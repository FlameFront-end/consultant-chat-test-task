import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Chat } from "@/components/chat/chat";
import { MeetingsSection } from "@/components/meetings/meetings-section";
import { meetingsQueryOptions } from "@/features/meetings/queries";
import { getMeetings } from "@/lib/meetings/get-meetings";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export default async function ChatPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    ...meetingsQueryOptions(),
    queryFn: getMeetings,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Консультация онлайн
        </h1>
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="min-h-[240px] lg:h-[70vh]">
            <MeetingsSection />
          </div>
          <div className="h-[70vh] min-h-[400px]">
            <Chat />
          </div>
        </div>
      </main>
    </HydrationBoundary>
  );
}
