"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { clockTime, type DirectMessage, type Profile } from "../../data";
import { supabaseBrowser } from "../../supabase";
import { Avatar } from "../../parts";
import { sendDirectMessage } from "../../actions";

/**
 * One private conversation.
 *
 * The history is the server's — a socket event asks the router to refetch and
 * the new list arrives as a prop, so the thread cannot drift from the database
 * and there is no second copy to keep in step.
 *
 * The realtime filter is a convenience, not a security control: the row-level
 * policy on `talkapo_direct_messages` already means this socket can only ever
 * receive messages from conversations you belong to. Filtering by id just
 * avoids waking every open thread on every message.
 */
export function Thread({
  conversationId,
  other,
  messages,
}: {
  conversationId: string;
  other: Profile;
  messages: DirectMessage[];
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;

    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;

    /* Hand the socket the session token *before* subscribing.
     *
     * The session lives in cookies and is restored asynchronously, so a channel
     * opened on the first render connects anonymously — and because realtime
     * honours the same policies as everything else, an anonymous socket is
     * filtered down to nothing. It subscribes successfully and then silently
     * never delivers a message, which is a miserable thing to debug. */
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await supabase.realtime.setAuth(data.session?.access_token ?? null);
      if (cancelled) return;

      channel = supabase
        .channel(`talkapo-thread-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "talkapo_direct_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => router.refresh(),
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  // Follow the conversation, but only from the bottom — pulling the view away
  // from someone reading back through history is worse than a missed message.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function submit() {
    const value = text.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      const result = await sendDirectMessage(conversationId, value);
      if (result.ok) setText("");
      else setError(result.error);
    });
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--tk-border)] px-5">
        <Avatar profile={other} size={40} />
        <div className="min-w-0">
          <h2 className="truncate text-base leading-tight font-bold">{other.displayName}</h2>
          <p className="truncate text-xs text-[var(--tk-muted)]">@{other.handle}</p>
        </div>
      </header>

      <div ref={scroller} className="tk-scroll flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <p className="self-center rounded-full bg-[var(--tk-secondary)] px-3 py-1 text-center text-xs text-[var(--tk-muted)]">
          Private between you and {other.displayName}. Messages clear after 24 hours.
        </p>

        {messages.length === 0 ? (
          <p className="mt-6 self-center text-sm text-[var(--tk-muted)]">
            Nothing here yet — say hello.
          </p>
        ) : null}

        {messages.map((message, index) => {
          const grouped = messages[index - 1]?.fromMe === message.fromMe;

          return (
            <div
              key={message.id}
              className={cn(
                "tk-arrive flex max-w-[80%] flex-col",
                message.fromMe ? "items-end self-end" : "items-start self-start",
                grouped ? "-mt-2" : "",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5",
                  message.fromMe
                    ? "rounded-br-sm bg-white text-black"
                    : "rounded-bl-sm border border-[var(--tk-border)] bg-[var(--tk-secondary)]",
                )}
              >
                <p className="leading-relaxed break-words">{message.content}</p>
              </div>
              <time
                dateTime={message.createdAt}
                className="mt-1 px-1 text-[11px] text-[var(--tk-muted)]"
              >
                {clockTime(message.createdAt)}
              </time>
            </div>
          );
        })}

        <div ref={endRef} />
      </div>

      <div className="border-t border-[var(--tk-border)] p-4">
        {error ? (
          <p role="alert" className="mb-2 text-sm text-[var(--tk-warn)]">
            {error}
          </p>
        ) : null}
        <div className="flex items-end gap-2 rounded-3xl border border-transparent bg-[var(--tk-secondary)] p-2 focus-within:border-[var(--tk-border-strong)]">
          <label htmlFor="tk-dm-input" className="sr-only">
            Message {other.displayName}
          </label>
          <textarea
            id="tk-dm-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={`Message ${other.displayName}`}
            className="max-h-32 min-h-[44px] flex-1 resize-none border-none bg-transparent px-3 py-3 outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={pending || !text.trim()}
            aria-label="Send message"
            className="rounded-full bg-white p-2.5 text-black transition disabled:opacity-40"
          >
            <Send size={18} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
