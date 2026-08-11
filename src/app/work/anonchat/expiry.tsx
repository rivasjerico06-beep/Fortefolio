"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/**
 * How long the signed-in account has left.
 *
 * The deadline arrives from the server as an ISO string read off the same
 * column the sweep deletes on. This only formats it — it never computes one —
 * because a countdown that invents its own deadline will drift from the one
 * actually being enforced, and then the page is wrong about the single rule
 * this whole demo exists to demonstrate.
 *
 * Rendered as `null` until after mount. The remaining time depends on the
 * reader's clock, so putting it in the server HTML would ship one visitor's
 * "3h left" into a cached response for everybody, and hydration would disagree
 * with it anyway.
 */
export function ExpiryBadge({
  expiresAt,
  className = "",
}: {
  expiresAt: string;
  className?: string;
}) {
  const [left, setLeft] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setLeft(remaining(expiresAt));
    tick();
    // A minute is enough: the badge never shows a unit finer than that.
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (left === null) return null;

  const urgent = left === "under a minute" || left.endsWith("m left");

  return (
    <span
      title={`This account and everything on it is deleted at ${new Date(expiresAt).toLocaleString()}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs whitespace-nowrap ${
        urgent
          ? "border-[var(--ac-warn)] text-[var(--ac-warn)]"
          : "border-[var(--ac-border-strong)] text-[var(--ac-muted)]"
      } ${className}`}
    >
      <Clock size={13} aria-hidden />
      {left}
    </span>
  );
}

/** "23h left", "45m left", "under a minute", or "expired". */
function remaining(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return "expired";
  if (ms <= 0) return "expired";

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes}m left`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  // Below three hours the minutes still matter to somebody deciding whether to
  // bother replying; above it they are noise.
  return hours < 3 && rest > 0 ? `${hours}h ${rest}m left` : `${hours}h left`;
}
