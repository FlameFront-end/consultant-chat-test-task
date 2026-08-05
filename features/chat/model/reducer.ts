import type { ChatAction, ChatMessage, ChatState } from "@/features/chat/model/types";

export const initialChatState: ChatState = {
  messages: [],
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "MESSAGE_QUEUED": {
      const message: ChatMessage = {
        id: action.payload.id,
        text: action.payload.text,
        createdAt: action.payload.createdAt,
        author: "user",
        status: "queued",
      };

      return {
        ...state,
        messages: [...state.messages, message],
      };
    }

    case "MESSAGE_SENDING": {
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.id && message.author === "user"
            ? { ...message, status: "sending" }
            : message,
        ),
      };
    }

    case "MESSAGE_QUEUED_AGAIN": {
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.id && message.author === "user"
            ? { ...message, status: "queued" }
            : message,
        ),
      };
    }

    case "ECHO_RECEIVED": {
      const alreadyHasConsultantEcho = state.messages.some(
        (message) => message.id === action.payload.id && message.author === "consultant",
      );

      if (alreadyHasConsultantEcho) {
        return state;
      }

      const userMessage = state.messages.find(
        (message) => message.id === action.payload.id && message.author === "user",
      );

      if (!userMessage || userMessage.status === "delivered") {
        return state;
      }

      const consultantMessage: ChatMessage = {
        id: action.payload.id,
        text: action.payload.text,
        createdAt: action.payload.createdAt,
        author: "consultant",
        status: "delivered",
      };

      return {
        ...state,
        messages: [
          ...state.messages.map((message) =>
            message.id === action.payload.id && message.author === "user"
              ? { ...message, status: "delivered" as const }
              : message,
          ),
          consultantMessage,
        ],
      };
    }

    case "PENDING_RETURNED_TO_QUEUE": {
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.author === "user" && message.status === "sending"
            ? { ...message, status: "queued" }
            : message,
        ),
      };
    }

    default:
      return state;
  }
}
