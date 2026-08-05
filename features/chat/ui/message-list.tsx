"use client";

import { useEffect, useRef } from "react";

import { ChatMessageListItem } from "@/features/chat/ui/chat-message-list-item";
import type { ChatMessage } from "@/features/chat/model/types";

const AUTO_SCROLL_THRESHOLD_PX = 48;

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-slate-400"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 20l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">
          Начните консультацию
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Напишите сообщение — консультант ответит в этом чате
        </p>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  onRetry,
  isConnected,
}: {
  messages: readonly ChatMessage[];
  onRetry: (id: string) => void;
  isConnected: boolean;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  const shouldFollowMessagesRef = useRef(true);

  useEffect(() => {
    const log = logRef.current;
    if (log && shouldFollowMessagesRef.current) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages]);

  function handleScroll() {
    const log = logRef.current;
    if (!log) {
      return;
    }

    const distanceFromBottom =
      log.scrollHeight - log.scrollTop - log.clientHeight;
    shouldFollowMessagesRef.current =
      distanceFromBottom <= AUTO_SCROLL_THRESHOLD_PX;
  }

  return (
    <div
      ref={logRef}
      role="log"
      aria-label="Сообщения чата"
      aria-live="polite"
      aria-relevant="additions text"
      onScroll={handleScroll}
      className="flex flex-1 flex-col overflow-y-auto px-4 py-4"
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatMessageListItem
              key={`${message.author}-${message.id}`}
              message={message}
              onRetry={onRetry}
              isConnected={isConnected}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
