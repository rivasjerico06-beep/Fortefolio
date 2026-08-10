"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortAgo, type Post, type Profile } from "./data";
import { supabaseBrowser } from "./supabase";
import { Avatar, LoginGate } from "./parts";
import { addComment, createPost, toggleLike } from "./actions";

/**
 * The feed, hydrated over the server-rendered list.
 *
 * The posts arrive as a prop from the server component, so the HTML a crawler
 * and a signed-out visitor receive is the complete feed. This adds three
 * things: optimistic likes, an inline composer, and a realtime subscription
 * that pulls new rows in without a refresh.
 *
 * Every write goes through a Server Action. Nothing here talks to Supabase
 * directly except the realtime socket, which is read-only by nature.
 */

export function Feed({ posts, me }: { posts: Post[]; me: Profile | null }) {
  const router = useRouter();

  /* Realtime -------------------------------------------------------------
     Supabase Realtime respects RLS, so this socket only ever delivers rows
     the visitor is allowed to read. Rather than splice payloads into local
     state — which would drift from the server's idea of like counts — a
     change just asks the router to refetch. One round trip, always correct. */
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel("talkapo-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "talkapo_posts" }, () =>
        router.refresh(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "talkapo_likes" }, () =>
        router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="tk-scroll flex-1 overflow-y-auto">
      <Composer me={me} />
      <ul>
        {posts.map((post) => (
          <PostRow key={post.id} post={post} me={me} />
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="p-8 text-center text-[var(--tk-muted)]">
          Nothing here yet. Be the first to post.
        </p>
      ) : null}
    </div>
  );
}

function Composer({ me }: { me: Profile | null }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!me) {
    return (
      <div className="border-b border-[var(--tk-border)] p-4 px-6">
        <LoginGate action="Log in to post to the feed." compact />
      </div>
    );
  }

  const over = text.length > 280;

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createPost(text);
      if (result.ok) setText("");
      else setError(result.error);
    });
  }

  return (
    <div className="flex gap-4 border-b border-[var(--tk-border)] p-4 px-6">
      <Avatar profile={me} size={40} />
      <div className="flex-1">
        <label htmlFor="tk-composer" className="sr-only">
          What&rsquo;s on your mind?
        </label>
        <textarea
          id="tk-composer"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What's on your mind?"
          rows={2}
          className="mt-1 mb-2 w-full resize-none border-none bg-transparent text-lg outline-none"
        />
        {error ? (
          <p role="alert" className="mb-2 text-sm text-[var(--tk-warn)]">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-between border-t border-[var(--tk-border)] pt-2">
          <span
            className={cn(
              "text-xs tabular-nums",
              over ? "text-[var(--tk-like)]" : "text-[var(--tk-muted)]",
            )}
          >
            {text.length}/280
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !text.trim() || over}
            className="rounded-full bg-white px-5 py-1.5 font-bold text-black transition disabled:opacity-50"
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PostRow({ post, me }: { post: Post; me: Profile | null }) {
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The heart flips immediately; the action reconciles it a moment later.
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: post.likedByMe, count: post.likes },
    (state) => ({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) }),
  );

  function like() {
    if (!me) return setError("Log in to like posts.");
    setError(null);
    startTransition(async () => {
      setOptimistic(null);
      const result = await toggleLike(post.id);
      if (!result.ok) setError(result.error);
    });
  }

  function gate(what: string) {
    setError(me ? null : `Log in to ${what}.`);
  }

  return (
    <li className="border-b border-[var(--tk-border)] p-4 px-6 transition hover:bg-white/[0.02]">
      <div className="flex gap-4">
        <Avatar profile={post.author} size={40} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-bold">{post.author.displayName}</span>
            <span className="text-[var(--tk-muted)]">@{post.author.handle}</span>
            <span aria-hidden className="text-xs text-[var(--tk-muted)]">
              ·
            </span>
            <time
              dateTime={post.createdAt}
              className="text-[var(--tk-muted)]"
              title={new Date(post.createdAt).toLocaleString()}
            >
              {shortAgo(post.createdAt)}
            </time>
          </div>

          <p className="mb-3 text-[15px] leading-relaxed break-words">{post.content}</p>

          <div className="flex max-w-md items-center justify-between pr-10 text-[var(--tk-muted)]">
            <ActionButton
              label={`${post.comments} comments`}
              count={post.comments}
              onClick={() => {
                if (!me) return gate("comment");
                setShowComments((open) => !open);
              }}
              hover="hover:text-white"
            >
              <MessageCircle size={18} aria-hidden />
            </ActionButton>

            <ActionButton
              label="Repost"
              onClick={() => gate("repost")}
              hover="hover:text-[var(--tk-repost)]"
            >
              <Repeat2 size={18} aria-hidden />
            </ActionButton>

            <ActionButton
              label={optimistic.liked ? "Unlike" : "Like"}
              count={optimistic.count}
              pressed={optimistic.liked}
              onClick={like}
              disabled={pending}
              hover="hover:text-[var(--tk-like)]"
              active={optimistic.liked ? "text-[var(--tk-like)]" : undefined}
            >
              <Heart size={18} aria-hidden fill={optimistic.liked ? "currentColor" : "none"} />
            </ActionButton>

            <ActionButton label="Share" onClick={() => gate("share")} hover="hover:text-white">
              <Share size={18} aria-hidden />
            </ActionButton>
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-[var(--tk-warn)]">
              {error}{" "}
              {!me ? (
                <a href="/work/talkapo/login" className="underline">
                  Have an account? Log in
                </a>
              ) : null}
            </p>
          ) : null}

          {showComments && me ? <CommentBox postId={post.id} /> : null}
        </div>
      </div>
    </li>
  );
}

function ActionButton({
  children,
  label,
  count,
  onClick,
  hover,
  active,
  pressed,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
  hover: string;
  active?: string;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className={cn("group flex items-center gap-2 transition", hover, active)}
    >
      <span className="rounded-full p-2 transition group-hover:bg-white/10">{children}</span>
      {count !== undefined ? <span className="text-xs tabular-nums">{count}</span> : null}
    </button>
  );
}

function CommentBox({ postId }: { postId: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addComment(postId, text);
      if (result.ok) setText("");
      else setError(result.error);
    });
  }

  return (
    <div className="mt-3 flex gap-2">
      <label htmlFor={`tk-comment-${postId}`} className="sr-only">
        Write a comment
      </label>
      <input
        id={`tk-comment-${postId}`}
        ref={input}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && text.trim()) submit();
        }}
        placeholder="Write a comment"
        className="flex-1 rounded-full border border-[var(--tk-border)] bg-[var(--tk-secondary)] px-4 py-2 text-sm outline-none focus:border-[var(--tk-border-strong)]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || !text.trim()}
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-50"
      >
        {pending ? "…" : "Reply"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-[var(--tk-warn)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
