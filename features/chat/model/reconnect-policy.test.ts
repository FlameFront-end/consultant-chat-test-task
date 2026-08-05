import { describe, expect, it } from "vitest";

import { getReconnectDelay } from "@/features/chat/model/reconnect-policy";

describe("getReconnectDelay", () => {
  it("uses exponential backoff with bounded jitter", () => {
    expect(getReconnectDelay(0, () => 0)).toBe(1000);
    expect(getReconnectDelay(1, () => 0.5)).toBe(2150);
  });

  it("never exceeds the maximum delay", () => {
    expect(getReconnectDelay(20, () => 1)).toBe(10000);
  });
});
