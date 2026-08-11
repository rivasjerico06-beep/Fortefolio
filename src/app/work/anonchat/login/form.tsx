"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { BASE } from "../data";
import { signIn, signUp } from "../actions";

/**
 * One form, two modes.
 *
 * Email and password rather than a magic link, on purpose: Supabase's built-in
 * mailer is rate-limited to a handful of messages an hour on the free tier, so
 * a magic link is exactly the wrong choice for a page that might get a burst of
 * visitors from a CV. Nothing here needs an inbox to work.
 *
 * The submit path is a Server Action, so the session cookie is set httpOnly by
 * the server and the browser never holds a token it could leak.
 */
export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const signingUp = mode === "signup";

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = signingUp ? await signUp(formData) : await signIn(formData);
      if (result.ok) {
        router.push(BASE);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  const field =
    "w-full rounded-xl border border-[var(--ac-border)] bg-[var(--ac-secondary)] px-4 py-3 outline-none focus:border-[var(--ac-border-strong)]";

  return (
    <div className="w-full max-w-sm">
      <h1 className="ac-display mb-2 text-3xl">
        {signingUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 text-[15px] text-[var(--ac-muted)]">
        {signingUp
          ? "You need an account to post, like, comment and send private messages."
          : "Log in to post, like, comment and send private messages."}
      </p>

      <form action={submit} className="flex flex-col gap-3">
        {signingUp ? (
          <>
            <div>
              <label htmlFor="ac-handle" className="mb-1.5 block text-sm">
                Handle
              </label>
              <input
                id="ac-handle"
                name="handle"
                required
                autoComplete="username"
                placeholder="yourhandle"
                pattern="[A-Za-z0-9_]{3,20}"
                title="3–20 letters, numbers or underscores"
                className={field}
              />
              <p className="mt-1 text-xs text-[var(--ac-muted)]">
                3–20 letters, numbers or underscores.
              </p>
            </div>

            <div>
              <label htmlFor="ac-name" className="mb-1.5 block text-sm">
                Display name
              </label>
              <input
                id="ac-name"
                name="displayName"
                autoComplete="name"
                placeholder="Your name"
                className={field}
              />
            </div>
          </>
        ) : null}

        <div>
          <label htmlFor="ac-email" className="mb-1.5 block text-sm">
            Email
          </label>
          <input
            id="ac-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="ac-password" className="mb-1.5 block text-sm">
            Password
          </label>
          <input
            id="ac-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={signingUp ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
            className={field}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-[var(--ac-warn)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-white py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Working…" : signingUp ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-sm text-[var(--ac-muted)]">
        {signingUp ? "Already have an account?" : "No account yet?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(signingUp ? "login" : "signup");
            setError(null);
          }}
          className={cn("font-semibold text-[var(--ac-fg)] underline")}
        >
          {signingUp ? "Log in" : "Create one"}
        </button>
      </p>

      <p className="mt-6 border-t border-[var(--ac-border)] pt-5 text-xs leading-relaxed text-[var(--ac-muted)]">
        This is a portfolio demo. Use a throwaway password — not one you use anywhere else. The
        account itself is deleted 24 hours after you make it, along with every post, like,
        comment and private message on it. There is nothing to log back into afterwards, and
        nothing to delete by hand.
      </p>

      <Link href={BASE} className="mt-4 inline-block text-sm text-[var(--ac-muted)] underline">
        Back to the feed
      </Link>
    </div>
  );
}
