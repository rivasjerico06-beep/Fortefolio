import { deliveryFor, describeVariants, getProduct, priceOf, type Product } from "./catalog";

/**
 * The cart, as a module-level store rather than React state.
 *
 * Three reasons it is built this way:
 *
 *  - It lives outside the React tree, so navigating between pages cannot reset
 *    it. A context in a layout would survive too, but only if every route stays
 *    under that layout; a plain module survives regardless.
 *  - `useSyncExternalStore` gives an explicit *server* snapshot, so the server
 *    renders an empty cart and the browser swaps in the stored one after
 *    hydration. Reading localStorage during render would mismatch instead.
 *  - It sidesteps loading persisted state inside an effect, which is both a
 *    flash of the wrong UI and something this codebase lints against.
 */

export type CartLine = {
  /** Stable identity: the same product with a different grind is a different line. */
  key: string;
  slug: string;
  variants: Record<string, string>;
  quantity: number;
};

export type CartState = { lines: CartLine[]; open: boolean };

const STORAGE_KEY = "lumen-cart";
const MAX_PER_LINE = 20;

const EMPTY: CartState = { lines: [], open: false };

let state: CartState = EMPTY;
const listeners = new Set<() => void>();

/** Same product, same options — one line. Order-independent. */
export function lineKey(slug: string, variants: Record<string, string>) {
  const parts = Object.keys(variants)
    .sort()
    .map((k) => `${k}:${variants[k]}`);
  return [slug, ...parts].join("|");
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
  } catch {
    // Private mode, or storage full. The cart still works for this session.
  }
}

function commit(next: CartState) {
  state = next;
  persist();
  listeners.forEach((listener) => listener());
}

/**
 * Read the stored cart once, at module load, on the client only.
 *
 * Anything that no longer exists in the catalogue, or is now out of stock, is
 * dropped rather than restored — a cart remembered from last week must not
 * resurrect a product that has since been delisted.
 */
function hydrate() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const lines = parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const line = entry as Partial<CartLine>;
      if (typeof line.slug !== "string" || typeof line.quantity !== "number") return [];

      const product = getProduct(line.slug);
      if (!product || product.stock === 0) return [];

      const variants = (line.variants ?? {}) as Record<string, string>;
      const quantity = Math.min(
        Math.max(1, Math.floor(line.quantity)),
        Math.min(MAX_PER_LINE, product.stock),
      );
      return [{ key: lineKey(line.slug, variants), slug: line.slug, variants, quantity }];
    });

    state = { lines, open: false };
  } catch {
    state = EMPTY;
  }
}

if (typeof window !== "undefined") hydrate();

/* Subscription ------------------------------------------------------------ */

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSnapshot = () => state;
export const getServerSnapshot = () => EMPTY;

/* Mutations --------------------------------------------------------------- */

export function addLine(product: Product, variants: Record<string, string>, quantity = 1) {
  if (product.stock === 0) return;
  const key = lineKey(product.slug, variants);
  const ceiling = Math.min(MAX_PER_LINE, product.stock);
  const existing = state.lines.find((line) => line.key === key);

  const lines = existing
    ? state.lines.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.min(line.quantity + quantity, ceiling) }
          : line,
      )
    : [
        ...state.lines,
        { key, slug: product.slug, variants, quantity: Math.min(quantity, ceiling) },
      ];

  commit({ lines, open: true });
}

export function setQuantity(key: string, quantity: number) {
  if (quantity <= 0) return removeLine(key);
  commit({
    ...state,
    lines: state.lines.map((line) => {
      if (line.key !== key) return line;
      const product = getProduct(line.slug);
      const ceiling = Math.min(MAX_PER_LINE, product?.stock ?? MAX_PER_LINE);
      return { ...line, quantity: Math.min(quantity, ceiling) };
    }),
  });
}

export function removeLine(key: string) {
  commit({ ...state, lines: state.lines.filter((line) => line.key !== key) });
}

export function clearCart() {
  commit({ lines: [], open: false });
}

export function openCart() {
  commit({ ...state, open: true });
}

export function closeCart() {
  commit({ ...state, open: false });
}

/* Derived ----------------------------------------------------------------- */

export type ResolvedLine = CartLine & {
  product: Product;
  unitPrice: number;
  lineTotal: number;
  description: string;
};

export function resolve(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = getProduct(line.slug);
    if (!product) return [];
    const unitPrice = priceOf(product, line.variants);
    return [
      {
        ...line,
        product,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
        description: describeVariants(product, line.variants),
      },
    ];
  });
}

export function totals(lines: CartLine[]) {
  const resolved = resolve(lines);
  const subtotal = resolved.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = deliveryFor(subtotal);
  return {
    resolved,
    count: resolved.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    delivery,
    total: subtotal + delivery,
  };
}
