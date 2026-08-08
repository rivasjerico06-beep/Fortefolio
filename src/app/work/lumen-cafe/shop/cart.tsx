"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { BASE } from "../data";
import { useFocusTrap } from "../use-focus-trap";
import { FREE_DELIVERY_OVER, formatPeso } from "./catalog";
import {
  closeCart,
  getServerSnapshot,
  getSnapshot,
  openCart,
  removeLine,
  setQuantity,
  subscribe,
  totals,
} from "./cart-store";

/** One hook over the store. Every cart-aware component reads the same state. */
export function useCart() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...state, ...totals(state.lines) };
}

/* -------------------------------------------------------------------------- */

export function CartButton({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={`lc-eyebrow group inline-flex items-center gap-2 ${className ?? ""}`}
      aria-label={
        count > 0 ? `Basket, ${count} item${count === 1 ? "" : "s"}` : "Basket, empty"
      }
    >
      <ShoppingBag
        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
        aria-hidden
      />
      <span aria-hidden>Basket</span>
      {count > 0 && (
        // `key` on the count restarts the pop animation every time it changes,
        // so adding a second item is visible even though the badge was already
        // there — without it the element persists and nothing re-runs.
        <span
          key={count}
          className="lc-count inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-5 text-white"
          style={{ backgroundColor: "var(--lc-accent-solid)" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * How long the exit animation runs before the drawer leaves the tree. Matches
 * the `[data-closing]` rules in globals.css — a drawer that unmounts on click
 * cannot animate out, so the close is deferred by exactly this long.
 */
const EXIT_MS = 240;

export function CartDrawer() {
  const { lines, open, resolved, count, subtotal, delivery, total } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  // It says aria-modal, so keyboard focus has to actually stay inside it
  useFocusTrap(dialogRef, open);

  // Escape closes it, and the page behind must not scroll while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setClosing(true);
      window.setTimeout(closeCart, EXIT_MS);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  /**
   * Play the exit, then actually close. Local state is enough to drive it:
   * `open` is still true throughout, so the component stays mounted, and the
   * flag resets by itself because the next open is a fresh mount.
   */
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(closeCart, EXIT_MS);
  };

  const toFreeDelivery = FREE_DELIVERY_OVER - subtotal;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[110]"
      data-closing={closing}
      role="dialog"
      aria-modal="true"
      aria-label="Basket"
    >
      <button
        type="button"
        aria-label="Close basket"
        onClick={requestClose}
        className="lc-scrim absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      <div
        className="lc-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l shadow-2xl"
        style={{ backgroundColor: "var(--lc-bg)", borderColor: "var(--lc-line)" }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-5"
          style={{ borderColor: "var(--lc-line)" }}
        >
          <p className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
            Basket {count > 0 && `(${count})`}
          </p>
          <button
            type="button"
            onClick={requestClose}
            data-autofocus
            className="lc-eyebrow group inline-flex items-center gap-2"
          >
            Close
            <X
              className="size-4 transition-transform duration-300 group-hover:rotate-90"
              aria-hidden
            />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <ShoppingBag className="size-8" style={{ color: "var(--lc-fg-2)" }} aria-hidden />
            <p className="text-[clamp(1.35rem,3vw,1.75rem)] leading-tight">
              Nothing in here yet
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--lc-fg-2)" }}>
              Beans go out on Tuesdays. Everything else ships the next working day.
            </p>
            <Link
              href={`${BASE}/shop`}
              onClick={closeCart}
              className="lc-btn lc-eyebrow group inline-flex items-center gap-2 px-6 py-3 text-white"
              style={{ backgroundColor: "var(--lc-accent-solid)" }}
            >
              Browse the shop
              <ArrowRight
                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        ) : (
          <>
            <ul className="lc-stagger no-bar flex-1 overflow-y-auto px-6">
              {resolved.map((line, index) => (
                <li
                  key={line.key}
                  className="flex gap-4 border-b py-5"
                  style={
                    { borderColor: "var(--lc-line)", "--i": index } as React.CSSProperties
                  }
                >
                  <Link
                    href={`${BASE}/shop/${line.slug}`}
                    onClick={closeCart}
                    className="relative block size-20 shrink-0 overflow-hidden border"
                    style={{ borderColor: "var(--lc-line)" }}
                  >
                    {line.product.image ? (
                      <Image
                        src={line.product.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`${BASE}/shop/${line.slug}`}
                        onClick={closeCart}
                        className="text-[16px] leading-snug hover:text-[var(--lc-accent-text)]"
                      >
                        {line.product.name}
                      </Link>
                      <span
                        key={line.lineTotal}
                        className="lc-swap shrink-0 text-[15px] tabular-nums"
                      >
                        {formatPeso(line.lineTotal)}
                      </span>
                    </div>
                    {line.description && (
                      <p className="mt-1 text-[13px]" style={{ color: "var(--lc-fg-2)" }}>
                        {line.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Stepper
                        value={line.quantity}
                        onChange={(next) => setQuantity(line.key, next)}
                        label={line.product.name}
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="lc-link text-[13px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t px-6 py-5" style={{ borderColor: "var(--lc-line)" }}>
              {toFreeDelivery > 0 && (
                <p
                  className="mb-4 border px-3 py-2 text-[13px]"
                  style={{ borderColor: "var(--lc-line)", color: "var(--lc-fg-2)" }}
                >
                  {formatPeso(toFreeDelivery)} more and delivery is free.
                </p>
              )}

              {/* Each figure is keyed on its own value, so only the numbers
                  that actually moved play the swap */}
              <dl className="space-y-2 text-[15px]">
                <div className="flex justify-between">
                  <dt style={{ color: "var(--lc-fg-2)" }}>Subtotal</dt>
                  <dd key={subtotal} className="lc-swap tabular-nums">
                    {formatPeso(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: "var(--lc-fg-2)" }}>Delivery</dt>
                  <dd key={delivery} className="lc-swap tabular-nums">
                    {delivery === 0 ? "Free" : formatPeso(delivery)}
                  </dd>
                </div>
                <div
                  className="flex justify-between border-t pt-3 text-[17px]"
                  style={{ borderColor: "var(--lc-line)" }}
                >
                  <dt>Total</dt>
                  <dd key={total} className="lc-swap tabular-nums">
                    {formatPeso(total)}
                  </dd>
                </div>
              </dl>

              <Link
                href={`${BASE}/checkout`}
                onClick={closeCart}
                className="lc-btn group mt-5 flex w-full items-center justify-center gap-3 px-6 py-4 text-white"
                style={{ backgroundColor: "var(--lc-accent-solid)" }}
              >
                <span className="lc-eyebrow" style={{ color: "inherit" }}>
                  Checkout
                </span>
                <span aria-hidden className="lc-nudge">
                  <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function Stepper({
  value,
  onChange,
  label,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
}) {
  return (
    <div
      className="inline-flex items-center border"
      style={{ borderColor: "var(--lc-line-strong)" }}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Fewer ${label}`}
        className="lc-step grid size-9 place-items-center disabled:opacity-35"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="w-8 text-center text-[15px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`More ${label}`}
        className="lc-step grid size-9 place-items-center"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
