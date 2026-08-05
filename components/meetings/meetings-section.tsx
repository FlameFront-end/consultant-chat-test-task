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
  scheduled: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const STATUS_DOT_STYLES: Record<MeetingStatus, string> = {
  scheduled: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-400",
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
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Мои встречи</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {meetings.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Обновить список встреч"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          >
            <path
              d="M13.5 8a5.5 5.5 0 1 1-1.66-3.95M13.5 2.5v3h-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{isFetching ? "Обновление…" : "Обновить"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isError ? (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            Не удалось обновить список встреч
            {error instanceof Error ? `: ${error.message}` : ""}.
          </p>
        ) : null}

        <ul className="flex flex-col gap-2">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="rounded-lg border border-slate-200 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium wrap-break-word text-slate-900">
                    {meeting.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(meeting.date)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[meeting.status]}`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_STYLES[meeting.status]}`}
                  />
                  {STATUS_LABELS[meeting.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
