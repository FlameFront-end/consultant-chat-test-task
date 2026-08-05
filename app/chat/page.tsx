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
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <header className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
            Личный кабинет
          </span>
          <h1 className="text-2xl font-semibold text-slate-900">
            Консультация онлайн
          </h1>
          <p className="text-sm text-slate-500">
            Просматривайте встречи и общайтесь с консультантом в режиме реального времени.
          </p>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          <div className="min-h-70 lg:h-[calc(100vh-14rem)] lg:min-h-120">
            <MeetingsSection />
          </div>
          <div className="h-[70vh] min-h-105 lg:h-[calc(100vh-14rem)]">
            <Chat />
          </div>
        </div>
      </main>
    </HydrationBoundary>
  );
}
