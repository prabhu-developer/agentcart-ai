"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

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

  return (
    <div className="w-full">
      {/* Input Shell */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-[#e8ece9] bg-white p-2.5 shadow-xs transition-focus-within focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/15"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          placeholder="Describe what you're shopping for, budget, or adjustments..."
          className="max-h-36 min-h-9.5 flex-1 resize-none bg-transparent py-1.5 text-sm text-[#202522] outline-none placeholder:text-[#727b76] disabled:cursor-not-allowed"
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
    </div>
  );
}
