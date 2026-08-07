import Image from "next/image";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { BASE, gallery, menuHero, ticker, type MenuItem, type MenuSection } from "../data";

/** The content column inside WpLayout, used to size the responsive images. */
const CONTENT_SIZES = "(min-width: 1024px) 784px, 100vw";

/**
 * The theme's featured-image slot. The photograph pans slowly behind a scrim,
 * with the caption plate and the "on the grinder" stamp sitting over it.
 *
 * `preload` because this is the page's largest contentful paint; every other
 * image on the page is left to lazy-load as it comes into view.
 */
export function FeaturedImage() {
  return (
    <figure className="relative border-b border-[var(--wp-line)]">
      <div className="ken-burns relative h-52 overflow-hidden sm:h-72 lg:h-80">
        <Image
          src={menuHero.image}
          alt={menuHero.alt}
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
        />
      </div>

      {/* Caption and stamp share the strip, so neither can cover the other */}
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
        <span className="max-w-md text-[12.5px] text-white/85 italic">{menuHero.caption}</span>
        <GrinderStamp />
      </figcaption>
    </figure>
  );
}

/**
 * A circular stamp whose ring of text turns once every thirty seconds. The
 * ring is drawn on a path and stretched to the exact circumference with
 * `textLength`, so it fits no matter which system font renders it.
 */
function GrinderStamp() {
  return (
    <Link
      href={`${BASE}/blog/washed-benguet-on-the-grinder`}
      className="relative grid size-20 shrink-0 place-items-center rounded-full bg-[var(--wp-accent)] text-[var(--wp-accent-ink)] shadow-lg transition-transform hover:scale-105 sm:size-25"
    >
      <span className="sr-only">
        On the grinder now: a washed Benguet. Read the post about it.
      </span>

      <span aria-hidden className="stamp-turn absolute inset-0">
        <svg viewBox="0 0 100 100" className="size-full">
          <defs>
            <path
              id="lumen-stamp-ring"
              fill="none"
              d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>
          <text fill="currentColor" fontSize="9" fontWeight="700">
            <textPath href="#lumen-stamp-ring" textLength="232" lengthAdjust="spacingAndGlyphs">
              ON THE GRINDER · WASHED BENGUET ·
            </textPath>
          </text>
        </svg>
      </span>

      <Coffee aria-hidden className="size-6 sm:size-7" strokeWidth={1.6} />
    </Link>
  );
}

/**
 * The scrolling notice bar. A café would run this as a plugin; here it is the
 * shared `Marquee`, which duplicates its children for a seamless loop, hides
 * the duplicate from screen readers, and pauses on hover.
 */
export function NoticeBar() {
  return (
    <div className="border-b border-[var(--wp-line)] bg-[var(--wp-accent)] text-[var(--wp-accent-ink)]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5">
        <span className="hidden shrink-0 items-center gap-2 py-2.5 text-[11.5px] font-bold tracking-[0.12em] uppercase sm:flex">
          <span aria-hidden className="soft-pulse block size-2 rounded-full bg-current" />
          Open now
        </span>
        <Marquee duration={46} className="min-w-0 flex-1 py-2.5">
          {ticker.map((line) => (
            <span
              key={line}
              className="flex items-center gap-4 pr-4 text-[13px] whitespace-nowrap"
            >
              {line}
              <span aria-hidden className="opacity-55">
                ✦
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}

/** One menu section: a banner with the heading over it, then the item rows. */
export function MenuSectionBlock({ group }: { group: MenuSection }) {
  return (
    <section id={group.id} className="scroll-mt-32">
      <Reveal kind="scale">
        {/* Taller on phones, where the section note needs two or three lines */}
        <div className="ken-burns relative aspect-[5/3] overflow-hidden border border-[var(--wp-line)] sm:aspect-[16/7]">
          <Image
            src={group.image}
            alt={group.imageAlt}
            fill
            sizes={CONTENT_SIZES}
            placeholder="blur"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h2
              className="text-2xl font-bold text-white sm:text-3xl"
              style={{ fontFamily: "var(--wp-heading-font)" }}
            >
              {group.section}
            </h2>
            <p className="mt-1 text-[13px] text-white/80 italic">{group.note}</p>
          </div>
        </div>
      </Reveal>

      <ul className="mt-4">
        {group.items.map((item, index) => (
          <MenuRow key={item.name} item={item} index={index} />
        ))}
      </ul>
    </section>
  );
}

/**
 * A single row. Every row keeps the same thumbnail column so the names line up
 * — items we have no photograph of get the monogram tile a theme falls back to
 * when a post has no featured image.
 */
function MenuRow({ item, index }: { item: MenuItem; index: number }) {
  return (
    <Reveal
      as="li"
      kind="up"
      stagger={Math.min(index, 5)}
      className="menu-row flex items-center gap-4 border-b border-dashed border-[var(--wp-line)] py-3.5 last:border-b-0"
    >
      <span className="relative block size-16 shrink-0 overflow-hidden border border-[var(--wp-line)]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt ?? ""}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-full place-items-center bg-[var(--wp-surface-alt)] text-xl font-bold text-[var(--wp-line)]"
            style={{ fontFamily: "var(--wp-heading-font)" }}
          >
            {item.name.charAt(0)}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-medium">{item.name}</span>
          <span aria-hidden className="dot-leader hidden sm:block" />
          {/* Below sm there is no dot leader to push it, so it pushes itself */}
          <span className="ml-auto text-[14px] tabular-nums sm:ml-0">{item.price}</span>
        </span>
        <span className="mt-0.5 block text-[12.5px] text-[var(--wp-ink-2)]">{item.note}</span>
      </span>
    </Reveal>
  );
}

/** The gallery block at the foot of the page — a strip that never stops. */
export function PhotoStrip() {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--wp-accent)] pb-2">
        <h2 className="text-2xl font-bold">In the Room</h2>
        <span className="text-[12px] tracking-wide text-[var(--wp-ink-2)] uppercase">
          Gallery
        </span>
      </div>

      <Marquee
        duration={55}
        className="mt-5 border border-[var(--wp-line)] bg-[var(--wp-surface)] p-3"
      >
        {gallery.map((shot) => (
          <figure
            key={shot.alt}
            className="relative mr-3 h-[140px] w-[200px] shrink-0 overflow-hidden border border-[var(--wp-line)] sm:h-[170px] sm:w-[240px]"
          >
            <Image
              src={shot.image}
              alt={shot.alt}
              fill
              sizes="240px"
              className="object-cover"
            />
          </figure>
        ))}
      </Marquee>

      <p className="mt-2 text-[12px] text-[var(--wp-ink-2)]">Hover to hold the strip still.</p>
    </section>
  );
}
