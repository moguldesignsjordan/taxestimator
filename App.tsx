import React, { useState, useMemo, useCallback, useEffect } from "react";
import { FilingStatus, TaxFormData, GeminiResponse } from "./types";
import { QUESTIONS } from "./constants";
import getGeminiResponse from "./services/geminiService";

import ProgressIndicator from "./components/ProgressIndicator";
import QuestionCard from "./components/QuestionCard";
import SummaryCard from "./components/SummaryCard";
import ResultCard from "./components/ResultCard";

/* ============================================================================
   DEFAULT FORM DATA
============================================================================ */
const initialFormData: TaxFormData = {
  tax_year: 2025,
  filing_status: FilingStatus.SINGLE,
  age_primary: 23,
  age_spouse: null,
  u17_dependents: 0,
  other_dependents: 0,
  w2_wages: 0,
  federal_withheld: 0,
  self_employment_gross: 0,
  self_employment_expenses: 0,
  self_employment_net: 0,
  unemployment: 0,
  student_loan_interest: 0,
  childcare_expenses: 0,
};

/* ============================================================================
   BRANDING + THEME
============================================================================ */
const defaultBranding = {
  appName: "AI Refund Estimator",
  logoUrl: "/logo.png",
};

const useBranding = () => {
  const [branding, setBranding] = useState(defaultBranding);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBranding({
      ...defaultBranding,
      appName: params.get("appName") || defaultBranding.appName,
      logoUrl: params.get("logoUrl") || defaultBranding.logoUrl,
    });

    const style = document.createElement("style");
    style.innerHTML = `
      :root {
        --bg-color: #020617;
        --text-color: #f9fafb;
        --text-color-light: #9ca3af;
        --text-color-lighter: #6b7280;

        --card-bg-color: #020617;
        --border-color: #1f2937;

        --primary-color: #009A44;
        --primary-color-hover: #00B34B;

        --secondary-color: #1e293b;
        --secondary-color-hover: #334155;
        --secondary-text-color: #d1d5db;

        --success-color: #34d399;
        --error-color: #f87171;

        --footer-bg: #020617;
      }

      .animate-fade-in-up {
        animation: fadeInUp .45s ease-out forwards;
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-slide-in {
        animation: slideIn .45s ease-out forwards;
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return branding;
};

/* ============================================================================
   LOADER
============================================================================ */
const Loader = () => (
  <div className="flex flex-col items-center justify-center py-10 text-[var(--text-color-light)] animate-fade-in-up">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--primary-color)] border-t-transparent mb-4"></div>
    <p>Calculating your estimate…</p>
  </div>
);

/* ============================================================================
   SHARE BUTTON
============================================================================ */
const ShareCard = ({ text }: { text: string }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Unable to copy");
    }
  };
  return (
    <button
      onClick={copy}
      className="btn-strong mt-6 w-full py-3 bg-[var(--secondary-color)] text-[var(--secondary-text-color)] rounded-lg hover:bg-[var(--secondary-color-hover)] transition"
    >
      Share Estimate
    </button>
  );
};

const detectLanguage = () => {
  const lang = navigator.language || navigator.languages?.[0] || "en";
  return lang.startsWith("es") ? "es" : "en";
};

/* ============================================================================
   MAIN APP
============================================================================ */
export default function App() {
  const branding = useBranding();

  const [step, setStep] = useState(0);
  const [language] = useState(detectLanguage());
  const [formData, setFormData] = useState<TaxFormData>(initialFormData);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ============================================================================
     RESTORE SAVED FORM
  ============================================================================ */
  useEffect(() => {
    const saved = localStorage.getItem("tax_form_v1");
    if (saved) try { setFormData(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("tax_form_v1", JSON.stringify(formData));
  }, [formData]);

  /* ============================================================================
     ACTIVE QUESTIONS
  ============================================================================ */
  const activeQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.condition || q.condition(formData)),
    [formData]
  );
  const currentQuestion = activeQuestions[step];

  /* ============================================================================
     DATA CHANGE HANDLER
  ============================================================================ */
  const handleDataChange = useCallback((field: keyof TaxFormData, value: any) => {
    setValidationError(null);

    // Fix select value mismatches
    const question = QUESTIONS.find((q) => q.id === field);
    if (question?.type === "select") {
      value = String(value);
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "filing_status" && value !== FilingStatus.MFJ) {
        next.age_spouse = null;
      }

      return next;
    });
  }, []);

  /* ============================================================================
     VALIDATION (FULLY FIXED)
  ============================================================================ */
  const validateStep = () => {
    if (!currentQuestion) return true;

    if (currentQuestion.required) {
      const val = (formData as any)[currentQuestion.id];

      if (
        val === "" ||
        val === null ||
        (typeof val === "number" && isNaN(val))
      ) {
        setValidationError("This field is required.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setValidationError(null);
    if (step > 0) setStep((prev) => prev - 1);
  };

  /* ============================================================================
     SUBMIT — CALL AI BACKEND
  ============================================================================ */
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedForm = {
        ...formData,
        self_employment_net: Math.max(
          0,
          (formData.self_employment_gross || 0) -
            (formData.self_employment_expenses || 0)
        ),
        language,
      };

      const response = await getGeminiResponse(updatedForm);

      setResult({
        ...response,
        summary: response.summary?.trim() || "",
      });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  /* ============================================================================
     VIEW ENGINE
  ============================================================================ */
  const renderContent = () => {
    if (result)
      return (
        <ResultCard result={result} onReset={handleReset} language={language} />
      );

    if (isLoading) return <Loader />;

    if (step >= activeQuestions.length) {
      return (
        <div className="animate-fade-in-up w-full">
          <SummaryCard
            formData={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            error={error}
            language={language}
          />
        </div>
      );
    }

    return (
      <div className="animate-slide-in w-full">
        <QuestionCard
          question={currentQuestion}
          formData={formData}
          onDataChange={handleDataChange}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={step === 0}
          isLast={step === activeQuestions.length - 1}
          validationError={validationError}
          language={language}
        />
      </div>
    );
  };

  /* ============================================================================
     UI STRUCTURE
  ============================================================================ */
  return (
    <div className="min-h-screen text-[var(--text-color)] flex flex-col p-4 bg-[var(--bg-color)]">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* HERO */}
        <header className="text-center mb-8 animate-fade-in-up">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <img src={branding.logoUrl} alt="" className="max-h-20 w-auto object-contain" />
          </div>

          <h1 className="text-4xl font-bold mb-2">{branding.appName}</h1>

          <p className="text-sm text-[var(--text-color-light)]">
            {language === "es"
              ? "Estimador impulsado por Google Gemini"
              : "Powered by Google Gemini AI"}
          </p>
        </header>

        {/* MAIN CARD */}
        <main className="animate-fade-in-up bg-[var(--card-bg-color)] border border-[var(--border-color)] rounded-2xl shadow-xl p-6 md:p-8 min-h-[480px] flex flex-col text-[var(--text-color)]">
          {!result && (
            <ProgressIndicator
              currentStep={step}
              totalSteps={activeQuestions.length + 1}
            />
          )}

          <div className="flex-grow flex items-center justify-center">
            {renderContent()}
          </div>
        </main>

        {/* RESULT ACTIONS */}
        {result && (
          <>
            <ShareCard
              text={`My estimated refund range: ${result.json_result.estimate.refund_low} to ${result.json_result.estimate.refund_high}. Estimated by Tax Moguls.`}
            />

            <a
              href="https://www.thetaxmoguls.com/file-now"
              target="_blank"
              className="btn-strong block w-full text-center mt-6 py-3 bg-[var(--primary-color)] text-white font-bold rounded-lg hover:bg-[var(--primary-color-hover)] transition"
            >
              {language === "es"
                ? "Presenta tus impuestos"
                : "File Your Taxes with Tax Moguls"}
            </a>
          </>
        )}

        {/* FOOTER */}
        <footer className="text-center mt-8 text-sm text-[var(--text-color-lighter)]">
          © {new Date().getFullYear()} {branding.appName}. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
