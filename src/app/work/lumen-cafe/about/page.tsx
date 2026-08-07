import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PageTitle, SectionHead } from "../chrome";
import { BASE, gallery, menu, team } from "../data";

export const metadata: Metadata = {
  title: "About — Lumen Café",
  description:
    "How Lumen started, where the beans are roasted, and the three people who run it.",
};

/**
 * Each person is paired with the part of the café they are responsible for
 * rather than a portrait. We have no photographs of the team, and an editorial
 * pairing reads as a deliberate choice where a stock face would read as a lie.
 */
const people = team.map((member, index) => ({
  ...member,
  image: [gallery[4], gallery[2], gallery[0]][index],
  quote: [
    "If the roast is wrong on Tuesday, everything after it is wrong too.",
    "The filter flight was not on the menu. I kept making it anyway.",
    "The croissants are weekends only because I am not doing that on a Tuesday.",
  ][index],
}));

export default function AboutPage() {
  return (
    <>
      <PageTitle
        index="02"
        label="About"
        title="About"
        intro="Twelve seats on Kalayaan Avenue, open since 2021. We roast eight kilometres away and we are not planning to get bigger."
      />

      {/* Story */}
      <section
        id="story"
        className="mx-auto max-w-[90rem] scroll-mt-32 px-5 py-20 sm:px-10 sm:py-28"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lc-sticky">
              <p className="lc-eyebrow">01 — Our story</p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Reveal kind="up">
              <p className="lc-display text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.2]">
                Mariel spent five years roasting for other people before deciding she would
                rather answer for it herself.
              </p>
            </Reveal>
            <div
              className="mt-8 space-y-5 text-[17px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              <Reveal kind="up" stagger={1} as="p">
                Lumen opened in 2021 with twelve seats, one lever machine and a roaster in a
                unit eight kilometres north. That is still the whole operation. There has been
                no second branch and there is not going to be one — the room is the size it is
                because that is the size Mariel can stand behind.
              </Reveal>
              <Reveal kind="up" stagger={2} as="p">
                Most of what we do is unremarkable on purpose. We open at seven because people
                need coffee at seven. The batch brew is free to refill before ten because that
                keeps it moving and therefore keeps it good. The kitchen closes an hour early so
                the machine gets cleaned before midnight.
              </Reveal>
              <Reveal kind="up" stagger={3} as="p">
                If you want the long version, it is mostly on{" "}
                <Link href={`${BASE}/blog`} className="lc-link">
                  the journal
                </Link>
                , written up as it happened.
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Roastery */}
      <section
        id="roastery"
        className="scroll-mt-32 border-y py-20 sm:py-28"
        style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
      >
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-5 sm:px-10 lg:grid-cols-2 lg:gap-16">
          <Reveal kind="scale">
            <div
              className="ken-burns relative aspect-[4/3] overflow-hidden border"
              style={{ borderColor: "var(--lc-line)" }}
            >
              <Image
                src={gallery[4].image}
                alt={gallery[4].alt}
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal kind="right">
            <p className="lc-eyebrow">02 — The roastery</p>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] leading-[0.95]">
              Eight kilometres, every Tuesday
            </h2>
            <p
              className="mt-6 max-w-md text-[17px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              One drum, one person, one morning a week. Roasting on site would mean giving up
              four of the twelve seats, so it happens in a unit up the road instead — close
              enough that what you drink on Wednesday was green on Monday.
            </p>
            <p
              className="mt-4 max-w-md text-[17px] leading-relaxed"
              style={{ color: "var(--lc-fg-2)" }}
            >
              The house blend does not change. The single origin does, every few weeks, and we
              will tell you far more about it than you asked for.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section
        id="team"
        className="mx-auto max-w-[90rem] scroll-mt-32 px-5 py-20 sm:px-10 sm:py-28"
      >
        <SectionHead index="03" label="The team" />

        <div className="space-y-20 sm:space-y-28">
          {people.map((person, index) => (
            <article
              key={person.name}
              className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-16 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Reveal kind={index % 2 === 1 ? "right" : "left"} className="lg:col-span-5">
                <div
                  className="ken-burns relative aspect-[3/4] overflow-hidden border"
                  style={{ borderColor: "var(--lc-line)" }}
                >
                  <Image
                    src={person.image.image}
                    alt={person.image.alt}
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className="lg:col-span-7">
                <p className="lc-eyebrow">{person.role}</p>
                <h3 className="mt-4 text-[clamp(2.5rem,7vw,5rem)] leading-[0.9]">
                  {person.name}
                </h3>
                <blockquote
                  className="lc-display mt-8 border-l-2 pl-6 text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.25]"
                  style={{ borderColor: "var(--lc-accent)" }}
                >
                  {person.quote}
                </blockquote>
                <p
                  className="mt-8 max-w-md text-[16px] leading-relaxed"
                  style={{ color: "var(--lc-fg-2)" }}
                >
                  {person.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Closing link out */}
      <section className="mx-auto max-w-[90rem] px-5 pb-8 sm:px-10">
        <Reveal as="div" kind="up" className="lc-rule" />
        <div className="flex flex-wrap items-baseline justify-between gap-6 py-14">
          <p className="text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
            {menu.length} sections, {menu.reduce((n, s) => n + s.items.length, 0)} things to
            order.
          </p>
          <Link href={`${BASE}/menu`} className="lc-link lc-eyebrow">
            Read the menu
          </Link>
        </div>
      </section>
    </>
  );
}
