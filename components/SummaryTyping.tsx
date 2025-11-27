import React, { useEffect, useState } from "react";

export default function SummaryTyping({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 22); // smooth + fast

    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="text-[var(--text-color)] leading-relaxed text-lg opacity-90 whitespace-pre-line">
      {displayed}
    </p>
  );
}
