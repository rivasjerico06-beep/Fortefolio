import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WpBreadcrumbs, WpLayout } from "@/components/wp/wp-chrome";
import { BASE, beansImage, menu } from "../data";
import { LumenHeader, LumenSidebar, PageHeading, SteamMark } from "../parts";
import { FeaturedImage, MenuSectionBlock, NoticeBar, PhotoStrip } from "./menu-parts";

export const metadata: Metadata = {
  title: "Menu — Lumen Café",
  description: "Espresso, filter coffee and the kitchen menu at Lumen Café.",
};

export default function MenuPage() {
  return (
    <>
      <LumenHeader active={`${BASE}/menu`} />
      <WpBreadcrumbs trail={[{ label: "Home", href: BASE }, { label: "Menu" }]} />

      <FeaturedImage />
      <NoticeBar />

      <WpLayout sidebar={<LumenSidebar />}>
        <article className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8">
          <PageHeading
            title="Menu"
            intro="Prices include tax. We take cash, cards and the usual e-wallets, and there is no minimum on card."
            mark={<SteamMark />}
          />

          {/* In-page jump links, matching the header's Menu dropdown */}
          <nav aria-label="Menu sections" className="mt-6 flex flex-wrap gap-2">
            {menu.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="border border-[var(--wp-line)] px-3.5 py-2 text-[12.5px] font-semibold tracking-wide uppercase hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]"
              >
                {group.section}
              </a>
            ))}
          </nav>

          <div className="mt-8 space-y-12">
            {menu.map((group) => (
              <MenuSectionBlock key={group.id} group={group} />
            ))}
          </div>

          {/* The classic wrapped image a theme calls "alignright" */}
          <div className="mt-10 border-t border-[var(--wp-line)] pt-6">
            <h2 className="text-lg font-bold">Beans to take home</h2>
            <Image
              src={beansImage.image}
              alt={beansImage.alt}
              sizes="(min-width: 640px) 220px, 100vw"
              className="mt-3 w-full border border-[var(--wp-line)] sm:float-right sm:mt-1 sm:ml-5 sm:w-[220px]"
            />
            <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
              A 250g bag of whatever is on the grinder is ₱620, and we will grind it for
              whatever you brew on — tell us the machine, not just &ldquo;espresso&rdquo;. A
              moka pot and a lever want very different things, and the difference between them
              is the difference between a good cup and a wasted one.
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
              What is on this month is{" "}
              <Link
                href={`${BASE}/blog/washed-benguet-on-the-grinder`}
                className="font-semibold text-[var(--wp-accent)] hover:underline"
              >
                written up on the blog
              </Link>
              , tasting notes and brew recipes included.
            </p>
            <div className="clear-both" />
          </div>
        </article>

        <PhotoStrip />
      </WpLayout>
    </>
  );
}
