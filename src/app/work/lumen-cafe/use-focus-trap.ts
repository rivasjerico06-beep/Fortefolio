"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Keeps keyboard focus inside an open overlay, and gives it back afterwards.
 *
 * Anything that covers the page — the basket drawer, the mobile nav — is a
 * modal in practice, and the basket says so with `aria-modal`. Without this,
 * that claim is a lie: Tab walks straight out of the panel and into the page
 * behind it, which is invisible to a sighted keyboard user and announced as
 * inert to a screen reader. The focus then sits somewhere nobody can see.
 *
 * Focus starts on whatever is marked `data-autofocus`, falling back to the
 * first focusable thing, and returns to whatever opened the overlay on close.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const opener = document.activeElement as HTMLElement | null;

    // Recomputed on every keypress: the drawer's contents change as lines are
    // removed, so a list captured once would go stale.
    const focusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const preferred = node.querySelector<HTMLElement>("[data-autofocus]");
    (preferred ?? focusable()[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = focusable();
      if (list.length === 0) {
        event.preventDefault();
        return;
      }

      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement;
      const outside = !node.contains(current);

      if (event.shiftKey && (current === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      opener?.focus?.();
    };
  }, [ref, active]);
}
