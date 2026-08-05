import type { Meeting } from "@/features/meetings/types";

export async function fetchMeetings(): Promise<Meeting[]> {
  const response = await fetch("/api/meetings");

  if (!response.ok) {
    throw new Error(`Не удалось загрузить встречи: ${response.status}`);
  }

  return (await response.json()) as Meeting[];
}
