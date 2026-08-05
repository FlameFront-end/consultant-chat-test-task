import type { ConnectionState } from "@/features/chat/model/types";

const STATUS_CONFIG: Record<
  ConnectionState,
  { label: string; dotClass: string; badgeClass: string }
> = {
  connecting: {
    label: "Подключение…",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  open: {
    label: "Связь установлена",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  closed: {
    label: "Нет связи",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
  reconnecting: {
    label: "Переподключение…",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
};

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  const config = STATUS_CONFIG[state];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.badgeClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass} ${
          state === "connecting" || state === "reconnecting"
            ? "motion-safe:animate-pulse"
            : ""
        }`}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </div>
  );
}
