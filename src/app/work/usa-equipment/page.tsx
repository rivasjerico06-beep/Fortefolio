import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Search } from "lucide-react";
import { BASE, BRANDS, CATEGORIES, UNITS, YARD, getStatusCounts, getUnits } from "./data";
import { Kicker, PhotoSlot, UnitCard } from "./parts";

export const metadata: Metadata = {
  title: "USA Equipment Co. — demo site",
  description:
    "Equipment sales and rentals in Magnolia, Texas. A yard site with live unit status, a filterable fleet, and a quote list that survives navigation.",
};

/** Category icons, drawn inline rather than pulled from an icon font. */
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Generators: (
    <>
      <path d="M4 7h16v10H4z" />
      <path d="M8 7V4h8v3" />
      <path d="M9 12h6" />
    </>
  ),
  "Light Towers": (
    <>
      <path d="M12 3v11" />
      <path d="M6 21h12" />
      <path d="M9 21l3-7 3 7" />
      <path d="M6 5h12l-3 4H9z" />
    </>
  ),
  Compaction: (
    <>
      <path d="M3 16h18" />
      <path d="M6 16V9h12v7" />
      <path d="M9 9V5h6v4" />
    </>
  ),
  "Pressure Washers": (
    <>
      <path d="M5 20h9V9H5z" />
      <path d="M14 12h3l3-5" />
      <path d="M8 5V3" />
    </>
  ),
  Pumps: (
    <>
      <path d="M4 18h16" />
      <path d="M7 18V8h8v10" />
      <path d="M15 11h4" />
      <path d="M9 5h4" />
    </>
  ),
  "Lift Equipment": (
    <>
      <path d="M4 20h16" />
      <path d="M7 20V6" />
      <path d="M17 20V6" />
      <path d="M7 12l10-6" />
      <path d="M7 6l10 6" />
    </>
  ),
  "Air Compressors": (
    <>
      <path d="M5 20h14" />
      <path d="M7 20v-8h10v8" />
      <circle cx="12" cy="8" r="3" />
    </>
  ),
  Mixers: (
    <>
      <path d="M4 19h16" />
      <path d="M7 19l2-9h6l2 9" />
      <path d="M9 6h6" />
    </>
  ),
};

export default async function UsaEquipmentHome() {
  const units = await getUnits();
  const counts = await getStatusCounts();
  const ready = counts["in-yard"];

  /* The four newest arrivals in the yard lead the grid */
  const featured = units.filter((unit) => unit.status === "in-yard").slice(0, 4);

  const pad = "px-4 sm:px-[5.5vw] xl:px-20";

  return (
    <>
      {/* Hero ------------------------------------------------------------ */}
      <section className="flex flex-wrap border-b border-[var(--ue-line)]">
        <div className={`flex flex-[1_1_35rem] flex-col justify-center py-10 sm:py-16 ${pad}`}>
          <p
            className="ue-rise mb-5 flex items-center gap-2.5"
            style={{ "--ue-delay": 0 } as React.CSSProperties}
          >
            <span
              aria-hidden
              className="ue-led size-2.5 rounded-[2px] bg-[var(--ue-in-yard)] text-[var(--ue-in-yard)]"
            />
            <span className="ue-mono text-[11px] text-[var(--ue-ink-2)]">
              Yard open now · {ready} units ready for pickup
            </span>
          </p>

          <h1 className="mb-6 text-[clamp(2.625rem,6.4vw,4.5rem)] leading-[0.98]">
            <span className="ue-rise block" style={{ "--ue-delay": 40 } as React.CSSProperties}>
              Equipment
            </span>
            <span
              className="ue-rise block"
              style={{ "--ue-delay": 130 } as React.CSSProperties}
            >
              That
            </span>
            <span
              className="ue-rise relative block w-max max-w-full"
              style={{ "--ue-delay": 220 } as React.CSSProperties}
            >
              <span
                aria-hidden
                className="ue-wipe absolute inset-x-[-6px] bottom-0.5 h-[0.34em] bg-[var(--ue-yellow)]"
              />
              <span className="relative">Shows Up.</span>
            </span>
          </h1>

          <p
            className="ue-rise mb-7 max-w-[32.5rem] text-lg leading-relaxed text-pretty text-[var(--ue-ink-2)]"
            style={{ "--ue-delay": 300 } as React.CSSProperties}
          >
            Sales and rentals for contractors, cities, and anyone with a job to finish. Locally
            owned in Magnolia, Texas — and open to the public.
          </p>

          <form
            action={`${BASE}/equipment`}
            className="ue-rise mb-6 flex max-w-[32.5rem]"
            style={{ "--ue-delay": 360 } as React.CSSProperties}
          >
            <label htmlFor="yard-search" className="sr-only">
              Search the fleet
            </label>
            <input
              id="yard-search"
              type="search"
              name="q"
              placeholder="LIGHT TOWER, PUMP, COMPACTOR…"
              className="ue-mono h-14 min-w-0 flex-1 border-2 border-r-0 border-[var(--ue-ink)] bg-white px-4 text-[13px] outline-none placeholder:text-[var(--ue-ink-3)]"
            />
            <button
              type="submit"
              className="flex h-14 items-center gap-2 border-2 border-[var(--ue-ink)] bg-[var(--ue-ink)] px-5 text-sm font-semibold tracking-[0.03em] text-[var(--ue-on-navy)] uppercase transition-colors duration-150 hover:bg-[var(--ue-navy)]"
            >
              <Search aria-hidden className="size-4" />
              Find it
            </button>
          </form>

          <div
            className="ue-rise flex flex-wrap gap-3"
            style={{ "--ue-delay": 420 } as React.CSSProperties}
          >
            <Link
              href={`${BASE}/equipment`}
              className="flex h-14 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-7 text-base font-semibold uppercase transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[var(--ue-yellow-deep)] hover:shadow-[0_4px_0_0_var(--ue-ink)]"
            >
              Browse the fleet
            </Link>
            <a
              href={`tel:${YARD.phoneDial}`}
              className="flex h-14 items-center gap-2.5 border-2 border-[var(--ue-ink)] px-7 text-base font-semibold uppercase transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_4px_0_0_var(--ue-ink)]"
            >
              <Phone aria-hidden className="size-4" />
              Call {YARD.phone}
            </a>
          </div>
        </div>

        <div className="relative min-h-[27.5rem] flex-[1_1_26rem] border-l border-[var(--ue-line)]">
          <PhotoSlot label="Yard photo — 3:2" className="absolute inset-0" />
          <span
            aria-hidden
            className="ue-hazard ue-hazard-live absolute inset-y-0 left-0 w-2.5"
          />

          <div
            className="ue-rise absolute bottom-7 left-7 border-2 border-[var(--ue-ink)] bg-white px-4.5 py-3.5 shadow-[0_4px_0_0_var(--ue-ink)]"
            style={{ "--ue-delay": 620 } as React.CSSProperties}
          >
            <p className="ue-mono text-[11px] text-[var(--ue-ink-2)]">Unit LT-2214</p>
            <p className="ue-display mt-1 text-xl">Night-Lite Pro II</p>
            <p className="mt-2 flex items-center gap-2">
              <span
                aria-hidden
                className="ue-led size-2 rounded-[2px] bg-[var(--ue-in-yard)] text-[var(--ue-in-yard)]"
              />
              <span className="ue-mono text-[11px] font-medium text-[var(--ue-in-yard)]">
                In yard · Ready for pickup
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Trust band ------------------------------------------------------ */}
      <section className="ue-on-dark bg-[var(--ue-navy)] text-[var(--ue-on-navy)]">
        <div aria-hidden className="ue-hazard h-1.5" />
        <div
          className={`grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-8 py-8 sm:py-11 ${pad}`}
        >
          {[
            {
              title: "Locally owned",
              body: "Not a national chain. You'll talk to the same people every time.",
            },
            {
              title: "Open to the public",
              body: "Contractors and homeowners both. No account minimum.",
            },
            {
              title: `${BRANDS.length} factory brands`,
              body: "Authorized dealer for the manufacturers we stock and service.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              data-reveal="up"
              style={{ "--stagger": index } as React.CSSProperties}
            >
              <p className="ue-mono mb-2 text-[11px] text-[var(--ue-yellow)]">{item.title}</p>
              <p className="text-base leading-relaxed text-[var(--ue-on-navy-2)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick find ------------------------------------------------------ */}
      <section className={`border-b border-[var(--ue-line)] bg-white py-8 sm:py-12 ${pad}`}>
        <Kicker>Quick find</Kicker>
        <ul className="mt-5 flex flex-wrap gap-4">
          {CATEGORIES.map((category, index) => {
            const count = UNITS.filter((unit) => unit.category === category).length;
            return (
              <li
                key={category}
                data-reveal="up"
                style={{ "--stagger": index % 4 } as React.CSSProperties}
                className="flex-[1_1_7.5rem]"
              >
                <Link
                  href={`${BASE}/equipment?category=${encodeURIComponent(category)}`}
                  className="flex h-full flex-col items-center gap-3 border border-[var(--ue-line)] bg-[var(--ue-bg)] px-2 py-5 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-[3px] hover:border-[var(--ue-ink)] hover:shadow-[0_4px_0_0_var(--ue-ink)]"
                >
                  <svg
                    aria-hidden
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {CATEGORY_ICON[category]}
                  </svg>
                  <span className="ue-display text-center text-[15px] font-bold">
                    {category}
                  </span>
                  <span className="ue-mono text-[10px] text-[var(--ue-ink-3)]">
                    {count} {count === 1 ? "unit" : "units"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* In the yard today ----------------------------------------------- */}
      <section className={`py-12 sm:py-20 ${pad}`}>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker>Live from the yard</Kicker>
            <h2 className="mt-2.5 text-[clamp(1.875rem,3.6vw,2.75rem)]">In the yard today</h2>
          </div>
          <Link
            href={`${BASE}/equipment`}
            className="ue-mono border-b-2 border-[var(--ue-yellow)] pb-1 text-[12px] font-medium"
          >
            See all {UNITS.length} units →
          </Link>
        </div>
        <div aria-hidden className="my-6 h-0.5 bg-[var(--ue-ink)]" />

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(16.5rem,1fr))] gap-6">
          {featured.map((unit, index) => (
            <li key={unit.id} className="flex">
              <UnitCard unit={unit} stagger={index} showSpecs />
            </li>
          ))}
        </ul>
      </section>

      {/* Rent / buy ------------------------------------------------------ */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] border-t-2 border-[var(--ue-ink)]">
        {[
          {
            kicker: "01 — By the day",
            title: "Rent it",
            body: "Day, week and month rates on light towers, compaction, pumps and lifts. No account required — walk in, sign, load up.",
            cta: "See the rental fleet",
            href: `${BASE}/equipment`,
            solid: true,
          },
          {
            kicker: "02 — For the fleet",
            title: "Buy it",
            body: `New units from ${BRANDS.length} factory brands, plus used equipment as it comes through the yard. Parts and service on everything we sell.`,
            cta: "Browse new & used",
            href: `${BASE}/equipment`,
            solid: false,
          },
        ].map((panel, index) => (
          <div
            key={panel.title}
            data-reveal="up"
            style={{ "--stagger": index } as React.CSSProperties}
            className={`py-10 sm:py-16 ${pad} ${
              panel.solid ? "border-r border-[var(--ue-line)] bg-white" : "bg-[var(--ue-bg)]"
            }`}
          >
            <Kicker>{panel.kicker}</Kicker>
            <h3 className="mt-3 mb-3 text-[clamp(1.75rem,3.2vw,2.5rem)]">{panel.title}</h3>
            <p className="mb-6 max-w-[26rem] text-[17px] leading-relaxed text-[var(--ue-ink-2)]">
              {panel.body}
            </p>
            <Link
              href={panel.href}
              className={`inline-flex h-13 items-center border-2 border-[var(--ue-ink)] px-6 text-[15px] font-semibold uppercase transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--ue-ink)] ${
                panel.solid
                  ? "bg-[var(--ue-yellow)] hover:bg-[var(--ue-yellow-deep)]"
                  : "hover:bg-white"
              }`}
            >
              {panel.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* Brands ---------------------------------------------------------- */}
      <section
        id="brands"
        className={`scroll-mt-32 border-t border-[var(--ue-line)] bg-white py-12 sm:py-20 ${pad}`}
      >
        <Kicker>Authorized dealer</Kicker>
        <h2 className="mt-2.5 mb-7 text-[clamp(1.75rem,3.2vw,2.5rem)]">
          {BRANDS.length} factory brands
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(11.875rem,1fr))] border-t border-l border-[var(--ue-line)]">
          {BRANDS.map((brand) => (
            <li key={brand.name} className="border-r border-b border-[var(--ue-line)]">
              <span className="flex h-full flex-col items-center justify-center gap-1.5 px-3 py-6 text-center">
                <span className="ue-display text-[17px] font-bold">{brand.name}</span>
                <span className="ue-mono text-[10px] text-[var(--ue-ink-3)]">
                  {brand.category}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Find the yard --------------------------------------------------- */}
      <section
        id="yard"
        className="grid scroll-mt-32 grid-cols-[repeat(auto-fit,minmax(21.25rem,1fr))] border-t-2 border-[var(--ue-ink)]"
      >
        <div className={`py-11 sm:py-16 ${pad}`}>
          <Kicker>Find the yard</Kicker>
          <h2 className="mt-2.5 mb-5 text-[clamp(1.75rem,3.4vw,2.75rem)]">
            30 miles NW
            <br />
            of Houston
          </h2>
          <address className="ue-mono mb-6 text-[15px] leading-relaxed not-italic">
            {YARD.street}
            <br />
            {YARD.city}
          </address>

          <table className="ue-mono mb-7 border-collapse text-[13px] normal-case">
            <caption className="sr-only">Yard opening hours</caption>
            <tbody>
              {YARD.hours.map((row, index) => (
                <tr key={row.days}>
                  <th
                    scope="row"
                    className={`py-2 pr-7 text-left font-normal text-[var(--ue-ink-2)] uppercase ${
                      index < YARD.hours.length - 1 ? "border-b border-[var(--ue-line)]" : ""
                    }`}
                  >
                    {row.days}
                  </th>
                  <td
                    className={`py-2 ${
                      index < YARD.hours.length - 1 ? "border-b border-[var(--ue-line)]" : ""
                    } ${row.time === "Closed" ? "text-[var(--ue-ink-3)]" : ""}`}
                  >
                    {row.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${YARD.street}, ${YARD.city}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-13 items-center border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)] px-6 text-[15px] font-semibold uppercase transition-[background,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:bg-[var(--ue-yellow-deep)] hover:shadow-[0_4px_0_0_var(--ue-ink)]"
          >
            Get directions
          </a>
        </div>

        {/* A schematic, not a map tile — no third-party request, no API key */}
        <div
          aria-hidden
          className="relative min-h-[23.75rem] overflow-hidden border-l-2 border-[var(--ue-ink)] bg-[var(--ue-navy)]"
        >
          <span
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(#173355 1px, transparent 1px), linear-gradient(90deg, #173355 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <span className="absolute inset-x-0 top-[52%] h-[3px] -rotate-2 bg-white/50" />
          <span className="absolute inset-y-0 left-[34%] w-0.5 bg-white/30" />
          <span className="absolute top-[44%] left-[52%] size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ue-yellow)] opacity-35" />
          <span className="absolute top-[44%] left-[52%] -translate-x-1/2 -translate-y-full">
            <span className="relative block size-6.5 rotate-45 border-2 border-[var(--ue-ink)] bg-[var(--ue-yellow)]">
              <span className="absolute inset-1.5 rounded-full bg-[var(--ue-ink)]" />
            </span>
          </span>
          <span className="ue-mono absolute bottom-6 left-6 border border-white/25 bg-[var(--ue-navy)]/85 px-3 py-2 text-[11px] text-[var(--ue-on-navy)]">
            FM 1488 &amp; Magnolia · 30 mi NW of Houston
          </span>
        </div>
      </section>
    </>
  );
}
