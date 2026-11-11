import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#eef1ef] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-xs text-[#727b76]">
          <span className="font-semibold text-[#181c1a]">AgentCart</span>
          <span>·</span>
          <span>Personal AI Shopping</span>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs text-[#6b7470]">
          <Link href="/shop" className="transition-colors hover:text-[#181c1a]">
            Assistant
          </Link>
          <Link
            href="/shop?category=all"
            className="transition-colors hover:text-[#181c1a]"
          >
            Catalog
          </Link>
          <a href="#setups" className="transition-colors hover:text-[#181c1a]">
            Setups
          </a>
          <span className="text-[#9ca5a0]">PayPal Sandbox</span>
        </nav>
      </div>
    </footer>
  );
}
