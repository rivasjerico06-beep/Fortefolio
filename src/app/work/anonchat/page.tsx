import type { Metadata } from "next";
import { getFeed, getMyExpiry, getMyProfile, isLive } from "./data";
import { Feed } from "./feed";
import { LiveBadge, ReadOnlyNotice } from "./parts";
import { ExpiryBadge } from "./expiry";

export const metadata: Metadata = {
  title: "AnonChat — demo site",
  description:
    "A social feed and private messenger where nothing lasts a day. Posts, conversations and the account itself are deleted after 24 hours — enforced by the database, not a privacy policy.",
};

/**
 * The feed is public, so it renders on the server for everyone — a signed-out
 * visitor and a crawler both get the whole list in the HTML.
 *
 * It renders per request rather than being cached, and that is not a
 * concession: every row carries `likedByMe`, so the feed is personalised and
 * there is no single version of it to hand two different people. The layout
 * reads the session cookie for the same reason. An earlier draft set
 * `revalidate = 30`, which did nothing once a project was configured — reading
 * cookies opts the route out of static rendering — and would have been wrong
 * even if it had worked, because it would have served one visitor's likes to
 * another.
 *
 * What matters for crawling survives regardless: this is still server-rendered
 * HTML containing the whole feed, not a client-side fetch.
 */

export default async function AnonChatHome() {
  const [posts, me, expiresAt] = await Promise.all([getFeed(), getMyProfile(), getMyExpiry()]);

  return (
    /* The right rail is gone along with the trending panel it existed to hold.
       Removing only the panel would have left a single disabled search box
       alone in a 350px column — a dead control occupying a third of the
       screen — so the rail went with it. Real search lives in Messages, where
       it does something.

       The feed keeps its 600px measure and centres instead of stretching:
       column width is a readability decision, not a leftover from what used to
       sit beside it. Borders on both edges so it still reads as a column. */
    <main className="flex min-w-0 flex-1 justify-center">
      <div className="flex w-full max-w-[600px] min-w-0 flex-col border-[var(--ac-border)] sm:border-x">
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--ac-border)] px-4 sm:px-6">
          <h1 className="ac-display text-xl">For You</h1>
          <LiveBadge live={isLive} />

          {/* The retention rule is the product, so it belongs on the feed
              rather than only in a footnote on the sign-up form — and on a
              phone especially, which is where most people will meet it.
              Signed in, the generic rule is replaced by your own deadline;
              the countdown is the same sentence with a number in it. */}
          <div className="ml-auto">
            {expiresAt ? (
              <ExpiryBadge expiresAt={expiresAt} />
            ) : (
              <p className="text-xs text-[var(--ac-muted)]">
                <span className="hidden sm:inline">Everything here disappears after </span>
                <span className="sm:hidden">Clears in </span>24 hours
              </p>
            )}
          </div>
        </header>

        {!isLive ? <ReadOnlyNotice /> : null}

        <Feed posts={posts} me={me} />
      </div>
    </main>
  );
}
