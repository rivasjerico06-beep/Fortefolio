"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Pulls the element gently toward the cursor while it is nearby, then springs
 * back. Only on devices with a real pointer — touch gets a plain button — and
 * disabled entirely under reduced motion.
 */
export function Magnetic({
  children,
  href,
  className,
  strength = 0.32,
}: {
  children: ReactNode;
  href: string;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  function allowed() {
    return (
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function handleMove(event: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el || !allowed()) return;
    const box = el.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "transition-transform duration-500 ease-out will-change-transform",
        className,
      )}
    >
      {children}
    </Link>
  );
}
