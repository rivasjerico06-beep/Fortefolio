"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BASE } from "../data";
import { CATEGORIES, formatPeso, products, type ShopCategory } from "./catalog";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "name", label: "Name" },
];

/**
 * Filtering and sorting run in the browser over the whole catalogue, which is
 * ten products. At this size a round trip to filter would be slower than the
 * render, and the full grid is in the server HTML either way — so it is
 * crawlable and works with no JavaScript.
 */
export function ShopGrid() {
  const [category, setCategory] = useState<ShopCategory | "All">("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");

  const shown = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        (!inStockOnly || product.stock > 0),
    );

    switch (sort) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "name":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  }, [category, inStockOnly, sort]);

  const reset = () => {
    setCategory("All");
    setInStockOnly(false);
    setSort("featured");
  };

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-y py-5"
        style={{ borderColor: "var(--lc-line)" }}
      >
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
          role="group"
          aria-label="Filter by category"
        >
          {(["All", ...CATEGORIES] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              aria-pressed={category === option}
              // `.lc-chip` draws its own underline, so the chosen state is the
              // same rule the pointer already previewed rather than a
              // text-decoration that appears from nowhere
              className="lc-chip lc-eyebrow"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="lc-eyebrow inline-flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
              className="size-4 accent-[var(--lc-accent)]"
            />
            In stock only
          </label>

          <label className="lc-eyebrow inline-flex items-center gap-2.5">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Sort products"
              className="lc-eyebrow border-b bg-transparent py-1 outline-none"
              style={{ borderColor: "var(--lc-line-strong)", color: "var(--lc-fg)" }}
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="lc-eyebrow mt-6" aria-live="polite">
        Showing {shown.length} of {products.length}
      </p>

      {shown.length === 0 ? (
        <div
          className="lc-enter mt-10 border px-8 py-20 text-center"
          style={{ borderColor: "var(--lc-line)" }}
        >
          <p className="text-[clamp(1.5rem,3vw,2rem)] leading-tight">Nothing matches that</p>
          <p className="mt-3 text-[16px]" style={{ color: "var(--lc-fg-2)" }}>
            Try a different category, or turn off the stock filter.
          </p>
          <button type="button" onClick={reset} className="lc-link lc-eyebrow mt-8">
            Clear filters
          </button>
        </div>
      ) : (
        // Keyed on the selection, so changing a filter remounts the list and
        // the cards stagger back in instead of snapping to their new places.
        <ul
          key={`${category}-${inStockOnly}-${sort}`}
          className="lc-stagger mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((product, index) => {
            const soldOut = product.stock === 0;
            return (
              <li
                key={product.slug}
                className="lc-row group"
                style={{ "--i": index } as React.CSSProperties}
              >
                <Link href={`${BASE}/shop/${product.slug}`} className="block">
                  <div
                    className="lc-frame relative aspect-square overflow-hidden border"
                    style={{ borderColor: "var(--lc-line)" }}
                  >
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.imageAlt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover"
                        style={soldOut ? { filter: "grayscale(1)", opacity: 0.65 } : undefined}
                      />
                    )}
                    {soldOut && (
                      <span
                        className="lc-eyebrow absolute top-3 left-3 px-2.5 py-1 text-white"
                        style={{ backgroundColor: "var(--lc-fg)", color: "var(--lc-bg)" }}
                      >
                        Sold out
                      </span>
                    )}
                    {!soldOut && product.stock < 6 && (
                      <span
                        className="lc-eyebrow absolute top-3 left-3 px-2.5 py-1"
                        style={{ backgroundColor: "var(--lc-accent-solid)", color: "#fff" }}
                      >
                        Only {product.stock} left
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h2 className="text-[1.35rem] leading-tight transition-colors group-hover:text-[var(--lc-accent-text)]">
                      {product.name}
                    </h2>
                    <span className="shrink-0 text-[15px] tabular-nums">
                      {formatPeso(product.price)}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[14.5px] leading-relaxed"
                    style={{ color: "var(--lc-fg-2)" }}
                  >
                    {product.blurb}
                  </p>
                  <span
                    aria-hidden
                    className="lc-row-rule mt-4 block h-px"
                    style={{ backgroundColor: "var(--lc-accent)" }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
