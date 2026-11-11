import { BudgetAnalysis } from "@/features/shopping/types";

interface BudgetAnalysisCardProps {
  analysis: BudgetAnalysis;
}

export function BudgetAnalysisCard({ analysis }: BudgetAnalysisCardProps) {
  const safeBudget = Math.max(analysis.budget, 1);
  const ratio = Math.min(100, Math.round((analysis.total / safeBudget) * 100));
  const isOver = analysis.status === "slightly_over";

  return (
    <div className="rounded-2xl border border-[#e8ece9] bg-[#f8faf9]/75 px-4 py-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold tabular-nums text-[#181c1a]">
            ${analysis.total.toFixed(2)}
          </span>
          <span className="text-xs text-[#727b76]">
            of ${analysis.budget.toLocaleString()} budget
          </span>
        </div>

        <span
          className={`text-xs font-medium tabular-nums ${
            isOver ? "text-amber-700" : "text-[#0f766e]"
          }`}
        >
          {isOver
            ? `$${Math.abs(analysis.difference).toFixed(2)} over`
            : `$${analysis.difference.toFixed(2)} remaining`}
        </span>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e6ece8]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver ? "bg-amber-500" : "bg-[#0f766e]"
          }`}
          style={{ width: `${ratio}%` }}
        />
      </div>

      {analysis.breakdown.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6b7470]">
          {analysis.breakdown.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1">
              <span className="truncate max-w-[180px]">{item.label}</span>
              <span className="tabular-nums text-[#181c1a]">
                ${item.amount.toFixed(2)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
