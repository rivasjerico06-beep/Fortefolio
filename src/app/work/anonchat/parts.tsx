import Link from "next/link";
import { cn } from "@/lib/utils";
import { BASE, avatarColors, initials, type Profile } from "./data";

/**
 * An avatar drawn rather than fetched.
 *
 * The mockup hotlinked four Unsplash portraits. Those are photographs of real
 * people used to stand in for fictional ones, they cost a third-party request
 * each, and — the practical problem — a visitor who signs up has no portrait at
 * all, so the seeded cast would look like the real product and every actual
 * user would look like a placeholder. A deterministic gradient from the handle
 * gives everyone the same treatment and no network request.
 */
export function Avatar({
  profile,
  size = 40,
  className,
}: {
  profile: Profile;
  size?: number;
  className?: string;
}) {
  const { from, to } = avatarColors(profile.handle);

  return (
    <span
      aria-hidden
      className={cn(
        "ac-display inline-flex shrink-0 items-center justify-center rounded-full text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(140deg, ${from}, ${to})`,
      }}
    >
      {initials(profile.displayName)}
    </span>
  );
}

/**
 * The wall a signed-out visitor hits.
 *
 * Used for the whole Messages tab and inline under the feed's composer. It
 * always names what the action was, so the prompt reads as an explanation
 * rather than a refusal.
 */
export function LoginGate({ action, compact }: { action: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--ac-border)] bg-[var(--ac-card)]",
        compact ? "px-4 py-3" : "p-6 text-center",
      )}
    >
      <p className={cn("text-[var(--ac-muted)]", compact ? "text-sm" : "text-[15px]")}>
        {action}
      </p>
      <div className={cn("flex flex-wrap gap-2", compact ? "mt-2.5" : "mt-4 justify-center")}>
        <Link
          href={`${BASE}/login`}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Log in
        </Link>
        <Link
          href={`${BASE}/login?mode=signup`}
          className="rounded-full border border-[var(--ac-border-strong)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--ac-secondary)]"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

/** The banner shown when no Supabase project is attached to this deployment. */
export function ReadOnlyNotice() {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--ac-border)] bg-[var(--ac-card)] px-6 py-3">
      <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--ac-warn)]" />
      <p className="text-sm text-[var(--ac-muted)]">
        <span className="font-semibold text-[var(--ac-fg)]">Read-only.</span> No database is
        attached to this deployment, so AnonChat is running on seed content — nothing can be
        posted and there are no accounts. Point it at a Supabase project and the same UI goes
        live.
      </p>
    </div>
  );
}

/** "Live" / "Read-only" pill in the feed header. */
export function LiveBadge({ live }: { live: boolean }) {
  return (
    <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--ac-border)] px-3 py-1 text-xs text-[var(--ac-muted)]">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          live ? "ac-pulse bg-[var(--ac-live)] text-[var(--ac-live)]" : "bg-[var(--ac-muted)]",
        )}
      />
      {live ? "Live" : "Read-only"}
    </span>
  );
}
