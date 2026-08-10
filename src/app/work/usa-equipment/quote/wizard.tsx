"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { Check } from "lucide-react";
import { BASE, YARD, photoFor } from "../data";
import { PhotoSlot } from "../parts";
import { QtyStepper } from "../quote-ui";
import {
  clearQuote,
  countOf,
  getServerSnapshot,
  getSnapshot,
  removeUnit,
  resolve,
  setQty,
  subscribe,
} from "../quote-store";
import { requestQuote } from "../actions";

/**
 * The three-step quote request.
 *
 * The list itself comes from the module store, so units added anywhere on the
 * site are already here — including ones added before a reload. The steps are
 * local state: they are a view of one form, not four addresses, and putting
 * them in the URL would let someone land on "review" with an empty list.
 */

const FIELDS = [
  { name: "name", label: "Name", placeholder: "Jordan Reyes", required: true },
  { name: "company", label: "Company", placeholder: "Reyes Site Works", required: false },
  { name: "phone", label: "Phone", placeholder: "(281) 555-0142", required: true },
  { name: "email", label: "Email", placeholder: "jordan@example.com", required: false },
  { name: "zip", label: "Job ZIP", placeholder: "77354", required: false },
  { name: "needed", label: "Needed by", placeholder: "MM / DD", required: false },
] as const;

const STEPS = ["Units", "Details", "Send"] as const;

export function QuoteWizard() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const rows = resolve(lines);
  const count = countOf(lines);

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState<{ reference: string; units: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const primary =
    "flex h-12 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-6 text-[15px] font-semibold uppercase transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[var(--ue-yellow-deep)] hover:shadow-[0_4px_0_0_var(--ue-ink)] disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none";
  const ghost =
    "flex h-12 items-center border-2 border-[var(--ue-ink)] px-5 text-sm font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-bg)]";

  function send() {
    setErrors([]);
    startTransition(async () => {
      const result = await requestQuote(
        lines.map((line) => ({ id: line.id, qty: line.qty })),
        contact,
      );

      if (!result.ok) {
        setErrors(result.errors);
        // Contact problems belong on the step that collects them
        if (result.errors.some((error) => !error.includes("at least one unit"))) setStep(2);
        return;
      }

      setSent({ reference: result.reference, units: result.units });
      clearQuote();
      setStep(4);
      window.scrollTo(0, 0);
    });
  }

  /* Confirmation --------------------------------------------------------- */
  if (step === 4 && sent) {
    return (
      <div className="ue-on-dark border-2 border-[var(--ue-ink)] bg-[var(--ue-navy)] p-8 text-[var(--ue-on-navy)] sm:p-14">
        <span
          aria-hidden
          className="mb-5 flex size-14 items-center justify-center bg-[var(--ue-yellow)]"
        >
          <Check className="size-7 text-[var(--ue-ink)]" strokeWidth={3} />
        </span>
        <h2 className="mb-3 text-[clamp(1.75rem,3.6vw,2.625rem)]">Request sent.</h2>
        <p className="mb-2 max-w-[48ch] text-lg leading-relaxed text-[var(--ue-on-navy-2)]">
          We&rsquo;ll call you at the number you gave us within one business hour. If you need
          it sooner, call the yard directly.
        </p>
        <p className="ue-mono mb-6 text-[12px] text-[var(--ue-yellow)]">
          Reference {sent.reference} · {sent.units} {sent.units === 1 ? "unit" : "units"}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={`tel:${YARD.phoneDial}`}
            className="flex h-13 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-6 text-[15px] font-semibold text-[var(--ue-ink)] uppercase hover:bg-[var(--ue-yellow-deep)]"
          >
            Call now instead
          </a>
          <Link
            href={BASE}
            className="flex h-13 items-center border-2 border-[var(--ue-on-navy)] px-6 text-[15px] font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-navy-lift)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Progress -------------------------------------------------------- */}
      <ol className="mb-8 flex flex-wrap">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const done = step > number;
          const here = step === number;
          return (
            <li
              key={label}
              aria-current={here ? "step" : undefined}
              className={`flex min-w-[11.25rem] flex-1 items-center gap-3 border-2 py-3 pr-5 pl-4 ${
                index === STEPS.length - 1 ? "" : "border-r-0"
              } border-[var(--ue-ink)] ${
                here
                  ? "bg-[var(--ue-yellow)]"
                  : done
                    ? "bg-[var(--ue-ink)] text-[var(--ue-on-navy)]"
                    : "bg-white"
              }`}
            >
              <span className="ue-mono text-lg font-medium opacity-65">0{number}</span>
              <span className="ue-display text-base font-bold tracking-[0.02em]">{label}</span>
            </li>
          );
        })}
      </ol>

      {errors.length > 0 ? (
        <div
          role="alert"
          className="mb-6 border-2 border-[var(--ue-on-rent)] bg-white p-4 text-[15px]"
        >
          <p className="ue-mono mb-2 text-[11px] text-[var(--ue-on-rent)]">Check these first</p>
          <ul className="list-disc pl-5 text-[var(--ue-ink-2)]">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Step 1 — the list ----------------------------------------------- */}
      {step === 1 ? (
        count > 0 ? (
          <div className="border-2 border-[var(--ue-ink)] bg-white">
            <ul>
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-4 border-b border-[var(--ue-line)] p-4"
                >
                  <PhotoSlot
                    photo={photoFor(row.unit)}
                    label="Photo"
                    className="size-22 shrink-0 border border-[var(--ue-line)]"
                    sizes="88px"
                  />
                  <div className="min-w-[10rem] flex-1">
                    <p className="ue-display text-[17px] leading-tight">{row.unit.name}</p>
                    <p className="ue-mono mt-1 text-[12px] text-[var(--ue-ink-3)]">
                      {row.unit.id} · {row.unit.category}
                    </p>
                  </div>

                  <QtyStepper
                    unit={row.unit}
                    qty={row.qty}
                    onChange={(next) => setQty(row.id, next)}
                  />

                  <button
                    type="button"
                    onClick={() => removeUnit(row.id)}
                    className="ue-mono h-10 border-2 border-[var(--ue-line)] px-3.5 text-[12px] transition-colors duration-150 hover:border-[var(--ue-ink)]"
                  >
                    Remove<span className="sr-only"> {row.unit.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <Link href={`${BASE}/equipment`} className={ghost}>
                + Add another unit
              </Link>
              <button type="button" onClick={() => setStep(2)} className={primary}>
                Continue →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3.5 border-2 border-dashed border-[var(--ue-ink-3)] bg-white p-8 sm:p-14">
            <p className="ue-mono text-[11px] text-[var(--ue-ink-3)]">Empty list</p>
            <h2 className="text-[clamp(1.375rem,2.6vw,1.875rem)] leading-[1.05]">
              Nothing on your list yet
            </h2>
            <p className="max-w-[46ch] text-base leading-relaxed text-[var(--ue-ink-2)]">
              Add units from the yard and they&rsquo;ll stack up here. Or skip it and call —
              we&rsquo;ll build the list with you.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={`${BASE}/equipment`}
                className="flex h-13 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-6 text-[15px] font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-yellow-deep)]"
              >
                Browse equipment
              </Link>
              <a
                href={`tel:${YARD.phoneDial}`}
                className="flex h-13 items-center border-2 border-[var(--ue-ink)] px-6 text-[15px] font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-bg)]"
              >
                Call {YARD.phone}
              </a>
            </div>
          </div>
        )
      ) : null}

      {/* Step 2 — who to call -------------------------------------------- */}
      {step === 2 ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep(3);
          }}
          className="border-2 border-[var(--ue-ink)] bg-white p-5 sm:p-9"
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-5">
            {FIELDS.map((field) => (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="ue-mono text-[11px] text-[var(--ue-ink-2)]">
                  {field.label}
                  {field.required ? <span className="text-[var(--ue-on-rent)]"> *</span> : null}
                </span>
                <input
                  type={field.name === "email" ? "email" : "text"}
                  name={field.name}
                  required={field.required}
                  autoComplete={
                    field.name === "name"
                      ? "name"
                      : field.name === "phone"
                        ? "tel"
                        : field.name === "email"
                          ? "email"
                          : field.name === "company"
                            ? "organization"
                            : field.name === "zip"
                              ? "postal-code"
                              : "off"
                  }
                  value={contact[field.name] ?? ""}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="h-13 border-2 border-[var(--ue-ink)] bg-white px-3.5 text-base outline-none focus:border-[var(--ue-yellow-deep)] focus:shadow-[0_0_0_3px_var(--ue-yellow)]"
                />
              </label>
            ))}
          </div>

          <label className="mt-5 flex flex-col gap-1.5">
            <span className="ue-mono text-[11px] text-[var(--ue-ink-2)]">
              What&rsquo;s the job?
            </span>
            <textarea
              name="job"
              rows={4}
              value={contact.job ?? ""}
              onChange={(event) =>
                setContact((current) => ({ ...current, job: event.target.value }))
              }
              placeholder="Site conditions, delivery vs pickup, anything else we should know."
              className="resize-y border-2 border-[var(--ue-ink)] bg-white p-3.5 text-base outline-none focus:border-[var(--ue-yellow-deep)] focus:shadow-[0_0_0_3px_var(--ue-yellow)]"
            />
          </label>

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setStep(1)} className={ghost}>
              ← Back
            </button>
            <button type="submit" className={primary}>
              Review →
            </button>
          </div>
        </form>
      ) : null}

      {/* Step 3 — review and send ---------------------------------------- */}
      {step === 3 ? (
        <div className="border-2 border-[var(--ue-ink)] bg-white p-5 sm:p-9">
          <p className="ue-mono mb-3.5 text-[11px] text-[var(--ue-ink-3)]">Your request</p>
          <ul className="mb-6">
            {rows.map((row) => (
              <li
                key={row.id}
                className="ue-mono flex justify-between gap-4 border-b border-[var(--ue-line)] py-3 text-sm normal-case"
              >
                <span>
                  {row.unit.id} · {row.unit.name}
                </span>
                <span className="text-[var(--ue-ink-2)]">×{row.qty}</span>
              </li>
            ))}
          </ul>

          <dl className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-x-8 gap-y-2 text-sm">
            {FIELDS.filter((field) => (contact[field.name] ?? "").trim() !== "").map(
              (field) => (
                <div
                  key={field.name}
                  className="flex justify-between gap-3 border-b border-[var(--ue-line)] py-2"
                >
                  <dt className="ue-mono text-[11px] text-[var(--ue-ink-2)]">{field.label}</dt>
                  <dd className="text-right">{contact[field.name]}</dd>
                </div>
              ),
            )}
          </dl>

          <div className="flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setStep(2)} className={ghost}>
              ← Back
            </button>
            <button type="button" onClick={send} disabled={pending} className={primary}>
              {pending ? "Sending…" : "Send request"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
