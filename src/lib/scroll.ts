/**
 * One scroll listener and one animation frame for the whole page.
 *
 * Every scroll-driven scene subscribes here instead of attaching its own
 * listener, so five scenes still cost one `scroll` handler and one rAF per
 * frame. Callbacks run in a single batch, which also keeps all the scenes on
 * the same frame as each other.
 */

type Subscriber = (state: ScrollState) => void;

export type ScrollState = {
  y: number;
  /** Pixels moved since the previous frame — signed, positive scrolling down. */
  velocity: number;
};

const subscribers = new Set<Subscriber>();
let frame = 0;
let lastY = 0;
let attached = false;

function flush() {
  frame = 0;
  const y = window.scrollY;
  const state: ScrollState = { y, velocity: y - lastY };
  lastY = y;
  for (const subscriber of subscribers) subscriber(state);
}

function request() {
  if (!frame) frame = requestAnimationFrame(flush);
}

export function subscribeScroll(callback: Subscriber) {
  subscribers.add(callback);

  if (!attached) {
    lastY = window.scrollY;
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    attached = true;
  }

  // Paint once immediately so the scene is correct before the first scroll
  callback({ y: window.scrollY, velocity: 0 });

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(frame);
      frame = 0;
      attached = false;
    }
  };
}

export const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * How far the viewport has travelled through a tall element, 0 → 1.
 * Pair with a `sticky` child to build a pinned scene.
 */
export function progressThrough(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  return distance > 0 ? clamp01(-rect.top / distance) : 0;
}

/** 0 when the element's top edge enters the viewport, 1 when its bottom leaves. */
export function progressAcross(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const total = window.innerHeight + rect.height;
  return clamp01((window.innerHeight - rect.top) / total);
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
