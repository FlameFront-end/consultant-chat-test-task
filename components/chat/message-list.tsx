import type { ChatMessage } from "@/features/chat/model/types";

const STATUS_LABELS: Record<ChatMessage["status"], string> = {
  queued: "В очереди",
  sending: "Отправляется…",
  delivered: "Доставлено",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageList({
  messages,
  onRetry,
}: {
  messages: ChatMessage[];
  onRetry: (id: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Сообщений пока нет. Напишите что-нибудь консультанту.
      </p>
    );
  }

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-y-auto px-1 py-2">
      {messages.map((message) => {
        const isUser = message.author === "user";
        return (
          <li
            key={`${message.author}-${message.id}`}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                isUser
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-900 rounded-bl-sm"
              }`}
            >
              {message.text}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>{formatTime(message.createdAt)}</span>
              {isUser ? (
                <span
                  className={
                    message.status === "delivered"
                      ? "text-emerald-600"
                      : message.status === "sending"
                        ? "text-amber-600"
                        : "text-slate-500"
                  }
                >
                  {STATUS_LABELS[message.status]}
                </span>
              ) : null}
              {isUser && message.status === "queued" ? (
                <button
                  type="button"
                  onClick={() => onRetry(message.id)}
                  className="rounded border border-slate-300 px-1.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500"
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
