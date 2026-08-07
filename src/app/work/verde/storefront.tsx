"use client";

import { useMemo, useState } from "react";
import { Droplets, Minus, Plus, ShoppingBag, Star, Sun, X } from "lucide-react";
import {
  LinkListWidget,
  SearchWidget,
  Widget,
  WpBreadcrumbs,
  WpHeader,
} from "@/components/wp/wp-chrome";

type Product = {
  id: string;
  name: string;
  category: "Plants" | "Pots" | "Care";
  price: number;
  light: "Low" | "Bright indirect" | "Full sun";
  water: string;
  hue: string;
  petSafe: boolean;
  rating: number;
  onSale?: boolean;
};

const catalogue: Product[] = [
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    category: "Plants",
    price: 1450,
    light: "Bright indirect",
    water: "Weekly",
    hue: "#2f6f4e",
    petSafe: false,
    rating: 5,
  },
  {
    id: "zz",
    name: "ZZ Plant",
    category: "Plants",
    price: 980,
    light: "Low",
    water: "Every 3 weeks",
    hue: "#3a5f43",
    petSafe: false,
    rating: 4,
  },
  {
    id: "pothos",
    name: "Golden Pothos",
    category: "Plants",
    price: 620,
    light: "Low",
    water: "Every 10 days",
    hue: "#5d8a4a",
    petSafe: false,
    rating: 5,
    onSale: true,
  },
  {
    id: "calathea",
    name: "Calathea Orbifolia",
    category: "Plants",
    price: 1780,
    light: "Bright indirect",
    water: "Twice weekly",
    hue: "#4a7c59",
    petSafe: true,
    rating: 4,
  },
  {
    id: "snake",
    name: "Snake Plant",
    category: "Plants",
    price: 850,
    light: "Low",
    water: "Monthly",
    hue: "#46664a",
    petSafe: false,
    rating: 5,
  },
  {
    id: "cactus",
    name: "Golden Barrel Cactus",
    category: "Plants",
    price: 1120,
    light: "Full sun",
    water: "Every 4 weeks",
    hue: "#7d9a4e",
    petSafe: true,
    rating: 3,
  },
  {
    id: "fiddle",
    name: "Fiddle Leaf Fig",
    category: "Plants",
    price: 2350,
    light: "Bright indirect",
    water: "Weekly",
    hue: "#2c5f3f",
    petSafe: false,
    rating: 4,
  },
  {
    id: "spider",
    name: "Spider Plant",
    category: "Plants",
    price: 540,
    light: "Bright indirect",
    water: "Weekly",
    hue: "#6b9455",
    petSafe: true,
    rating: 5,
    onSale: true,
  },
  {
    id: "terracotta",
    name: 'Terracotta Pot, 6"',
    category: "Pots",
    price: 380,
    light: "Full sun",
    water: "—",
    hue: "#b5714a",
    petSafe: true,
    rating: 4,
  },
  {
    id: "stoneware",
    name: 'Stoneware Planter, 8"',
    category: "Pots",
    price: 760,
    light: "Full sun",
    water: "—",
    hue: "#8a8071",
    petSafe: true,
    rating: 5,
  },
  {
    id: "hanging",
    name: "Hanging Ceramic Pot",
    category: "Pots",
    price: 890,
    light: "Full sun",
    water: "—",
    hue: "#9c8a6f",
    petSafe: true,
    rating: 4,
  },
  {
    id: "feed",
    name: "Liquid Plant Feed, 500ml",
    category: "Care",
    price: 320,
    light: "Low",
    water: "—",
    hue: "#4f7a3d",
    petSafe: true,
    rating: 5,
  },
  {
    id: "mix",
    name: "Aroid Potting Mix, 5L",
    category: "Care",
    price: 450,
    light: "Low",
    water: "—",
    hue: "#6b5a3f",
    petSafe: true,
    rating: 4,
  },
  {
    id: "mister",
    name: "Brass Mister",
    category: "Care",
    price: 680,
    light: "Low",
    water: "—",
    hue: "#a08a52",
    petSafe: true,
    rating: 5,
  },
];

const categories = ["All", "Plants", "Pots", "Care"] as const;
const lightLevels = ["Any", "Low", "Bright indirect", "Full sun"] as const;
const sorts = ["Featured", "Price: low to high", "Price: high to low"] as const;

/**
 * Verde is still a single page, so the nav points at the shop archive itself.
 * Category routes and a product page arrive when this demo is split up, the way
 * Lumen Café already is.
 */
const nav = [
  { label: "Home", href: "/work/verde" },
  { label: "Shop", href: "/work/verde" },
];

const peso = (value: number) => `₱${value.toLocaleString()}`;

function StarRating({ rating }: { rating: number }) {
  return (
    <p className="mt-1.5 flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className="size-3.5"
          style={{
            fill: star <= rating ? "#e6a817" : "transparent",
            color: star <= rating ? "#e6a817" : "#c9c2b4",
          }}
        />
      ))}
    </p>
  );
}

/**
 * WooCommerce-style shop archive. All filtering, sorting and cart maths run in
 * React state, so changing a filter costs one frame instead of the full page
 * reload a stock WooCommerce archive does.
 */
export function Storefront() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [light, setLight] = useState<(typeof lightLevels)[number]>("Any");
  const [petSafeOnly, setPetSafeOnly] = useState(false);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Featured");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  // Filtering and sorting run in memory — one frame, no network round trip
  const visible = useMemo(() => {
    const filtered = catalogue.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (light !== "Any" && product.light !== light) return false;
      if (petSafeOnly && !product.petSafe) return false;
      return true;
    });

    if (sort === "Price: low to high") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "Price: high to low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [category, light, petSafeOnly, sort]);

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => ({ product: catalogue.find((p) => p.id === id)!, qty }))
    .filter((line) => line.product && line.qty > 0);

  const itemCount = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  function addToCart(id: string) {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  }

  function setQty(id: string, qty: number) {
    setCart((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  function clearFilters() {
    setCategory("All");
    setLight("Any");
    setPetSafeOnly(false);
    setSort("Featured");
  }

  const fieldClass =
    "w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-2.5 py-2 text-[13.5px] text-[var(--wp-ink)] outline-none focus:border-[var(--wp-accent)]";

  return (
    <>
      <WpHeader
        title="Verde Supply"
        tagline="Houseplants and supplies · Grown in Cavite"
        nav={nav}
        active="/work/verde"
        titleHref="/work/verde"
        cta={
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="ml-2 inline-flex items-center gap-1.5 bg-[var(--wp-accent)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--wp-accent-ink)]"
          >
            <ShoppingBag className="size-3.5" aria-hidden />
            Cart ({itemCount})
          </button>
        }
      />

      <WpBreadcrumbs trail={[{ label: "Home", href: "/work/verde" }, { label: "Shop" }]} />

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        {/* Shop sidebar — WooCommerce filter widgets */}
        <aside aria-label="Shop filters" className="min-w-0 space-y-7">
          <SearchWidget title="Search Products" />

          <Widget title="Filter by Category">
            <label htmlFor="filter-category" className="mb-1.5 block text-[13px]">
              Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof categories)[number])
              }
              className={fieldClass}
            >
              {categories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </Widget>

          <Widget title="Filter by Light">
            <label htmlFor="filter-light" className="mb-1.5 block text-[13px]">
              Light
            </label>
            <select
              id="filter-light"
              value={light}
              onChange={(event) => setLight(event.target.value as (typeof lightLevels)[number])}
              className={fieldClass}
            >
              {lightLevels.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <label className="mt-4 flex cursor-pointer items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={petSafeOnly}
                onChange={(event) => setPetSafeOnly(event.target.checked)}
                className="size-4 accent-[var(--wp-accent)]"
              />
              Pet safe only
            </label>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 w-full border border-[var(--wp-line)] px-3 py-2 text-[12.5px] font-semibold tracking-wide uppercase hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]"
            >
              Clear filters
            </button>
          </Widget>

          <LinkListWidget
            title="Product Categories"
            items={[
              { label: "Plants", count: 8 },
              { label: "Pots & planters", count: 3 },
              { label: "Care & soil", count: 3 },
            ]}
          />

          <Widget title="Cart">
            {itemCount === 0 ? (
              <p>No products in the cart.</p>
            ) : (
              <>
                <p>
                  {itemCount} item{itemCount === 1 ? "" : "s"} · {peso(subtotal)}
                </p>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="mt-3 w-full bg-[var(--wp-accent)] px-3 py-2 text-[12.5px] font-bold tracking-wide text-[var(--wp-accent-ink)] uppercase"
                >
                  View cart
                </button>
              </>
            )}
          </Widget>
        </aside>

        {/* Shop archive */}
        <main className="min-w-0">
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
            Grown in Cavite, delivered across Metro Manila. Every listing tells you how much
            light it needs before you buy it, not after.
          </p>

          {/* Result count + ordering row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--wp-line)] py-3">
            <p
              role="status"
              aria-live="polite"
              className="text-[13.5px] text-[var(--wp-ink-2)]"
            >
              Showing {visible.length} of {catalogue.length} results
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="shop-sort" className="text-[13px] text-[var(--wp-ink-2)]">
                Sort
              </label>
              <select
                id="shop-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as (typeof sorts)[number])}
                className="border border-[var(--wp-line)] bg-[var(--wp-surface)] px-2.5 py-1.5 text-[13px] text-[var(--wp-ink)] outline-none focus:border-[var(--wp-accent)]"
              >
                {sorts.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-6 border-l-4 border-[var(--wp-accent)] bg-[var(--wp-surface-alt)] px-4 py-3.5 text-[14px]">
              No products were found matching your selection.
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 font-semibold text-[var(--wp-accent)] underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="products mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <li key={product.id} className="product group relative flex min-w-0 flex-col">
                  {product.onSale && (
                    <span className="absolute top-2 left-2 z-10 bg-[var(--wp-accent)] px-2 py-0.5 text-[11px] font-bold text-[var(--wp-accent-ink)] uppercase">
                      Sale!
                    </span>
                  )}

                  {/* Fixed aspect ratio reserves the space, so the grid never reflows */}
                  <div
                    aria-hidden
                    className="grid aspect-square place-items-center border border-[var(--wp-line)]"
                    style={{ backgroundColor: `${product.hue}1a` }}
                  >
                    <span
                      className="size-20 rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: product.hue }}
                    />
                  </div>

                  <h2 className="mt-3 text-[16px] font-semibold">
                    <a href="#" className="hover:text-[var(--wp-accent)]">
                      {product.name}
                    </a>
                  </h2>

                  <StarRating rating={product.rating} />

                  <div className="mt-1.5 space-y-0.5 text-[12.5px] text-[var(--wp-ink-2)]">
                    <p className="flex items-center gap-1.5">
                      <Sun className="size-3" aria-hidden />
                      {product.light}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Droplets className="size-3" aria-hidden />
                      {product.water}
                    </p>
                  </div>

                  <p className="mt-2 text-[17px] font-bold text-[var(--wp-ink)]">
                    {peso(product.price)}
                  </p>

                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="mt-auto w-full bg-[var(--wp-accent)] px-4 py-2.5 text-[12.5px] font-bold tracking-wide text-[var(--wp-accent-ink)] uppercase transition-opacity hover:opacity-90"
                  >
                    Add to cart
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[110]">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div
            role="dialog"
            aria-label="Shopping cart"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-[var(--wp-surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--wp-line)] px-5 py-3.5">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--wp-heading-font)" }}
              >
                Your Cart
              </h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="grid size-8 place-items-center text-[var(--wp-ink-2)] hover:text-[var(--wp-ink)]"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {cartLines.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-semibold">No products in the cart.</p>
                  <p className="mt-1.5 text-[13.5px] text-[var(--wp-ink-2)]">
                    Add a plant and it will show up here with a running total.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="mt-5 border border-[var(--wp-line)] px-4 py-2 text-[12.5px] font-semibold tracking-wide uppercase"
                  >
                    Return to shop
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--wp-line)]">
                  {cartLines.map(({ product, qty }) => (
                    <li key={product.id} className="flex gap-3 py-4">
                      <div
                        aria-hidden
                        className="grid size-14 shrink-0 place-items-center border border-[var(--wp-line)]"
                        style={{ backgroundColor: `${product.hue}1a` }}
                      >
                        <span
                          className="size-6 rounded-full"
                          style={{ backgroundColor: product.hue }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold">{product.name}</p>
                        <p className="mt-0.5 text-[12.5px] text-[var(--wp-ink-2)] tabular-nums">
                          {peso(product.price)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="grid size-7 place-items-center border border-[var(--wp-line)] hover:border-[var(--wp-accent)]"
                          >
                            <Minus className="size-3" aria-hidden />
                          </button>
                          <span className="w-6 text-center text-[13px] tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="grid size-7 place-items-center border border-[var(--wp-line)] hover:border-[var(--wp-accent)]"
                          >
                            <Plus className="size-3" aria-hidden />
                          </button>
                        </div>
                      </div>
                      <p className="text-[14px] font-bold tabular-nums">
                        {peso(product.price * qty)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartLines.length > 0 && (
              <div className="border-t border-[var(--wp-line)] px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13.5px] text-[var(--wp-ink-2)]">Subtotal</span>
                  <span className="text-xl font-bold tabular-nums">{peso(subtotal)}</span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--wp-ink-2)]">
                  Delivery calculated at checkout. Free over ₱2,500.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full bg-[var(--wp-accent)] px-5 py-3 text-[13px] font-bold tracking-wide text-[var(--wp-accent-ink)] uppercase"
                >
                  Proceed to checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
