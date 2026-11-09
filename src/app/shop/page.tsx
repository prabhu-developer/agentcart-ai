import { Suspense } from "react";
import { Metadata } from "next";
import { ShoppingWorkspace } from "@/features/shopping/components/shopping-workspace";
import { SiteHeader } from "@/components/layout/site-header";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Shopping Assistant — AgentCart",
  description:
    "AI-powered commerce workspace. Tell AgentCart what you need, compare curated options, and organize your cart.",
};

function WorkspaceFallback() {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-white text-[#727b76]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf5f2] text-[#0f766e]">
          <Sparkles className="size-5 animate-pulse" />
        </div>
        <p className="text-xs font-medium">Initializing AgentCart Workspace...</p>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <Suspense fallback={<WorkspaceFallback />}>
        <ShoppingWorkspace />
      </Suspense>
    </div>
  );
}
