"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

const QUICK_SUGGESTIONS = [
  "Can we compare monitor options?",
  "Show wireless alternatives",
  "Adjust setup to stay under $600",
  "Add ergonomic accessories",
];

export function ChatComposer({ onSendMessage, isLoading = false }: ChatComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  return (
    <div className="w-full">
      {/* Quick Suggestions Chips */}
      <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="shrink-0 text-[11px] font-medium text-[#727b76]">
          Suggested:
        </span>
        {QUICK_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectSuggestion(suggestion)}
            className="shrink-0 rounded-full border border-[#e8ece9] bg-white px-2.5 py-1 text-[11px] text-[#727b76] transition-colors hover:border-[#0f766e]/30 hover:bg-[#eaf5f2] hover:text-[#0f766e] disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Shell */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-[#e8ece9] bg-white p-2.5 shadow-xs transition-focus-within focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/15"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eaf5f2] text-[#0f766e]">
          <Sparkles className="size-3.5" />
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          placeholder="Describe what you're shopping for, budget, or adjustments..."
          className="max-h-36 min-h-[38px] flex-1 resize-none bg-transparent py-1.5 text-sm text-[#202522] outline-none placeholder:text-[#727b76] disabled:cursor-not-allowed"
          aria-label="Shopping prompt composer"
        />

        <Button
          type="submit"
          disabled={!text.trim() || isLoading}
          size="icon-sm"
          className="shrink-0 rounded-xl bg-[#0f766e] text-white hover:bg-[#115e59] disabled:opacity-40"
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      </form>

      <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-[#727b76]">
        <span>Press Enter to send, Shift + Enter for a new line</span>
        <span className="hidden sm:inline">Phase 01 Interactive Preview</span>
      </div>
    </div>
  );
}
