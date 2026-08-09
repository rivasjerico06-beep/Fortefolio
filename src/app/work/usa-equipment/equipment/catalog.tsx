"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { YARD, type StatusKey, type Unit } from "../data";
import { UnitGrid } from "../parts";
import { CatalogHeading, chipClass, statusChips } from "./fleet";

/**
 * Filtering and search over the fleet.
 *
 * This reads the URL through `useSearchParams`, which opts the component out of
 * prerendering — so it sits inside a `<Suspense>` whose fallback is
 * `StaticFleet`, the same catalogue rendered on the server. That is the whole
 * trick on this page: the static HTML holds **every unit**, so a crawler and a
 * reader with no JavaScript get the complete fleet and working filter links,
 * and hydration swaps in the live version. The route stays static.
 *
 * Once hydrated, filtering is a `useMemo` over an array of eight — a chip click
 * repaints on the same frame instead of making a round trip.
 */

const ALL = "All";

export function Catalog({
  units,
  counts,
  categories,
}: {
  units: readonly Unit[];
  counts: Record<StatusKey, number>;
  categories: readonly string[];
}) {
  const params = useSearchParams();

  // Remounting on a URL change is the point: arriving from a category link in
  // the mega menu should set the filter, not be ignored because state exists.
  const key = `${params.get("q") ?? ""}|${params.get("category") ?? ""}|${params.get("status") ?? ""}`;

  return (
    <CatalogInner
      key={key}
      units={units}
      counts={counts}
      categories={categories}
      initialQuery={params.get("q") ?? ""}
      initialCategory={params.get("category") ?? ALL}
      initialStatus={params.get("status") ?? ALL}
    />
  );
}

function CatalogInner({
  units,
  counts,
  categories,
  initialQuery,
  initialCategory,
  initialStatus,
}: {
  units: readonly Unit[];
  counts: Record<StatusKey, number>;
  categories: readonly string[];
  initialQuery: string;
  initialCategory: string;
  initialStatus: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || ALL);
  const [status, setStatus] = useState(initialStatus || ALL);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return units.filter((unit) => {
      if (status !== ALL && unit.status !== status) return false;
      if (category !== ALL && unit.category !== category) return false;
      if (!needle) return true;
      return `${unit.name} ${unit.category} ${unit.sub} ${unit.id}`
        .toLowerCase()
        .includes(needle);
    });
  }, [units, query, category, status]);

  const dirty = query.trim() !== "" || category !== ALL || status !== ALL;

  const reset = () => {
    setQuery("");
    setCategory(ALL);
    setStatus(ALL);
  };

  return (
    <>
      <CatalogHeading count={results.length} />

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mb-4 flex max-w-[26rem]"
        role="search"
      >
        <label htmlFor="catalog-search" className="sr-only">
          Search the fleet
        </label>
        <input
          id="catalog-search"
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="SEARCH BY NAME, UNIT NO. OR SPEC"
          className="ue-mono h-9.5 min-w-0 flex-1 border-2 border-[var(--ue-ink)] bg-white px-3 text-[12px] outline-none placeholder:text-[var(--ue-ink-3)]"
        />
      </form>

      <div className="mb-3 flex flex-wrap gap-2.5">
        {[ALL, ...categories].map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={chipClass(category === name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        {statusChips(units.length, counts).map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={status === item.key}
            onClick={() => setStatus(item.key)}
            className={chipClass(status === item.key)}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: item.dot }}
            />
            {item.label}
            <span className="opacity-60">{item.count}</span>
          </button>
        ))}

        {dirty ? (
          <button
            type="button"
            onClick={reset}
            className="ue-mono h-9.5 border-b-2 border-[var(--ue-ink)] px-3 text-[12px]"
          >
            Clear all ✕
          </button>
        ) : null}
      </div>

      {results.length > 0 ? (
        // No reveal: a card that appears from a filter click has already missed
        // its intersection, and would sit at opacity 0 forever.
        <UnitGrid units={results} />
      ) : (
        <div className="flex flex-col items-start gap-4 border-2 border-[var(--ue-ink)] bg-white p-8 sm:p-14">
          <p className="ue-mono text-[11px] text-[var(--ue-ink-3)]">No matches</p>
          <h2 className="max-w-[16ch] text-[clamp(1.5rem,3vw,2.125rem)] leading-[1.05]">
            More in the yard than we&rsquo;ve listed.
          </h2>
          <p className="m-0 max-w-[46ch] text-[17px] leading-relaxed text-[var(--ue-ink-2)]">
            Our online fleet page is still filling in. If you don&rsquo;t see what you need,
            call — we likely have it or can get it.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <a
              href={`tel:${YARD.phoneDial}`}
              className="flex h-13 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-6 text-[15px] font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-yellow-deep)]"
            >
              Call {YARD.phone}
            </a>
            <button
              type="button"
              onClick={reset}
              className="h-13 border-2 border-[var(--ue-ink)] px-6 text-[15px] font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-bg)]"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
