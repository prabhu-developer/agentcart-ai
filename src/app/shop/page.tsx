import { Suspense } from "react";
import { Metadata } from "next";
import { ShoppingWorkspace } from "@/features/shopping/components/shopping-workspace";

export const metadata: Metadata = {
  title: "Shopping Assistant — AgentCart AI",
  description:
    "AI-powered commerce workspace. Tell AgentCart what you need, compare curated options, and organize your cart.",
};

function WorkspaceFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8F7FB] text-[#777181]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-11 rounded-full agentcart-orb animate-pulse" />
        <p className="text-xs font-semibold text-[#777181]">
          Initializing AgentCart Workspace...
        </p>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#F8F7FB]">
      <Suspense fallback={<WorkspaceFallback />}>
        <ShoppingWorkspace />
      </Suspense>
    </div>
  );
}
