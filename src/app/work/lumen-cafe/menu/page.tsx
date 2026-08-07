import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { getMenu } from "../api";
import { PageTitle } from "../chrome";
import { BASE, beansImage } from "../data";

export const metadata: Metadata = {
  title: "Menu — Lumen Café",
  description:
    "Espresso, filter and the kitchen at Lumen Café. Prices include tax, and there is no minimum on card.",
};

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <>
      <PageTitle
        index="01"
        label="Menu"
        title="Menu"
        intro="Prices include tax. We take cash, cards and the usual e-wallets, and there is no minimum on card. Ask what is on the grinder — the single origin changes every few weeks."
      />

      {/* Jump links, matching the section order */}
      <nav
        aria-label="Menu sections"
        className="mx-auto mt-10 flex max-w-[90rem] flex-wrap gap-x-8 gap-y-3 px-5 sm:px-10"
      >
        {menu.map((group, index) => (
          <a key={group.id} href={`#${group.id}`} className="lc-link lc-eyebrow">
            0{index + 1} — {group.section}
          </a>
        ))}
      </nav>

      <div className="mx-auto max-w-[90rem] px-5 sm:px-10">
        {menu.map((group, index) => (
          <section
            key={group.id}
            id={group.id}
            className="scroll-mt-32 border-t py-16 first:mt-16 sm:py-24"
            style={{ borderColor: "var(--lc-line)" }}
          >
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              {/* Sticky label column — holds while the items scroll past */}
              <div className="lg:col-span-4">
                <div className="lc-sticky">
                  <p className="lc-eyebrow">
                    0{index + 1} — {group.section}
                  </p>
                  <h2 className="mt-5 text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9]">
                    {group.section}
                  </h2>
                  <p
                    className="mt-6 max-w-xs text-[16px] leading-relaxed"
                    style={{ color: "var(--lc-fg-2)" }}
                  >
                    {group.note}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <Reveal kind="scale">
                  <div
                    className="ken-burns relative aspect-[16/9] overflow-hidden border"
                    style={{ borderColor: "var(--lc-line)" }}
                  >
                    <Image
                      src={group.image}
                      alt={group.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      placeholder="blur"
                      className="object-cover"
                    />
                  </div>
                </Reveal>

                <ul className="mt-12">
                  {group.items.map((item, itemIndex) => (
                    <Reveal
                      as="li"
                      key={item.name}
                      kind="up"
                      stagger={Math.min(itemIndex, 4)}
                      className="lc-row group border-b py-6 last:border-b-0"
                    >
                      <div className="flex items-start gap-6">
                        {item.image && (
                          <span
                            className="relative hidden size-24 shrink-0 overflow-hidden border sm:block"
                            style={{ borderColor: "var(--lc-line)" }}
                          >
                            <Image
                              src={item.image}
                              alt={item.imageAlt ?? ""}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-6">
                            <h3 className="text-[clamp(1.25rem,2.2vw,1.75rem)] leading-tight transition-colors group-hover:text-[var(--lc-accent-text)]">
                              {item.name}
                            </h3>
                            <span className="shrink-0 text-[16px] tabular-nums">
                              ₱{item.price}
                            </span>
                          </div>
                          <p
                            className="mt-2 text-[15px] leading-relaxed"
                            style={{ color: "var(--lc-fg-2)" }}
                          >
                            {item.note}
                          </p>
                          <span
                            aria-hidden
                            className="lc-row-rule mt-4 block h-px"
                            style={{ backgroundColor: "var(--lc-accent)" }}
                          />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* Retail beans */}
        <section className="border-t py-16 sm:py-24" style={{ borderColor: "var(--lc-line)" }}>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="lc-eyebrow">04 — To take home</p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] leading-[0.95]">
                A 250g bag, ground for whatever you brew on
              </h2>
              <p
                className="mt-6 max-w-lg text-[17px] leading-relaxed"
                style={{ color: "var(--lc-fg-2)" }}
              >
                ₱620 for whatever is on the grinder. Tell us the machine, not just
                &ldquo;espresso&rdquo; — a moka pot and a lever want very different things, and
                the difference between them is the difference between a good cup and a wasted
                one. What is on this month is{" "}
                <Link href={`${BASE}/blog/washed-benguet-on-the-grinder`} className="lc-link">
                  written up on the journal
                </Link>
                .
              </p>
            </div>
            <Reveal kind="right" className="lg:col-span-5">
              <div
                className="relative aspect-[4/3] overflow-hidden border"
                style={{ borderColor: "var(--lc-line)" }}
              >
                <Image
                  src={beansImage.image}
                  alt={beansImage.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
