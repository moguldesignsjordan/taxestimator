import React from "react";
import { TaxBreakdown } from "../types";
import { CheckIcon } from "./icons/CheckIcon";

interface BreakdownCardProps {
  breakdown: TaxBreakdown;
}

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

export default function BreakdownCard({ breakdown }: BreakdownCardProps) {
  const b = breakdown || {};

  return (
    <div
      className="
        bg-[var(--card-bg-color)]
        border border-[var(--border-color)]
        rounded-xl 
        p-6 md:p-8 
        shadow-xl 
        mt-10
        animate-fade-in-up
      "
    >
      <h3 className="font-semibold text-2xl mb-4 text-[var(--primary-color)] flex items-center gap-2">
        <CheckIcon className="h-6 w-6" />
        Detailed Tax Breakdown
      </h3>

      {/* Income */}
      <div className="mb-6">
        <h4 className="font-bold text-xl mb-2 text-[var(--text-color)]">Income</h4>
        <div className="space-y-2 text-[var(--text-color-light)]">
          <div className="flex justify-between">
            <span>Adjusted Gross Income (AGI)</span>
            <strong className="text-[var(--text-color)]">{currency(b.agi)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Standard Deduction</span>
            <strong className="text-[var(--text-color)]">{currency(b.standard_deduction)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Taxable Income</span>
            <strong className="text-[var(--text-color)]">{currency(b.taxable_income)}</strong>
          </div>
        </div>
      </div>

      {/* Tax */}
      <div className="mb-6">
        <h4 className="font-bold text-xl mb-2 text-[var(--text-color)]">Tax Calculations</h4>
        <div className="space-y-2 text-[var(--text-color-light)]">
          <div className="flex justify-between">
            <span>Tentative Tax</span>
            <strong className="text-[var(--text-color)]">{currency(b.tentative_tax)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Self-Employment Tax</span>
            <strong className="text-[var(--text-color)]">{currency(b.se_tax)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Total Tax</span>
            <strong className="text-[var(--text-color)]">{currency(b.total_tax)}</strong>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="mb-6">
        <h4 className="font-bold text-xl mb-2 text-[var(--text-color)]">Credits</h4>

        <div className="space-y-2 text-[var(--text-color-light)]">
          <div className="flex justify-between">
            <span>CTC (Nonrefundable)</span>
            <strong className="text-[var(--text-color)]">
              {currency(b.credits?.ctc_nonrefundable || 0)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>CTC (Refundable)</span>
            <strong className="text-[var(--text-color)]">
              {currency(b.credits?.ctc_refundable || 0)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Other Dependent Credit</span>
            <strong className="text-[var(--text-color)]">
              {currency(b.credits?.odc || 0)}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Earned Income Tax Credit</span>
            <strong className="text-[var(--text-color)]">
              {currency(b.credits?.eitc || 0)}
            </strong>
          </div>

          <hr className="border-[var(--border-color)] my-3" />

          <div className="flex justify-between">
            <span>Total Credits (nonrefundable)</span>
            <strong className="text-[var(--text-color)]">{currency(b.total_credits)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Refundable Credits</span>
            <strong className="text-[var(--text-color)]">{currency(b.refundable_credits)}</strong>
          </div>
        </div>
      </div>

      {/* Withholding */}
      <div className="mb-4">
        <h4 className="font-bold text-xl mb-2 text-[var(--text-color)]">Withholding</h4>

        <div className="flex justify-between text-[var(--text-color-light)]">
          <span>Federal Withheld</span>
          <strong className="text-[var(--text-color)]">{currency(b.withholding)}</strong>
        </div>
      </div>
    </div>
  );
}
