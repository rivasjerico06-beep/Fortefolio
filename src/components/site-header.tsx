"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  // Slide the bar away on the way down, bring it back the moment you scroll up.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = barRef.current;
      if (!el) return;
      const y = window.scrollY;
      const goingDown = y > lastY.current && y > 220;
      el.style.transform = goingDown ? "translate3d(0,-100%,0)" : "translate3d(0,0,0)";
      el.dataset.stuck = y > 24 ? "true" : "false";
      lastY.current = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      ref={barRef}
      data-stuck="false"
      className="data-[stuck=true]:border-line data-[stuck=true]:bg-bg/85 sticky top-0 z-50 border-b border-transparent transition-[transform,background-color,border-color] duration-500 ease-out data-[stuck=true]:backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[72px] max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          {/* Mark: a leaf-ish diamond that rotates on hover */}
          <span
            aria-hidden
            className="bg-accent grid size-8 place-items-center rounded-[10px] transition-transform duration-500 ease-out group-hover:rotate-[135deg]"
          >
            <span className="bg-accent-ink size-2.5 rounded-[3px] rounded-tl-none" />
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            <span className="text-accent">{siteConfig.brandLead}</span>
            {siteConfig.brandRest}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "link-wipe text-sm transition-colors",
                isActive(item.href) ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/contact"
            className="group bg-ink text-bg relative hidden overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium sm:inline-flex"
          >
            {/* Accent wash wipes up from the bottom on hover */}
            <span className="bg-accent absolute inset-0 translate-y-full transition-transform duration-400 ease-out group-hover:translate-y-0" />
            <span className="group-hover:text-accent-ink relative transition-colors">
              Start a brief
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="border-line text-ink-2 grid size-9 place-items-center rounded-full border md:hidden"
          >
            {open ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <ScrollProgress />

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-line bg-surface border-t px-5 py-3 md:hidden"
        >
          {siteConfig.nav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-baseline gap-3 rounded-xl px-3 py-3 text-lg transition-colors",
                isActive(item.href) ? "bg-surface-2 text-ink" : "text-ink-2",
              )}
            >
              <span className="text-ink-3 font-mono text-[11px]">0{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
