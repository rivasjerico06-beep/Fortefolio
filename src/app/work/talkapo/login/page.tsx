import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BASE, getMyProfile, isLive } from "../data";
import { ReadOnlyNotice } from "../parts";
import { AuthForm } from "./form";

export const metadata: Metadata = {
  title: "Log in — Talkapo",
  description: "Log in or create an account to post, like, comment and open the lobby.",
};

type Props = { searchParams: Promise<{ mode?: string }> };

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: Props) {
  // Already signed in? There is nothing to do here.
  if (await getMyProfile()) redirect(BASE);

  const { mode } = await searchParams;

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      {!isLive ? <ReadOnlyNotice /> : null}

      <div className="tk-scroll flex flex-1 items-center justify-center overflow-y-auto p-6">
        {isLive ? (
          <Suspense>
            <AuthForm initialMode={mode === "signup" ? "signup" : "login"} />
          </Suspense>
        ) : (
          <div className="max-w-md text-center">
            <h1 className="tk-display mb-3 text-2xl">Accounts need a database</h1>
            <p className="text-[15px] leading-relaxed text-[var(--tk-muted)]">
              No Supabase project is attached to this deployment, so there is nowhere to create
              an account. The feed still works — it is running on seed content.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
