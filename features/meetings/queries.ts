import { queryOptions } from "@tanstack/react-query";

import type { Meeting } from "@/features/meetings/model/types";

export const meetingsQueryKey = ["meetings"] as const;

type GetMeetings = () => Promise<readonly Meeting[]>;

export function meetingsQueryOptions(getMeetings: GetMeetings) {
  return queryOptions({
    queryKey: meetingsQueryKey,
    queryFn: getMeetings,
  });
}
