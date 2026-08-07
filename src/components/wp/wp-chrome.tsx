import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { themeVars, type WpTheme } from "./theme";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
};

/** A crumb, a widget row, a pagination page — anything that points somewhere. */
export type WpLinkItem = { label: string; href?: string };

/**
 * Routes inside the app through `next/link` so navigation is client-side, and
 * leaves anything else (mailto:, tel:, external, or a deliberate "#") as a
 * plain anchor.
 */
export function WpLink({
  href,
  className,
  children,
  ...rest
}: {
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  if (href && href.startsWith("/")) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href ?? "#"} className={className} {...rest}>
      {children}
    </a>
  );
}

/**
 * Outermost wrapper for a themed demo. Sets the scoped custom properties and
 * the base body type, so everything inside can be written against roles.
 */
export function WpShell({
  theme,
  children,
  className,
}: {
  theme: WpTheme;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={themeVars(theme)}
      className={cn("wp-root flex-1 bg-[var(--wp-bg)] text-[var(--wp-ink)]", className)}
    >
      {children}
    </div>
  );
}

/**
 * Site header: title, tagline, and a nav bar with hover dropdowns.
 *
 * The dropdowns are CSS-only and the mobile menu is a native <details>, so the
 * whole header ships without a line of JavaScript — which is both period-
 * accurate for a classic theme and keeps the demo weightless.
 */
export function WpHeader({
  title,
  tagline,
  nav,
  active,
  titleHref,
  cta,
}: {
  title: ReactNode;
  tagline: string;
  nav: readonly NavItem[];
  /** href of the current page — matched against nav items to mark one active */
  active?: string;
  /** Where the site title links to, the way a theme's logo links home */
  titleHref?: string;
  cta?: ReactNode;
}) {
  return (
    <header className="sticky top-11 z-40 border-b border-[var(--wp-line)] bg-[var(--wp-header-bg)] text-[var(--wp-header-ink)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
        <div className="min-w-0">
          <p
            className="text-2xl leading-tight font-bold tracking-tight"
            style={{ fontFamily: "var(--wp-heading-font)" }}
          >
            <WpLink href={titleHref} className="hover:text-[var(--wp-accent)]">
              {title}
            </WpLink>
          </p>
          <p className="mt-0.5 text-[13px] opacity-70">{tagline}</p>
        </div>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const isActive = active === item.href;
              return (
                <li key={item.label} className="wp-nav-item relative">
                  <WpLink
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-2 text-[13.5px] font-medium tracking-wide uppercase transition-colors",
                      isActive ? "text-[var(--wp-accent)]" : "hover:text-[var(--wp-accent)]",
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown className="size-3 opacity-60" aria-hidden />}
                  </WpLink>
                  {item.children && (
                    <ul className="wp-submenu absolute top-full left-0 z-50 w-52 border border-[var(--wp-line)] bg-[var(--wp-surface)] py-1 text-[var(--wp-ink)] shadow-lg">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <WpLink
                            href={child.href}
                            className="block px-4 py-2 text-[13px] hover:bg-[var(--wp-surface-alt)] hover:text-[var(--wp-accent)]"
                          >
                            {child.label}
                          </WpLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <span aria-hidden className="mx-1 h-5 w-px bg-current opacity-20" />
          <Search className="size-4 opacity-70" aria-hidden />
          {cta}
        </nav>

        {/* Mobile nav — native disclosure, no JavaScript */}
        <details className="wp-mobile-nav w-full md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between border border-[var(--wp-line)] px-3 py-2 text-[13px] font-medium tracking-wide uppercase">
            Menu
            <ChevronDown className="size-4 transition-transform" aria-hidden />
          </summary>
          <ul className="mt-2 border border-t-0 border-[var(--wp-line)]">
            {nav.map((item) => (
              <li key={item.label} className="border-b border-[var(--wp-line)] last:border-b-0">
                <WpLink
                  href={item.href}
                  aria-current={active === item.href ? "page" : undefined}
                  className={cn(
                    "block px-4 py-2.5 text-sm",
                    active === item.href && "font-semibold text-[var(--wp-accent)]",
                  )}
                >
                  {item.label}
                </WpLink>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </header>
  );
}

/**
 * Breadcrumb trail — the "You are here" line a lot of themes ship with.
 * The last crumb is the current page and is never a link.
 */
export function WpBreadcrumbs({ trail }: { trail: readonly WpLinkItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-[var(--wp-line)] bg-[var(--wp-surface-alt)]"
    >
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-2.5 text-[12.5px] text-[var(--wp-ink-2)]">
        {trail.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden>›</span>}
            {index === trail.length - 1 || !crumb.href ? (
              <span
                aria-current={index === trail.length - 1 ? "page" : undefined}
                className="text-[var(--wp-ink)]"
              >
                {crumb.label}
              </span>
            ) : (
              <WpLink
                href={crumb.href}
                className="hover:text-[var(--wp-accent)] hover:underline"
              >
                {crumb.label}
              </WpLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The two-column body every classic theme is built around. */
export function WpLayout({
  children,
  sidebar,
  /** Put the widget column on the left, the way some older themes do */
  sidebarFirst = false,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarFirst?: boolean;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
      <main className={cn("min-w-0", sidebarFirst && "lg:order-2")}>{children}</main>
      <aside
        aria-label="Sidebar"
        className={cn("min-w-0 space-y-7", sidebarFirst && "lg:order-1")}
      >
        {sidebar}
      </aside>
    </div>
  );
}

/** One sidebar widget, with the classic underlined widget title. */
export function Widget({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="wp-widget">
      <h2 className="wp-widget-title">{title}</h2>
      <div className="text-[14px] leading-relaxed text-[var(--wp-ink-2)]">{children}</div>
    </section>
  );
}

/** A widget whose body is a plain list of links — recent posts, pages, archives. */
export function LinkListWidget({
  title,
  items,
}: {
  title: string;
  items: readonly (string | { label: string; count?: number; href?: string })[];
}) {
  return (
    <Widget title={title}>
      <ul className="wp-linklist">
        {items.map((item) => {
          const entry = typeof item === "string" ? { label: item } : item;
          return (
            <li key={entry.label}>
              <WpLink href={"href" in entry ? entry.href : undefined}>{entry.label}</WpLink>
              {"count" in entry && entry.count !== undefined && (
                <span className="opacity-60"> ({entry.count})</span>
              )}
            </li>
          );
        })}
      </ul>
    </Widget>
  );
}

export function SearchWidget({ title = "Search" }: { title?: string }) {
  return (
    <Widget title={title}>
      {/* Decorative: this is a demo, so the field is labelled but inert */}
      <div className="flex">
        <input
          type="search"
          aria-label={`${title} this site`}
          placeholder="Search &hellip;"
          className="min-w-0 flex-1 border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[13px] text-[var(--wp-ink)] outline-none focus:border-[var(--wp-accent)]"
        />
        <button
          type="button"
          className="shrink-0 bg-[var(--wp-accent)] px-3 py-2 text-[13px] font-medium text-[var(--wp-accent-ink)]"
        >
          Go
        </button>
      </div>
    </Widget>
  );
}

export function TagCloudWidget({
  tags,
}: {
  tags: readonly (string | { label: string; href?: string })[];
}) {
  return (
    <Widget title="Tags">
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag, index) => {
          const entry = typeof tag === "string" ? { label: tag } : tag;
          // Tag clouds size by post count — vary it so it reads as one
          const style = { fontSize: `${11 + ((index * 3) % 5)}px` };
          const className =
            "inline-block border border-[var(--wp-line)] px-2 py-1 hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]";

          return (
            <li key={entry.label}>
              {/* Without a tag archive to point at, render a label rather than a
                  link that goes nowhere */}
              {entry.href ? (
                <WpLink href={entry.href} className={className} style={style}>
                  {entry.label}
                </WpLink>
              ) : (
                <span className={className} style={style}>
                  {entry.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Widget>
  );
}

/**
 * "Posted on … by … in …" — the line under a post title. The date and author
 * stay plain text (a demo has no date archive or author page); the category and
 * comment count link out when given somewhere to go.
 */
export function PostMeta({
  date,
  author = "admin",
  category,
  categoryHref,
  comments,
  commentsHref,
}: {
  date: string;
  author?: string;
  category?: string;
  categoryHref?: string;
  comments?: number;
  commentsHref?: string;
}) {
  return (
    <p className="mt-2 text-[12.5px] text-[var(--wp-ink-2)]">
      Posted on <span className="text-[var(--wp-ink)]">{date}</span> by{" "}
      <span className="text-[var(--wp-ink)]">{author}</span>
      {category && (
        <>
          {" "}
          in{" "}
          <WpLink href={categoryHref} className="hover:text-[var(--wp-accent)] hover:underline">
            {category}
          </WpLink>
        </>
      )}
      {comments !== undefined && (
        <>
          {" · "}
          <WpLink href={commentsHref} className="hover:text-[var(--wp-accent)] hover:underline">
            {comments} Comments
          </WpLink>
        </>
      )}
    </p>
  );
}

/**
 * Numbered pagination. Pass `hrefFor` to map a page number to a real route;
 * without it the links stay inert, which is fine for a single-page demo.
 */
export function WpPagination({
  pages = 3,
  current = 1,
  hrefFor,
}: {
  pages?: number;
  current?: number;
  hrefFor?: (page: number) => string;
}) {
  const next = current < pages ? current + 1 : null;

  return (
    <nav aria-label="Posts" className="mt-8 flex items-center gap-1.5">
      {Array.from({ length: pages }, (_, index) => index + 1).map((page) => (
        <WpLink
          key={page}
          href={hrefFor?.(page)}
          aria-current={page === current ? "page" : undefined}
          className={cn(
            "min-w-9 border px-3 py-2 text-center text-[13px]",
            page === current
              ? "border-[var(--wp-accent)] bg-[var(--wp-accent)] text-[var(--wp-accent-ink)]"
              : "border-[var(--wp-line)] hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]",
          )}
        >
          {page}
        </WpLink>
      ))}
      {next && (
        <WpLink
          href={hrefFor?.(next)}
          className="border border-[var(--wp-line)] px-3 py-2 text-[13px] hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]"
        >
          Next »
        </WpLink>
      )}
    </nav>
  );
}

/** Comment thread plus the "Leave a Reply" form. */
export function WpComments({
  comments,
}: {
  comments: readonly { author: string; date: string; body: string; reply?: boolean }[];
}) {
  return (
    <section className="mt-12 border-t border-[var(--wp-line)] pt-8">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--wp-heading-font)" }}>
        {comments.length} thoughts on this
      </h2>

      <ol className="mt-6 space-y-6">
        {comments.map((comment) => (
          <li
            key={comment.author + comment.date}
            className={cn("flex gap-4", comment.reply && "ml-6 sm:ml-12")}
          >
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center bg-[var(--wp-surface-alt)] text-sm font-semibold text-[var(--wp-ink-2)]"
            >
              {comment.author.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 border border-[var(--wp-line)] bg-[var(--wp-surface)] p-4">
              <p className="text-[13px]">
                <strong>{comment.author}</strong>{" "}
                <span className="text-[var(--wp-ink-2)]">said on {comment.date}</span>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--wp-ink-2)]">
                {comment.body}
              </p>
              {/* #respond is WordPress's own comment-form anchor, so this
                  genuinely jumps to the reply box */}
              <a
                href="#respond"
                className="mt-2 inline-block text-[12.5px] text-[var(--wp-accent)] hover:underline"
              >
                Reply
              </a>
            </div>
          </li>
        ))}
      </ol>

      <div id="respond" className="mt-10 scroll-mt-32">
        <h3 className="text-lg font-bold" style={{ fontFamily: "var(--wp-heading-font)" }}>
          Leave a Reply
        </h3>
        <p className="mt-1 text-[12.5px] text-[var(--wp-ink-2)]">
          Your email address will not be published. Required fields are marked{" "}
          <span aria-hidden>*</span>
        </p>
        {/* Inert: this is a demo, so nothing is submitted anywhere */}
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="wp-comment" className="block text-[13px] font-medium">
              Comment <span aria-hidden>*</span>
            </label>
            <textarea
              id="wp-comment"
              rows={4}
              className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wp-name" className="block text-[13px] font-medium">
                Name <span aria-hidden>*</span>
              </label>
              <input
                id="wp-name"
                type="text"
                className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
              />
            </div>
            <div>
              <label htmlFor="wp-email" className="block text-[13px] font-medium">
                Email <span aria-hidden>*</span>
              </label>
              <input
                id="wp-email"
                type="email"
                className="mt-1.5 w-full border border-[var(--wp-line)] bg-[var(--wp-surface)] px-3 py-2 text-[14px] outline-none focus:border-[var(--wp-accent)]"
              />
            </div>
          </div>
          <button
            type="button"
            className="bg-[var(--wp-accent)] px-5 py-2.5 text-[13px] font-semibold text-[var(--wp-accent-ink)]"
          >
            Post Comment
          </button>
        </div>
      </div>
    </section>
  );
}

/** Footer widget columns plus the credit bar every theme ends with. */
export function WpFooter({
  columns,
  credit,
}: {
  columns: readonly { title: string; body: ReactNode }[];
  credit: string;
}) {
  return (
    <footer className="mt-12 border-t border-[var(--wp-line)] bg-[var(--wp-footer-bg)] text-[var(--wp-footer-ink)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <section key={column.title}>
            <h2 className="wp-widget-title wp-widget-title--footer">{column.title}</h2>
            <div className="text-[13.5px] leading-relaxed opacity-80">{column.body}</div>
          </section>
        ))}
      </div>
      <div className="border-t border-current/15">
        <div className="mx-auto max-w-6xl px-5 py-4 text-center text-[12.5px] opacity-70">
          {credit}
        </div>
      </div>
    </footer>
  );
}
