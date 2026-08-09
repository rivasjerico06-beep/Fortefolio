import Link from "next/link";
import { BASE, STATUS, type StatusKey, type Unit } from "../data";
import { UnitGrid } from "../parts";

/**
 * The catalogue as the server renders it, plus the bits both versions share.
 *
 * `StaticFleet` is the `<Suspense>` fallback for the interactive `Catalog`.
 * That is deliberate rather than incidental: because the interactive version
 * reads the URL (and so cannot prerender), this is what ends up in the static
 * HTML — the complete fleet, with every filter available as a real link. A
 * crawler indexes all of it, and a reader with no JavaScript can still narrow
 * the list, because these chips are anchors rather than buttons.
 *
 * The chip styling and the status counts live here so the two versions cannot
 * drift out of step with each other.
 */

export function chipClass(active: boolean) {
  return `ue-mono flex h-9.5 items-center gap-2 border-2 border-[var(--ue-ink)] px-3.5 text-[12px] font-medium transition-colors duration-150 ${
    active ? "bg-[var(--ue-ink)] text-[var(--ue-on-navy)]" : "bg-white hover:bg-[var(--ue-bg)]"
  }`;
}

export function statusChips(total: number, counts: Record<StatusKey, number>) {
  return [
    { key: "All", label: "All", dot: "var(--ue-ink)", count: total },
    ...(Object.keys(STATUS) as StatusKey[]).map((key) => ({
      key,
      label: STATUS[key].label,
      dot: STATUS[key].color,
      count: counts[key],
    })),
  ];
}

export function CatalogHeading({ count }: { count: number }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[clamp(2.125rem,4.6vw,3.5rem)]">Equipment</h1>
        <p aria-live="polite" className="ue-mono text-[13px] text-[var(--ue-ink-2)]">
          {count} {count === 1 ? "unit" : "units"}
        </p>
      </div>
      <div aria-hidden className="mb-5 h-0.5 bg-[var(--ue-ink)]" />
    </>
  );
}

export function StaticFleet({
  units,
  counts,
  categories,
}: {
  units: readonly Unit[];
  counts: Record<StatusKey, number>;
  categories: readonly string[];
}) {
  return (
    <>
      <CatalogHeading count={units.length} />

      {/* A plain GET form. Submitting it lands on ?q=… which the hydrated
          catalogue picks up — so search works before and after hydration. */}
      <form action={`${BASE}/equipment`} role="search" className="mb-4 flex max-w-[26rem]">
        <label htmlFor="catalog-search-static" className="sr-only">
          Search the fleet
        </label>
        <input
          id="catalog-search-static"
          type="search"
          name="q"
          placeholder="SEARCH BY NAME, UNIT NO. OR SPEC"
          className="ue-mono h-9.5 min-w-0 flex-1 border-2 border-[var(--ue-ink)] bg-white px-3 text-[12px] outline-none placeholder:text-[var(--ue-ink-3)]"
        />
      </form>

      <div className="mb-3 flex flex-wrap gap-2.5">
        <Link href={`${BASE}/equipment`} className={chipClass(true)}>
          All
        </Link>
        {categories.map((name) => (
          <Link
            key={name}
            href={`${BASE}/equipment?category=${encodeURIComponent(name)}`}
            className={chipClass(false)}
          >
            {name}
          </Link>
        ))}
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        {statusChips(units.length, counts).map((item) => (
          <Link
            key={item.key}
            href={
              item.key === "All" ? `${BASE}/equipment` : `${BASE}/equipment?status=${item.key}`
            }
            className={chipClass(item.key === "All")}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: item.dot }}
            />
            {item.label}
            <span className="opacity-60">{item.count}</span>
          </Link>
        ))}
      </div>

      <UnitGrid units={units} />
    </>
  );
}
