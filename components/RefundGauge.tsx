import React from "react";
import { motion } from "framer-motion";

interface RefundGaugeProps {
  amount: number;
  low: number;
  high: number;
}

export default function RefundGauge({ amount, low, high }: RefundGaugeProps) {
  const pct =
    high === low ? 1 : (amount - low) / (high - low);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * pct;

  return (
    <div className="my-6 flex flex-col items-center">
      <div className="relative h-[160px] w-[160px] flex items-center justify-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="transform -rotate-90"
        >
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--border-color)"
            strokeWidth="14"
            fill="none"
            className="opacity-30"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--primary-color)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute text-center"
        >
          <p className="text-sm text-[var(--text-color-light)]">Average</p>
          <p className="text-3xl font-bold text-[var(--primary-color)]">
            ${Math.round(amount).toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
