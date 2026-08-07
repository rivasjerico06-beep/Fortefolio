import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { WpBreadcrumbs, WpLayout, PostMeta } from "@/components/wp/wp-chrome";
import { BASE, homeHero, hours, menu, posts } from "./data";
import { LumenHeader, LumenSidebar, OpenTodayStrip } from "./parts";

export const metadata: Metadata = {
  title: "Lumen Café — demo site",
  description:
    "A classic WordPress business-theme layout: content column, widget sidebar, footer widgets.",
};

export default function LumenHome() {
  const featured = menu[0];

  return (
    <>
      <LumenHeader active={BASE} />
      <WpBreadcrumbs trail={[{ label: "Home" }]} />

      {/* Full-width header image area — the theme's "featured image" slot */}
      <div className="ken-burns relative h-40 overflow-hidden border-b border-[var(--wp-line)] sm:h-56">
        <Image
          src={homeHero.image}
          alt={homeHero.alt}
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="object-cover"
        />
      </div>

      <WpLayout sidebar={<LumenSidebar />}>
        <article className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Welcome to Lumen</h1>
          <PostMeta
            date="1 March 2026"
            author="Lumen"
            category="About"
            categoryHref={`${BASE}/about`}
          />

          <div className="wp-prose mt-6">
            <p>
              Twelve seats, one espresso machine, and beans we roast eight kilometres from here.
              We open at seven every morning and the batch brew is free to refill before ten.
            </p>
            <p>
              The kitchen closes an hour before we do, and the last coffee goes out fifteen
              minutes before close. If you are coming for a laptop afternoon, the tables at the
              back have the plug sockets.
            </p>
            <blockquote>
              Ask what is on the grinder — the single origin changes every few weeks and we are
              usually far too keen to talk about it.
            </blockquote>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--wp-line)] pt-6">
            <OpenTodayStrip />
            <Link
              href={`${BASE}/visit`}
              className="ml-auto inline-flex items-center gap-1.5 bg-[var(--wp-accent)] px-4 py-2.5 text-[13px] font-semibold text-[var(--wp-accent-ink)]"
            >
              <MapPin className="size-4" aria-hidden />
              Plan your visit
            </Link>
          </div>
        </article>

        {/* A taste of the menu, with the full thing one click away */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--wp-accent)] pb-2">
            <h2 className="text-2xl font-bold">On the Bar</h2>
            <Link
              href={`${BASE}/menu`}
              className="text-[13px] font-semibold text-[var(--wp-accent)] hover:underline"
            >
              See the full menu →
            </Link>
          </div>

          <ul className="mt-5 border border-[var(--wp-line)] bg-[var(--wp-surface)] px-6 py-2">
            {featured.items.map((item) => (
              <li
                key={item.name}
                className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--wp-line)] py-3 last:border-b-0"
              >
                <span>
                  <span className="text-[15px] font-medium">{item.name}</span>
                  <span className="block text-[12.5px] text-[var(--wp-ink-2)]">
                    {item.note}
                  </span>
                </span>
                <span className="shrink-0 text-[14px] tabular-nums">{item.price}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Blog roll */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--wp-accent)] pb-2">
            <h2 className="text-2xl font-bold">From the Blog</h2>
            <Link
              href={`${BASE}/blog`}
              className="text-[13px] font-semibold text-[var(--wp-accent)] hover:underline"
            >
              All posts →
            </Link>
          </div>

          <div className="mt-6 space-y-6">
            {posts.slice(0, 2).map((post) => (
              <article
                key={post.slug}
                className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6"
              >
                <h3 className="text-xl font-bold">
                  <Link
                    href={`${BASE}/blog/${post.slug}`}
                    className="hover:text-[var(--wp-accent)]"
                  >
                    {post.title}
                  </Link>
                </h3>
                <PostMeta
                  date={post.date}
                  author="Lumen"
                  category={post.category}
                  categoryHref={`${BASE}/blog`}
                  comments={post.comments.length}
                  commentsHref={`${BASE}/blog/${post.slug}#respond`}
                />
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
                  {post.excerpt}
                </p>
                <Link
                  href={`${BASE}/blog/${post.slug}`}
                  className="mt-4 inline-block border border-[var(--wp-line)] px-4 py-2 text-[12.5px] font-semibold tracking-wide uppercase hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]"
                >
                  Continue reading
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Hours, repeated in the content column the way a theme's page would */}
        <section className="mt-10">
          <h2 className="border-b-2 border-[var(--wp-accent)] pb-2 text-2xl font-bold">
            Hours
          </h2>
          <dl className="mt-5 border border-[var(--wp-line)] bg-[var(--wp-surface)] px-6 py-2">
            {hours.map((entry) => (
              <div
                key={entry.day}
                className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--wp-line)] py-3 last:border-b-0"
              >
                <dt>{entry.day}</dt>
                <dd className="text-[14px] tabular-nums">{entry.time}</dd>
              </div>
            ))}
          </dl>
        </section>
      </WpLayout>
    </>
  );
}
