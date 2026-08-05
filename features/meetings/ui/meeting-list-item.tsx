import { formatMeetingDate } from "@/features/meetings/model/format-meeting-date";
import type { Meeting, MeetingStatus } from "@/features/meetings/model/types";

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

type MeetingListItemProps = {
  readonly meeting: Meeting;
};

export function MeetingListItem({ meeting }: MeetingListItemProps) {
  return (
    <li className="rounded-lg border border-slate-200 px-3.5 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium wrap-break-word text-slate-900">
            {meeting.title}
          </p>
          <time
            dateTime={meeting.date}
            className="mt-0.5 block text-xs text-slate-500"
          >
            {formatMeetingDate(meeting.date)}
          </time>
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
  );
}
