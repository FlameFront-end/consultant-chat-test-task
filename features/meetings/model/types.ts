export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export type Meeting = Readonly<{
  id: string;
  title: string;
  date: string;
  status: MeetingStatus;
}>;
