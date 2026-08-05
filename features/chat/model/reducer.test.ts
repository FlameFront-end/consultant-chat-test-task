import { describe, expect, it } from "vitest";

import { chatReducer, initialChatState } from "@/features/chat/model/reducer";
import type { ChatState } from "@/features/chat/model/types";

const NOW = "2026-08-05T10:00:00.000Z";

describe("chatReducer", () => {
  it("adds an optimistic queued message", () => {
    const state = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]).toMatchObject({
      id: "1",
      text: "Привет",
      author: "user",
      status: "queued",
    });
  });

  it("moves a queued message to sending", () => {
    let state = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });

    state = chatReducer(state, {
      type: "MESSAGE_SENDING",
      payload: { id: "1" },
    });

    expect(state.messages[0].status).toBe("sending");
  });

  it("confirms a sending message on echo and appends a consultant reply", () => {
    let state = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });
    state = chatReducer(state, { type: "MESSAGE_SENDING", payload: { id: "1" } });

    state = chatReducer(state, {
      type: "ECHO_RECEIVED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });

    expect(state.messages).toHaveLength(2);
    const userMessage = state.messages.find((message) => message.author === "user");
    const consultantMessage = state.messages.find((message) => message.author === "consultant");

    expect(userMessage?.status).toBe("delivered");
    expect(consultantMessage).toMatchObject({
      id: "1",
      text: "Привет",
      author: "consultant",
      status: "delivered",
    });
  });

  it("ignores a duplicate echo for the same id", () => {
    let state = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });
    state = chatReducer(state, { type: "MESSAGE_SENDING", payload: { id: "1" } });
    state = chatReducer(state, {
      type: "ECHO_RECEIVED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });

    const afterFirstEcho = state;

    state = chatReducer(state, {
      type: "ECHO_RECEIVED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });

    expect(state).toBe(afterFirstEcho);
    expect(state.messages).toHaveLength(2);
  });

  it("returns unconfirmed sending messages to the queue on disconnect", () => {
    let state = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });
    state = chatReducer(state, { type: "MESSAGE_SENDING", payload: { id: "1" } });

    state = chatReducer(state, { type: "PENDING_RETURNED_TO_QUEUE" });

    expect(state.messages[0].status).toBe("queued");
  });

  it("does not touch already delivered messages when pending messages are returned to queue", () => {
    let state: ChatState = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });
    state = chatReducer(state, { type: "MESSAGE_SENDING", payload: { id: "1" } });
    state = chatReducer(state, {
      type: "ECHO_RECEIVED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });

    state = chatReducer(state, { type: "PENDING_RETURNED_TO_QUEUE" });

    const userMessage = state.messages.find((message) => message.author === "user");
    expect(userMessage?.status).toBe("delivered");
  });

  it("moves a message back to queued explicitly via MESSAGE_QUEUED_AGAIN", () => {
    let state = chatReducer(initialChatState, {
      type: "MESSAGE_QUEUED",
      payload: { id: "1", text: "Привет", createdAt: NOW },
    });
    state = chatReducer(state, { type: "MESSAGE_SENDING", payload: { id: "1" } });

    state = chatReducer(state, { type: "MESSAGE_QUEUED_AGAIN", payload: { id: "1" } });

    expect(state.messages[0].status).toBe("queued");
  });
});
