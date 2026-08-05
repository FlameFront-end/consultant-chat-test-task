// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeetingsSection } from "@/features/meetings/ui/meetings-section";
import { meetingsQueryKey } from "@/features/meetings/queries";
import type { Meeting } from "@/features/meetings/model/types";

const MEETING: Meeting = {
  id: "1",
  title: "Первичная консультация",
  date: "2026-08-06T10:00:00.000Z",
  status: "scheduled",
};

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });
}

function renderMeetings(queryClient: QueryClient): void {
  render(
    <QueryClientProvider client={queryClient}>
      <MeetingsSection />
    </QueryClientProvider>,
  );
}

describe("MeetingsSection", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders meeting time in the product timezone", () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(meetingsQueryKey, [MEETING]);

    renderMeetings(queryClient);

    expect(screen.getByText("06.08.2026, 13:00")).toBeTruthy();
  });

  it("renders an explicit empty state", () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(meetingsQueryKey, []);

    renderMeetings(queryClient);

    expect(screen.getByText("Встреч пока нет")).toBeTruthy();
  });

  it("renders a loading state without cached meetings", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(new Promise(() => undefined)),
    );

    renderMeetings(createQueryClient());

    expect(screen.getByText("Загрузка встреч…")).toBeTruthy();
  });

  it("renders a user-facing initial loading error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    renderMeetings(createQueryClient());

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "Не удалось загрузить список встреч. Повторите попытку.",
    );
  });
});
