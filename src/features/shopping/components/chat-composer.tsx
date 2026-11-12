"use client";

import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSendMessage,
  isLoading = false,
  placeholder = "Describe what you need and your budget...",
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-end gap-2.5 rounded-2xl border border-[#e5e9e7] bg-white px-4 py-2.5 shadow-[0_2px_16px_rgb(0,0,0,0.04)] transition-all duration-200 focus-within:border-[#0a5c55]/40 focus-within:shadow-[0_4px_20px_rgb(10,92,85,0.08)]">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder}
          aria-label="Ask AgentCart"
          className="max-h-35 flex-1 resize-none bg-transparent py-1 text-[15px] text-[#111817] placeholder:text-[#9ca5a0] focus:outline-none disabled:opacity-60"
        />

        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          <button
            type="button"
            onClick={submit}
            disabled={isLoading || !value.trim()}
            aria-label="Send inquiry"
            className="flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0a5c55] text-white transition-all hover:bg-[#084f49] disabled:cursor-not-allowed disabled:bg-[#f0f3f1] disabled:text-[#b0b8b4]"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
