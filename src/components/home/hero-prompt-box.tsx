"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MOCK_EXAMPLE_PROMPTS } from "@/features/shopping/data/mock-products";

export function HeroPromptBox() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const launchQuery = (text: string) => {
    const query = text.trim();
    if (!query) {
      router.push("/shop");
      return;
    }
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      launchQuery(prompt);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="rounded-2xl border border-[#e5e9e7] bg-white p-4 shadow-[0_12px_36px_rgb(0,0,0,0.04)] transition-all duration-200 focus-within:border-[#0a5c55]/50 focus-within:shadow-[0_12px_36px_rgb(10,92,85,0.08)]">
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you need and your budget..."
          aria-label="Shopping request"
          className="w-full resize-none bg-transparent px-1.5 py-1 text-[15px] sm:text-[16px] leading-relaxed text-[#111817] placeholder:text-[#9ca5a0] focus:outline-none"
        />

        <div className="mt-2.5 flex items-center justify-between border-t border-[#f4f6f5] pt-3">
          <span className="px-1.5 text-[11px] text-[#9ca5a0]">
            Enter to start
          </span>

          <button
            type="button"
            onClick={() => launchQuery(prompt)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0a5c55] px-4 text-xs font-medium text-white transition-all hover:bg-[#084f49]"
          >
            <span>Ask AgentCart</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {MOCK_EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => launchQuery(example)}
            className="cursor-pointer rounded-full border border-[#e5e9e7] bg-[#fafafa] px-3.5 py-1.5 text-xs text-[#525b56] transition-all hover:border-[#0a5c55] hover:bg-[#edf7f5] hover:text-[#0a5c55]"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
