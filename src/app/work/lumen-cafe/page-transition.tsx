"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Plays an arrival animation on every route change inside the demo.
 *
 * `key={pathname}` is the whole mechanism: React tears the subtree down and
 * builds a new one when the path changes, so the `.lc-enter` animation on the
 * wrapper starts from the beginning each time. Without the key the element
 * would persist across navigations and the animation would run exactly once,
 * on first load.
 *
 * The obvious alternative is React's `<ViewTransition>`, which would crossfade
 * the old page into the new one and could morph a product thumbnail into its
 * hero. It is not used here: it needs `experimental.viewTransition`, and that
 * flag swaps the React build for the entire portfolio — forty routes of risk
 * for a nicer transition on eleven of them. Worth revisiting when it is stable.
 *
 * This is a client component, but a thin one: it renders its children
 * untouched, so the pages inside stay server components and none of their
 * content is pulled into the browser bundle.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="lc-enter">
      {children}
    </div>
  );
}
