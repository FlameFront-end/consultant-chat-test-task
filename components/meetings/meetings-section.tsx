"use client";

import { useQuery } from "@tanstack/react-query";

import { meetingsQueryOptions } from "@/features/meetings/queries";
import type { MeetingStatus } from "@/features/meetings/types";

const STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: "Запланирована",
  completed: "Завершена",
  cancelled: "Отменена",
};

const STATUS_STYLES: Record<MeetingStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-600",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MeetingsSection() {
  const { data, isFetching, isError, error, refetch } = useQuery(
    meetingsQueryOptions(),
  );

  const meetings = data ?? [];

  return (
    <section className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Мои встречи
        </h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Обновление…" : "Обновить"}
        </button>
      </div>

      {isError ? (
        <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Не удалось обновить список встреч
          {error instanceof Error ? `: ${error.message}` : ""}.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2 overflow-y-auto">
        {meetings.map((meeting) => (
          <li
            key={meeting.id}
            className="flex flex-col gap-1 rounded-md border border-slate-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{meeting.title}</p>
              <p className="text-sm text-slate-500">{formatDate(meeting.date)}</p>
            </div>
            <span
              className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[meeting.status]}`}
            >
              {STATUS_LABELS[meeting.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
