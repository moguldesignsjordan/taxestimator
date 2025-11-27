import React from "react";
import { motion } from "framer-motion";
import { GeminiResponse } from "../types";
import RefundGauge from "./RefundGauge";
import SummaryTyping from "./SummaryTyping";
import ConfettiPulse from "./ConfettiPulse";
import BreakdownCard from "./BreakdownCard";

interface ResultCardProps {
  result: GeminiResponse;
  onReset: () => void;
  language?: string;
}

export default function ResultCard({
  result,
  onReset,
  language,
}: ResultCardProps) {
  const {
    json_result: { estimate },
    summary,
  } = result;

  const breakdown = estimate.breakdown || {};
  const isRefund = estimate.refund_low >= 0;
  const mid = (estimate.refund_low + estimate.refund_high) / 2;

  const currency = (n: number) =>
    Math.abs(n).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto text-center"
    >
      {/* Confetti Glow */}
      <ConfettiPulse />

      <h2 className="text-4xl font-bold text-[var(--text-color)] mb-4 relative z-10">
        {isRefund ? "Estimated Refund" : "Amount Due"}
      </h2>

      {/* Animated Gauge */}
      <RefundGauge amount={mid} low={estimate.refund_low} high={estimate.refund_high} />

      {/* Refund Amount */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-6xl md:text-7xl font-bold mb-6 relative z-10 ${
          isRefund ? "text-[var(--success-color)]" : "text-[var(--error-color)]"
        }`}
      >
        {currency(mid)}
      </motion.div>

      {/* Range */}
      <p className="text-[var(--text-color-light)] mb-10 text-lg relative z-10">
        {language === "es"
          ? "Su rango estimado está entre "
          : "Your estimated range is between "}
        <strong className="text-[var(--text-color)]">
          {currency(estimate.refund_low)}
        </strong>
        {language === "es" ? " y " : " and "}
        <strong className="text-[var(--text-color)]">
          {currency(estimate.refund_high)}
        </strong>
        .
      </p>

      {/* Summary (typing animation) */}
      <div
        className="
          bg-[var(--card-bg-color)]
          border border-[var(--border-color)]
          rounded-xl 
          p-6 md:p-8
          text-left
          shadow-xl
          mb-10
          relative z-10
        "
      >
        <h3 className="font-semibold text-xl mb-3 text-[var(--primary-color)]">
          {language === "es" ? "Resumen del Análisis" : "Analysis Summary"}
        </h3>

        <SummaryTyping text={summary.trim()} />
      </div>

      {/* Breakdown */}
      <BreakdownCard breakdown={breakdown} />

      <button
        onClick={onReset}
        className="
          mt-12
          px-8 py-3 
          bg-[var(--secondary-color)] 
          text-[var(--secondary-text-color)] 
          font-bold 
          rounded-lg 
          hover:bg-[var(--secondary-color-hover)] 
          transition
        "
      >
        {language === "es" ? "Empezar de nuevo" : "Start Over"}
      </button>
    </motion.div>
  );
}
