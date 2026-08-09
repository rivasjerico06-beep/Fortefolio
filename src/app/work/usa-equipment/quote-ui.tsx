"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Phone } from "lucide-react";
import { subscribeScroll } from "@/lib/scroll";
import { BASE, YARD, type Unit } from "./data";
import { addUnit, countOf, getServerSnapshot, getSnapshot, subscribe } from "./quote-store";
import { ToastHost, showToast } from "./toast";

/** The quote list, read live. Empty on the server, stored list after hydration. */
function useQuoteCount() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return countOf(lines);
}

/**
 * The header's call to action, with the running count of units on the list.
 *
 * The button is a link to the quote page whether or not the list has anything
 * in it — the empty state is a real screen with somewhere to go next, not a
 * dead end, so there is no reason to disable it.
 */
export function QuoteButton() {
  const count = useQuoteCount();

  return (
    <Link
      href={`${BASE}/quote`}
      className="relative flex h-12 shrink-0 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-5 text-sm font-semibold tracking-[0.02em] whitespace-nowrap uppercase transition-[background,transform] duration-150 hover:-translate-y-px hover:bg-[var(--ue-yellow-deep)] active:translate-y-px"
    >
      <span className="hidden sm:inline">Request a quote</span>
      <span className="sm:hidden">Quote</span>

      {count > 0 ? (
        <span
          // Keyed on the count so the pop replays every time it changes
          key={count}
          data-quote-count={count}
          className="ue-pop ue-mono absolute -top-2.5 -right-2.5 flex h-6 min-w-6 items-center justify-center border-2 border-[var(--ue-bg)] bg-[var(--ue-navy)] px-1 text-[12px] text-[var(--ue-on-navy)]"
        >
          {count}
          <span className="sr-only"> units on your quote list</span>
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Adds a unit to the quote list.
 *
 * A button, not a link: it changes state on this page rather than navigating.
 * The confirmation goes through the toast's live region, so the click is
 * announced rather than only drawn.
 */
export function AddToQuote({
  unit,
  size = "md",
  className = "",
}: {
  unit: Unit;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const height = { sm: "h-9 px-3 text-xs", md: "h-11 text-[13px]", lg: "h-14 px-6 text-base" };

  return (
    <button
      type="button"
      onClick={() => {
        addUnit(unit.id);
        showToast(`${unit.id} added to your quote list`);
      }}
      className={`${height[size]} border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] font-semibold tracking-[0.03em] uppercase transition-colors duration-150 hover:bg-[var(--ue-yellow-deep)] ${className}`}
    >
      + Add
      {/* The unit name is always in the accessible name, so a screen reader
          never hears a row of identical "+ Add" buttons. The small variant
          drops "to quote" visually — it wraps in a narrow related-unit card. */}
      <span className="sr-only"> {unit.name}</span>
      <span className={size === "sm" ? "sr-only" : undefined}> to quote</span>
    </button>
  );
}

/** − / + stepper for a line on the quote list. */
export function QtyStepper({
  unit,
  qty,
  onChange,
}: {
  unit: Unit;
  qty: number;
  onChange: (next: number) => void;
}) {
  const cell =
    "flex size-10 items-center justify-center text-lg transition-colors duration-150 hover:bg-[var(--ue-bg)] disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center border-2 border-[var(--ue-ink)]">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={qty <= 1}
        aria-label={`Fewer ${unit.name}`}
        className={`${cell} border-r border-[var(--ue-line)]`}
      >
        −
      </button>
      <span className="ue-mono w-11 text-center text-[15px] normal-case tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        aria-label={`More ${unit.name}`}
        className={`${cell} border-l border-[var(--ue-line)]`}
      >
        +
      </button>
    </div>
  );
}

/**
 * The two things fixed to the viewport: the phone call bar and the toast.
 *
 * They live in one component because the toast has to sit above the bar when
 * the bar is up, and both are driven by the same piece of state.
 *
 * The bar appears once the header has scrolled away, so it never covers content
 * a reader is still looking at near the top. It subscribes to the portfolio's
 * shared scroll module rather than adding a listener of its own — five scenes
 * on a page still cost one `scroll` handler between them.
 */
export function ViewportExtras() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => subscribeScroll(({ y }) => setScrolled(y > 400)), []);

  const cell =
    "ue-mono flex flex-1 flex-col items-center justify-center gap-1 text-[12px] text-[var(--ue-on-navy)]";

  return (
    <>
      {/* Reserves the bar's height so a fixed bar can never cover the footer */}
      {scrolled ? <div aria-hidden className="h-[4.5rem] shrink-0 md:hidden" /> : null}

      {scrolled ? (
        <nav
          aria-label="Contact the yard"
          className="ue-on-dark ue-bar-up fixed inset-x-0 bottom-0 z-[110] flex h-[4.5rem] bg-[var(--ue-navy)] md:hidden"
        >
          <a
            href={`tel:${YARD.phoneDial}`}
            className={`${cell} border-l-4 border-[var(--ue-yellow)]`}
          >
            <Phone aria-hidden className="size-[19px] text-[var(--ue-yellow)]" />
            Call
          </a>
          <a href={`sms:${YARD.phoneDial}`} className={`${cell} border-l border-white/20`}>
            <svg
              aria-hidden
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l2-4.9a8.4 8.4 0 0 1-1-4A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" />
            </svg>
            Text
          </a>
          <Link href={`${BASE}/quote`} className={`${cell} border-l border-white/20`}>
            <svg
              aria-hidden
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Quote
          </Link>
        </nav>
      ) : null}

      <ToastHost raised={scrolled} />
    </>
  );
}
