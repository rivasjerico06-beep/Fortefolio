import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE, STATUS, UNITS, YARD, getRelated, getUnit, statusLabel } from "../../data";
import { Breadcrumb, PhotoSlot, StatusBadge } from "../../parts";
import { AddToQuote } from "../../quote-ui";

type Params = { params: Promise<{ id: string }> };

/** Every unit prerenders — the fleet is a known list, not a search space. */
export function generateStaticParams() {
  return UNITS.map((unit) => ({ id: unit.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) return {};

  return {
    title: `${unit.name} (${unit.id}) — USA Equipment Co.`,
    description: `${unit.sub}. ${statusLabel(unit)} at the Magnolia yard.`,
  };
}

const DOCS = [
  { title: "Spec sheet", meta: "PDF · 2.1 MB" },
  { title: "Operating manual", meta: "PDF · 12.4 MB" },
  { title: "Rental agreement", meta: "PDF · 0.4 MB" },
];

export default async function UnitPage({ params }: Params) {
  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) notFound();

  const related = await getRelated(unit.id);
  const status = STATUS[unit.status];

  const tab =
    "ue-tab ue-display mr-2 flex h-13 items-center border-2 border-b-0 border-[var(--ue-ink)] px-5 text-[15px] font-bold tracking-[0.02em] normal-case";

  return (
    <div className="px-4 pt-6 pb-14 sm:px-[5.5vw] sm:pt-10 sm:pb-20 xl:px-20">
      <Breadcrumb
        trail={[
          { label: "Home", href: BASE },
          { label: "Equipment", href: `${BASE}/equipment` },
          { label: unit.id },
        ]}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] items-start gap-6 sm:gap-10 lg:gap-14">
        {/* Gallery ------------------------------------------------------- */}
        <div>
          <PhotoSlot
            label={`Photo — ${unit.category}, 3:2`}
            tag={unit.id}
            className="mb-3 aspect-3/2 border-2 border-[var(--ue-ink)]"
          />
          <ul className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <PhotoSlot
                  label={`Thumb ${n}`}
                  className="aspect-square border border-[var(--ue-line)]"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Summary ------------------------------------------------------- */}
        <div>
          <StatusBadge unit={unit} large />

          <h1 className="mt-4 mb-2.5 text-[clamp(1.875rem,3.8vw,2.875rem)]">{unit.name}</h1>
          <p className="mb-1.5 text-[17px] text-[var(--ue-ink-2)]">{unit.sub}</p>
          <p className="ue-mono mb-6 text-[13px] text-[var(--ue-ink-3)]">
            Unit {unit.id} · {unit.category}
          </p>

          <table className="mb-2.5 w-full border-collapse border-2 border-[var(--ue-ink)]">
            <caption className="sr-only">Rental rates for {unit.name}</caption>
            <thead>
              <tr className="bg-[var(--ue-navy)] text-[var(--ue-on-navy)]">
                <th
                  scope="col"
                  className="ue-mono px-3.5 py-2.5 text-left text-[11px] font-medium"
                >
                  Rate
                </th>
                <th
                  scope="col"
                  className="ue-mono px-3.5 py-2.5 text-right text-[11px] font-medium"
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="ue-mono bg-white text-sm normal-case">
              {["Day", "Week", "Month"].map((term, index) => (
                <tr key={term}>
                  <th
                    scope="row"
                    className={`px-3.5 py-3 text-left font-normal text-[var(--ue-ink-2)] uppercase ${
                      index < 2 ? "border-b border-[var(--ue-line)]" : ""
                    }`}
                  >
                    {term}
                  </th>
                  <td
                    className={`px-3.5 py-3 text-right ${
                      index < 2 ? "border-b border-[var(--ue-line)]" : ""
                    }`}
                  >
                    $—
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ue-mono mb-6 text-[11px] text-[var(--ue-ink-3)]">
            ⚠ Placeholder rates — call to confirm
          </p>

          <div className="mb-4 flex flex-wrap gap-2.5">
            <AddToQuote unit={unit} size="lg" className="min-w-[12.5rem] flex-1" />
            <a
              href={`tel:${YARD.phoneDial}`}
              className="flex h-14 items-center border-2 border-[var(--ue-ink)] px-6 text-base font-semibold uppercase transition-colors duration-150 hover:bg-white"
            >
              Call now
            </a>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ue-ink-2)]">
            Pickup at the Magnolia yard during business hours. Delivery available — ask for a
            radius quote when you call.
          </p>
        </div>
      </div>

      {/* Tabs ------------------------------------------------------------ */}
      <div className="ue-tabs mt-10 sm:mt-16">
        <nav
          aria-label="Unit information"
          className="flex flex-wrap border-b-2 border-[var(--ue-ink)]"
        >
          <a href="#specs" className={tab}>
            Specifications
          </a>
          <a href="#docs" className={tab}>
            Documents
          </a>
          <a href="#terms" className={tab}>
            Rental terms
          </a>
        </nav>

        <div className="border-2 border-t-0 border-[var(--ue-ink)] bg-white p-5 sm:p-9">
          <section
            id="specs"
            className="ue-tabpanel ue-tabpanel-default scroll-mt-40"
            aria-label="Specifications"
          >
            <h2 className="sr-only">Specifications</h2>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(17.5rem,1fr))] gap-x-12">
              {[
                { k: "Unit no.", v: unit.id },
                { k: "Category", v: unit.category },
                ...unit.specs,
              ].map((row) => (
                <div
                  key={row.k}
                  className="ue-mono flex justify-between gap-4 border-b border-[var(--ue-line)] py-3 text-sm normal-case"
                >
                  <dt className="text-[var(--ue-ink-2)] uppercase">{row.k}</dt>
                  <dd className="text-right">{row.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="docs" className="ue-tabpanel scroll-mt-40" aria-label="Documents">
            <h2 className="sr-only">Documents</h2>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(16.25rem,1fr))] gap-4">
              {DOCS.map((doc) => (
                <li
                  key={doc.title}
                  className="flex flex-col gap-2 border-2 border-[var(--ue-ink)] bg-[var(--ue-bg)] p-4.5"
                >
                  <span className="ue-mono self-start bg-[var(--ue-ink)] px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-[var(--ue-yellow)]">
                    PDF
                  </span>
                  <span className="ue-display text-lg leading-tight">{doc.title}</span>
                  <span className="ue-mono text-[11px] text-[var(--ue-ink-3)]">{doc.meta}</span>
                </li>
              ))}
            </ul>
            {/* Listed, not linked: the yard has not supplied the files, and a
                link to a PDF that does not exist is worse than none. */}
            <p className="mt-4 text-sm text-[var(--ue-ink-2)]">
              Document downloads are not wired up in this demo — call the yard and we&rsquo;ll
              email the sheet for {unit.id}.
            </p>
          </section>

          <section id="terms" className="ue-tabpanel scroll-mt-40" aria-label="Rental terms">
            <h2 className="sr-only">Rental terms</h2>
            <div className="flex max-w-[62ch] flex-col gap-3.5 text-base leading-relaxed text-[var(--ue-ink-2)]">
              <p>
                <strong className="text-[var(--ue-ink)]">Day rate</strong> covers 8 hours of use
                within 24 hours. Week is 5 days, month is 28 days.
              </p>
              <p>
                <strong className="text-[var(--ue-ink)]">Fuel</strong> goes out full and comes
                back full, or we bill the difference.
              </p>
              <p>
                <strong className="text-[var(--ue-ink)]">Damage waiver</strong> is optional and
                quoted per unit. Bring proof of insurance if you decline it.
              </p>
              <p>
                <strong className="text-[var(--ue-ink)]">No account required.</strong> Valid ID
                and a card on file is enough to rent.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Related --------------------------------------------------------- */}
      <section className="mt-10 sm:mt-16">
        <h2 className="mb-5 text-[clamp(1.5rem,2.8vw,2.125rem)]">Often rented with</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(16.25rem,1fr))] gap-5">
          {related.map((item) => (
            <li key={item.id}>
              <article className="flex h-full items-center gap-4 border-2 border-[var(--ue-ink)] bg-white p-4 transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-[0_4px_0_0_var(--ue-ink)]">
                <PhotoSlot
                  label="Photo"
                  className="size-26 shrink-0 border border-[var(--ue-line)]"
                />
                <div className="min-w-0">
                  <p className="mb-1.5 flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-[7px] shrink-0 rounded-[2px]"
                      style={{ background: STATUS[item.status].color }}
                    />
                    <span
                      className="ue-mono text-[10px] font-medium"
                      style={{ color: STATUS[item.status].color }}
                    >
                      {statusLabel(item)}
                    </span>
                  </p>
                  <Link
                    href={`${BASE}/equipment/${item.id}`}
                    className="ue-display block text-base leading-tight hover:text-[var(--ue-navy)]"
                  >
                    {item.name}
                  </Link>
                  <AddToQuote unit={item} size="sm" className="mt-2.5" />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <p className="ue-mono mt-10 text-[11px] text-[var(--ue-ink-3)]">
        Status shown: {statusLabel(unit)} · {status.note}
      </p>
    </div>
  );
}
