import { describe, expect, it, vi } from "vitest";

import { meetingsQueryKey, meetingsQueryOptions } from "@/features/meetings/queries";
import type { Meeting } from "@/features/meetings/model/types";

describe("meetingsQueryOptions", () => {
  it("uses the injected meetings source with the shared query key", () => {
    const getMeetings = vi.fn<() => Promise<readonly Meeting[]>>();

    const options = meetingsQueryOptions(getMeetings);

    expect(options.queryKey).toBe(meetingsQueryKey);
    expect(options.queryFn).toBe(getMeetings);
  });
});
