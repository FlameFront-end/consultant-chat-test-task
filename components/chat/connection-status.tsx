import type { ConnectionState } from "@/features/chat/model/types";

const STATUS_CONFIG: Record<ConnectionState, { label: string; dotClass: string }> = {
  connecting: { label: "Подключение…", dotClass: "bg-amber-500" },
  open: { label: "Связь установлена", dotClass: "bg-emerald-500" },
  closed: { label: "Нет связи", dotClass: "bg-red-500" },
  reconnecting: { label: "Переподключение…", dotClass: "bg-amber-500" },
};

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  const config = STATUS_CONFIG[state];

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600" role="status">
      <span
        className={`h-2.5 w-2.5 rounded-full ${config.dotClass} ${state === "connecting" || state === "reconnecting" ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </div>
  );
}
