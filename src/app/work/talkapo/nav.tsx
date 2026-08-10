"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Bell, Home, MessageSquare, Search, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BASE, type Profile } from "./data";
import { Avatar } from "./parts";
import { signOut } from "./actions";

/**
 * The rail down the left.
 *
 * A client component only because it highlights the current route and holds the
 * sign-out transition. The links themselves are real `next/link` navigations
 * rather than the mockup's tab state, so every screen has a URL, the back
 * button works, and the feed can be linked to directly.
 *
 * Explore, Notifications and Settings are rendered `disabled` rather than as
 * dead links. This demo does not implement them, and a nav item that silently
 * does nothing is the thing that makes a portfolio piece feel fake — saying
 * "not in this demo" out loud costs nothing and is true.
 */

const ITEMS = [
  { href: BASE, label: "Home", icon: Home, live: true },
  { href: `${BASE}/messages`, label: "Messages", icon: MessageSquare, live: true },
  { href: null, label: "Explore", icon: Search, live: false },
  { href: null, label: "Notifications", icon: Bell, live: false },
  { href: null, label: "Settings", icon: Settings, live: false },
] as const;

export function TalkapoNav({ me }: { me: Profile | null }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <nav
      aria-label="Talkapo"
      className="z-20 flex w-[76px] shrink-0 flex-col justify-between border-r border-[var(--tk-border)] xl:w-[260px]"
    >
      <div className="flex flex-col gap-6 p-4 xl:p-6">
        <Link
          href={BASE}
          aria-label="Talkapo home"
          className="mb-2 flex size-12 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90"
        >
          <Sparkles size={24} aria-hidden />
        </Link>

        <ul className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = item.href !== null && pathname === item.href;
            const Icon = item.icon;

            const inner = (
              <>
                <Icon size={26} strokeWidth={active ? 2.5 : 1.5} aria-hidden />
                <span className={cn("hidden text-lg xl:block", active && "font-bold")}>
                  {item.label}
                </span>
              </>
            );

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-4 rounded-full p-3 transition xl:px-4",
                      active ? "font-bold" : "hover:bg-[var(--tk-secondary)]",
                    )}
                  >
                    {inner}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title={`${item.label} is not part of this demo`}
                    className="flex cursor-not-allowed items-center gap-4 rounded-full p-3 text-[var(--tk-muted)] opacity-50 xl:px-4"
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 xl:p-4">
        {me ? (
          <div className="flex items-center gap-3 rounded-full p-2 xl:pr-3">
            <Avatar profile={me} size={40} />
            <div className="hidden min-w-0 flex-1 flex-col xl:flex">
              <span className="truncate text-sm font-semibold">{me.displayName}</span>
              <span className="truncate text-xs text-[var(--tk-muted)]">@{me.handle}</span>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => void signOut())}
              className="hidden rounded-full border border-[var(--tk-border-strong)] px-3 py-1.5 text-xs transition hover:bg-[var(--tk-secondary)] disabled:opacity-50 xl:block"
            >
              {pending ? "…" : "Log out"}
            </button>
          </div>
        ) : (
          <Link
            href={`${BASE}/login`}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            <span className="hidden xl:inline">Log in</span>
            <span className="xl:hidden" aria-hidden>
              →
            </span>
            <span className="sr-only xl:hidden">Log in</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
