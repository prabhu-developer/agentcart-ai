import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0f766e]/15 bg-[#eaf5f2] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0f766e]">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-[#202522] sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-[#727b76]">
          {description}
        </p>
      )}
    </div>
  );
}
