import { BudgetAnalysis } from "@/features/shopping/types";

interface BudgetAnalysisCardProps {
  analysis: BudgetAnalysis;
}

export function BudgetAnalysisCard({ analysis }: BudgetAnalysisCardProps) {
  const safeBudget = Math.max(analysis.budget, 1);
  const ratio = Math.min(100, Math.round((analysis.total / safeBudget) * 100));
  const isOver = analysis.status === "slightly_over";

  return (
    <div className="rounded-2xl border border-[#e5e9e7] bg-[#fafafa] p-4 sm:p-5 shadow-[0_2px_12px_rgb(0,0,0,0.03)] transition-all">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tabular-nums text-[#111817]">
            ${analysis.total.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-[#7a8580]">
            of ${analysis.budget.toLocaleString()} target budget
          </span>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${isOver
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-[#edf7f5] text-[#0a5c55] border border-[#0a5c55]/20"
            }`}
        >
          {isOver
            ? `$${Math.abs(analysis.difference).toFixed(2)} over budget`
            : `$${analysis.difference.toFixed(2)} remaining`}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e5e9e7]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isOver ? "bg-amber-500" : "bg-[#0a5c55]"
            }`}
          style={{ width: `${ratio}%` }}
        />
      </div>

      {analysis.breakdown.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-1">
          {analysis.breakdown.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e9e7] bg-white px-2.5 py-1 text-[11px] text-[#525b56]"
            >
              <span className="truncate max-w-35 font-medium text-[#111817]">
                {item.label}
              </span>
              <span className="tabular-nums font-semibold text-[#0a5c55]">
                ${item.amount.toFixed(2)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
