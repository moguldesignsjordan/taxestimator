import React from "react";
import { TaxFormData, FilingStatus } from "../types";
import { QUESTIONS } from "../constants";

interface Props {
  formData: TaxFormData;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  language?: string;
}

export default function SummaryCard({
  formData,
  onSubmit,
  onBack,
  isLoading,
  error,
  language,
}: Props) {
  // Get readable filing status label
  const filingStatusLabel =
    QUESTIONS.find((q) => q.id === "filing_status")
      ?.options?.find((opt) => opt.value === formData.filing_status)?.label ??
    formData.filing_status;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <h2 className="text-3xl font-bold text-center mb-6">
        {language === "es" ? "Revisar Información" : "Review Your Information"}
      </h2>

      <div className="flex flex-col gap-4 text-[var(--text-color)] bg-[var(--card-bg-color)] border border-[var(--border-color)] p-6 rounded-xl shadow-md">
        <p>
          <strong>Tax Year:</strong> {formData.tax_year}
        </p>

        <p>
          <strong>Filing Status:</strong> {filingStatusLabel}
        </p>

        <p>
          <strong>Age:</strong> {formData.age_primary}
        </p>

        {formData.filing_status === FilingStatus.MFJ && formData.age_spouse && (
          <p>
            <strong>Spouse Age:</strong> {formData.age_spouse}
          </p>
        )}

        <p>
          <strong>Dependents (Under 17):</strong> {formData.u17_dependents}
        </p>

        <p>
          <strong>Other Dependents:</strong> {formData.other_dependents}
        </p>

        <p>
          <strong>W-2 Wages:</strong> ${formData.w2_wages.toLocaleString()}
        </p>

        <p>
          <strong>Federal Withholding:</strong> $
          {formData.federal_withheld.toLocaleString()}
        </p>

        <p>
          <strong>Unemployment:</strong> $
          {formData.unemployment.toLocaleString()}
        </p>

        <p>
          <strong>Student Loan Interest:</strong> $
          {formData.student_loan_interest.toLocaleString()}
        </p>

        {(formData.self_employment_gross ?? 0) > 0 && (
          <>
            <p>
              <strong>Self-Employment Gross:</strong> $
              {formData.self_employment_gross.toLocaleString()}
            </p>
            <p>
              <strong>Self-Employment Expenses:</strong> $
              {formData.self_employment_expenses.toLocaleString()}
            </p>
            <p>
              <strong>Net Self-Employment Income:</strong> $
              {formData.self_employment_net.toLocaleString()}
            </p>
          </>
        )}

        <p>
          <strong>Childcare Expenses:</strong> $
          {formData.childcare_expenses.toLocaleString()}
        </p>

        {error && (
          <p className="text-red-400 text-center mt-4">{error}</p>
        )}
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <button
          onClick={onBack}
          className="
            w-1/2 py-3 rounded-lg bg-[var(--secondary-color)]
            text-[var(--secondary-text-color)] hover:bg-[var(--secondary-color-hover)]
          "
        >
          {language === "es" ? "Atrás" : "Back"}
        </button>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="
            w-1/2 py-3 rounded-lg bg-[var(--primary-color)] 
            text-white font-semibold hover:bg-[var(--primary-color-hover)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading
            ? language === "es"
              ? "Procesando..."
              : "Processing..."
            : language === "es"
            ? "Obtener Reembolso"
            : "Get Estimate"}
        </button>
      </div>
    </div>
  );
}
