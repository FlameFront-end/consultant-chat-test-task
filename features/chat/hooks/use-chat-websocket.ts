import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { chatReducer, initialChatState } from "@/features/chat/model/reducer";
import { MAX_MESSAGE_LENGTH } from "@/features/chat/model/message-policy";
import { getReconnectDelay } from "@/features/chat/model/reconnect-policy";
import {
  type ChatMessage,
  type ChatAction,
  type ConnectionState,
  type MessagePayload,
} from "@/features/chat/model/types";
import {
  parseEchoPayload,
  type InvalidEchoReason,
} from "@/features/chat/protocol/echo-payload";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8081";
const INVALID_ECHO_MESSAGES: Record<InvalidEchoReason, string> = {
  "unsupported-data": "WebSocket-сервер вернул неподдерживаемый тип сообщения",
  "invalid-json": "WebSocket-сервер вернул невалидный JSON",
  "invalid-payload": "WebSocket-сервер вернул невалидное сообщение",
};

type UseChatWebSocketResult = {
  messages: readonly ChatMessage[];
  connectionState: ConnectionState;
  sendMessage: (text: string) => void;
  retryMessage: (id: string) => void;
};

export function useChatWebSocket(): UseChatWebSocketResult {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptRef = useRef(0);
  const mountedRef = useRef(true);
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const messagesRef = useRef(state.messages);

  const dispatchChatAction = useCallback((action: ChatAction) => {
    messagesRef.current = chatReducer(
      { messages: messagesRef.current },
      action,
    ).messages;
    dispatch(action);
  }, []);

  const sendOverSocket = useCallback(
    (socket: WebSocket, payload: MessagePayload) => {
      if (pendingIdsRef.current.has(payload.id)) {
        return;
      }

      pendingIdsRef.current.add(payload.id);
      try {
        socket.send(JSON.stringify(payload));
        dispatchChatAction({
          type: "MESSAGE_SENDING",
          payload: { id: payload.id },
        });
      } catch (error) {
        pendingIdsRef.current.delete(payload.id);
        dispatchChatAction({
          type: "MESSAGE_QUEUED_AGAIN",
          payload: { id: payload.id },
        });
        console.error("Не удалось отправить сообщение через WebSocket", error);
        // The socket is unusable, but its `close` event only lands later. Reflect
        // the broken connection right away so the status badge stops claiming a
        // live link and the retry button does not invite a no-op click.
        setConnectionState("closed");
        socket.close();
      }
    },
    [dispatchChatAction],
  );

  const flushQueue = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    for (const message of messagesRef.current) {
      if (socket.readyState !== WebSocket.OPEN) {
        break;
      }

      if (message.author === "user" && message.status === "queued") {
        sendOverSocket(socket, {
          id: message.id,
          text: message.text,
          createdAt: message.createdAt,
        });
      }
    }
  }, [sendOverSocket]);

  useEffect(() => {
    mountedRef.current = true;
    const pendingIds = pendingIdsRef.current;

    function scheduleReconnect() {
      if (
        !mountedRef.current ||
        reconnectTimeoutRef.current !== null ||
        socketRef.current !== null
      ) {
        return;
      }

      const delay = getReconnectDelay(reconnectAttemptRef.current);
      reconnectAttemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        if (!mountedRef.current || socketRef.current !== null) {
          return;
        }

        setConnectionState("reconnecting");
        connect();
      }, delay);
    }

    function connect() {
      if (!mountedRef.current || socketRef.current !== null) {
        return;
      }

      let socket: WebSocket;
      try {
        socket = new WebSocket(WS_URL);
      } catch (error) {
        setConnectionState("closed");
        console.error("Не удалось создать WebSocket-соединение", error);
        scheduleReconnect();
        return;
      }

      socketRef.current = socket;
      if (reconnectAttemptRef.current === 0) {
        setConnectionState("connecting");
      }

      socket.onopen = () => {
        if (!mountedRef.current || socketRef.current !== socket) {
          return;
        }

        reconnectAttemptRef.current = 0;
        setConnectionState("open");
        flushQueue();
      };

      socket.onmessage = (event) => {
        if (!mountedRef.current || socketRef.current !== socket) {
          return;
        }

        const echoResult = parseEchoPayload(event.data);
        if (!echoResult.isValid) {
          console.warn(INVALID_ECHO_MESSAGES[echoResult.reason]);
          return;
        }

        const echo = echoResult.payload;
        if (!pendingIds.has(echo.id)) {
          return;
        }

        pendingIds.delete(echo.id);
        dispatchChatAction({
          type: "ECHO_RECEIVED",
          payload: echo,
        });
      };

      socket.onclose = () => {
        if (!mountedRef.current || socketRef.current !== socket) {
          return;
        }

        socketRef.current = null;
        dispatchChatAction({ type: "PENDING_RETURNED_TO_QUEUE" });
        pendingIds.clear();
        setConnectionState("closed");
        scheduleReconnect();
      };

      socket.onerror = () => {
        if (socketRef.current === socket) {
          socket.close();
        }
      };
    }

    connect();

    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }

      pendingIds.clear();
    };
  }, [dispatchChatAction, flushQueue]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
        return;
      }

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      dispatchChatAction({
        type: "MESSAGE_QUEUED",
        payload: { id, text: trimmed, createdAt },
      });

      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendOverSocket(socket, { id, text: trimmed, createdAt });
      }
    },
    [dispatchChatAction, sendOverSocket],
  );

  const retryMessage = useCallback(
    (id: string) => {
      const message = messagesRef.current.find((item) => item.id === id);
      if (
        !message ||
        message.author !== "user" ||
        message.status !== "queued"
      ) {
        return;
      }

      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendOverSocket(socket, {
          id: message.id,
          text: message.text,
          createdAt: message.createdAt,
        });
      }
    },
    [sendOverSocket],
  );

  return {
    messages: state.messages,
    connectionState,
    sendMessage,
    retryMessage,
  };
}
