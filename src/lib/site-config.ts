/**
 * Every personal detail on the site lives here. Edit this file to make the
 * portfolio yours — no component needs to change.
 */
export const siteConfig = {
  name: "Jerico Rivas",
  brand: "ECOmissions",
  brandLead: "ECO", // rendered in the accent colour in the wordmark
  brandRest: "missions",
  role: "Web Developer",

  tagline: "The lightest site that still does the job.",
  strapline: "Every byte you ship burns someone else's electricity.",
  intro:
    "I build websites that load fast because they are small, not because they are cached. Less JavaScript, fewer requests, lower emissions — and a page that happens to feel instant.",

  location: "Philippines",
  email: "rivasjerico06@gmail.com",
  availability: "Taking on work for Q3",

  /**
   * Canonical origin, no trailing slash — e.g. "https://ecomissions.dev".
   * Leave it empty and a Vercel deploy uses its own production domain
   * automatically; see `src/lib/site-url.ts`.
   */
  url: "",

  socials: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/in/",
  },

  nav: [
    { href: "/", label: "Index" },
    { href: "/projects", label: "Work" },
    { href: "/about", label: "Studio" },
    { href: "/contact", label: "Brief" },
  ],
} as const;

/** The band that scrolls under the hero. */
export const marqueeWords = [
  "Low carbon",
  "Static first",
  "No tracker bloat",
  "Accessible by default",
  "Measured, not guessed",
  "Sub-second loads",
] as const;

export const skills = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "HTML", "CSS", "SQL"],
  },
  {
    group: "Frameworks",
    items: ["React", "Next.js", "Astro", "Node.js", "Tailwind CSS"],
  },
  {
    group: "Measurement",
    items: ["Lighthouse", "Web Vitals", "Playwright", "WebPageTest", "CO2.js"],
  },
  {
    group: "Platform",
    items: ["Vercel", "Cloudflare", "Postgres", "Edge caching", "SEO"],
  },
] as const;

export const services = [
  {
    index: "01",
    title: "Low-carbon builds",
    body: "Sites built to a page-weight budget from the first commit. Static where it can be, dynamic only where it must be.",
  },
  {
    index: "02",
    title: "Marketing sites",
    body: "Landing pages and multi-page sites that load fast, rank well, and turn visitors into enquiries.",
  },
  {
    index: "03",
    title: "Web apps",
    body: "Dashboards, portals, and internal tools on React and Next.js, with real state management behind them.",
  },
  {
    index: "04",
    title: "Weight-loss audits",
    body: "I find the four megabytes you did not know you were shipping, and I take them out without breaking the design.",
  },
] as const;

/**
 * The studio's operating principles. Deliberately phrased as commitments
 * rather than features — they are what a brief gets held against.
 */
export const missions = [
  {
    number: "01",
    title: "Ship less",
    body: "The fastest request is the one never made. Every dependency has to argue for its place in the bundle, and most of them lose.",
  },
  {
    number: "02",
    title: "Render early",
    body: "Content belongs in the HTML. If a page needs JavaScript to show its own words, it is broken for anyone on a bad connection.",
  },
  {
    number: "03",
    title: "Measure honestly",
    body: "On a mid-range Android over throttled 4G, not on a laptop plugged into fibre. The second number is the one that lies.",
  },
  {
    number: "04",
    title: "Leave it maintainable",
    body: "Plain patterns a future developer can read without a tour. Cleverness is a cost the next person pays.",
  },
] as const;
