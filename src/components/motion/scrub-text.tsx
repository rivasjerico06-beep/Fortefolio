"use client";

import { useEffect, useRef } from "react";
import { subscribeScroll, progressThrough, prefersReducedMotion } from "@/lib/scroll";

/**
 * A statement that lights up word by word as you scroll through it.
 *
 * The words are dim rather than hidden, and `--p` falls back to 1, so without
 * JavaScript the whole sentence is simply lit and readable. The text is one
 * continuous string in the DOM, so screen readers hear a sentence, not a list.
 */
export function ScrubText({ text, footnote }: { text: string; footnote?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;
    if (prefersReducedMotion()) {
      panel.style.setProperty("--p", "1");
      return;
    }

    return subscribeScroll(() => {
      // Bias slightly ahead so the last word lands before the scene releases
      panel.style.setProperty("--p", String(progressThrough(wrap) * 1.15));
    });
  }, []);

  return (
    <div ref={wrapRef} data-scene-wrap="scrub" className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8">
          <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
            The argument
          </p>
          <p
            ref={panelRef}
            data-scene="scrub"
            style={{ "--n": words.length } as React.CSSProperties}
            className="mt-8 max-w-5xl text-[clamp(1.6rem,4.6vw,3.75rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance"
          >
            {words.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className="scrub-word" style={{ "--i": index } as React.CSSProperties}>
                  {word}
                </span>
                {index < words.length - 1 ? " " : null}
              </span>
            ))}
          </p>
          {footnote && (
            <p className="text-ink-3 mt-10 max-w-md text-sm leading-relaxed">{footnote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
