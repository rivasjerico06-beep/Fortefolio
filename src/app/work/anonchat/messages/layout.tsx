import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { getConversations, getMyProfile, isLive } from "../data";
import { LoginGate, ReadOnlyNotice } from "../parts";
import { Inbox } from "./inbox";

export const metadata: Metadata = {
  title: "Messages — AnonChat",
  description:
    "Private conversations between accounts, readable only by the two people in them.",
};

/**
 * Chrome for the messages area: the gate, then the inbox beside the thread.
 *
 * A layout rather than repeated page code, so navigating between threads
 * leaves the conversation list mounted and does not re-fetch it.
 */
export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const me = await getMyProfile();
  const conversations = me ? await getConversations() : null;

  if (!me || !conversations) {
    return (
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center border-b border-[var(--ac-border)] px-6">
          <h1 className="ac-display text-xl">Messages</h1>
        </header>

        {!isLive ? <ReadOnlyNotice /> : null}

        {/* The gate. Nothing is loaded behind this — the policies on
            conversations, membership and messages return nothing at all to a
            signed-out caller, so there is no fetched content being hidden. */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <span
              aria-hidden
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-[var(--ac-border)] bg-[var(--ac-card)]"
            >
              <Lock size={22} className="text-[var(--ac-muted)]" />
            </span>
            <h2 className="ac-display mb-2 text-2xl">Messages are private</h2>
            <p className="mb-6 text-[15px] leading-relaxed text-[var(--ac-muted)]">
              {isLive
                ? "Conversations here are between two accounts and nobody else — the database will not send them to a signed-out visitor. Sign in to search for someone and start one."
                : "This deployment has no database attached, so there are no accounts and no conversations."}
            </p>
            {isLive ? <LoginGate action="Have an account?" /> : null}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1">
      <Inbox conversations={conversations} />
      {children}
    </main>
  );
}
