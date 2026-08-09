import { UNITS, type Unit } from "./data";

/**
 * The quote list, as a module-level store rather than React state.
 *
 * Same reasoning as the Lumen basket, and for the same reasons: the list has to
 * survive navigating from the catalogue to a unit page to the quote form, and a
 * module outlives the React tree regardless of which layout a route sits under.
 * `useSyncExternalStore` gives an explicit *server* snapshot, so the server
 * renders an empty list and the browser swaps in the stored one after
 * hydration — reading localStorage during render would mismatch instead.
 *
 * There is no total to protect here the way a checkout has: a quote request
 * carries unit numbers and quantities, and the yard prices it. That is not a
 * simplification, it is how quoting works — the rate depends on term, delivery
 * radius and waiver, none of which the browser knows.
 */

export type QuoteLine = { id: string; qty: number };

const STORAGE_KEY = "usaeq-quote";
const MAX_PER_LINE = 20;

const EMPTY: readonly QuoteLine[] = [];

let lines: readonly QuoteLine[] = EMPTY;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode, or storage full. The list still works for this session.
  }
}

function commit(next: readonly QuoteLine[]) {
  lines = next;
  persist();
  listeners.forEach((listener) => listener());
}

/**
 * Read the stored list once, at module load, on the client only.
 *
 * A unit that has since left the fleet is dropped rather than restored — a list
 * remembered from last week must not put a sold machine back on a quote.
 */
function hydrate() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    lines = parsed.flatMap((entry): QuoteLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const line = entry as Partial<QuoteLine>;
      if (typeof line.id !== "string" || typeof line.qty !== "number") return [];
      if (!UNITS.some((unit) => unit.id === line.id)) return [];
      return [{ id: line.id, qty: clamp(Math.floor(line.qty)) }];
    });
  } catch {
    lines = EMPTY;
  }
}

function clamp(qty: number) {
  return Math.min(Math.max(1, qty), MAX_PER_LINE);
}

if (typeof window !== "undefined") hydrate();

/* Subscription ------------------------------------------------------------ */

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSnapshot = () => lines;
export const getServerSnapshot = () => EMPTY;

/* Mutations --------------------------------------------------------------- */

export function addUnit(id: string) {
  const existing = lines.find((line) => line.id === id);
  commit(
    existing
      ? lines.map((line) => (line.id === id ? { ...line, qty: clamp(line.qty + 1) } : line))
      : [...lines, { id, qty: 1 }],
  );
}

export function setQty(id: string, qty: number) {
  if (qty <= 0) return removeUnit(id);
  commit(lines.map((line) => (line.id === id ? { ...line, qty: clamp(qty) } : line)));
}

export function removeUnit(id: string) {
  commit(lines.filter((line) => line.id !== id));
}

export function clearQuote() {
  commit(EMPTY);
}

/* Derived ----------------------------------------------------------------- */

export type ResolvedLine = QuoteLine & { unit: Unit };

export function resolve(current: readonly QuoteLine[]): ResolvedLine[] {
  return current.flatMap((line) => {
    const unit = UNITS.find((candidate) => candidate.id === line.id);
    return unit ? [{ ...line, unit }] : [];
  });
}

export function countOf(current: readonly QuoteLine[]) {
  return current.reduce((sum, line) => sum + line.qty, 0);
}
