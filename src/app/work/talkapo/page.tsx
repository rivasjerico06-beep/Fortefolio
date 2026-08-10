import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getFeed, getMyProfile, isLive } from "./data";
import { Feed } from "./feed";
import { LiveBadge, ReadOnlyNotice } from "./parts";

export const metadata: Metadata = {
  title: "Talkapo — demo site",
  description:
    "A social feed and chat client on Supabase: public reading, an account gate on every write, row-level security, and realtime updates.",
};

/**
 * The feed is public, so it renders on the server for everyone — a signed-out
 * visitor and a crawler both get the whole list in the HTML.
 *
 * `revalidate` rather than full dynamic rendering: the page is regenerated at
 * most twice a minute, so it is a cached file for almost every request, and
 * anything newer than that arrives over the realtime socket instead. That keeps
 * the route cheap without the feed ever looking stale.
 */
export const revalidate = 30;

export default async function TalkapoHome() {
  const [posts, me] = await Promise.all([getFeed(), getMyProfile()]);

  return (
    <main className="flex min-w-0 flex-1">
      <div className="flex max-w-[600px] min-w-0 flex-1 flex-col border-r border-[var(--tk-border)]">
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--tk-border)] px-6">
          <h1 className="tk-display text-xl">For You</h1>
          <LiveBadge live={isLive} />
        </header>

        {!isLive ? <ReadOnlyNotice /> : null}

        <Feed posts={posts} me={me} />
      </div>

      {/* Trending rail — static copy, and labelled as such rather than dressed
          up as data the demo does not have. */}
      <aside className="tk-scroll hidden w-[350px] flex-col gap-6 overflow-y-auto p-6 lg:flex">
        <div className="relative">
          <Search
            size={18}
            aria-hidden
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--tk-muted)]"
          />
          <label htmlFor="tk-search" className="sr-only">
            Search Talkapo
          </label>
          <input
            id="tk-search"
            type="search"
            placeholder="Search"
            disabled
            title="Search is not part of this demo"
            className="w-full cursor-not-allowed rounded-full border border-transparent bg-[var(--tk-secondary)] py-3 pr-4 pl-12 opacity-60 outline-none"
          />
        </div>

        <div className="rounded-2xl border border-[var(--tk-border)] bg-[var(--tk-card)] p-4">
          <h2 className="tk-display mb-4 text-lg">What&rsquo;s happening</h2>
          <ul className="flex flex-col gap-4">
            {[
              { category: "Technology · Trending", topic: "#React19", posts: "12.5K" },
              { category: "Design · Trending", topic: "Figma Config", posts: "8,240" },
              { category: "Development · Popular", topic: "Vite 8", posts: "5,102" },
            ].map((trend) => (
              <li key={trend.topic}>
                <p className="mb-0.5 text-xs text-[var(--tk-muted)]">{trend.category}</p>
                <p className="font-bold">{trend.topic}</p>
                <p className="mt-0.5 text-xs text-[var(--tk-muted)]">{trend.posts} posts</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-[var(--tk-border)] pt-3 text-xs text-[var(--tk-muted)]">
            Sample data — trends are not computed in this demo.
          </p>
        </div>
      </aside>
    </main>
  );
}
