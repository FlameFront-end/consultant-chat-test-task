import { describe, expect, it } from "vitest";

import { formatMeetingDate } from "@/features/meetings/model/format-meeting-date";

describe("formatMeetingDate", () => {
  it("formats meeting time in the product timezone", () => {
    expect(formatMeetingDate("2026-08-06T10:00:00.000Z")).toContain("13:00");
  });
});
