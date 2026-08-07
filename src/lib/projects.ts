/**
 * The portfolio's case studies. Each one points at a live demo site that lives
 * under /work/<slug> in this same app, so every project links to something real.
 *
 * All four demos reproduce a WordPress layout — a classic business theme, a
 * theme with a pricing plugin, a wp-admin plugin screen, and a WooCommerce shop
 * archive — but are built as static Next.js rather than PHP. The copy says so
 * plainly: the point is that the familiar layout does not require the weight
 * that usually comes with it.
 */
export type Project = {
  slug: string;
  name: string;
  kind: string;
  summary: string;
  year: string;
  stack: readonly string[];
  accent: string;
  brief: string;
  challenge: string;
  approach: readonly string[];
  outcome: readonly { label: string; value: string; note: string }[];
};

export const projects: readonly Project[] = [
  {
    slug: "lumen-cafe",
    name: "Lumen Café",
    kind: "Editorial site, designed then built",
    summary:
      "An art-directed café site — full-bleed photography, scroll-driven type, a live open/closed indicator — built to a page-weight budget with no animation library.",
    year: "2026",
    stack: ["Next.js", "Tailwind CSS", "Server Components"],
    accent: "#c8551b",
    brief:
      "Lumen is a twelve-seat coffee bar in Poblacion. They wanted a site that looked like the room does — photographic, unhurried, confident — and that told you whether they were open right now without making you read a table.",
    challenge:
      "Sites that look like this usually cost four megabytes and an animation library. The design was drafted in Figma from a written brief, which produced a good token layer and a working data model — and also a palette that failed contrast in four places and a day-of-week lookup that silently resolved Sunday and Tuesday to the wrong rows.",
    approach: [
      "Rebuild the design against its own tokens, correcting the palette so secondary text and accent links clear 4.5:1 in both themes and splitting the accent into a fill tone and a darker text tone.",
      "Drive every animation with CSS keyframes and one shared IntersectionObserver, so a single reduced-motion rule stops all of it and no content can be stranded invisible.",
      "Compute the open/closed state from a pure function that takes the time as an argument, rendered only after mount — server-rendering it would bake the build-time answer into the HTML.",
      "Put every read behind an async accessor and every write behind a Server Action, so connecting a real CMS and inbox changes those files and nothing else.",
    ],
    outcome: [
      { label: "Animation library", value: "0KB", note: "CSS keyframes and one observer" },
      {
        label: "Contrast failures fixed",
        value: "4",
        note: "found by measuring, not by eye",
      },
      { label: "Pages prerendered static", value: "11", note: "including every article" },
    ],
  },
  {
    slug: "nimbus",
    name: "Nimbus",
    kind: "Theme + pricing plugin",
    summary:
      "A WordPress business theme with the pricing-table and FAQ-accordion plugins every SaaS site bolts on — minus the four plugins.",
    year: "2026",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    accent: "#1c5cab",
    brief:
      "Nimbus needed the standard developer-tool marketing page: banner, services grid, pricing table with a monthly/annual switch, and an FAQ accordion. On WordPress that is a theme plus roughly four plugins.",
    challenge:
      "Pricing toggles and accordions are the two things sites reach for a plugin to do, and those plugins drag jQuery and a stylesheet each. The page had to keep both interactions and lose the machinery underneath them.",
    approach: [
      "Build the pricing table to look like a stock pricing-plugin block — header band, recommended ribbon, tick lists — with the billing toggle as ordinary React state.",
      "Replace the accordion plugin with native <details> and <summary>, which are keyboard operable and screen-reader announced for free.",
      "Keep the theme's sidebar widgets (search, testimonial, docs list, tag cloud) so the page still reads as a WordPress build.",
      "Answer the four objections that came up most in user interviews, rather than padding the FAQ to fill the block.",
    ],
    outcome: [
      { label: "Plugins replaced", value: "4", note: "pricing, accordion, slider, forms" },
      { label: "JavaScript shipped", value: "~14KB", note: "gzipped, the toggle only" },
      { label: "Fully keyboard operable", value: "Yes", note: "toggle, nav, and FAQ" },
    ],
  },
  {
    slug: "atlas",
    name: "Atlas Analytics",
    kind: "wp-admin plugin screen",
    summary:
      "An analytics plugin screen inside the WordPress admin — admin menu, metaboxes, and charts that survive being printed in greyscale.",
    year: "2026",
    stack: ["React", "TypeScript", "SVG charts"],
    accent: "#2271b1",
    brief:
      "Atlas is a reporting screen that lives under the WordPress admin menu, the way most analytics plugins do. Its previous version used a rainbow palette and stacked two different scales onto one chart, so the team routinely misread it.",
    challenge:
      "Dashboards fail quietly: nobody reports a chart they misread. The rebuild had to look at home in wp-admin while making the numbers hard to get wrong, including for colourblind readers and anyone printing to greyscale.",
    approach: [
      "Match wp-admin exactly — collapsed admin menu, admin bar, and bordered metaboxes — so it reads as part of WordPress rather than an iframe bolted into it.",
      "Draw the charts as hand-built SVG, so there is no charting library in the bundle and every mark is controllable.",
      "Use a fixed categorical palette validated for colour-vision deficiency, assigned per entity so filtering never repaints a series.",
      "Give every chart a legend plus direct labels and a table of the same data, so identity is never carried by colour alone.",
    ],
    outcome: [
      { label: "Charting library weight", value: "0KB", note: "charts are plain SVG" },
      { label: "Worst-case CVD separation", value: "ΔE 9.2", note: "validated, target is 8" },
      { label: "Dual-axis charts", value: "0", note: "two scales are never merged" },
    ],
  },
  {
    slug: "verde",
    name: "Verde Supply",
    kind: "WooCommerce storefront",
    summary:
      "A WooCommerce shop archive — filter widgets, product grid, star ratings, working cart — where changing a filter takes a frame instead of a page load.",
    year: "2026",
    stack: ["Next.js", "React state", "Tailwind CSS"],
    accent: "#2f5d33",
    brief:
      "Verde sells houseplants on WooCommerce. The catalogue worked, but every filter change was a full server round trip, which made browsing on a phone feel broken.",
    challenge:
      "Shoppers browse by wandering. Every filter that costs a page load is a chance to lose them — but the catalogue still had to be crawlable, and the shop had to keep the WooCommerce layout staff already knew how to manage.",
    approach: [
      "Keep the WooCommerce archive exactly: sidebar filter widgets, result count, ordering select, product grid with ratings and sale flashes.",
      "Render the full catalogue server-side for crawlers, then hydrate filtering and sorting into client state.",
      "Filter, sort and total the cart in memory so results update on the same frame as the click.",
      "Reserve every product image's space up front, so the grid never reflows mid-scroll.",
    ],
    outcome: [
      { label: "Filter response", value: "<16ms", note: "one frame, no round trip" },
      { label: "Catalogue indexable", value: "Yes", note: "server-rendered before hydration" },
      { label: "Cumulative Layout Shift", value: "0.00", note: "images reserve their space" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
