"use client";

import { useEffect, useState } from "react";
import { onPageWeight, GRAMS_PER_MB } from "@/lib/page-weight";

/**
 * Reads what this page actually cost to load and estimates the carbon from it.
 * The byte count is measured; the grams are modelled, and the label says so.
 */
export function PageWeight() {
  const [kb, setKb] = useState<number | null>(null);

  useEffect(() => onPageWeight(setKb), []);

  const grams = kb === null ? null : (kb / 1024) * GRAMS_PER_MB;

  return (
    <div className="text-ink-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px] tracking-wide">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex size-1.5">
          <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-70" />
          <span className="bg-accent relative inline-flex size-1.5 rounded-full" />
        </span>
        THIS PAGE
      </span>
      <span className="text-ink-2">
        {kb === null ? "measuring…" : `${kb.toFixed(0)} KB transferred`}
      </span>
      {grams !== null && (
        <span aria-label={`Approximately ${grams.toFixed(2)} grams of CO2 per visit`}>
          ≈ {grams.toFixed(2)} g CO₂ / visit (est.)
        </span>
      )}
    </div>
  );
}
