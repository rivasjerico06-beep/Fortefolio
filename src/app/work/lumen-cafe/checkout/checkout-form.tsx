"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock } from "lucide-react";
import { placeOrder, type PlacedOrder } from "../actions";
import { BASE } from "../data";
import { FREE_DELIVERY_OVER, formatPeso } from "../shop/catalog";
import { clearCart } from "../shop/cart-store";
import { useCart } from "../shop/cart";

type Step = 0 | 1 | 2;
const STEPS = ["Contact", "Delivery", "Payment"];

const field =
  "w-full border-b bg-transparent py-3 text-[16px] outline-none transition-colors focus:border-[var(--lc-accent-text)]";

export function CheckoutForm() {
  const { lines, resolved, count, subtotal, delivery, total } = useCart();

  const [step, setStep] = useState<Step>(0);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ line1: "", city: "", postcode: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  /* Confirmation ---------------------------------------------------------- */
  if (placed) {
    return (
      <div className="mx-auto max-w-[52rem] px-5 py-16 sm:px-10 sm:py-24">
        <Check aria-hidden className="size-10" style={{ color: "var(--lc-accent)" }} />
        <h1 className="mt-6 text-[clamp(2.25rem,6vw,4rem)] leading-[0.95]">
          Order {placed.reference}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--lc-fg-2)" }}>
          On the real site this would be in the roastery&rsquo;s queue and a confirmation would
          be in your inbox. On this demo nothing was charged and nothing will arrive — no
          payment provider is connected.
        </p>

        <dl className="mt-12">
          {placed.lines.map((line) => (
            <div
              key={`${line.name}-${line.description}`}
              className="flex items-baseline justify-between gap-6 border-b py-4"
              style={{ borderColor: "var(--lc-line)" }}
            >
              <dt>
                <span className="text-[16px]">
                  {line.quantity} × {line.name}
                </span>
                {line.description && (
                  <span className="block text-[13.5px]" style={{ color: "var(--lc-fg-2)" }}>
                    {line.description}
                  </span>
                )}
              </dt>
              <dd className="shrink-0 text-[16px] tabular-nums">
                {formatPeso(line.lineTotal)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-6 pt-5 text-[16px]">
            <dt style={{ color: "var(--lc-fg-2)" }}>Delivery</dt>
            <dd className="tabular-nums">
              {placed.delivery === 0 ? "Free" : formatPeso(placed.delivery)}
            </dd>
          </div>
          <div className="mt-3 flex justify-between gap-6 text-[clamp(1.25rem,3vw,1.75rem)]">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPeso(placed.total)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-[13.5px]" style={{ color: "var(--lc-fg-2)" }}>
          These totals were recalculated on the server from the catalogue, not taken from the
          browser.
        </p>

        <Link
          href={`${BASE}/shop`}
          className="lc-btn lc-eyebrow group mt-12 inline-flex items-center gap-2 px-8 py-4 text-white"
          style={{ backgroundColor: "var(--lc-accent-solid)" }}
        >
          Back to the shop
          <ArrowRight
            className="size-4 transition-transform duration-500 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    );
  }

  /* Empty basket ---------------------------------------------------------- */
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[52rem] px-5 py-24 text-center sm:px-10 sm:py-32">
        <h1 className="text-[clamp(2rem,5vw,3.25rem)] leading-[0.95]">Your basket is empty</h1>
        <p className="mt-5 text-[17px]" style={{ color: "var(--lc-fg-2)" }}>
          Nothing to check out yet.
        </p>
        <Link
          href={`${BASE}/shop`}
          className="lc-btn lc-eyebrow group mt-10 inline-flex items-center gap-2 px-8 py-4 text-white"
          style={{ backgroundColor: "var(--lc-accent-solid)" }}
        >
          Browse the shop
          <ArrowRight
            className="size-4 transition-transform duration-500 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    );
  }

  /* Step handling --------------------------------------------------------- */
  const next = () => {
    setError(null);
    if (step === 0) {
      if (!contact.name.trim()) return setError("We need a name for the order.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        return setError("That email address looks wrong.");
      }
      if (contact.phone.replace(/\D/g, "").length < 7) {
        return setError("We need a phone number in case the driver cannot find you.");
      }
      return setStep(1);
    }
    if (step === 1) {
      if (!address.line1.trim()) return setError("Please give a street address.");
      if (!address.city.trim()) return setError("Please give a city.");
      return setStep(2);
    }
  };

  async function submit() {
    setPlacing(true);
    setError(null);

    const result = await placeOrder({
      // Only what was chosen — never a price. The server works those out.
      items: lines.map((line) => ({
        slug: line.slug,
        variants: line.variants,
        quantity: line.quantity,
      })),
      contact,
      address,
    });

    setPlacing(false);
    if (result.ok) {
      clearCart();
      setPlaced(result.order);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
      <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.9]">Checkout</h1>

      {/* Step indicator */}
      <ol className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
        {STEPS.map((label, index) => (
          <li key={label} className="lc-eyebrow flex items-center gap-2">
            <span
              className="grid size-6 place-items-center rounded-full text-[11px]"
              style={
                index <= step
                  ? { backgroundColor: "var(--lc-accent-solid)", color: "#fff" }
                  : { border: "1px solid var(--lc-line-strong)", color: "var(--lc-fg-2)" }
              }
            >
              {index < step ? <Check className="size-3" aria-hidden /> : index + 1}
            </span>
            <span style={index === step ? { color: "var(--lc-fg)" } : undefined}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Keyed on the step, so moving between contact, delivery and payment
            is a panel arriving rather than three fields blinking out and three
            different ones blinking in */}
        <div key={step} className="lc-enter lg:col-span-7">
          {step === 0 && (
            <fieldset className="space-y-8">
              <legend className="sr-only">Contact</legend>
              <Field
                id="co-name"
                label="Name"
                value={contact.name}
                onChange={(v) => setContact({ ...contact, name: v })}
                autoComplete="name"
              />
              <Field
                id="co-email"
                label="Email"
                type="email"
                value={contact.email}
                onChange={(v) => setContact({ ...contact, email: v })}
                autoComplete="email"
              />
              <Field
                id="co-phone"
                label="Phone"
                type="tel"
                value={contact.phone}
                onChange={(v) => setContact({ ...contact, phone: v })}
                autoComplete="tel"
              />
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="space-y-8">
              <legend className="sr-only">Delivery</legend>
              <Field
                id="co-line1"
                label="Street address"
                value={address.line1}
                onChange={(v) => setAddress({ ...address, line1: v })}
                autoComplete="address-line1"
              />
              <div className="grid gap-8 sm:grid-cols-2">
                <Field
                  id="co-city"
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                  autoComplete="address-level2"
                />
                <Field
                  id="co-postcode"
                  label="Postcode"
                  value={address.postcode}
                  onChange={(v) => setAddress({ ...address, postcode: v })}
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <label htmlFor="co-notes" className="lc-eyebrow block">
                  Notes for the driver
                </label>
                <textarea
                  id="co-notes"
                  rows={3}
                  value={address.notes}
                  onChange={(event) => setAddress({ ...address, notes: event.target.value })}
                  className={`${field} resize-none`}
                  style={{ borderColor: "var(--lc-line-strong)" }}
                />
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div>
              <div
                className="border p-6 sm:p-8"
                style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
              >
                <p
                  className="lc-eyebrow inline-flex items-center gap-2"
                  style={{ color: "var(--lc-fg)" }}
                >
                  <Lock className="size-4" aria-hidden />
                  Payment is not connected
                </p>
                <p
                  className="mt-4 text-[16px] leading-relaxed"
                  style={{ color: "var(--lc-fg-2)" }}
                >
                  This is a portfolio demo, so there is no payment provider behind it and these
                  fields are deliberately disabled. Everything else on this checkout is real:
                  the basket, the validation, and the order that gets placed on the next screen.
                </p>
              </div>

              <fieldset disabled className="mt-8 space-y-8 opacity-50">
                <legend className="sr-only">Card details, disabled</legend>
                <div>
                  <label htmlFor="co-card" className="lc-eyebrow block">
                    Card number
                  </label>
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-4 shrink-0" aria-hidden />
                    <input
                      id="co-card"
                      className={field}
                      placeholder="Not accepting payments"
                      style={{ borderColor: "var(--lc-line-strong)" }}
                    />
                  </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-exp" className="lc-eyebrow block">
                      Expiry
                    </label>
                    <input
                      id="co-exp"
                      className={field}
                      style={{ borderColor: "var(--lc-line-strong)" }}
                    />
                  </div>
                  <div>
                    <label htmlFor="co-cvc" className="lc-eyebrow block">
                      CVC
                    </label>
                    <input
                      id="co-cvc"
                      className={field}
                      style={{ borderColor: "var(--lc-line-strong)" }}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {error && (
            <p
              key={error}
              role="alert"
              className="lc-swap mt-8 text-[15px]"
              style={{ color: "var(--lc-accent-text)" }}
            >
              {error}
            </p>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((step - 1) as Step);
                }}
                className="lc-eyebrow group inline-flex items-center gap-2 hover:text-[var(--lc-fg)]"
              >
                <ArrowLeft
                  className="size-4 transition-transform duration-500 group-hover:-translate-x-1"
                  aria-hidden
                />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={step === 2 ? submit : next}
              disabled={placing}
              className="lc-btn group ml-auto inline-flex items-center gap-3 px-8 py-4 text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--lc-accent-solid)" }}
            >
              <span className="lc-eyebrow" style={{ color: "inherit" }}>
                {step === 2 ? (placing ? "Placing order" : "Place order") : "Continue"}
              </span>
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5">
          <div
            className="lc-sticky border p-6"
            style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
          >
            <p className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
              Your basket ({count})
            </p>
            <ul className="mt-5">
              {resolved.map((line) => (
                <li
                  key={line.key}
                  className="flex items-baseline justify-between gap-4 border-b py-3"
                  style={{ borderColor: "var(--lc-line)" }}
                >
                  <span className="text-[15px]">
                    {line.quantity} × {line.product.name}
                    {line.description && (
                      <span className="block text-[13px]" style={{ color: "var(--lc-fg-2)" }}>
                        {line.description}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[15px] tabular-nums">
                    {formatPeso(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt style={{ color: "var(--lc-fg-2)" }}>Subtotal</dt>
                <dd className="tabular-nums">{formatPeso(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: "var(--lc-fg-2)" }}>Delivery</dt>
                <dd className="tabular-nums">
                  {delivery === 0 ? "Free" : formatPeso(delivery)}
                </dd>
              </div>
              <div
                className="flex justify-between border-t pt-3 text-[17px]"
                style={{ borderColor: "var(--lc-line)" }}
              >
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPeso(total)}</dd>
              </div>
            </dl>

            {delivery > 0 && (
              <p className="mt-4 text-[13px]" style={{ color: "var(--lc-fg-2)" }}>
                Free over {formatPeso(FREE_DELIVERY_OVER)}.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="lc-eyebrow block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={field}
        style={{ borderColor: "var(--lc-line-strong)" }}
      />
    </div>
  );
}
