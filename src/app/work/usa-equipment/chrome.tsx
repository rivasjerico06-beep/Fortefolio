import Link from "next/link";
import { Search } from "lucide-react";
import { BASE, CATEGORIES, UNITS, YARD } from "./data";
import { QuoteButton } from "./quote-ui";

/**
 * Chrome for the yard site.
 *
 * The header ships **no JavaScript except the quote counter**. The mega menus
 * are `:hover` / `:focus-within` on a wrapper that holds both the trigger and
 * the panel — focusing the top-level link opens the panel, so it is keyboard
 * operable without a single event handler — and the mobile menu is a native
 * `<details>`. The search box is a plain GET form, so it works before hydration
 * and with scripting off entirely.
 *
 * Every menu link resolves to a real filtered view of the catalogue. None of
 * them is an `href="#"`: a link that goes nowhere is the thing that makes a
 * demo read as a mockup, and `npm run test:links` fails the build over it.
 */

const NAV: readonly { label: string; href: string; items: readonly Item[] }[] = [
  {
    label: "Rent",
    href: `${BASE}/equipment`,
    items: [
      { label: "The whole fleet", href: `${BASE}/equipment`, meta: `${UNITS.length} units` },
      { label: "In yard now", href: `${BASE}/equipment?status=in-yard`, meta: "Ready" },
      { label: "Out on rent", href: `${BASE}/equipment?status=on-rent`, meta: "Booked" },
      { label: "Inbound", href: `${BASE}/equipment?status=inbound`, meta: "Arriving" },
      { label: "Start a quote", href: `${BASE}/quote`, meta: "No account" },
    ],
  },
  {
    label: "Buy",
    href: `${BASE}/equipment`,
    items: [
      { label: "Generators", href: `${BASE}/equipment?category=Generators`, meta: "" },
      { label: "Light towers", href: `${BASE}/equipment?category=Light+Towers`, meta: "" },
      { label: "Compaction", href: `${BASE}/equipment?category=Compaction`, meta: "" },
      {
        label: "Air compressors",
        href: `${BASE}/equipment?category=Air+Compressors`,
        meta: "",
      },
      { label: "Parts & service", href: `${BASE}#yard`, meta: "Call the yard" },
    ],
  },
  {
    label: "Brands",
    href: `${BASE}#brands`,
    items: [
      {
        label: "Allmand",
        href: `${BASE}/equipment?category=Light+Towers`,
        meta: "Light towers",
      },
      { label: "Kubota", href: `${BASE}/equipment?category=Generators`, meta: "Generators" },
      { label: "Bomag", href: `${BASE}/equipment?category=Compaction`, meta: "Compaction" },
      {
        label: "Airman / MMD",
        href: `${BASE}/equipment?category=Air+Compressors`,
        meta: "Compressors",
      },
      { label: "Niftylift", href: `${BASE}/equipment?category=Lift+Equipment`, meta: "Lifts" },
      { label: "Koshin", href: `${BASE}/equipment?category=Pumps`, meta: "Pumps" },
      { label: "All 15 brands", href: `${BASE}#brands`, meta: "→" },
    ],
  },
  {
    label: "Categories",
    href: `${BASE}/equipment`,
    items: CATEGORIES.map((category) => ({
      label: category,
      href: `${BASE}/equipment?category=${encodeURIComponent(category)}`,
      meta: `${UNITS.filter((unit) => unit.category === category).length} units`,
    })),
  },
  {
    label: "The yard",
    href: `${BASE}#yard`,
    items: [
      { label: "Hours & directions", href: `${BASE}#yard`, meta: "Magnolia, TX" },
      {
        label: "Rental terms",
        href: `${BASE}/equipment/LT-2214#terms`,
        meta: "Day / week / month",
      },
      { label: "Request a quote", href: `${BASE}/quote`, meta: "1 hr callback" },
      { label: `Call ${YARD.phone}`, href: `tel:${YARD.phoneDial}`, meta: "Mon–Fri 7–5" },
    ],
  },
];

type Item = { label: string; href: string; meta: string };

/* -------------------------------------------------------------------------- */

/** The yellow chevron-notched block that stands in for a logo. */
function Mark({ size = 34, notch }: { size?: number; notch: string }) {
  return (
    <span
      aria-hidden
      className="relative block shrink-0 overflow-hidden bg-[var(--ue-yellow)]"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute top-0 right-0 rotate-45"
        style={{
          width: size * 0.38,
          height: size * 0.38,
          background: notch,
          transform: `rotate(45deg) translate(${size * 0.18}px, ${-size * 0.2}px)`,
        }}
      />
      <span className="absolute inset-x-0 bottom-0 h-1 bg-[var(--ue-ink)]" />
    </span>
  );
}

/** The navy strip above the header: hours, the live yard ticker, the phone. */
export function YardBar() {
  const ticker = [
    { id: "LT-2214", state: "In yard", tone: "var(--ue-yellow)" },
    { id: "CP-0885", state: "On rent", tone: "var(--ue-on-navy-2)" },
    { id: "GN-1140", state: "In yard", tone: "var(--ue-yellow)" },
    { id: "CM-3301", state: "In yard (2)", tone: "var(--ue-yellow)" },
    { id: "PW-0472", state: "Inbound", tone: "var(--ue-on-navy-2)" },
    { id: "LF-0119", state: "In yard", tone: "var(--ue-yellow)" },
  ];

  const run = (hidden: boolean) => (
    <div className="flex shrink-0 gap-10 pr-10" aria-hidden={hidden || undefined}>
      {ticker.map((entry) => (
        <span key={entry.id} className="whitespace-nowrap" style={{ color: entry.tone }}>
          ▪ {entry.id} {entry.state}
        </span>
      ))}
    </div>
  );

  return (
    <div className="ue-on-dark ue-mono flex min-h-10 items-center justify-between gap-6 overflow-hidden bg-[var(--ue-navy)] px-4 text-[13px] text-[var(--ue-on-navy)] sm:px-[5.5vw] xl:px-20">
      <span className="hidden shrink-0 text-[var(--ue-on-navy-2)] lg:inline">
        Magnolia, TX · Mon–Fri 7–5 · Sat 8–12
      </span>

      {/* Reuses the portfolio's marquee: one keyframe, and it pauses on hover
          so a reader can actually catch a unit number as it goes past. */}
      <div
        className="marquee-host min-w-0 flex-1 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <div className="marquee">
          {run(false)}
          {run(true)}
        </div>
      </div>

      <a
        href={`tel:${YARD.phoneDial}`}
        className="shrink-0 font-medium whitespace-nowrap text-[var(--ue-yellow)] hover:text-white"
      >
        {YARD.phone}
      </a>
    </div>
  );
}

export function UsaHeader() {
  return (
    <header className="relative flex min-h-20 items-center justify-between gap-6 border-b border-[var(--ue-line)] bg-[var(--ue-bg)] px-4 sm:px-[5.5vw] xl:px-20">
      <div className="flex min-w-0 items-center gap-5 xl:gap-12">
        <Link href={BASE} className="flex shrink-0 items-center gap-3.5">
          <Mark notch="var(--ue-bg)" />
          <span className="ue-display flex flex-col leading-none tracking-[-0.01em]">
            <span className="text-2xl font-extrabold">USA</span>
            <span className="text-[13px] font-bold text-[var(--ue-ink-2)]">Equipment Co.</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-4 lg:flex xl:gap-8">
          {NAV.map((section) => (
            // `static`, so the panel below resolves against the header rather
            // than against this wrapper — it spans the full width.
            <div key={section.label} className="group static">
              <Link
                href={section.href}
                className="ue-display block py-7 text-[17px] font-bold tracking-[0.01em] normal-case hover:text-[var(--ue-navy)]"
              >
                {section.label}
                <span
                  aria-hidden
                  className="mt-1.5 block h-[3px] origin-left scale-x-0 bg-[var(--ue-yellow)] transition-transform duration-150 group-focus-within:scale-x-100 group-hover:scale-x-100"
                  style={{ transitionTimingFunction: "var(--ue-ease)" }}
                />
              </Link>

              <div className="ue-menu-in absolute inset-x-0 top-full z-50 hidden border-b-2 border-[var(--ue-ink)] bg-white px-4 pt-8 pb-9 shadow-[0_12px_24px_-18px_rgba(15,37,64,0.5)] group-focus-within:block group-hover:block sm:px-[5.5vw] xl:px-20">
                <div className="flex flex-wrap items-start gap-12">
                  <div className="min-w-[11rem]">
                    <p className="ue-mono text-[11px] text-[var(--ue-ink-3)]">Section</p>
                    <p className="ue-display mt-2.5 text-[32px]">{section.label}</p>
                    <span aria-hidden className="mt-3 block h-1 w-12 bg-[var(--ue-yellow)]" />
                  </div>
                  <ul className="grid min-w-[16rem] flex-1 grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-x-10">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between gap-3 border-b border-[var(--ue-line)] py-2.5 pr-3 text-[15px] font-semibold transition-[padding,background] duration-150 hover:bg-[var(--ue-bg)] hover:pl-3"
                        >
                          {item.label}
                          <span className="ue-mono shrink-0 text-[11px] text-[var(--ue-ink-3)]">
                            {item.meta}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* A real GET form — searching works with scripting off */}
        <form
          action={`${BASE}/equipment`}
          className="hidden h-11 max-w-[17.5rem] items-center border-2 border-[var(--ue-ink)] bg-white pl-3 xl:flex"
        >
          <Search aria-hidden className="size-[15px] shrink-0 text-[var(--ue-ink-2)]" />
          <input
            type="search"
            name="q"
            placeholder="SEARCH THE YARD"
            aria-label="Search the yard"
            className="ue-mono w-[10.5rem] bg-transparent px-2.5 text-[12px] outline-none placeholder:text-[var(--ue-ink-3)]"
          />
        </form>

        <QuoteButton />

        {/* Native disclosure — the mobile menu costs no JavaScript either */}
        <details className="static lg:hidden">
          <summary
            aria-label="Menu"
            className="flex size-12 cursor-pointer list-none flex-col items-center justify-center gap-[5px] border-2 border-[var(--ue-ink)] [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden className="block h-0.5 w-[18px] bg-[var(--ue-ink)]" />
            <span aria-hidden className="block h-0.5 w-[18px] bg-[var(--ue-ink)]" />
            <span aria-hidden className="block h-0.5 w-[18px] bg-[var(--ue-ink)]" />
          </summary>
          <div className="ue-on-dark ue-menu-in absolute inset-x-0 top-full z-50 border-b-4 border-[var(--ue-yellow)] bg-[var(--ue-navy)] px-4 pt-4 pb-7 sm:px-[5.5vw]">
            {NAV.map((section) => (
              <Link
                key={section.label}
                href={section.href}
                className="ue-display block border-b border-white/15 py-4 text-[22px] text-[var(--ue-on-navy)]"
              >
                {section.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}

export function UsaFooter() {
  const columns = [
    {
      title: "Rent",
      links: [
        { label: "Rental fleet", href: `${BASE}/equipment` },
        { label: "In yard now", href: `${BASE}/equipment?status=in-yard` },
        { label: "Rental terms", href: `${BASE}/equipment/LT-2214#terms` },
        { label: "Request a quote", href: `${BASE}/quote` },
      ],
    },
    {
      title: "Buy",
      links: [
        { label: "New equipment", href: `${BASE}/equipment` },
        { label: "Generators", href: `${BASE}/equipment?category=Generators` },
        { label: "Compaction", href: `${BASE}/equipment?category=Compaction` },
        { label: "Factory brands", href: `${BASE}#brands` },
      ],
    },
  ];

  return (
    <footer className="ue-on-dark mt-auto bg-[var(--ue-navy)] text-[var(--ue-on-navy)]">
      <div aria-hidden className="ue-hazard h-1.5" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(13.75rem,1fr))] gap-9 px-4 pt-10 pb-7 sm:px-[5.5vw] sm:pt-14 xl:px-20">
        <div>
          <div className="mb-4 flex items-center gap-3.5">
            <Mark size={30} notch="var(--ue-navy)" />
            <p className="ue-display text-xl">{YARD.name}</p>
          </div>
          <address className="ue-mono text-[13px] leading-relaxed text-[var(--ue-on-navy-2)] not-italic">
            {YARD.street}
            <br />
            {YARD.city}
          </address>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="ue-mono mb-3.5 text-[11px] text-[var(--ue-yellow)]">{column.title}</p>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[var(--ue-on-navy-2)] transition-colors duration-150 hover:text-[var(--ue-yellow)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="ue-mono mb-3.5 text-[11px] text-[var(--ue-yellow)]">The yard</p>
          <a
            href={`tel:${YARD.phoneDial}`}
            className="ue-mono mb-3 block text-[22px] font-medium tracking-[0.03em] text-[var(--ue-yellow)] hover:text-white"
          >
            {YARD.phone}
          </a>
          <p className="ue-mono text-[13px] leading-relaxed text-[var(--ue-on-navy-2)]">
            Mon–Fri 7–5
            <br />
            Sat 8–12 · Sun closed
            <br />
            Fax {YARD.fax}
          </p>
        </div>
      </div>

      <div className="ue-mono flex flex-wrap justify-between gap-4 border-t border-white/15 px-4 py-5 text-[11px] text-[var(--ue-on-navy-2)] sm:px-[5.5vw] xl:px-20">
        <span>© {YARD.name} · Magnolia, Texas — a portfolio demo, not a real yard</span>
        <span>⚠ Rates and photos shown are placeholder data</span>
      </div>
    </footer>
  );
}
