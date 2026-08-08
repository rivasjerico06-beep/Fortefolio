"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { defaultVariants, formatPeso, priceOf, type Product } from "../catalog";
import { addLine } from "../cart-store";
import { Stepper, useCart } from "../cart";

/**
 * The buy panel: variant pickers, quantity, and the add button.
 *
 * Price is recomputed from the selection rather than stored, so a variant with
 * a delta can never disagree with what the cart charges — both call `priceOf`.
 */
export function BuyPanel({ product }: { product: Product }) {
  const [chosen, setChosen] = useState<Record<string, string>>(() => defaultVariants(product));
  const [quantity, setQuantity] = useState(1);
  const { lines } = useCart();

  const soldOut = product.stock === 0;
  const unitPrice = priceOf(product, chosen);

  // How many of this exact configuration are already in the basket
  const alreadyIn = lines.find(
    (line) =>
      line.slug === product.slug &&
      Object.entries(chosen).every(([k, v]) => line.variants[k] === v),
  )?.quantity;

  const ceiling = Math.min(20, product.stock);
  const remaining = Math.max(ceiling - (alreadyIn ?? 0), 0);

  return (
    <div>
      {/* Keyed on the price so picking a bigger bag swaps the figure in rather
          than replacing it between frames */}
      <p key={unitPrice} className="lc-swap text-[clamp(1.5rem,3vw,2rem)] tabular-nums">
        {formatPeso(unitPrice)}
      </p>

      {product.variants?.map((group) => (
        <fieldset key={group.id} className="mt-8">
          <legend className="lc-eyebrow">{group.label}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((option) => {
              const active = chosen[group.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setChosen((prev) => ({ ...prev, [group.id]: option.id }))}
                  aria-pressed={active}
                  disabled={soldOut}
                  className={`lc-swatch border px-4 py-2.5 text-[14px] disabled:opacity-40 ${
                    active ? "" : "lc-btn-ghost"
                  }`}
                  style={
                    active
                      ? {
                          borderColor: "var(--lc-accent-solid)",
                          backgroundColor: "var(--lc-accent-solid)",
                          color: "#fff",
                        }
                      : // Deliberately unset: `.lc-btn-ghost` owns the resting
                        // border, and an inline value here would outrank the
                        // hover rule and pin it.
                        undefined
                  }
                >
                  {option.label}
                  {option.priceDelta ? (
                    <span className="ml-2 tabular-nums opacity-70">
                      +{formatPeso(option.priceDelta)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {group.hint && (
            <p
              className="mt-3 max-w-sm text-[13.5px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              {group.hint}
            </p>
          )}
        </fieldset>
      ))}

      {soldOut ? (
        <div
          className="mt-10 border px-5 py-5"
          style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
        >
          <p className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
            Sold out
          </p>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "var(--lc-fg-2)" }}>
            This one goes fast. The next roast lands on Tuesday — ask at the bar and we will put
            a bag aside.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Stepper
              value={quantity}
              onChange={(next) =>
                setQuantity(Math.min(Math.max(next, 1), Math.max(remaining, 1)))
              }
              label={product.name}
            />
            <button
              type="button"
              onClick={() => addLine(product, chosen, quantity)}
              disabled={remaining === 0}
              className="lc-btn group inline-flex flex-1 items-center justify-center gap-3 px-8 py-4 text-white disabled:opacity-50 sm:flex-none"
              style={{ backgroundColor: "var(--lc-accent-solid)" }}
            >
              <ShoppingBag
                className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5"
                aria-hidden
              />
              <span className="lc-eyebrow" style={{ color: "inherit" }}>
                {remaining === 0 ? "All of it is in your basket" : "Add to basket"}
              </span>
            </button>
          </div>

          {alreadyIn ? (
            <p
              className="mt-4 inline-flex items-center gap-2 text-[14px]"
              style={{ color: "var(--lc-accent-text)" }}
            >
              <Check className="size-4" aria-hidden />
              {alreadyIn} in your basket already
            </p>
          ) : null}

          {product.stock < 6 && (
            <p className="mt-4 text-[14px]" style={{ color: "var(--lc-fg-2)" }}>
              Only {product.stock} left on the shelf.
            </p>
          )}
        </>
      )}
    </div>
  );
}
