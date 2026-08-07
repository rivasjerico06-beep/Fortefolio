"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BASE, nav } from "./data";
import { getOpenState, openingHours } from "./hours";

/* ---------------------------------------------------------------------------
   Open / closed indicator

   Built on useSyncExternalStore rather than an effect that sets state. Three
   things fall out of that: the server snapshot is explicitly "unknown", so the
   HTML never claims the café is open at build time; the value re-reads on a
   timer, so a tab left open overnight corrects itself; and React is given a
   primitive, so there is no new object each render to loop on.
--------------------------------------------------------------------------- */

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}

function snapshot() {
  const state = getOpenState(openingHours, new Date());
  return state.open
    ? `open|${state.closesAt}|${state.closingSoon ? "1" : ""}`
    : `shut|${state.opensAt ?? ""}|${state.opensOn ?? ""}`;
}

/** Rendered on the server and on the very first client paint. */
const serverSnapshot = () => "unknown||";

export function OpenIndicator({ className }: { className?: string }) {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [status, time, extra] = value.split("|");

  if (status === "unknown") {
    // Before we know the real time, state the fact that never changes
    return (
      <span className={className}>
        <span className="lc-eyebrow">Open from seven, every day</span>
      </span>
    );
  }

  const open = status === "open";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span
        aria-hidden
        className={`lc-ping relative block size-2 rounded-full ${
          open ? "text-[var(--lc-accent)]" : "text-[var(--lc-fg-2)]"
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
      <span className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
        {open
          ? extra
            ? `Closing soon · last orders before ${time}`
            : `Open now · until ${time}`
          : `Closed · opens ${time} ${extra}`}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Header
--------------------------------------------------------------------------- */

export function LumenHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === BASE ? pathname === BASE : pathname.startsWith(href);

  return (
    <header
      className="sticky top-11 z-40 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--lc-line)",
        backgroundColor: "color-mix(in srgb, var(--lc-bg) 85%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-5 py-4 sm:px-10">
        <Link
          href={BASE}
          className="lc-display text-2xl leading-none transition-colors hover:text-[var(--lc-accent-text)] sm:text-[1.75rem]"
        >
          Lumen
        </Link>

        <nav aria-label="Lumen Café" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="lc-eyebrow transition-colors hover:text-[var(--lc-fg)]"
              style={isActive(item.href) ? { color: "var(--lc-fg)" } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <OpenIndicator />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          className="lc-eyebrow inline-flex items-center gap-2 md:hidden"
        >
          <Menu className="size-4" aria-hidden />
          Menu
        </button>
      </div>

      {/* Full-screen overlay, phones only */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col md:hidden"
          style={{ backgroundColor: "var(--lc-bg)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="lc-display text-2xl">Lumen</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="lc-eyebrow inline-flex items-center gap-2"
            >
              Close
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <nav
            aria-label="Lumen Café"
            className="flex flex-1 flex-col justify-center gap-2 px-5"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="lc-display border-b py-4 text-4xl transition-colors hover:text-[var(--lc-accent-text)]"
                style={{ borderColor: "var(--lc-line)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-5 py-8">
            <OpenIndicator />
          </div>
        </div>
      )}
    </header>
  );
}
