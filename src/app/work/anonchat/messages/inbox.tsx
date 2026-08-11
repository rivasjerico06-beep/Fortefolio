"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Edit, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BASE, shortAgo, type Conversation, type Profile } from "../data";
import { Avatar } from "../parts";
import { findPeople } from "./search-action";
import { startConversation } from "../actions";

/**
 * The conversation list, with people search folded into it.
 *
 * Search runs against a database function that only returns accounts which
 * actually exist — no fixtures, and never you. That rule lives in SQL rather
 * than here, so it holds no matter what calls it.
 *
 * Picking someone opens the thread through `startConversation`, which returns
 * the existing one if you have messaged before. The list is a real route each,
 * so a conversation can be linked to and the back button walks the inbox.
 */
export function Inbox({ conversations }: { conversations: Conversation[] }) {
  const [searching, setSearching] = useState(false);
  const pathname = usePathname();

  /* A phone has room for the list or the conversation, not both. With a thread
     open the list steps aside; from `sm` up they sit side by side as designed.
     Done with a class rather than by not rendering, so navigating between
     threads never unmounts and refetches the list. */
  const threadOpen = /\/messages\/[^/]+$/.test(pathname);

  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-r border-[var(--ac-border)] sm:flex sm:w-[320px] lg:w-[380px]",
        threadOpen ? "hidden" : "flex",
      )}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--ac-border)] px-4">
        <h1 className="ac-display text-xl">Messages</h1>
        <button
          type="button"
          onClick={() => setSearching((open) => !open)}
          aria-expanded={searching}
          aria-label={searching ? "Close new message" : "New message"}
          className="rounded-full p-2 transition hover:bg-[var(--ac-secondary)]"
        >
          {searching ? <X size={20} aria-hidden /> : <Edit size={20} aria-hidden />}
        </button>
      </div>

      {searching ? (
        <PeopleSearch onDone={() => setSearching(false)} />
      ) : (
        <ConversationList conversations={conversations} />
      )}
    </aside>
  );
}

function ConversationList({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="ac-scroll flex-1 overflow-y-auto p-6 text-center">
        <p className="text-[15px] text-[var(--ac-muted)]">
          No conversations yet. Use the pencil to find someone and say hello.
        </p>
      </div>
    );
  }

  return (
    <ul className="ac-scroll flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const href = `${BASE}/messages/${conversation.id}`;
        const active = pathname === href;

        return (
          <li key={conversation.id}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 p-4 transition",
                active ? "bg-[var(--ac-secondary)]" : "hover:bg-white/[0.03]",
              )}
            >
              <Avatar profile={conversation.other} size={48} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">
                    {conversation.other.displayName}
                  </span>
                  {conversation.lastAt ? (
                    <time
                      dateTime={conversation.lastAt}
                      className="shrink-0 text-xs text-[var(--ac-muted)]"
                    >
                      {shortAgo(conversation.lastAt)}
                    </time>
                  ) : null}
                </div>
                <p className="truncate text-sm text-[var(--ac-muted)]">
                  {conversation.lastMessage
                    ? `${conversation.lastFromMe ? "You: " : ""}${conversation.lastMessage}`
                    : `@${conversation.other.handle}`}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function PeopleSearch({ onDone }: { onDone: () => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  /* Debounced so typing a handle is one query rather than one per keystroke.
     An empty box still searches — it lists everyone, which is the useful
     default on a demo with a handful of accounts. */
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        setResults(await findPeople(term));
      });
    }, 220);
    return () => clearTimeout(timer);
  }, [term]);

  function open(profile: Profile) {
    setError(null);
    startTransition(async () => {
      const result = await startConversation(profile.id);
      if (result.ok) {
        onDone();
        router.push(`${BASE}/messages/${result.id}`);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="ac-scroll flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="relative">
          <Search
            size={18}
            aria-hidden
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--ac-muted)]"
          />
          <label htmlFor="ac-people" className="sr-only">
            Search people by name or handle
          </label>
          <input
            id="ac-people"
            ref={input}
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search people"
            className="w-full rounded-full border border-transparent bg-[var(--ac-secondary)] py-2.5 pr-4 pl-11 outline-none focus:border-[var(--ac-border-strong)]"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="px-4 pb-3 text-sm text-[var(--ac-warn)]">
          {error}
        </p>
      ) : null}

      {results === null && pending ? (
        <p className="px-4 text-sm text-[var(--ac-muted)]">Searching…</p>
      ) : null}

      {results !== null && results.length === 0 ? (
        <p className="px-4 text-sm leading-relaxed text-[var(--ac-muted)]">
          {term.trim() ? `Nobody matches “${term.trim()}”.` : "Nobody else has an account yet."}{" "}
          Only people who have actually signed up appear here.
        </p>
      ) : null}

      <ul>
        {(results ?? []).map((profile) => (
          <li key={profile.id}>
            <button
              type="button"
              onClick={() => open(profile)}
              disabled={pending}
              className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[0.03] disabled:opacity-50"
            >
              <Avatar profile={profile} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{profile.displayName}</span>
                <span className="block truncate text-sm text-[var(--ac-muted)]">
                  @{profile.handle}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
