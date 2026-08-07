import type { ReactNode } from "react";
import { Clock, Coffee, MapPin, Phone } from "lucide-react";
import {
  LinkListWidget,
  SearchWidget,
  TagCloudWidget,
  Widget,
  WpHeader,
} from "@/components/wp/wp-chrome";
import { BASE, address, allTags, categories, hours, nav, posts, type Block } from "./data";

/** The site header, with the active nav item marked per page. */
export function LumenHeader({ active }: { active: string }) {
  return (
    <WpHeader
      title="Lumen Café"
      titleHref={BASE}
      tagline="Coffee worth the walk · Poblacion, Makati"
      nav={nav}
      active={active}
      cta={
        <a
          href={`tel:${address.phone.replace(/\s/g, "")}`}
          className="ml-2 inline-flex items-center gap-1.5 bg-[var(--wp-accent)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--wp-accent-ink)]"
        >
          <Phone className="size-3.5" aria-hidden />
          Call
        </a>
      }
    />
  );
}

/** The widget column, shared by every page that has a sidebar. */
export function LumenSidebar() {
  return (
    <>
      <SearchWidget />

      <Widget title="Opening Hours">
        <dl className="wp-linklist">
          {hours.map((entry) => (
            <div key={entry.day} className="flex justify-between gap-3 py-[0.45rem]">
              <dt>{entry.day}</dt>
              <dd className="text-[var(--wp-ink)] tabular-nums">{entry.time}</dd>
            </div>
          ))}
        </dl>
      </Widget>

      <Widget title="Find Us">
        <address className="space-y-1 not-italic">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--wp-accent)]" aria-hidden />
            <span>
              {address.street}
              <br />
              {address.area} {address.postcode.replace("Metro Manila ", "")}
            </span>
          </p>
          <p className="flex items-center gap-2 pt-1">
            <Phone className="size-4 shrink-0 text-[var(--wp-accent)]" aria-hidden />
            <a href={`tel:${address.phone.replace(/\s/g, "")}`} className="hover:underline">
              {address.phone}
            </a>
          </p>
        </address>
        <MapPlaceholder className="mt-3 h-28" />
        <a
          href={`${BASE}/visit`}
          className="mt-3 inline-block text-[13px] font-semibold text-[var(--wp-accent)] hover:underline"
        >
          Directions and parking →
        </a>
      </Widget>

      <LinkListWidget
        title="Recent Posts"
        items={posts.slice(0, 4).map((post) => ({
          label: post.title,
          href: `${BASE}/blog/${post.slug}`,
        }))}
      />

      <LinkListWidget title="Categories" items={categories} />

      <TagCloudWidget tags={allTags} />
    </>
  );
}

/** Decorative map stand-in — no third-party embed, so no extra requests. */
export function MapPlaceholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`border border-[var(--wp-line)] ${className ?? ""}`}
      style={{
        backgroundColor: "#e6dbc9",
        backgroundImage:
          "linear-gradient(#d9cbb4 1px, transparent 1px), linear-gradient(90deg, #d9cbb4 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}

/** The page title bar every inner page opens with. */
export function PageHeading({
  title,
  intro,
  /** Optional flourish shown beside the title, e.g. the steaming cup. */
  mark,
}: {
  title: string;
  intro?: string;
  mark?: ReactNode;
}) {
  return (
    <header className="border-b-2 border-[var(--wp-accent)] pb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {mark}
      </div>
      {intro && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--wp-ink-2)]">
          {intro}
        </p>
      )}
    </header>
  );
}

/**
 * A cup with three wisps of steam rising off it, forever. Decoration only —
 * the wisps sit at opacity 0 until the animation lifts them, so with motion
 * switched off this is just a small cup icon.
 */
export function SteamMark() {
  return (
    <span aria-hidden className="relative inline-block shrink-0 text-[var(--wp-accent)]">
      <span className="steam absolute inset-x-0 -top-1 flex justify-center gap-[3px]">
        <span className="block h-2.5 w-[3px] rounded-full bg-current blur-[1.5px]" />
        <span className="block h-3 w-[3px] rounded-full bg-current blur-[1.5px]" />
        <span className="block h-2.5 w-[3px] rounded-full bg-current blur-[1.5px]" />
      </span>
      <Coffee className="size-7" strokeWidth={1.6} />
    </span>
  );
}

/** Renders a post body's blocks into the theme's entry-content styling. */
export function PostBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="wp-prose mt-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return <h2 key={index}>{block.text}</h2>;
          case "quote":
            return <blockquote key={index}>{block.text}</blockquote>;
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          default:
            return <p key={index}>{block.text}</p>;
        }
      })}
    </div>
  );
}

/** "Open today" strip used on the home and visit pages. */
export function OpenTodayStrip() {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-[var(--wp-ink-2)]">
      <Clock className="size-4 text-[var(--wp-accent)]" aria-hidden />
      Open today {hours[0].time}
    </span>
  );
}
