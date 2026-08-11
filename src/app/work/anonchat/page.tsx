import type { Metadata } from "next";
import { getFeed, getMyProfile, isLive } from "./data";
import { Feed } from "./feed";
import { LiveBadge, ReadOnlyNotice } from "./parts";

export const metadata: Metadata = {
  title: "AnonChat — demo site",
  description:
    "A social feed and chat client on Supabase: public reading, an account gate on every write, row-level security, and realtime updates.",
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
  const [posts, me] = await Promise.all([getFeed(), getMyProfile()]);

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
          {/* The retention rule is the product, so it is stated on the feed
              rather than buried in a footnote on the sign-up form. */}
          <p className="ml-auto hidden text-xs text-[var(--ac-muted)] sm:block">
            Everything here disappears after 24 hours
          </p>
        </header>

        {!isLive ? <ReadOnlyNotice /> : null}

        <Feed posts={posts} me={me} />
      </div>
    </main>
  );
}
