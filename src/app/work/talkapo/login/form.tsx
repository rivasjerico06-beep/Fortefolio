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
    "w-full rounded-xl border border-[var(--tk-border)] bg-[var(--tk-secondary)] px-4 py-3 outline-none focus:border-[var(--tk-border-strong)]";

  return (
    <div className="w-full max-w-sm">
      <h1 className="tk-display mb-2 text-3xl">
        {signingUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 text-[15px] text-[var(--tk-muted)]">
        {signingUp
          ? "You need an account to post, like, comment and open the lobby."
          : "Log in to post, like, comment and open the lobby."}
      </p>

      <form action={submit} className="flex flex-col gap-3">
        {signingUp ? (
          <>
            <div>
              <label htmlFor="tk-handle" className="mb-1.5 block text-sm">
                Handle
              </label>
              <input
                id="tk-handle"
                name="handle"
                required
                autoComplete="username"
                placeholder="yourhandle"
                pattern="[A-Za-z0-9_]{3,20}"
                title="3–20 letters, numbers or underscores"
                className={field}
              />
              <p className="mt-1 text-xs text-[var(--tk-muted)]">
                3–20 letters, numbers or underscores.
              </p>
            </div>

            <div>
              <label htmlFor="tk-name" className="mb-1.5 block text-sm">
                Display name
              </label>
              <input
                id="tk-name"
                name="displayName"
                autoComplete="name"
                placeholder="Your name"
                className={field}
              />
            </div>
          </>
        ) : null}

        <div>
          <label htmlFor="tk-email" className="mb-1.5 block text-sm">
            Email
          </label>
          <input
            id="tk-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="tk-password" className="mb-1.5 block text-sm">
            Password
          </label>
          <input
            id="tk-password"
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
          <p role="alert" className="text-sm text-[var(--tk-warn)]">
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

      <p className="mt-5 text-sm text-[var(--tk-muted)]">
        {signingUp ? "Already have an account?" : "No account yet?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(signingUp ? "login" : "signup");
            setError(null);
          }}
          className={cn("font-semibold text-[var(--tk-fg)] underline")}
        >
          {signingUp ? "Log in" : "Create one"}
        </button>
      </p>

      <p className="mt-6 border-t border-[var(--tk-border)] pt-5 text-xs leading-relaxed text-[var(--tk-muted)]">
        This is a portfolio demo. Use a throwaway password — not one you use anywhere else.
        Anything you post clears itself after 24 hours.
      </p>

      <Link href={BASE} className="mt-4 inline-block text-sm text-[var(--tk-muted)] underline">
        Back to the feed
      </Link>
    </div>
  );
}
