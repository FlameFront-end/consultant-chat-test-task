import "server-only";

import type { Meeting } from "@/features/meetings/model/types";

const MOCK_MEETINGS = [
  {
    id: "1",
    title: "Первичная консультация",
    date: "2026-08-06T10:00:00.000Z",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Разбор договора аренды",
    date: "2026-08-08T13:30:00.000Z",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Обсуждение трудового спора",
    date: "2026-07-28T09:00:00.000Z",
    status: "completed",
  },
  {
    id: "4",
    title: "Консультация по налогам",
    date: "2026-07-20T15:00:00.000Z",
    status: "cancelled",
  },
  {
    id: "5",
    title: "Сопровождение сделки",
    date: "2026-08-12T11:00:00.000Z",
    status: "scheduled",
  },
] satisfies readonly Meeting[];

export async function getMeetings(): Promise<readonly Meeting[]> {
  return MOCK_MEETINGS.map((meeting) => ({ ...meeting }));
}
