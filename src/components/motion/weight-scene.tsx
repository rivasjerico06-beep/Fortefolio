"use client";

import { useEffect, useRef, useState } from "react";
import { onPageWeight } from "@/lib/page-weight";
import { subscribeScroll, progressThrough } from "@/lib/scroll";

/**
 * A scroll-pinned scene — the pattern behind most "product page" scroll
 * animations.
 *
 * How it works: a tall outer wrapper reserves the scroll distance, an inner
 * `sticky` panel stays put while you scroll through it, and the wrapper's
 * position in the viewport becomes a 0→1 progress value. Everything else is
 * driven off that number.
 *
 * Progress is written straight to the DOM as CSS custom properties rather than
 * held in React state — a state update per scroll frame would re-render this
 * subtree ~60 times a second for no reason.
 */

const BARS = [
  {
    label: "Median web page",
    kb: 2600,
    note: "HTTP Archive desktop median, rounded",
    tone: "var(--ink-3)",
    // Progress window during which this bar fills
    from: 0.05,
    to: 0.4,
  },
  {
    label: "A portfolio with a hero video",
    kb: 4200,
    note: "illustrative — autoplay video, three font families, an animation library",
    tone: "var(--series-2)",
    from: 0.3,
    to: 0.65,
  },
  {
    label: "This page",
    kb: 250, // replaced at runtime by the real measurement
    note: "measured live in your browser, right now",
    tone: "var(--accent)",
    from: 0.55,
    to: 0.9,
  },
];

const MAX_KB = 4200;
const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function WeightScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // The last bar shows what this page really weighed, not a number I typed in.
  const [measuredKb, setMeasuredKb] = useState<number | null>(null);
  useEffect(() => onPageWeight((kb) => setMeasuredKb(Math.round(kb))), []);

  const weights = BARS.map((bar, index) =>
    index === BARS.length - 1 && measuredKb !== null ? measuredKb : bar.kb,
  );
  const ratio = Math.floor(BARS[1].kb / (weights[2] || 1));

  useEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = (progress: number) => {
      BARS.forEach((bar, index) => {
        const kb = weights[index];
        const local = easeOut(clamp((progress - bar.from) / (bar.to - bar.from)));
        panel.style.setProperty(`--b${index}`, String(local * (kb / MAX_KB)));
        panel.style.setProperty(`--o${index}`, String(clamp(local * 3)));
        const node = numberRefs.current[index];
        if (node) node.textContent = Math.round(kb * local).toLocaleString();
      });
    };

    if (reduced) {
      paint(1);
      return;
    }

    return subscribeScroll(() => paint(progressThrough(wrap)));
    // Repaint once the real page weight arrives and changes the last bar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measuredKb]);

  return (
    // The wrapper's extra height IS the scroll distance the scene plays over
    <div ref={wrapRef} data-scene-wrap="weight" className="relative h-[280vh]">
      <div
        ref={panelRef}
        data-scene="weight"
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
      >
        <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8">
          <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            What a page costs
          </p>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.75rem,4.6vw,3.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-balance">
            Weight is not an abstraction. Someone pays for it.
          </h2>

          <ul className="mt-12 space-y-9 sm:mt-16">
            {BARS.map((bar, index) => (
              <li
                key={bar.label}
                style={{ opacity: `var(--o${index}, 0)` }}
                className="transition-opacity duration-300"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <span className="text-base font-medium sm:text-lg">{bar.label}</span>
                  <span className="text-ink-2 font-mono text-sm tabular-nums">
                    <span
                      ref={(el) => {
                        numberRefs.current[index] = el;
                      }}
                    >
                      0
                    </span>{" "}
                    KB
                  </span>
                </div>
                <div className="bg-surface-2 mt-3 h-2.5 overflow-hidden rounded-full sm:h-3">
                  <div
                    className="h-full origin-left rounded-full"
                    style={{
                      backgroundColor: bar.tone,
                      transform: `scaleX(var(--b${index}, 0))`,
                    }}
                  />
                </div>
                <p className="text-ink-3 mt-2 text-xs">{bar.note}</p>
              </li>
            ))}
          </ul>

          <p
            style={{ opacity: `var(--o2, 0)` }}
            className="text-ink-2 mt-12 max-w-lg text-sm leading-relaxed transition-opacity duration-300"
          >
            {measuredKb === null
              ? "That last figure is measured in your browser as the page loads — it is not a number I typed in."
              : `About ${ratio}× lighter than the site it competes with for attention — and it still has four working demos, a dark mode, and every animation you just scrolled through.`}
          </p>
        </div>
      </div>
    </div>
  );
}
