"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

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
      <div className="flex items-end gap-2 rounded-2xl border border-[#e3e8e5] bg-white px-4 py-2.5 shadow-[0_2px_16px_rgb(0,0,0,0.03)] transition-colors focus-within:border-[#0f766e]/50">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder}
          aria-label="Ask AgentCart"
          className="max-h-[140px] flex-1 resize-none bg-transparent py-1 text-sm text-[#181c1a] placeholder:text-[#8a948f] focus:outline-none disabled:opacity-60"
        />

        <button
          type="button"
          onClick={submit}
          disabled={isLoading || !value.trim()}
          aria-label="Send message"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0f766e] text-white transition-colors hover:bg-[#0d655e] disabled:cursor-not-allowed disabled:bg-[#dce2de] disabled:text-[#8a948f]"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
    </div>
  );
}
