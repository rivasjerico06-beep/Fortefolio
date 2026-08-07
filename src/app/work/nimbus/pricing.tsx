"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Hobby",
    monthly: 0,
    blurb: "For side projects and trying things out.",
    features: ["1 project", "10k requests / month", "Community support", "Shared runners"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Team",
    monthly: 24,
    blurb: "For small teams shipping to production.",
    features: [
      "Unlimited projects",
      "2M requests / month",
      "Email support, 1-day reply",
      "Dedicated runners",
      "Preview environments",
      "Audit log",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    blurb: "For orgs with compliance requirements.",
    features: [
      "Everything in Team",
      "SSO and SCIM",
      "99.99% uptime SLA",
      "Private networking",
      "Named support engineer",
    ],
    cta: "Talk to sales",
    featured: false,
  },
];

/**
 * Styled as a WordPress pricing-table plugin block — boxed columns, a coloured
 * header band per tier, and a "recommended" ribbon. The billing toggle is
 * ordinary React state, so switching period costs no page load.
 */
export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      {/* Billing period toggle */}
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex border border-[var(--wp-line)] bg-[var(--wp-surface)]"
        >
          {(["Monthly", "Annual"] as const).map((label) => {
            const isAnnual = label === "Annual";
            const active = annual === isAnnual;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setAnnual(isAnnual)}
                aria-pressed={active}
                className={`px-5 py-2.5 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
                  active
                    ? "bg-[var(--wp-accent)] text-[var(--wp-accent-ink)]"
                    : "text-[var(--wp-ink-2)] hover:text-[var(--wp-accent)]"
                }`}
              >
                {label}
                {isAnnual && <span className="ml-1.5 opacity-80">−20%</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price =
            tier.monthly === null
              ? null
              : annual
                ? Math.round(tier.monthly * 0.8)
                : tier.monthly;

          return (
            <div
              key={tier.name}
              className={`relative flex flex-col border bg-[var(--wp-surface)] ${
                tier.featured
                  ? "border-[var(--wp-accent)] shadow-[0_0_0_3px_var(--wp-surface-alt)]"
                  : "border-[var(--wp-line)]"
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--wp-accent)] px-3 py-1 text-[10.5px] font-bold tracking-[0.12em] text-[var(--wp-accent-ink)] uppercase">
                  Recommended
                </span>
              )}

              {/* Header band */}
              <div
                className={`border-b px-6 py-5 text-center ${
                  tier.featured
                    ? "border-[var(--wp-accent)] bg-[var(--wp-surface-alt)]"
                    : "border-[var(--wp-line)] bg-[var(--wp-surface-alt)]"
                }`}
              >
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--wp-heading-font)" }}
                >
                  {tier.name}
                </h3>
                <p className="mt-1 text-[12.5px] text-[var(--wp-ink-2)]">{tier.blurb}</p>
              </div>

              <div className="px-6 py-7 text-center">
                {price === null ? (
                  <p className="text-4xl font-bold">Custom</p>
                ) : (
                  <p className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-[13px] text-[var(--wp-ink-2)]">/user /mo</span>
                  </p>
                )}
                <p className="mt-1 h-4 text-[11.5px] text-[var(--wp-ink-2)]">
                  {price !== null && annual && price > 0 ? "billed annually" : ""}
                </p>
              </div>

              <ul className="flex-1 border-t border-[var(--wp-line)] px-6 py-5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 border-b border-dashed border-[var(--wp-line)] py-2.5 text-[13.5px] text-[var(--wp-ink-2)] last:border-b-0"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[var(--wp-accent)]"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="px-6 pt-2 pb-6">
                <button
                  type="button"
                  className={`w-full px-5 py-3 text-[13px] font-bold tracking-wide uppercase transition-opacity hover:opacity-90 ${
                    tier.featured
                      ? "bg-[var(--wp-accent)] text-[var(--wp-accent-ink)]"
                      : "border border-[var(--wp-line)] text-[var(--wp-ink)]"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
