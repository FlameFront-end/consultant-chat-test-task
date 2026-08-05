import { describe, expect, it } from "vitest";

import { isCanonicalIsoTimestamp } from "@/lib/validation/is-canonical-iso-timestamp";

describe("isCanonicalIsoTimestamp", () => {
  it("accepts the canonical UTC representation produced by Date.toISOString", () => {
    expect(isCanonicalIsoTimestamp("2026-08-06T10:00:00.000Z")).toBe(true);
  });

  it.each([
    "2026-08-06T10:00:00Z",
    "2026-08-06 10:00:00",
    "invalid-date",
    1_786_010_400_000,
    null,
  ])("rejects a non-canonical timestamp: %s", (value) => {
    expect(isCanonicalIsoTimestamp(value)).toBe(false);
  });
});
