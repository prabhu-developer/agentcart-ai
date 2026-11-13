import { BudgetAnalysis } from "@/features/shopping/types";
import { CheckCircle2, TrendingUp } from "lucide-react";

interface BudgetAnalysisCardProps {
  analysis: BudgetAnalysis;
}

export function BudgetAnalysisCard({ analysis }: BudgetAnalysisCardProps) {
  const safeBudget = Math.max(analysis.budget, 1);
  const ratio = Math.min(100, Math.round((analysis.total / safeBudget) * 100));
  const isOver = analysis.status === "slightly_over";

  return (
    <div className="rounded-2xl border border-[#EAE6F2] bg-white p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(33,27,46,0.03)] transition-all">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777181]">
            Budget Overview
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums text-[#211B2E]">
              ${analysis.total.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-[#777181]">
              of ${analysis.budget.toLocaleString()} target budget
            </span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums border ${
            isOver
              ? "bg-[#FDF2F2] text-[#D64545] border-[#FCDADA]"
              : "bg-[#EDFAF2] text-[#16A34A] border-[#D5F5E3]"
          }`}
        >
          {isOver ? (
            <>
              <TrendingUp className="size-3.5" />
              <span>${Math.abs(analysis.difference).toFixed(2)} over budget</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5 text-[#16A34A]" />
              <span>${analysis.difference.toFixed(2)} remaining</span>
            </>
          )}
        </span>
      </div>

      {/* Progress track */}
      <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-[#F2EDFC]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isOver ? "bg-[#D64545]" : "bg-[#5125A8]"
          }`}
          style={{ width: `${ratio}%` }}
        />
      </div>

      {/* Itemized Cost Breakdown */}
      {analysis.breakdown.length > 0 && (
        <div className="mt-4 border-t border-[#F8F7FB] pt-3">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#777181]">
            Allocation breakdown
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {analysis.breakdown.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAE6F2] bg-[#F8F7FB] px-2.5 py-1 text-[11px] text-[#211B2E]"
              >
                <span className="truncate max-w-36 text-[#777181]">
                  {item.label}
                </span>
                <span className="tabular-nums font-semibold text-[#5125A8]">
                  ${item.amount.toFixed(2)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
