import React from "react";
import { CheckCircle2, DollarSign, Wallet } from "lucide-react";
import { BudgetAnalysis } from "../types";

interface BudgetAnalysisCardProps {
  analysis: BudgetAnalysis;
}

export function BudgetAnalysisCard({ analysis }: BudgetAnalysisCardProps) {
  const { total, budget, status, difference, breakdown } = analysis;
  const percentage = Math.min(100, Math.round((total / budget) * 100));

  return (
    <div className="my-3.5 rounded-2xl border border-[#e8ece9] bg-[#f8faf9] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ece9] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#eaf5f2] text-[#0f766e]">
            <Wallet className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202522]">
              Budget Optimization Analysis
            </h4>
            <p className="text-[11px] text-[#727b76]">
              Real-time calculation against your stated spending target
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="size-3.5" />
          {status === "under_budget" ? "Under Target Budget" : "Within Stated Budget"}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center sm:gap-4">
        <div className="rounded-xl border border-[#e8ece9] bg-white p-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#727b76]">
            Total Cost
          </span>
          <p className="text-sm font-bold text-[#202522] sm:text-base">
            ${total.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-[#e8ece9] bg-white p-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#727b76]">
            Target Budget
          </span>
          <p className="text-sm font-bold text-[#202522] sm:text-base">
            ${budget.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-[#e8ece9] bg-white p-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#727b76]">
            Remaining Savings
          </span>
          <p className="text-sm font-bold text-[#0f766e] sm:text-base">
            +${difference.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-[#727b76]">
          <span>Budget Utilization</span>
          <span className="font-semibold text-[#202522]">{percentage}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e8ece9]">
          <div
            className="h-full rounded-full bg-[#0f766e] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Allocation Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="mt-3.5 border-t border-[#e8ece9] pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#727b76]">
            Itemized Cost Breakdown
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {breakdown.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md border border-[#e8ece9] bg-white px-2 py-0.5 text-[11px] text-[#202522]"
              >
                <DollarSign className="size-3 text-[#0f766e]" />
                <span className="max-w-[140px] truncate text-[#727b76]">{item.label}:</span>
                <span className="font-medium">${item.amount.toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
