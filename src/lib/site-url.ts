import { siteConfig } from "./site-config";

/**
 * The site's canonical origin — used by `metadataBase`, the sitemap and
 * robots.txt, which are the three places that need an absolute URL.
 *
 * Resolved in this order:
 *
 *  1. `siteConfig.url`, once a custom domain is pointed at the project. Setting
 *     it there wins everywhere.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel fills in at build time with
 *     the project's stable production domain. This is what makes the very first
 *     deploy come out correct with no configuration at all.
 *  3. localhost, for `next dev` and the Playwright suites.
 *
 * Deliberately **not** `VERCEL_URL`: that is the unique per-deployment
 * hostname, so every preview build would stamp a throwaway address into the
 * canonical tags and the sitemap.
 *
 * Server-only by design. This lives outside `site-config.ts` because that file
 * is also imported by client components, and a server environment variable read
 * from a client bundle silently evaluates to `undefined`.
 */
export const siteUrl = (() => {
  // Widened, because `as const` on siteConfig types an empty default as `""`
  const configured: string = siteConfig.url;
  if (configured) return configured.replace(/\/+$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  return "http://localhost:3000";
})();
