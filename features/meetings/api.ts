import type { Meeting, MeetingStatus } from "@/features/meetings/model/types";
import { isCanonicalIsoTimestamp } from "@/lib/validation/is-canonical-iso-timestamp";

export async function fetchMeetings(): Promise<readonly Meeting[]> {
  const response = await fetch("/api/meetings");

  if (!response.ok) {
    throw new Error(`Не удалось загрузить встречи: ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isMeeting)) {
    throw new Error("Некорректный ответ сервера встреч");
  }

  return payload;
}

function isMeeting(value: unknown): value is Meeting {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const meeting = value as Record<string, unknown>;
  return (
    typeof meeting.id === "string" &&
    meeting.id.trim().length > 0 &&
    typeof meeting.title === "string" &&
    meeting.title.trim().length > 0 &&
    isCanonicalIsoTimestamp(meeting.date) &&
    isMeetingStatus(meeting.status)
  );
}

function isMeetingStatus(value: unknown): value is MeetingStatus {
  return (
    value === "scheduled" || value === "completed" || value === "cancelled"
  );
}
