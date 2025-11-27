import { motion } from "framer-motion";

export default function ConfettiPulse() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0.05 }}
      animate={{ scale: 1.1, opacity: 0.12 }}
      transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse" }}
      className="absolute inset-0 rounded-2xl bg-[var(--primary-color)] pointer-events-none blur-3xl opacity-10"
    />
  );
}
