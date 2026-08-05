"use client";

import { ConnectionStatus } from "@/components/chat/connection-status";
import { MessageForm } from "@/components/chat/message-form";
import { MessageList } from "@/components/chat/message-list";
import { useChatWebSocket } from "@/features/chat/hooks/use-chat-websocket";

export function Chat() {
  const { messages, connectionState, sendMessage, retryMessage } = useChatWebSocket();

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Чат с консультантом</h2>
          <p className="text-xs text-slate-500">Ответы приходят в этом окне в реальном времени</p>
        </div>
        <ConnectionStatus state={connectionState} />
      </div>

      <MessageList
        messages={messages}
        onRetry={retryMessage}
        isConnected={connectionState === "open"}
      />

      <MessageForm onSend={sendMessage} />
    </section>
  );
}
