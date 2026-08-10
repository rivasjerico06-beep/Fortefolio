import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { getLobby, getMyProfile, isLive } from "../data";
import { LiveBadge, LoginGate, ReadOnlyNotice } from "../parts";
import { Lobby } from "./lobby";

export const metadata: Metadata = {
  title: "Messages — Talkapo",
  description: "A shared realtime room, readable only with an account.",
};

/**
 * Messages are per-visitor, so this renders per request rather than being
 * cached — two people must never be served each other's view of the room.
 */
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const me = await getMyProfile();
  const messages = me ? await getLobby() : null;

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--tk-border)] px-6">
        <h1 className="tk-display text-xl">Messages</h1>
        <LiveBadge live={isLive && Boolean(me)} />
      </header>

      {!isLive ? <ReadOnlyNotice /> : null}

      {me && messages ? (
        <Lobby messages={messages} me={me} />
      ) : (
        /* The gate. Worth being precise about what is happening: the row-level
           security policy on `talkapo_lobby_messages` refuses the read for an
           anonymous session, so there is genuinely nothing to render here —
           this is not a UI that hides content it has already fetched. */
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <span
              aria-hidden
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-[var(--tk-border)] bg-[var(--tk-card)]"
            >
              <Lock size={22} className="text-[var(--tk-muted)]" />
            </span>
            <h2 className="tk-display mb-2 text-2xl">Messages are for members</h2>
            <p className="mb-6 text-[15px] leading-relaxed text-[var(--tk-muted)]">
              {isLive
                ? "The lobby is a shared room for anyone with an account. The database refuses to send these messages to a signed-out visitor, so there is nothing loaded on this page to peek at."
                : "This deployment has no database attached, so there is no lobby to join."}
            </p>
            {isLive ? <LoginGate action="Have an account?" /> : null}
          </div>
        </div>
      )}
    </main>
  );
}
