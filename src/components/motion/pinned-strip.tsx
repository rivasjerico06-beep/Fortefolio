"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, progressThrough, subscribeScroll } from "@/lib/scroll";

/**
 * Pins a section and slides its track sideways as the page scrolls down.
 *
 * The content-agnostic half of `HorizontalGallery`, so more than one demo can
 * use the effect. Degrades the same way: the `.js`-gated CSS only turns this
 * into a pinned scene when the motion layer is live, so with no JavaScript — or
 * under reduced motion — it stays an ordinary swipeable row.
 */
export function PinnedStrip({
  scene,
  children,
  className,
}: {
  /** Unique per page; used for the data attributes tests hook onto. */
  scene: string;
  children: ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!wrap || !panel || !track) return;
    if (prefersReducedMotion()) return;

    let travel = 0;

    const measure = () => {
      // offsetWidth, not scrollWidth: the track is sized by `width: max-content`
      travel = Math.max(track.offsetWidth - panel.clientWidth, 0);
      wrap.style.setProperty("--scene-height", `${window.innerHeight + travel}px`);
    };

    const paint = () => {
      track.style.setProperty("--x", String(progressThrough(wrap) * travel));
    };

    measure();
    const resizeObserver = new ResizeObserver(() => {
      measure();
      paint();
    });
    resizeObserver.observe(track);
    resizeObserver.observe(panel);

    // Tabbing into a pinned panel must move the page, not the hidden overflow —
    // otherwise the browser scrolls the container out of sync with the transform
    const onFocusIn = () => {
      panel.scrollLeft = 0;
    };
    panel.addEventListener("focusin", onFocusIn);

    const unsubscribe = subscribeScroll(paint);
    return () => {
      resizeObserver.disconnect();
      panel.removeEventListener("focusin", onFocusIn);
      unsubscribe();
    };
  }, []);

  return (
    <div ref={wrapRef} data-scene-wrap={scene} className={`hscene relative ${className ?? ""}`}>
      <div ref={panelRef} data-scene={scene} className="hscene-panel">
        <div ref={trackRef} className="hscene-track">
          {children}
        </div>
      </div>
    </div>
  );
}
