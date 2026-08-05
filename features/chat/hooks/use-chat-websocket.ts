import { useCallback, useEffect, useReducer, useRef } from "react";

import { chatReducer, initialChatState } from "@/features/chat/model/reducer";
import type { ConnectionState, OutgoingPayload } from "@/features/chat/model/types";

const WS_URL = "ws://localhost:8081";
const MIN_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000;

function nextBackoffDelay(attempt: number): number {
  const exponential = Math.min(MIN_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
  const jitter = Math.random() * 300;
  return Math.min(exponential + jitter, MAX_BACKOFF_MS);
}

function isOutgoingPayload(value: unknown): value is OutgoingPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.createdAt === "string"
  );
}

export function useChatWebSocket() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [connectionState, setConnectionState] = useReducer(
    (_current: ConnectionState, next: ConnectionState) => next,
    "connecting",
  );

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const mountedRef = useRef(true);
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const messagesRef = useRef(state.messages);

  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  const sendOverSocket = useCallback((socket: WebSocket, payload: OutgoingPayload) => {
    pendingIdsRef.current.add(payload.id);
    dispatch({ type: "MESSAGE_SENDING", payload: { id: payload.id } });
    socket.send(JSON.stringify(payload));
  }, []);

  const flushQueue = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    for (const message of messagesRef.current) {
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

    function scheduleReconnect() {
      if (!mountedRef.current) {
        return;
      }

      const delay = nextBackoffDelay(reconnectAttemptRef.current);
      reconnectAttemptRef.current += 1;

      reconnectTimeoutRef.current = setTimeout(() => {
        setConnectionState("reconnecting");
        connect();
      }, delay);
    }

    function connect() {
      if (!mountedRef.current) {
        return;
      }

      let socket: WebSocket;
      try {
        socket = new WebSocket(WS_URL);
      } catch {
        scheduleReconnect();
        return;
      }

      socketRef.current = socket;
      if (reconnectAttemptRef.current === 0) {
        setConnectionState("connecting");
      }

      socket.addEventListener("open", () => {
        if (!mountedRef.current) {
          return;
        }
        reconnectAttemptRef.current = 0;
        setConnectionState("open");
        flushQueue();
      });

      socket.addEventListener("message", (event) => {
        if (!mountedRef.current) {
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(String(event.data));
        } catch {
          return;
        }

        if (!isOutgoingPayload(parsed)) {
          return;
        }

        if (!pendingIdsRef.current.has(parsed.id)) {
          return;
        }

        pendingIdsRef.current.delete(parsed.id);
        dispatch({
          type: "ECHO_RECEIVED",
          payload: { id: parsed.id, text: parsed.text, createdAt: parsed.createdAt },
        });
      });

      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (!mountedRef.current) {
          return;
        }

        dispatch({ type: "PENDING_RETURNED_TO_QUEUE" });
        pendingIdsRef.current.clear();
        setConnectionState("closed");
        scheduleReconnect();
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    }

    connect();

    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const socket = socketRef.current;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
        socketRef.current = null;
      }
    };
  }, [flushQueue]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    dispatch({ type: "MESSAGE_QUEUED", payload: { id, text: trimmed, createdAt } });

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendOverSocket(socket, { id, text: trimmed, createdAt });
    }
  }, [sendOverSocket]);

  const retryMessage = useCallback((id: string) => {
    const message = messagesRef.current.find((item) => item.id === id);
    if (!message || message.author !== "user" || message.status !== "queued") {
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
  }, [sendOverSocket]);

  return {
    messages: state.messages,
    connectionState,
    sendMessage,
    retryMessage,
  };
}
