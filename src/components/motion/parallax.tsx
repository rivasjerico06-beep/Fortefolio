"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { subscribeScroll, progressAcross, prefersReducedMotion } from "@/lib/scroll";

/**
 * Moves its children at a different rate to the page as they cross the
 * viewport. `speed` is in pixels of total travel — negative rises, positive
 * sinks. Does nothing under reduced motion, and nothing at all without JS,
 * which is exactly right for decoration.
 */
export function Parallax({
  children,
  speed = 60,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    return subscribeScroll(() => {
      // Centre the travel so the element sits neutral mid-viewport
      const offset = (progressAcross(el) - 0.5) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
