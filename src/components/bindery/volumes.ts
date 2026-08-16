/**
 * The seven volumes on the shelf.
 *
 * Four are bound and titled — the three demos in this portfolio that were
 * designed and then built, plus the site itself. The remaining three are
 * deliberately blank: cloth, headbands and endpapers with no foil, no title
 * and no spine text. They are not placeholders that someone forgot to fill in,
 * and the detail panel says so. A shelf with room left on it is a truer
 * picture of a body of work than a shelf padded out to look full.
 *
 * Cloth colours are each project's real accent, darkened to the tone a dyed
 * book cloth actually takes — a screen accent at full saturation reads as
 * plastic under studio lighting.
 */

import { siteConfig } from "@/lib/site-config";

export type Spread = {
  /** Running head, printed small above the text block. */
  heading: string;
  /** Body copy for the spread. Kept short — this is a book, not a document. */
  body: string;
};

export type Volume = {
  /** Case-study slug, or null when the volume is unwritten. */
  slug: string | null;
  /** Where the "read the case study" link goes. */
  href: string | null;
  title: string;
  subtitle: string;
  /** Set on the spine. Shorter than the title where the title would not fit. */
  spine: string;
  /** One paragraph in the detail panel. */
  blurb: string;
  /** Printed on the colophon page and in the panel's specification list. */
  binding: string;
  year: string;
  /** Physical proportions in scene units. Every volume differs. */
  size: { width: number; height: number; depth: number };
  cloth: string;
  /** Foil stamp colour. Null on the unwritten volumes — they carry no stamp. */
  foil: string | null;
  paper: string;
  ink: string;
  /** Drives the abstract cover motif. Same seed always draws the same mark. */
  seed: number;
  spreads: readonly Spread[];
};

const UNWRITTEN_BLURB =
  "This volume is bound but unwritten. It has cloth, boards, headbands and endpapers, and no title — the shelf was built with room on it rather than padded out to look full. The next project to come through the studio gets this slot.";

export const volumes: readonly Volume[] = [
  {
    slug: "lumen-cafe",
    href: "/projects/lumen-cafe",
    title: "Lumen Café",
    subtitle: "An editorial site with a shop attached",
    spine: "Lumen Café",
    blurb:
      "A twelve-seat coffee bar in Poblacion, drafted in a design tool and rebuilt against its own tokens. The palette failed contrast in four places and a day-of-week lookup resolved two days to the wrong rows; both were found by measuring rather than by eye.",
    binding: "Quarter cloth over boards, foil stamp, sewn",
    year: "2026",
    size: { width: 1.32, height: 1.92, depth: 0.3 },
    cloth: "#9c4517",
    foil: "#f0d9a8",
    paper: "#f6efe3",
    ink: "#2b1a10",
    seed: 1041,
    spreads: [
      {
        heading: "The brief",
        body: "They wanted a site that looked like the room does — photographic, unhurried, confident — and that told you whether they were open right now without making you read a table.",
      },
      {
        heading: "Contrast",
        body: "One accent cannot be both a legible body colour and a rich fill. It was split in two: a fill tone for display type, and a darker text tone that clears 4.5:1 at body size in both themes.",
      },
      {
        heading: "The basket",
        body: "Cart state lives in a module-level store, so it survives navigation and reload. Checkout reprices the whole order on the server, because a cart is client state and client state is editable by whoever holds it.",
      },
      {
        heading: "Motion",
        body: "Every animation is a CSS keyframe driven by one shared observer. A single reduced-motion rule stops all of it, and nothing can be stranded invisible.",
      },
    ],
  },
  {
    slug: "usa-equipment",
    href: "/projects/usa-equipment",
    title: "USA Equipment Co.",
    subtitle: "A yard that answers the only two questions",
    spine: "USA Equipment",
    blurb:
      "A rental-and-sales yard in Magnolia, Texas. The design arrived as a single HTML prototype with four screens behind one component's state; it became four real routes, and its palette was corrected against the darker of the two grounds each colour actually lands on.",
    binding: "Full cloth over boards, blind and foil stamp, sewn",
    year: "2026",
    size: { width: 1.44, height: 2.04, depth: 0.36 },
    cloth: "#1c2836",
    foil: "#e8af12",
    paper: "#f2efe6",
    ink: "#16202b",
    seed: 2270,
    spreads: [
      {
        heading: "The brief",
        body: "Painted steel, stencilled unit numbers, hazard tape — and an answer to the only two questions a contractor has. Do you have it, and can I pick it up today.",
      },
      {
        heading: "ON RENT at 3.00:1",
        body: "The status a renter most needs to read was the one that failed hardest. It went to 4.89:1. The focus ring left hazard yellow for ink, keeping the yellow only on navy bands where it reads at 9.9:1.",
      },
      {
        heading: "Chrome without JavaScript",
        body: "Mega menus on :hover and :focus-within, the mobile menu as a native <details>, unit tabs on :target. The tabs are deep-linkable and the back button steps through them.",
      },
      {
        heading: "Blank rates",
        body: "Every rate is an em dash. A rental rate depends on term, delivery radius and waiver — an invented number is worse than no number, so the demo shows none.",
      },
    ],
  },
  {
    slug: "anonchat",
    href: "/projects/anonchat",
    title: "AnonChat",
    subtitle: "Nothing here survives a day",
    spine: "AnonChat",
    blurb:
      "A feed and private messenger on Postgres where posts, conversations and the account itself are deleted twenty-four hours after they are made. The rule is enforced by row-level security and a scheduled sweep, not by a privacy policy asking to be believed.",
    binding: "Full cloth over boards, foil stamp, sewn, no dust jacket",
    year: "2026",
    size: { width: 1.26, height: 1.86, depth: 0.42 },
    cloth: "#1c3372",
    foil: "#cfd9f5",
    paper: "#f4f5f8",
    ink: "#131a2b",
    seed: 3388,
    spreads: [
      {
        heading: "The brief",
        body: "A single-file React prototype with every post hard-coded. Make it real, then make it forget: give it a database, let people sign in, and have the whole account evaporate a day later.",
      },
      {
        heading: "The gate is a policy",
        body: "Authorisation written in the interface is decoration. Hiding a Messages tab means nothing if the rows were already fetched. The private tables refuse to send a single row to anyone not in the conversation.",
      },
      {
        heading: "Both directions",
        body: "Reads filter on the deadline, so an expired account stops existing the moment it lapses. A sweep deletes the auth user, which cascades to everything it wrote. Either one alone is a lie in one direction.",
      },
      {
        heading: "No tokens in the browser",
        body: "Every write routes through a Server Action, so the session stays in an httpOnly cookie. The client sends intent; the database resolves who is asking.",
      },
    ],
  },
  {
    slug: null,
    href: "/",
    title: "ECOmissions",
    subtitle: "The lightest site that still does the job",
    spine: "ECOmissions",
    blurb:
      "The portfolio this shelf sits inside. It reads its own transfer size out of the Performance API as it loads, so the number in the hero is measured rather than typed — including on this page, which is the heaviest thing here by a wide margin.",
    binding: "Full cloth over boards, foil stamp, sewn, open spine",
    year: "2026",
    size: { width: 1.38, height: 1.98, depth: 0.33 },
    cloth: "#14563a",
    foil: "#9fe3c0",
    paper: "#f1f4ef",
    ink: "#0d1a13",
    seed: 4155,
    spreads: [
      {
        heading: "Ship less",
        body: "The fastest request is the one never made. Every dependency has to argue for its place in the bundle, and most of them lose. This volume is the argument that lost — see the colophon.",
      },
      {
        heading: "Render early",
        body: "Content belongs in the HTML. If a page needs JavaScript to show its own words, it is broken for anyone on a bad connection.",
      },
      {
        heading: "Measure honestly",
        body: "On a mid-range Android over throttled 4G, not on a laptop plugged into fibre. The second number is the one that lies.",
      },
      {
        heading: "Leave it maintainable",
        body: "Plain patterns a future developer can read without a tour. Cleverness is a cost the next person pays.",
      },
    ],
  },
  {
    slug: null,
    href: null,
    title: "Unwritten",
    subtitle: "Volume five",
    spine: "",
    blurb: UNWRITTEN_BLURB,
    binding: "Full cloth over boards, unstamped",
    year: "—",
    size: { width: 1.2, height: 1.8, depth: 0.26 },
    cloth: "#6f6a60",
    foil: null,
    paper: "#efece5",
    ink: "#2a2823",
    seed: 5012,
    spreads: [],
  },
  {
    slug: null,
    href: null,
    title: "Unwritten",
    subtitle: "Volume six",
    spine: "",
    blurb: UNWRITTEN_BLURB,
    binding: "Full cloth over boards, unstamped",
    year: "—",
    size: { width: 1.29, height: 1.74, depth: 0.31 },
    cloth: "#8a8378",
    foil: null,
    paper: "#efece5",
    ink: "#2a2823",
    seed: 6023,
    spreads: [],
  },
  {
    slug: null,
    href: null,
    title: "Unwritten",
    subtitle: "Volume seven",
    spine: "",
    blurb: UNWRITTEN_BLURB,
    binding: "Full cloth over boards, unstamped",
    year: "—",
    size: { width: 1.16, height: 1.88, depth: 0.24 },
    cloth: "#55524b",
    foil: null,
    paper: "#efece5",
    ink: "#2a2823",
    seed: 7034,
    spreads: [],
  },
];

/** True when the volume carries no title, foil or text. */
export function isUnwritten(volume: Volume) {
  return volume.foil === null;
}

/** The four bound volumes, in shelf order. */
export const writtenVolumes = volumes.filter((volume) => !isUnwritten(volume));

/**
 * The single volume the home page scrolls through.
 *
 * The shelf demo gives every project its own book. The landing page is a
 * different job: one book, one spread per project, turned by the scrollbar. So
 * this is a compilation — bound in the studio's own cloth, with the four
 * projects as its pages. The three unwritten volumes are deliberately not in
 * it. On a shelf they read as room for more work; in a scroll they would be
 * three empty screens between the last project and the end.
 */
export const portfolioVolume: Volume = {
  slug: null,
  href: "/projects",
  title: "Selected Work",
  subtitle: `${siteConfig.brand} · ${writtenVolumes.length} projects`,
  spine: "Selected Work",
  blurb: "Four projects, each one a working site rather than a screenshot. Turn the pages.",
  binding: "Full cloth over boards, foil stamp, sewn",
  year: "2026",
  size: { width: 1.4, height: 2.0, depth: 0.34 },
  cloth: "#14563a",
  foil: "#9fe3c0",
  paper: "#f1f4ef",
  ink: "#0d1a13",
  seed: 9017,
  spreads: writtenVolumes.map((volume) => ({
    heading: volume.title,
    body: volume.blurb,
  })),
};
