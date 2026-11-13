"use client";

import { Paperclip, Send, Sparkles, Zap } from "lucide-react";
import { useRef, useState } from "react";

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSendMessage,
  isLoading = false,
  placeholder = "Ask me anything... Describe your setup, budget, or preferred pieces",
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
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Floating Pill Composer Bar (matching ref2.png) */}
      <div className="flex items-center gap-2 rounded-[28px] border border-[#EAE6F2] bg-white px-4 py-2 shadow-[0_4px_24px_rgba(33,27,46,0.06)] transition-all duration-200 focus-within:border-[#6D45D9] focus-within:shadow-[0_8px_28px_rgba(109,69,217,0.12)]">
        {/* Left utility icons */}
        <div className="flex items-center gap-1.5 text-[#777181]">
          <button
            type="button"
            aria-label="Add attachment"
            title="Attach brief"
            className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-[#F2EDFC] hover:text-[#5125A8]"
          >
            <Paperclip className="size-4" />
          </button>
          <div className="flex size-7 items-center justify-center rounded-full text-[#8B6CE8]">
            <Sparkles className="size-4" />
          </div>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder}
          aria-label="Ask AgentCart AI"
          className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-sm text-[#211B2E] placeholder:text-[#777181] focus:outline-none disabled:opacity-60"
        />

        {/* Right tools and Send button */}
        <div className="flex items-center gap-2">
          <span
            title="Fast catalog search enabled"
            className="hidden sm:flex size-7 items-center justify-center rounded-full text-[#777181] transition-colors hover:text-[#5125A8]"
          >
            <Zap className="size-4" />
          </span>

          <button
            type="button"
            onClick={submit}
            disabled={isLoading || !value.trim()}
            aria-label="Send inquiry"
            className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-[#211B2E] px-4 text-xs font-semibold text-white transition-all hover:bg-[#342C44] disabled:cursor-not-allowed disabled:bg-[#F8F7FB] disabled:text-[#A9A4B3] shadow-xs active:scale-95"
          >
            <Send className="size-3" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
