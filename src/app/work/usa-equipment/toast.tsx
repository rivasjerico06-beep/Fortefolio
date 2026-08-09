"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BASE } from "./data";

/**
 * The confirmation that slides up when a unit joins the quote list.
 *
 * A module-level store again, for a plainer reason than the quote list: the
 * thing that triggers a toast is a button on a card, and the thing that renders
 * it is fixed to the viewport in the layout. Those are nowhere near each other
 * in the tree.
 *
 * It is announced through a polite live region rather than only drawn, so the
 * confirmation reaches a screen reader too — the button gives no other feedback
 * that the click did anything.
 */

let message: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function showToast(next: string) {
  message = next;
  emit();
  clearTimeout(timer);
  timer = setTimeout(() => {
    message = null;
    emit();
  }, 3400);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => message;
const getServerSnapshot = () => null;

export function ToastHost({ raised }: { raised?: boolean }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      aria-live="polite"
      className={`ue-on-dark pointer-events-none fixed right-4 z-[120] sm:right-6 ${
        raised ? "bottom-[6rem] md:bottom-6" : "bottom-6"
      }`}
    >
      {current ? (
        <div className="ue-toast pointer-events-auto flex max-w-[min(92vw,24rem)] items-center gap-3.5 border-2 border-[var(--ue-yellow)] bg-[var(--ue-ink)] px-4 py-3.5 text-[var(--ue-on-navy)]">
          <span aria-hidden className="size-2.5 shrink-0 bg-[var(--ue-yellow)]" />
          <span className="ue-mono text-[13px] tracking-[0.04em] normal-case">{current}</span>
          <Link
            href={`${BASE}/quote`}
            className="ue-mono ml-auto shrink-0 border-b-2 border-[var(--ue-yellow)] pb-0.5 text-[12px] text-[var(--ue-yellow)]"
          >
            View list
          </Link>
        </div>
      ) : null}
    </div>
  );
}
