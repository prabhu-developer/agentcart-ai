"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
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
    <div className="mx-auto w-full max-w-2xl space-y-4 text-left">
      {/* Search Container */}
      <div className="group relative rounded-2xl border border-[#EAE6F2] bg-white p-3.5 shadow-[0_10px_32px_rgba(81,37,168,0.06)] transition-all duration-200 focus-within:border-[#6D45D9] focus-within:shadow-[0_12px_36px_rgba(109,69,217,0.12)] focus-within:ring-4 focus-within:ring-[#6D45D9]/10">
        <div className="flex items-start gap-2.5">
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center text-[#8B6CE8]">
            <Sparkles className="size-4.5" />
          </div>
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you need, your target budget, or paste product specs..."
            aria-label="Shopping request"
            className="w-full resize-none bg-transparent py-0.5 text-sm sm:text-[15px] leading-relaxed text-[#211B2E] placeholder:text-[#777181] focus:outline-none"
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-[#F8F7FB] pt-2.5 pl-1 pr-0.5">
          <div className="flex items-center gap-2 text-xs text-[#777181]">
            <span className="flex items-center gap-1 rounded-md bg-[#F8F7FB] px-2 py-0.5 text-[11px] font-medium text-[#777181] border border-[#EAE6F2]">
              <Zap className="size-3 text-[#6D45D9]" />
              <span>Catalog live</span>
            </span>
            <span className="hidden sm:inline text-[11px]">
              Press <kbd className="rounded bg-[#F8F7FB] px-1 py-0.5 font-mono text-[10px] text-[#211B2E] border border-[#EAE6F2]">Enter</kbd> to start
            </span>
          </div>

          <button
            type="button"
            onClick={() => launchQuery(prompt)}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-[#5125A8] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#431E8C] active:scale-[0.98]"
          >
            <span>Ask AgentCart</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-[11px] font-medium text-[#777181]">Try asking:</span>
        {MOCK_EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => launchQuery(example)}
            className="cursor-pointer rounded-full border border-[#EAE6F2] bg-white px-3.5 py-1.5 text-xs text-[#211B2E] transition-all hover:border-[#6D45D9]/40 hover:bg-[#F2EDFC] hover:text-[#5125A8] shadow-2xs"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
