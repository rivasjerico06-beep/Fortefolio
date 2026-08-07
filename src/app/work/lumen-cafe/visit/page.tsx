import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { WpBreadcrumbs, WpLayout } from "@/components/wp/wp-chrome";
import { BASE, address, hours } from "../data";
import { LumenHeader, LumenSidebar, MapPlaceholder, PageHeading } from "../parts";

export const metadata: Metadata = {
  title: "Visit — Lumen Café",
  description: "Where to find Lumen Café, opening hours, parking, and how to get in touch.",
};

const gettingHere = [
  "Two minutes on foot from the Kalayaan jeepney stop, heading away from the main road.",
  "There is no parking directly out front. The lot behind the building is free after 18:00.",
  "The entrance is a single step up. Ask and we will happily bring your order out to you.",
];

export default function VisitPage() {
  return (
    <>
      <LumenHeader active={`${BASE}/visit`} />
      <WpBreadcrumbs trail={[{ label: "Home", href: BASE }, { label: "Visit" }]} />

      <WpLayout sidebar={<LumenSidebar />}>
        <article className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8">
          <PageHeading
            title="Visit"
            intro="We are on Kalayaan Avenue, open from seven every day. No bookings — the twelve seats are first come, first served."
          />

          <MapPlaceholder className="mt-6 h-52 sm:h-64" />

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section>
              <h2 className="text-lg font-bold">Address</h2>
              <address className="mt-2 space-y-1 text-[14.5px] text-[var(--wp-ink-2)] not-italic">
                <p className="flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-[var(--wp-accent)]"
                    aria-hidden
                  />
                  <span>
                    {address.street}
                    <br />
                    {address.area}
                    <br />
                    {address.postcode}
                  </span>
                </p>
                <p className="flex items-center gap-2 pt-1">
                  <Phone className="size-4 shrink-0 text-[var(--wp-accent)]" aria-hidden />
                  <a
                    href={`tel:${address.phone.replace(/\s/g, "")}`}
                    className="hover:text-[var(--wp-accent)] hover:underline"
                  >
                    {address.phone}
                  </a>
                </p>
              </address>
              <a
                href="https://maps.google.com"
                className="mt-4 inline-flex items-center gap-1.5 bg-[var(--wp-accent)] px-4 py-2.5 text-[13px] font-semibold text-[var(--wp-accent-ink)]"
              >
                <MapPin className="size-4" aria-hidden />
                Open in Maps
              </a>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Clock className="size-4 text-[var(--wp-accent)]" aria-hidden />
                Opening hours
              </h2>
              <dl className="mt-2">
                {hours.map((entry) => (
                  <div
                    key={entry.day}
                    className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--wp-line)] py-2 last:border-b-0"
                  >
                    <dt className="text-[14px] text-[var(--wp-ink-2)]">{entry.day}</dt>
                    <dd className="text-[14px] tabular-nums">{entry.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12.5px] text-[var(--wp-ink-2)]">
                The kitchen closes an hour before we do, and the last coffee goes out fifteen
                minutes before close.
              </p>
            </section>
          </div>

          <section className="mt-8 border-t border-[var(--wp-line)] pt-6">
            <h2 className="text-lg font-bold">Getting here</h2>
            <div className="wp-prose mt-3">
              <ul>
                {gettingHere.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Enquiry form — labelled properly, but inert: this is a demo */}
          <section className="mt-8 border-t border-[var(--wp-line)] pt-6">
            <h2 className="text-lg font-bold">Ask us something</h2>
            <p className="mt-1 text-[12.5px] text-[var(--wp-ink-2)]">
              For large orders, private hire, or anything the page has not answered. Fields
              marked <span aria-hidden>*</span> are required.
            </p>

            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="visit-name" className="block text-[13px] font-medium">
                    Name <span aria-hidden>*</span>
                  </label>
                  <input
                    id="visit-name"
                    type="text"
                    autoComplete="name"
                    className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
                  />
                </div>
                <div>
                  <label htmlFor="visit-email" className="block text-[13px] font-medium">
                    Email <span aria-hidden>*</span>
                  </label>
                  <input
                    id="visit-email"
                    type="email"
                    autoComplete="email"
                    className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="visit-subject" className="block text-[13px] font-medium">
                  What is it about?
                </label>
                <select
                  id="visit-subject"
                  defaultValue="General"
                  className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
                >
                  <option>General</option>
                  <option>Large order</option>
                  <option>Private hire</option>
                  <option>Working here</option>
                </select>
              </div>
              <div>
                <label htmlFor="visit-message" className="block text-[13px] font-medium">
                  Message <span aria-hidden>*</span>
                </label>
                <textarea
                  id="visit-message"
                  rows={4}
                  className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
                />
              </div>
              <button
                type="button"
                className="bg-[var(--wp-accent)] px-5 py-2.5 text-[13px] font-bold tracking-wide text-[var(--wp-accent-ink)] uppercase"
              >
                Send enquiry
              </button>
              <p className="text-[12px] text-[var(--wp-ink-2)]">
                This is a portfolio demo, so the form does not send anywhere. On a real build it
                would post to the site&rsquo;s inbox.
              </p>
            </div>
          </section>

          <div className="mt-8 border-t border-[var(--wp-line)] pt-6">
            <p className="text-[14.5px] text-[var(--wp-ink-2)]">
              Wondering what to order?{" "}
              <Link
                href={`${BASE}/menu`}
                className="font-semibold text-[var(--wp-accent)] hover:underline"
              >
                Have a look at the menu
              </Link>
              .
            </p>
          </div>
        </article>
      </WpLayout>
    </>
  );
}
