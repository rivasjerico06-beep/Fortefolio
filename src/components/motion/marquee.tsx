import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal ticker. The children are rendered twice and the track
 * translates exactly -50%, so the loop is seamless. Pure CSS — it pauses on
 * hover and stops entirely under reduced motion.
 *
 * The duplicate is aria-hidden so screen readers hear the list once.
 */
export function Marquee({
  children,
  duration = 34,
  className,
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={cn("marquee-host relative overflow-hidden", className)}>
      <div
        className="marquee"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
