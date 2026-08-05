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

const TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

type ChatMessageListItemProps = {
  readonly message: ChatMessage;
  readonly isConnected: boolean;
  readonly onRetry: (id: string) => void;
};

export function ChatMessageListItem({
  message,
  isConnected,
  onRetry,
}: ChatMessageListItemProps) {
  const isUser = message.author === "user";

  return (
    <li className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <p
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap sm:max-w-[65%] ${
          isUser
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-slate-100 text-slate-900"
        }`}
      >
        <span className="sr-only">{isUser ? "Вы: " : "Консультант: "}</span>
        {message.text}
      </p>
      <div className="mt-1 flex items-center gap-2 px-1 text-xs text-slate-500">
        <time dateTime={message.createdAt}>
          {TIME_FORMATTER.format(new Date(message.createdAt))}
        </time>
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
            aria-label="Повторить отправку сообщения"
            className="min-h-6 touch-manipulation cursor-pointer rounded border border-slate-200 px-1.5 py-0.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Повторить
          </button>
        ) : null}
      </div>
    </li>
  );
}
