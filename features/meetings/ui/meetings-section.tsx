"use client";

import { useQuery } from "@tanstack/react-query";

import { MeetingListItem } from "@/features/meetings/ui/meeting-list-item";
import { fetchMeetings } from "@/features/meetings/api";
import { meetingsQueryOptions } from "@/features/meetings/queries";

export function MeetingsSection() {
  const { data, isPending, isFetching, isError, refetch } = useQuery(
    meetingsQueryOptions(fetchMeetings),
  );

  const meetings = data ?? [];

  return (
    <section
      aria-busy={isFetching}
      className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm"
    >
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
          className="inline-flex min-h-9 touch-manipulation cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className={`h-3.5 w-3.5 ${isFetching ? "motion-safe:animate-spin" : ""}`}
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
            {meetings.length > 0
              ? "Не удалось обновить список встреч. Повторите попытку."
              : "Не удалось загрузить список встреч. Повторите попытку."}
          </p>
        ) : null}

        {isPending ? (
          <p
            role="status"
            className="px-1 py-8 text-center text-sm text-slate-500"
          >
            Загрузка встреч…
          </p>
        ) : null}

        {!isPending && !isError && meetings.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Встреч пока нет
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Запланированные консультации появятся здесь.
            </p>
          </div>
        ) : null}

        {meetings.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {meetings.map((meeting) => (
              <MeetingListItem key={meeting.id} meeting={meeting} />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
