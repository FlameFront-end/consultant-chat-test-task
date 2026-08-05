// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MessageList } from "@/features/chat/ui/message-list";
import type { ChatMessage } from "@/features/chat/model/types";

const FIRST_MESSAGE: ChatMessage = {
  id: "1",
  text: "Первое сообщение",
  createdAt: "2026-08-05T10:00:00.000Z",
  author: "consultant",
  status: "delivered",
};

const SECOND_MESSAGE: ChatMessage = {
  id: "2",
  text: "Второе сообщение",
  createdAt: "2026-08-05T10:01:00.000Z",
  author: "consultant",
  status: "delivered",
};

describe("MessageList scrolling", () => {
  afterEach(cleanup);

  it("preserves the reading position when the user has scrolled up", () => {
    const { rerender } = render(
      <MessageList
        messages={[FIRST_MESSAGE]}
        onRetry={() => undefined}
        isConnected
      />,
    );
    const chatLog = screen.getByRole("log", { name: "Сообщения чата" });
    setScrollMetrics(chatLog, { scrollHeight: 1000, clientHeight: 200 });
    chatLog.scrollTop = 751;
    fireEvent.scroll(chatLog);

    rerender(
      <MessageList
        messages={[FIRST_MESSAGE, SECOND_MESSAGE]}
        onRetry={() => undefined}
        isConnected
      />,
    );

    expect(chatLog.scrollTop).toBe(751);
  });

  it("follows new messages while the user remains near the bottom", () => {
    const { rerender } = render(
      <MessageList
        messages={[FIRST_MESSAGE]}
        onRetry={() => undefined}
        isConnected
      />,
    );
    const chatLog = screen.getByRole("log", { name: "Сообщения чата" });
    setScrollMetrics(chatLog, { scrollHeight: 1000, clientHeight: 200 });
    chatLog.scrollTop = 752;
    fireEvent.scroll(chatLog);

    rerender(
      <MessageList
        messages={[FIRST_MESSAGE, SECOND_MESSAGE]}
        onRetry={() => undefined}
        isConnected
      />,
    );

    expect(chatLog.scrollTop).toBe(1000);
  });
});

function setScrollMetrics(
  element: HTMLElement,
  metrics: { readonly scrollHeight: number; readonly clientHeight: number },
): void {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: metrics.scrollHeight },
    clientHeight: { configurable: true, value: metrics.clientHeight },
  });
}
