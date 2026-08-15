/**
 * The portfolio's case studies. Each one points at a live demo site that lives
 * under /work/<slug> in this same app, so every project links to something real.
 *
 * Three of them — Lumen Café, USA Equipment and AnonChat — were drafted in a
 * design tool and rebuilt here against measured tokens. AnonChat is the only one
 * with a real database behind it; the rest are static by design. Three more
 * reproduce a WordPress layout — a theme with a pricing plugin, a wp-admin
 * plugin screen, and a WooCommerce shop archive — but are built as static
 * Next.js rather than PHP. The copy says so plainly: the point is that the
 * familiar layout does not require the weight that usually comes with it.
 *
 * The Bindery is the exception to all of it, deliberately. It is the only
 * project here that spends weight instead of saving it, and its case study is
 * mostly an argument about when that is allowed.
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
      "An art-directed café site with a working shop — variants, a basket that survives navigation, and a checkout that reprices on the server. No payment provider, by design.",
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
      "Keep the basket in a module-level store rather than React state, so it survives navigation and reloads — and reprice the whole order on the server at checkout, because a cart is client state and client state is editable by whoever holds it.",
    ],
    outcome: [
      { label: "Animation library", value: "0KB", note: "CSS keyframes and one observer" },
      {
        label: "Contrast failures fixed",
        value: "4",
        note: "found by measuring, not by eye",
      },
      {
        label: "Prices trusted from the browser",
        value: "0",
        note: "checkout reprices from the catalogue",
      },
    ],
  },
  {
    slug: "usa-equipment",
    name: "USA Equipment Co.",
    kind: "Equipment yard, designed then built",
    summary:
      "A rental-and-sales yard site: live unit status, a fleet you can filter in a frame, and a quote list that survives navigation — with the menus, mobile nav and tabs all built without JavaScript.",
    year: "2026",
    stack: ["Next.js", "Server Components", "Tailwind CSS"],
    accent: "#e8af12",
    brief:
      "USA Equipment is a locally owned yard in Magnolia, Texas, renting and selling to contractors, cities and walk-ins. They wanted the site to feel like the yard does — painted steel, stencilled unit numbers, hazard tape — and to answer the only two questions a customer actually has: do you have it, and can I pick it up today.",
    challenge:
      "The design came out of an AI design tool as a single HTML prototype: four screens behind one component's state, every colour inline, and three Google Fonts loaded over the network. It looked right. Measured, its palette failed contrast in four places — including the ON RENT amber at 3.00:1, which is the one status a renter most needs to read, and a focus ring in hazard yellow at 1.35:1 against the ground.",
    approach: [
      "Rebuild the four screens as four real routes rather than one component switching on state, so every unit has a URL, the catalogue is crawlable, and the back button works.",
      "Correct the palette against the darker of the two grounds each colour lands on, since a status appears on both white cards and the concrete page — the meta grey from 2.83:1 to 4.76:1, ON RENT from 3.00:1 to 4.89:1, IN YARD from 4.38:1 to 4.93:1, and the focus ring from hazard yellow to ink, keeping the yellow only on the navy bands where it reads at 9.9:1.",
      "Build the mega menus on :hover and :focus-within, the mobile menu as a native <details>, and the unit tabs on :target — so the entire chrome ships no JavaScript, the tabs are deep-linkable, and the back button steps through them.",
      "Render the whole fleet server-side and hydrate only the filtering, so a crawler and a reader with no JavaScript both get the full catalogue while a chip click repaints on the same frame.",
      "Keep the quote list in a module-level store rather than React state, so units added on any page survive navigation and a reload — and re-resolve every unit number against the fleet inside the Server Action, because a request describing the yard's own inventory back to it is not something to take on trust.",
      "Leave every rate as an em dash. A rental rate depends on term, delivery radius and waiver, and an invented number is worse than no number — so the demo says so rather than filling the gap.",
    ],
    outcome: [
      {
        label: "JavaScript in the chrome",
        value: "0KB",
        note: "menus, mobile nav and tabs are CSS",
      },
      {
        label: "Contrast failures fixed",
        value: "4",
        note: "found by measuring, not by eye",
      },
      {
        label: "Invented prices shown",
        value: "0",
        note: "rates are blank until the yard sets them",
      },
    ],
  },
  {
    slug: "anonchat",
    name: "AnonChat",
    kind: "Ephemeral social app on Postgres",
    summary:
      "A social feed and private messenger where nothing survives a day — posts, conversations and the account itself are deleted 24 hours after they are made. The retention rule is enforced by the database on a schedule, not by asking people to trust a privacy policy.",
    year: "2026",
    stack: ["Next.js", "Supabase", "Postgres", "Server Actions"],
    accent: "#2563eb",
    brief:
      "The design came out of Figma Make as a single-file React prototype — a feed and a messages tab switching on component state, every post hard-coded. The ask was to make it real, and then to make it forget: give it a database, let people sign in, and have the whole account evaporate a day later.",
    challenge:
      "Everything interesting about a social app is an authorisation question, and authorisation written in the interface is decoration — hiding a Messages tab means nothing if the data was already fetched into the page. Expiry has the same problem twice over: an app that claims to delete things and only hides them is worse than one that never promised. And a deadline enforced only on read leaves the rows sitting there, while a deadline enforced only by a sweep leaves an account live in the gap between expiring and being collected.",
    approach: [
      "Model it in Postgres — profiles, posts, comments, likes, conversations and direct messages — and hang every lifetime off one column so nothing can outlive the rule by being forgotten about.",
      "Put the access rules in row-level security, not the UI. The feed is world-readable, writes require an account and are checked against the caller's own profile, and the private tables refuse to send a single row to anyone who is not in the conversation — so the login gate is true rather than cosmetic.",
      "Route every write through a Server Action, so the session cookie stays httpOnly and the browser never holds a token to leak. The client sends intent; the database resolves who is asking.",
      "Enforce the 24 hours in both directions: reads filter on the deadline so an expired account stops existing the moment it lapses, and a scheduled sweep deletes the auth user — which cascades to the profile, the posts, the likes, the comments and both sides of every private conversation. Hiding without deleting would be a lie; deleting without hiding would leave a ten-minute window where a dead account can still post.",
      "Render the public feed on the server so a crawler and a reader with no JavaScript get the whole thing, and subscribe to realtime for anything newer. It renders per request rather than cached, because every row carries whether you liked it — a personalised feed has no one version to hand two people.",
      "Fall back to seed content when no Supabase project is configured, so the site still builds, still prerenders and still demonstrates the UI for anyone who clones it — and says plainly that it is read-only rather than pretending.",
    ],
    outcome: [
      {
        label: "Auth rules in the UI",
        value: "0",
        note: "the gate is a database policy",
      },
      {
        label: "Tokens in the browser",
        value: "0",
        note: "httpOnly cookie, writes via Server Actions",
      },
      {
        label: "Anything retained past a day",
        value: "0",
        note: "the account goes with the posts",
      },
    ],
  },
  {
    slug: "bindery",
    name: "The Bindery",
    kind: "Three.js shelf, built from a public brief",
    summary:
      "Seven clothbound volumes on a shelf you can browse, pull out, orbit and read — every surface drawn into a canvas at runtime, so the scene downloads no images at all. Four volumes are the work in this portfolio; three are bound and blank.",
    year: "2026",
    stack: ["Three.js", "WebGL", "Canvas 2D", "Next.js"],
    accent: "#7a2e36",
    brief:
      "Meng To published The Complete Shelf as an open build brief — a detailed spec for a Three.js library of hardcovers, explicitly inviting other people to build their own from it. This is that build, rebound around the four pieces of work worth putting on a shelf: Lumen Café, USA Equipment, AnonChat, and the portfolio itself.",
    challenge:
      "This site's whole argument is that most pages are four megabytes heavier than they need to be. Then it wants a 3D bookshelf, which is a WebGL renderer, a scene graph and a page of shaders — the single heaviest thing here by an order of magnitude. Either the demo is a hypocrisy, or the argument was never 'small at all costs' but 'nothing you did not choose'. It only survives as the second if the weight is quarantined, declared, and the content is readable without any of it.",
    approach: [
      "Serve the whole collection as server-rendered HTML underneath the canvas — every volume, every spread, every word printed inside the books. The 3D scene is a way of reading that page, not the only way; a crawler, a reader with JavaScript off and a browser with WebGL disabled all get the same content.",
      "Draw every surface at runtime into a 2D canvas from a seeded PRNG — cloth weave, foil stamp, paper grain, page edges, endpapers, shelf timber, contact shadows. Nothing is a downloaded image, so a scene this dense adds no network requests, and the same seed always draws the same book.",
      "Fake foil with maps instead of geometry: the stamp is drawn in its own colour, and a matching black-and-white mask drives metalnessMap and roughnessMap so only the stamped areas take a highlight while the cloth stays dead matte.",
      "Never reparent the selected volume. The brief warns about the last-frame jump when a book moves between the shelf and an inspection scene graph — the cheapest way not to have that bug is not to make that move, so books stay in one group for their whole life and the camera travels instead.",
      "Separate the two kinds of motion. Shelf-to-detail transitions are timed tweens that write their exact endpoint on the final frame; hover, cover angle and page settle are exponential smoothing on 1 − exp(−k·dt) with an epsilon snap. A per-frame lerp is neither, and it is why 3D scenes feel wrong on a 144Hz monitor.",
      "Write the orbit controller rather than importing one. The scene needs orbit, pan and zoom around a single object, which is about seventy lines — OrbitControls is a dependency that would have to argue for its place, and on this page of all pages it loses.",
      "Keep the reading panel near-black with white text and use each volume's foil colour only as an accent rule, so the interface contrast is fixed regardless of which book is selected. Theming the panel from the cloth is how the other case studies here ended up with contrast failures.",
    ],
    outcome: [
      {
        label: "Images downloaded",
        value: "0",
        note: "every texture is drawn at runtime",
      },
      {
        label: "Three.js, gzipped",
        value: "139KB",
        note: "its own chunk, on this route and no other",
      },
      {
        label: "Content behind WebGL",
        value: "None",
        note: "the collection is server-rendered HTML",
      },
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
