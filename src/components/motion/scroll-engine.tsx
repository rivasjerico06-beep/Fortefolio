"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Inline head script. Adds `.js` so the CSS starting states (opacity 0 and
 * friends) apply, and arms a failsafe that strips it again if the engine below
 * never mounts — a hydration error must never leave the page invisible.
 */
export const revealInitScript = `
(function () {
  var root = document.documentElement;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("js");
    window.__revealFailsafe = setTimeout(function () {
      root.classList.remove("js");
    }, 2500);
  } catch (e) {
    root.classList.remove("js");
  }
})();
`;

/**
 * Drives the whole motion layer: Lenis for smooth scrolling and one
 * IntersectionObserver that flips `[data-reveal]` elements to `.is-in` as they
 * enter. Re-scans on navigation so client-side route changes animate too.
 */
export function ScrollEngine() {
  const pathname = usePathname();

  useEffect(() => {
    // Hydration succeeded — the failsafe is no longer needed.
    clearTimeout(window.__revealFailsafe);

    const targets = document.querySelectorAll<HTMLElement>("[data-reveal], .word-rise");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.documentElement.classList.remove("js");
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    document.documentElement.classList.add("js");

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target); // reveal once, then stop watching
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

declare global {
  interface Window {
    __revealFailsafe?: ReturnType<typeof setTimeout>;
  }
}
