import type { ReactNode } from "react";
import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { BASE, address, nav, posts, ticker } from "./data";
import { hoursRows } from "./hours";

/** The accent strip above the header — a café's notice board, always moving. */
export function NoticeBar() {
  return (
    <div
      className="border-b text-white"
      style={{
        // Small uppercase white text, so it needs the deeper tone: white on
        // `--lc-accent` is 4.40:1, under the bar for text this size.
        backgroundColor: "var(--lc-accent-solid)",
        borderColor: "var(--lc-accent-solid)",
      }}
    >
      <Marquee duration={52} className="py-2.5">
        {ticker.map((line) => (
          <span
            key={line}
            className="lc-eyebrow flex items-center gap-5 pr-5 whitespace-nowrap"
            style={{ color: "inherit" }}
          >
            {line}
            <span aria-hidden className="opacity-50">
              ✦
            </span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}

export function LumenFooter() {
  return (
    <footer className="mt-32 border-t" style={{ borderColor: "var(--lc-line)" }}>
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="lc-breathe lc-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9]">
              Lumen
              <br />
              Café
            </p>
            {/* A hairline that keeps travelling under the wordmark */}
            <span aria-hidden className="lc-crawl mt-6 block w-32" />
            <address
              className="mt-8 text-[15px] leading-relaxed not-italic"
              style={{ color: "var(--lc-fg-2)" }}
            >
              {address.street}
              <br />
              {address.area}
              <br />
              {address.postcode}
              <br />
              <a
                href={`tel:${address.phone.replace(/\s/g, "")}`}
                className="lc-link mt-3 inline-block"
              >
                {address.phone}
              </a>
            </address>
          </div>

          <div className="md:col-span-4">
            <p className="lc-eyebrow">Hours</p>
            <dl className="mt-5">
              {hoursRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-b py-3 last:border-b-0"
                  style={{ borderColor: "var(--lc-line)" }}
                >
                  <dt className="text-[15px]" style={{ color: "var(--lc-fg-2)" }}>
                    {row.label}
                  </dt>
                  <dd className="text-[15px] tabular-nums">{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-3">
            <p className="lc-eyebrow">Pages</p>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="lc-link text-[15px]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="lc-eyebrow mt-10">Latest</p>
            <ul className="mt-5 space-y-3">
              {posts.slice(0, 2).map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`${BASE}/blog/${post.slug}`}
                    className="text-[15px] leading-snug transition-colors hover:text-[var(--lc-accent-text)]"
                    style={{ color: "var(--lc-fg-2)" }}
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          className="mt-16 border-t pt-8 text-[13px]"
          style={{ borderColor: "var(--lc-line)", color: "var(--lc-fg-2)" }}
        >
          Lumen Café — a demo site built for a portfolio. Not a real business.
        </p>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------------------------
   Small editorial pieces used across the pages
   -------------------------------------------------------------------------- */

/** Numbered section heading with a rule that draws itself in. */
export function SectionHead({
  index,
  label,
  title,
  action,
}: {
  index: string;
  label: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="lc-eyebrow inline-flex items-baseline gap-2">
          {/* The number drifts; the label it belongs to stays put, so the pair
              reads as one thing breathing rather than two things wobbling */}
          <span className="lc-float inline-block" style={{ color: "var(--lc-accent-text)" }}>
            {index}
          </span>
          — {label}
        </p>
        {action}
      </div>
      <Reveal as="div" kind="up" className="lc-rule lc-sweep mt-4" />
      {title && <h2 className="mt-8 text-[clamp(2rem,5vw,3.75rem)] leading-[0.95]">{title}</h2>}
    </div>
  );
}

/** The page title block every inner page opens with. */
export function PageTitle({
  index,
  label,
  title,
  intro,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="mx-auto max-w-[90rem] px-5 pt-16 sm:px-10 sm:pt-24">
      <p className="lc-eyebrow inline-flex items-baseline gap-2">
        <span className="lc-float inline-block" style={{ color: "var(--lc-accent-text)" }}>
          {index}
        </span>
        — {label}
      </p>
      <h1 className="mt-6 text-[clamp(3rem,11vw,9rem)] leading-[0.85]">{title}</h1>
      {intro && (
        <p
          className="mt-8 max-w-xl text-[17px] leading-relaxed"
          style={{ color: "var(--lc-fg-2)" }}
        >
          {intro}
        </p>
      )}
      <Reveal as="div" kind="up" className="lc-rule lc-sweep mt-12" />
    </header>
  );
}
