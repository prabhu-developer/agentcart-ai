"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLE_PROMPTS = [
  "Build my home office under $1,000",
  "Find the best gaming setup",
  "Plan my travel essentials",
  "Upgrade my everyday tech",
];

export function HeroPromptBox() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = prompt.trim();
    if (!query) {
      router.push("/shop");
      return;
    }
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Interactive Natural-Language Box */}
      <form
        onSubmit={handleSubmit}
        className="group relative flex flex-col rounded-2xl border border-[#e8ece9] bg-white p-3 shadow-lg shadow-[#0f766e]/5 transition-all focus-within:border-[#0f766e] focus-within:ring-3 focus-within:ring-[#0f766e]/15"
      >
        <div className="flex items-start gap-3 p-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
            <Sparkles className="size-4" />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="e.g. I need a complete home office setup under $1,000 with a monitor, keyboard, mouse and ergonomic chair..."
            className="w-full resize-none bg-transparent pt-1 text-sm text-[#202522] outline-none placeholder:text-[#727b76] sm:text-base"
            aria-label="Shopping query"
          />
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[#e8ece9]/80 pt-2.5">
          <span className="hidden text-[11px] text-[#727b76] sm:inline-block">
            Press <kbd className="rounded border border-[#e8ece9] bg-[#f8faf9] px-1 py-0.5 text-[10px]">Enter ↵</kbd> to launch
          </span>

          <Button
            type="submit"
            className="ml-auto bg-[#0f766e] text-white hover:bg-[#115e59]"
            size="sm"
          >
            <span>Ask AgentCart</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>

      {/* Example Prompt Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium text-[#727b76]">Try asking:</span>
        {EXAMPLE_PROMPTS.map((example, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(example)}
            className="rounded-full border border-[#e8ece9] bg-white px-3 py-1 text-xs text-[#727b76] transition-all hover:border-[#0f766e]/30 hover:bg-[#eaf5f2] hover:text-[#0f766e]"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
