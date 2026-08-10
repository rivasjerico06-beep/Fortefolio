"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { clockTime, type LobbyMessage, type Profile } from "../data";
import { supabaseBrowser } from "../supabase";
import { Avatar } from "../parts";
import { sendLobbyMessage } from "../actions";

/**
 * The public lobby: one room, everyone signed in is in it.
 *
 * The mockup drew a 1:1 inbox. A private DM demo has a problem no amount of
 * polish fixes — the first visitor has nobody to talk to, so it renders as an
 * empty room. A shared room is live from the first message and shows the same
 * realtime plumbing, which is the part worth demonstrating.
 */
export function Lobby({ messages, me }: { messages: LobbyMessage[]; me: Profile }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  /* The history is the server's, not a local copy of it. A socket event asks
     the router to refetch and the new list arrives as a prop — so the room
     cannot drift from the database, and there is no second source of truth to
     keep in step. Mirroring the prop into state here would buy nothing and
     cost a cascading render on every refresh. */
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel("talkapo-lobby")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "talkapo_lobby_messages" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  // Follow the conversation, but only when already at the bottom — yanking the
  // view away from somebody reading back through history is worse than a
  // missed message.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function submit() {
    const value = text.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      const result = await sendLobbyMessage(value);
      if (result.ok) setText("");
      else setError(result.error);
    });
  }

  return (
    <>
      <div ref={scroller} className="tk-scroll flex flex-1 flex-col gap-5 overflow-y-auto p-6">
        <p className="self-center rounded-full bg-[var(--tk-secondary)] px-3 py-1 text-xs text-[var(--tk-muted)]">
          Everyone signed in is in this room. Messages clear after 24 hours.
        </p>

        {messages.map((message, index) => {
          const mine = message.author.id === me.id;
          const previous = messages[index - 1];
          const grouped = previous?.author.id === message.author.id;

          return (
            <div
              key={message.id}
              className={cn(
                "tk-arrive flex max-w-[80%] gap-3",
                mine ? "flex-row-reverse self-end" : "self-start",
              )}
            >
              <div className="w-8 shrink-0">
                {!grouped ? <Avatar profile={message.author} size={32} /> : null}
              </div>

              <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                {!grouped ? (
                  <span className="mb-1 px-1 text-xs text-[var(--tk-muted)]">
                    {mine ? "You" : message.author.displayName}
                  </span>
                ) : null}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5",
                    mine
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
          <label htmlFor="tk-lobby-input" className="sr-only">
            Message the lobby
          </label>
          <textarea
            id="tk-lobby-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Start a new message"
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
    </>
  );
}
