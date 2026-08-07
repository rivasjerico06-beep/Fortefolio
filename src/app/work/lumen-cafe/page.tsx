import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedStrip } from "@/components/motion/pinned-strip";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { getMenu, listPosts } from "./api";
import { SectionHead } from "./chrome";
import { BASE, address, gallery, menuHero } from "./data";
import { hoursRows } from "./hours";
import { OpenIndicator } from "./nav";

export const metadata: Metadata = {
  title: "Lumen Café — twelve seats in Poblacion",
  description:
    "A twelve-seat specialty coffee bar on Kalayaan Avenue. Open from seven, beans roasted eight kilometres away.",
};

export default async function LumenHome() {
  const [menu, posts] = await Promise.all([getMenu(), listPosts()]);

  // The strip shows what the bar is known for, drawn from the real menu
  const signatures = [
    ...menu[0].items.slice(0, 3),
    ...menu[1].items.slice(1, 4),
    ...menu[2].items.slice(0, 2),
  ];

  return (
    <>
      {/* 01 — Hero ------------------------------------------------------- */}
      <section className="relative flex min-h-[calc(100svh-6rem)] flex-col justify-end overflow-hidden">
        <div className="ken-burns absolute inset-0">
          <Image
            src={menuHero.image}
            alt={menuHero.alt}
            fill
            preload
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--lc-bg) 2%, color-mix(in srgb, var(--lc-bg) 35%, transparent) 38%, transparent 78%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-14 sm:px-10 sm:pb-20">
          <h1 className="text-[clamp(3.5rem,15vw,13rem)] leading-[0.82] tracking-[-0.02em]">
            <WordRise text="Lumen Café" as="span" />
          </h1>

          <div
            className="mt-10 flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--lc-line-strong)" }}
          >
            <OpenIndicator />
            <p className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
              {address.street} · {address.area}
            </p>
          </div>
        </div>

        {/* Looping scroll cue */}
        <div
          aria-hidden
          className="lc-cue absolute right-5 bottom-6 hidden h-14 w-px sm:right-10 sm:block"
          style={{ color: "var(--lc-fg-2)" }}
        >
          <span />
        </div>
      </section>

      {/* 02 — Statement --------------------------------------------------- */}
      <section className="relative overflow-hidden py-28 sm:py-40">
        <div
          aria-hidden
          className="lc-wash pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--lc-accent) 22%, transparent), transparent)",
          }}
        />
        <div className="mx-auto max-w-[62rem] px-5 text-center sm:px-10">
          <Reveal kind="up">
            <p className="lc-display text-[clamp(1.75rem,4.2vw,3.25rem)] leading-[1.15]">
              Twelve seats, one espresso machine, and beans we roast eight kilometres from here.
              The batch brew is free to refill before ten, and the tables at the back have the
              plug sockets.
            </p>
          </Reveal>
          <Reveal kind="up" stagger={2}>
            <p
              className="mx-auto mt-8 max-w-md text-[16px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              Ask what is on the grinder. The single origin changes every few weeks and we are
              usually far too keen to talk about it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 03 — Signatures, pinned horizontal ------------------------------- */}
      <section>
        <div className="mx-auto max-w-[90rem] px-5 sm:px-10">
          <SectionHead
            index="03"
            label="On the bar"
            action={
              <Link href={`${BASE}/menu`} className="lc-link lc-eyebrow">
                The full menu
              </Link>
            }
          />
        </div>

        <PinnedStrip scene="lumen-signatures">
          <div className="flex w-[74vw] shrink-0 flex-col justify-center sm:w-[34vw]">
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] leading-[0.95]">
              What people come back for
            </h2>
            <p
              className="mt-5 max-w-xs text-[15px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              Keep scrolling — these move sideways. Prices include tax, and there is no minimum
              on card.
            </p>
          </div>

          {signatures.map((item) => (
            <article
              key={item.name}
              className="lc-row group flex w-[68vw] shrink-0 flex-col sm:w-[26vw] lg:w-[21vw]"
            >
              <div
                className="relative aspect-[4/5] overflow-hidden border"
                style={{ borderColor: "var(--lc-line)" }}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 640px) 26vw, 68vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="lc-display grid size-full place-items-center text-6xl"
                    style={{
                      backgroundColor: "var(--lc-surface)",
                      color: "var(--lc-line-strong)",
                    }}
                  >
                    {item.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-[1.35rem] leading-tight">{item.name}</h3>
                <span className="text-[15px] tabular-nums">₱{item.price}</span>
              </div>
              <p className="mt-1 text-[14px]" style={{ color: "var(--lc-fg-2)" }}>
                {item.note}
              </p>
              <span
                aria-hidden
                className="lc-row-rule mt-4 block h-px"
                style={{ backgroundColor: "var(--lc-accent)" }}
              />
            </article>
          ))}

          <div aria-hidden className="w-[10vw] shrink-0" />
        </PinnedStrip>
      </section>

      {/* 04 — The numbers -------------------------------------------------- */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-10 sm:py-32">
        <SectionHead index="04" label="The size of it" />
        <dl className="grid gap-12 sm:grid-cols-3">
          {[
            { value: "12", label: "Seats", note: "First come, first served. No bookings." },
            {
              value: "8km",
              label: "To the roastery",
              note: "Roasted every Tuesday by Mariel.",
            },
            { value: "2021", label: "Opened", note: "Same twelve seats ever since." },
          ].map((stat, index) => (
            <Reveal key={stat.label} kind="up" stagger={index} as="div">
              <dt
                className="lc-display text-[clamp(4rem,9vw,7.5rem)] leading-[0.85]"
                style={{ color: "var(--lc-accent)" }}
              >
                {stat.value}
              </dt>
              <dd className="mt-4">
                <span className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
                  {stat.label}
                </span>
                <span
                  className="mt-2 block text-[15px] leading-relaxed"
                  style={{ color: "var(--lc-fg-2)" }}
                >
                  {stat.note}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* 05 — On the grinder ----------------------------------------------- */}
      <section
        className="border-y py-20 sm:py-28"
        style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
      >
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-5 sm:px-10 lg:grid-cols-2">
          <Reveal kind="left">
            <p className="lc-eyebrow">05 — On the grinder</p>
            <h2 className="mt-6 text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.95]">
              A washed Benguet, until it runs out
            </h2>
            <p
              className="mt-6 max-w-md text-[17px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              Bright without being sharp. Something floral in the first sip and dried apricot
              underneath it — and it takes milk far better than last month&rsquo;s Ethiopian
              did.
            </p>
            <Link
              href={`${BASE}/blog/washed-benguet-on-the-grinder`}
              className="lc-eyebrow group mt-8 inline-flex items-center gap-2"
              style={{ color: "var(--lc-accent-text)" }}
            >
              Read the write-up
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>

          <Reveal kind="scale">
            <div
              className="ken-burns relative aspect-[5/4] overflow-hidden border"
              style={{ borderColor: "var(--lc-line)" }}
            >
              <Image
                src={gallery[4].image}
                alt={gallery[4].alt}
                fill
                sizes="(min-width: 1024px) 44vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 06 — Journal ------------------------------------------------------- */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 sm:px-10 sm:py-32">
        <SectionHead
          index="06"
          label="Journal"
          action={
            <Link href={`${BASE}/blog`} className="lc-link lc-eyebrow">
              Everything we have written
            </Link>
          }
        />

        <div className="grid gap-x-10 gap-y-14 md:grid-cols-2">
          {posts.slice(0, 2).map((post, index) => (
            <Reveal key={post.slug} kind="up" stagger={index} as="article">
              <Link href={`${BASE}/blog/${post.slug}`} className="lc-row group block">
                <div
                  className="relative aspect-[16/10] overflow-hidden border"
                  style={{ borderColor: "var(--lc-line)" }}
                >
                  <Image
                    src={gallery[index].image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 44vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="lc-eyebrow mt-6">
                  {post.date} · {post.category}
                </p>
                <h3 className="mt-3 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] transition-colors group-hover:text-[var(--lc-accent-text)]">
                  {post.title}
                </h3>
                <p
                  className="mt-4 max-w-md text-[15px] leading-relaxed"
                  style={{ color: "var(--lc-fg-2)" }}
                >
                  {post.excerpt}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 07 — Closing -------------------------------------------------------- */}
      <section className="mx-auto max-w-[90rem] px-5 sm:px-10">
        <Reveal as="div" kind="up" className="lc-rule" />
        <div className="grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9]">Come and sit down</h2>
          <div>
            <dl>
              {hoursRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-b py-3.5"
                  style={{ borderColor: "var(--lc-line)" }}
                >
                  <dt className="text-[15px]" style={{ color: "var(--lc-fg-2)" }}>
                    {row.label}
                  </dt>
                  <dd className="text-[15px] tabular-nums">{row.time}</dd>
                </div>
              ))}
            </dl>
            <Link
              href={`${BASE}/visit`}
              className="group mt-10 inline-flex items-center gap-3 px-8 py-4 text-white"
              style={{ backgroundColor: "var(--lc-accent)" }}
            >
              <span className="lc-eyebrow" style={{ color: "inherit" }}>
                Plan your visit
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
