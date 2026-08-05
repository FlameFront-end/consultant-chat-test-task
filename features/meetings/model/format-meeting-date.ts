const MEETING_DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Moscow",
});

export function formatMeetingDate(isoTimestamp: string): string {
  return MEETING_DATE_FORMATTER.format(new Date(isoTimestamp));
}
