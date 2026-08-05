// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MessageForm } from "@/features/chat/ui/message-form";
import { MessageList } from "@/features/chat/ui/message-list";
import type { ChatMessage } from "@/features/chat/model/types";

const CONSULTANT_MESSAGE: ChatMessage = {
  id: "1",
  text: "Здравствуйте",
  createdAt: "2026-08-05T10:00:00.000Z",
  author: "consultant",
  status: "delivered",
};

const USER_MESSAGE: ChatMessage = {
  id: "2",
  text: "Привет",
  createdAt: "2026-08-05T10:01:00.000Z",
  author: "user",
  status: "delivered",
};

describe("chat accessibility", () => {
  afterEach(cleanup);

  it("keeps the chat log mounted before the first message", () => {
    render(<MessageList messages={[]} onRetry={() => undefined} isConnected />);

    expect(screen.getByRole("log", { name: "Сообщения чата" })).toBeTruthy();
    expect(screen.getByText("Начните консультацию")).toBeTruthy();
  });

  it("exposes incoming messages as an accessible chat log", () => {
    render(
      <MessageList
        messages={[CONSULTANT_MESSAGE, USER_MESSAGE]}
        onRetry={() => undefined}
        isConnected
      />,
    );

    const chatLog = screen.getByRole("log", { name: "Сообщения чата" });
    expect(chatLog.getAttribute("aria-live")).toBe("polite");
    expect(chatLog.getAttribute("aria-relevant")).toBe("additions text");
    const consultantAuthor = screen.getByText("Консультант:");
    const userAuthor = screen.getByText("Вы:");
    expect(consultantAuthor.classList).toContain("sr-only");
    expect(userAuthor.classList).toContain("sr-only");
    expect(consultantAuthor.closest('[aria-hidden="true"]')).toBeNull();
    expect(userAuthor.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("does not submit while an input method composition is active", () => {
    const onSend = vi.fn();
    render(<MessageForm onSend={onSend} />);
    const textarea = screen.getByLabelText("Сообщение консультанту");
    fireEvent.change(textarea, { target: { value: "Привет" } });

    fireEvent.keyDown(textarea, {
      key: "Enter",
      shiftKey: false,
      isComposing: true,
    });

    expect(onSend).not.toHaveBeenCalled();
  });

  it("associates the keyboard hint with the textarea", () => {
    render(<MessageForm onSend={() => undefined} />);

    expect(
      screen
        .getByLabelText("Сообщение консультанту")
        .getAttribute("aria-describedby"),
    ).toBe("chat-message-hint");
  });
});
