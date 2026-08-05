"use client";

import { useEffect, useRef } from "react";

import type { ChatMessage } from "@/features/chat/model/types";

const STATUS_LABELS: Record<ChatMessage["status"], string> = {
  queued: "В очереди",
  sending: "Отправляется…",
  delivered: "Доставлено",
};

const STATUS_DOT_CLASSES: Record<ChatMessage["status"], string> = {
  queued: "bg-slate-400",
  sending: "bg-amber-500",
  delivered: "bg-emerald-500",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

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
        <p className="text-sm font-medium text-slate-900">Начните консультацию</p>
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
  messages: ChatMessage[];
  onRetry: (id: string) => void;
  isConnected: boolean;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => {
        const isUser = message.author === "user";
        return (
          <li
            key={`${message.author}-${message.id}`}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap sm:max-w-[65%] ${
                isUser
                  ? "rounded-br-md bg-blue-600 text-white"
                  : "rounded-bl-md bg-slate-100 text-slate-900"
              }`}
            >
              {message.text}
            </div>
            <div className="mt-1 flex items-center gap-2 px-1 text-xs text-slate-400">
              <span>{formatTime(message.createdAt)}</span>
              {isUser ? (
                <span className="inline-flex items-center gap-1">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASSES[message.status]}`}
                  />
                  {STATUS_LABELS[message.status]}
                </span>
              ) : null}
              {isUser && message.status === "queued" ? (
                <button
                  type="button"
                  onClick={() => onRetry(message.id)}
                  disabled={!isConnected}
                  title={isConnected ? undefined : "Нет связи с сервером"}
                  className="cursor-pointer rounded border border-slate-200 px-1.5 py-0.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Повторить
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
