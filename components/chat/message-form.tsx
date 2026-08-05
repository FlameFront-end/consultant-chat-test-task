"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export function MessageForm({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      className="border-t border-slate-200 p-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2">
        <label htmlFor="chat-message" className="sr-only">
          Сообщение консультанту
        </label>
        <textarea
          ref={textareaRef}
          id="chat-message"
          name="message"
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение…"
          className="max-h-32 min-h-11 flex-1 resize-none overflow-y-auto rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        />
        <button
          type="submit"
          disabled={value.trim().length === 0}
          className="h-11 shrink-0 cursor-pointer rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Отправить
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Enter — отправить, Shift+Enter — новая строка
      </p>
    </form>
  );
}
