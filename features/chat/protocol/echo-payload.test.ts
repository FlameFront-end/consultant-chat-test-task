import { describe, expect, it } from "vitest";

import { parseEchoPayload } from "@/features/chat/protocol/echo-payload";

const VALID_ECHO = {
  id: "00000000-0000-4000-8000-000000000001",
  text: "Привет",
  createdAt: "2026-08-06T10:00:00.000Z",
};

describe("parseEchoPayload", () => {
  it("returns a validated echo payload", () => {
    expect(parseEchoPayload(JSON.stringify(VALID_ECHO))).toEqual({
      isValid: true,
      payload: VALID_ECHO,
    });
  });

  it.each([
    [new Blob(), "unsupported-data"],
    ["not-json", "invalid-json"],
    [JSON.stringify({ ...VALID_ECHO, id: "" }), "invalid-payload"],
    [JSON.stringify({ ...VALID_ECHO, text: "" }), "invalid-payload"],
    [JSON.stringify({ ...VALID_ECHO, createdAt: "invalid" }), "invalid-payload"],
  ] as const)("rejects invalid echo input", (value, reason) => {
    expect(parseEchoPayload(value)).toEqual({ isValid: false, reason });
  });
});
