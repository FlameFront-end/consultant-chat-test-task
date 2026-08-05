import { queryOptions } from "@tanstack/react-query";

import { fetchMeetings } from "@/features/meetings/api";

export const meetingsQueryKey = ["meetings"] as const;

export function meetingsQueryOptions() {
  return queryOptions({
    queryKey: meetingsQueryKey,
    queryFn: fetchMeetings,
  });
}
