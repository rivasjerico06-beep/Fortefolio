import { createBrowserClient, createServerClient } from "@supabase/ssr";

/**
 * Supabase wiring for the Talkapo demo.
 *
 * Both values are safe in the browser bundle. The anon key is designed to be
 * public — it identifies the project and nothing else, and every table it can
 * reach is behind row-level security (see `supabase/migrations/0001_talkapo.sql`).
 * The service-role key, which bypasses RLS, is never referenced anywhere in
 * this app and must not be added to it.
 *
 * Everything here returns `null` when the project is not configured. That is
 * deliberate rather than defensive: the portfolio has to build and deploy for
 * anyone who clones it without a Supabase account, so the demo falls back to
 * seeded content and keeps working read-only. `isConfigured` is what the UI
 * checks before it offers to write anything.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isConfigured = Boolean(url && anonKey);

/**
 * Server-side client, carrying the visitor's session from their cookies.
 *
 * Call it from Server Components, Server Actions and route handlers. Reads work
 * everywhere; writes to the cookie store only work from actions and handlers,
 * which is why `setAll` swallows its error — a Server Component that merely
 * reads the session must not crash because Next refused a refresh write.
 */
export async function supabaseServer() {
  if (!isConfigured) return null;

  // Imported lazily so the client bundle never pulls in `next/headers`
  const { cookies } = await import("next/headers");
  const store = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (written) => {
        try {
          for (const { name, value, options } of written) {
            store.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where the response is already
          // committed. The session is still valid; it just is not refreshed
          // on this particular render.
        }
      },
    },
  });
}

/** Browser client, memoised so repeated calls share one socket. */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (!isConfigured) return null;
  browserClient ??= createBrowserClient(url, anonKey);
  return browserClient;
}
