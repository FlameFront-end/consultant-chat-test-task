import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("getMeetings", () => {
  it("does not share mutable meeting objects between calls", async () => {
    const { getMeetings } = await import("@/lib/meetings/get-meetings");
    const firstResult = await getMeetings();
    const originalTitle = firstResult[0].title;

    (firstResult as unknown as { title: string }[])[0].title =
      "Изменённая встреча";

    const secondResult = await getMeetings();
    expect(secondResult[0].title).toBe(originalTitle);
  });
});
