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
      <div className="rounded-2xl border border-[#e3e8e5] bg-white p-3.5 shadow-[0_12px_40px_rgb(0,0,0,0.04)] transition-colors focus-within:border-[#0f766e]/50">
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you need and your budget..."
          aria-label="Shopping request"
          className="w-full resize-none bg-transparent px-1.5 py-1 text-[15px] leading-relaxed text-[#181c1a] placeholder:text-[#8a948f] focus:outline-none"
        />

        <div className="mt-2 flex items-center justify-between border-t border-[#f3f6f4] pt-2.5">
          <span className="px-1.5 text-[11px] text-[#9ca5a0]">
            Enter to start
          </span>

          <button
            type="button"
            onClick={() => launchQuery(prompt)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0f766e] px-4 text-xs font-medium text-white transition-colors hover:bg-[#0d655e]"
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
            className="cursor-pointer rounded-full border border-[#e8ece9] bg-[#fcfdfc] px-3.5 py-1.5 text-xs text-[#4b544f] transition-colors hover:border-[#0f766e]/40 hover:bg-white hover:text-[#0f766e]"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
