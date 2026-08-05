import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchMeetings } from "@/features/meetings/api";

const VALID_MEETING = {
  id: "1",
  title: "Первичная консультация",
  date: "2026-08-06T10:00:00.000Z",
  status: "scheduled",
};

function mockMeetingsResponse(payload: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

describe("fetchMeetings", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns meetings with a valid API shape", async () => {
    mockMeetingsResponse([VALID_MEETING]);

    await expect(fetchMeetings()).resolves.toEqual([VALID_MEETING]);
  });

  it.each([
    ["non-array payload", { meeting: VALID_MEETING }],
    ["invalid status", [{ ...VALID_MEETING, status: "unknown" }]],
    ["invalid date", [{ ...VALID_MEETING, date: "invalid-date" }]],
    ["empty identifier", [{ ...VALID_MEETING, id: "" }]],
    ["empty title", [{ ...VALID_MEETING, title: "   " }]],
  ])("rejects %s", async (_caseName, payload) => {
    mockMeetingsResponse(payload);

    await expect(fetchMeetings()).rejects.toThrow(
      "Некорректный ответ сервера встреч",
    );
  });
});
