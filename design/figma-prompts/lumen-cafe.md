# Figma prompt — Lumen Café

**Front end only.** Figma Make builds the complete, working site; the back end
gets attached afterwards. The *Data layer* section is the part that makes that
possible — it keeps content and writes in one place instead of scattered through
components.

Paste everything below the `---` into Figma Make as one prompt, in a **new file**
(the earlier run only produced the style guide and components).

Notes for us, not for Figma:

- Palette is contrast-corrected. The first run shipped `#8A7C6E` secondary text
  at 3.54:1 on bone, and `#C8551B` as link text at 3.85:1 — both under the 4.5:1
  the brief asked for. Fixed values are in the art direction below.
- Also fixed: the first run used `font-mono` for prices with no mono font in the
  system. The constraint now says so explicitly.
- Photography already exists in `src/app/work/lumen-cafe/media/`. The prompt
  keeps every image URL in the content file, so swapping the placeholders for
  the real files is a one-file edit.
- The open/closed indicator is the one genuinely dynamic thing on this site, and
  it is a classic hydration trap. The prompt handles it deliberately.

---

Build the complete front end for **Lumen Café**, a twelve-seat specialty coffee
bar in Poblacion, Makati. Not a mockup — a working site in React and TypeScript:
every page, real navigation, a real journal, a working enquiry form, running
entirely on local mock content.

A back end will be attached later. Follow the **Data layer** rules exactly; they
are what make that possible.

## Order of work

1. The token and component layer — colour, type, spacing, components.
2. The data layer — types, content, and the async accessors.
3. The pages, consuming both.

Do not use a colour, type size or spacing value that is not in the token file.

## The place, in its own words

Twelve seats, one espresso machine, and beans roasted eight kilometres away.
Open at seven every morning; batch brew is free to refill before ten. The kitchen
closes an hour before the café does and the last coffee goes out fifteen minutes
before close. Opened in 2021 by Mariel, who still does every Tuesday roast
herself. Dan runs the bar. Joy bakes the sourdough before the doors open.

The voice is plain, specific and unsentimental. Never write marketing copy — no
"artisanal", no "passion", no "journey". Short declarative sentences that tell
you something true. "There is no parking out front. The lot behind the building
is free after 18:00."

## Data layer — follow this exactly

**Every rule here exists so real content and a real inbox can replace the mock
data without any component changing.**

Types in `src/data/types.ts`:

```ts
export type MenuItem = {
  id: string;            // slug, e.g. "flat-white"
  name: string;
  note: string;          // one line
  price: number;         // whole pesos — an integer, no symbol
  image?: string;
  imageAlt?: string;
};

export type MenuSection = {
  id: "espresso" | "filter" | "kitchen";
  title: string;
  note: string;
  image: string;
  imageAlt: string;
  items: MenuItem[];
};

/** One row per weekday. `null` means closed that day. */
export type DayHours = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; opens: string; closes: string } | null;

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  date: string;          // ISO 8601
  category: "Coffee" | "News" | "Kitchen";
  tags: string[];
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  body: Block[];
};

export type Comment = {
  id: string;
  postSlug: string;
  author: string;
  date: string;          // ISO 8601
  body: string;
  replyTo?: string;      // id of the comment being replied to
};

export type EnquiryDraft = {
  name: string;
  email: string;
  subject: "General" | "Large order" | "Private hire" | "Working here";
  message: string;
};

export type Enquiry = EnquiryDraft & { id: string; sentAt: string };
```

Content in `src/data/content.ts` — menu, hours, posts, comments, team, address.
**No component may contain content.** Every image URL lives here too, so the
photography can be swapped in one file.

Reads and writes in `src/data/api.ts`, **async even though they return mock data
today** — that is the whole point, so swapping in a real source later changes
nothing above them:

```ts
export async function getMenu(): Promise<MenuSection[]>
export async function listPosts(): Promise<Post[]>
export async function getPost(slug: string): Promise<Post | null>
export async function listComments(postSlug: string): Promise<Comment[]>
export async function sendEnquiry(draft: EnquiryDraft): Promise<Enquiry>
```

Money formats through one helper, `formatPeso(n)`. Never inline a `₱`.

Components take data as **props** and never import `content.ts` directly. Keep
routing out of them — a component should not know what page it is on.

Do **not** add authentication, a database, an email service, or any network call.
`sendEnquiry` resolves with a mock result after a short delay. Leave those seams
empty and clearly marked.

### The open/closed indicator — read this carefully

The header and home page show whether the café is open right now. Build it as a
**pure function** in `src/lib/hours.ts`:

```ts
export function getOpenState(hours: DayHours[], now: Date): {
  open: boolean;
  closesAt?: string;   // "18:00", when open
  opensAt?: string;    // "07:00 tomorrow", when closed
};
```

It takes `now` as an argument — it must never read the clock itself, so it can be
tested and so the server and the browser cannot disagree about it.

Render it **only after mount**, on the client. Before that, show the plain
opening hours instead. Computing "Open now" during server rendering bakes the
build-time answer into the HTML and it is wrong for every visitor afterwards.
Times are Asia/Manila regardless of the visitor's timezone.

## The content

**Hours** — Mon–Thu 7:00–18:00 · Fri 7:00–22:00 · Sat 8:00–22:00 · Sun 8:00–16:00
**Address** — 114 Kalayaan Avenue, Poblacion, Makati, Metro Manila 1210

**Menu.** Espresso: Espresso ₱110 (single origin, rotating), Cortado ₱140 (two
parts milk), Flat white ₱165 (our house blend), Latte ₱170 (hot or over ice),
Mocha ₱185 (70% dark, not sweet). Filter: Pour over ₱180 (V60, brewed to order),
Cold brew ₱175 (18-hour steep), Batch brew ₱120 (free refill before 10am), Filter
flight ₱280 (three origins, 90ml each). Kitchen: Sourdough & cultured butter
₱150, Ham & gruyère toastie ₱285, Ricotta toast ₱240 (honey, thyme, lemon),
Almond croissant ₱165 (weekends only), Banana bread ₱140 (toasted, with butter).
Retail: a 250g bag of whatever is on the grinder, ₱620.

**Team.** Mariel — owner and roaster, opened Lumen in 2021 after five years
roasting for other people. Dan — head barista, runs the bar most mornings, and
the filter flight was his idea. Joy — kitchen, bakes the sourdough and the banana
bread before the doors open.

**Journal.** Six posts. Write full bodies in the voice above, using the block
types. Titles and dates:

- "This month we are pouring a washed Benguet" — 4 March 2026, Coffee
- "The kitchen is open an hour later on Fridays" — 18 February 2026, News
- "Why the batch brew is free to refill before ten" — 2 February 2026, Coffee
- "We are closed on the 25th" — 14 January 2026, News
- "A short guide to ordering here, if it is your first time" — 3 January 2026, Kitchen
- "The new grinder, and why the queue got shorter" — 8 December 2025, Coffee

Give the first post a small thread of comments including one reply, so the
threading is visible. The others can have none.

## Art direction

Editorial and confident, warm rather than clinical. Big type, big pictures, a lot
of air, one loud accent.

- **Palette.** Espresso near-black `#16110E` on bone `#F4EFE7`. Secondary text
  `#776B5F`. Burnt orange as the single accent, in two tones because one cannot
  do both jobs legibly: `#C8551B` for large display type and filled areas, and
  `#B64D19` when the accent is body-sized text or a link. In dark mode secondary
  text is `#8A7C6E` and the accent text tone is `#CA5C24`. Design dark-on-bone
  first, then invert for a full dark mode from the same tokens. Also derive and
  name a recessed surface fill and a hairline border tone. No third colour — the
  accent earns its power by being rare.
- **Type.** *Instrument Serif* for headings against *Inter Tight* for everything
  else. Display genuinely large: 96–160px desktop hero, 40–56px mobile. Body
  17–18px at 1.6. Prices in tabular figures.
- **Layout.** 12 columns, 1440px frame, 80px margins, 24px gutters, 8pt spacing.
  Break the grid deliberately two or three times — a full-bleed image, a heading
  running off the right edge — so the rhythm has a shape.
- **Photography.** Warm, low-light, shallow depth of field: the bar with the
  espresso machine and chalkboards, milk poured into a rosetta, pour-over brewers
  mid-pour, croissants in the case, a sliced sourdough loaf, a ring of cupping
  bowls, the room from the window seats. Photography carries the site; it is
  never decoration in a box.
- **Detail.** Hairline rules, small-caps labels with wide tracking for section
  numbering (`01 — MENU`), sharp corners. No drop shadows, no glassmorphism, no
  gradient blobs.

## Pages

**Home.** Full-viewport opening: the café name in display type over a dark
photograph of the bar, with the open/closed indicator and the address. Then, on
scroll: a statement section revealing line by line; a horizontally scrolling
strip of signature drinks with prices; "Twelve seats" told through three large
numbers (12 seats, 8km to the roastery, 2021); a featured panel for the washed
Benguet on the grinder; two journal teasers; a closing block with hours, address
and a large call link.

**Menu.** Three sections, each opening with a full-bleed photograph and a sticky
section label that holds while its items scroll past. Items as generous editorial
rows: name, note, price, and a photograph that scales up on hover. Ends with the
retail beans note.

**About.** The story, the roastery, and the three people as large portraits with
pull quotes — not a card grid.

**Visit.** Address, hours as a table with today's row marked, a dark styled map,
getting-here notes, and the enquiry form. The form validates inline, calls
`sendEnquiry`, shows a pending state, then a confirmation. Make it obvious in the
UI that nothing is actually delivered yet.

**Journal.** An index of the six posts with pagination at three per page, and an
article template: full-bleed lead image, generous measure, pull quotes, tags, a
comment thread with threading, older/newer navigation. The comment form is
present and labelled but does not submit — mark that seam clearly.

## Motion and interaction

- Scroll-driven headline reveals, word by word out of a mask
- A pinned horizontal scroll section on the menu, driven by vertical scroll
- Parallax on full-bleed photography, no more than 15% travel
- A sticky section label that swaps as you pass each menu section
- Magnetic hover on primary buttons; images scaling slightly under the cursor
- A slim scroll-progress rule at the top of the viewport
- Page transitions: a warm wipe over the viewport between routes
- A slow marquee of café notices, pausing on hover

Easing `cubic-bezier(0.22, 1, 0.36, 1)`, 600–900ms for reveals, 200–300ms for
hover. Nothing bounces.

## Constraints

- Desktop and mobile for every page. Mobile is not a squeeze — rework the hero
  type, collapse the horizontal menu section into a vertical list, give the nav a
  full-screen overlay.
- Body text 4.5:1 and large display 3:1, on both themes. Visible focus ring on
  every control. Honour `prefers-reduced-motion`: every scroll animation, the
  marquee and the page wipe must stop, and no content may depend on motion to
  become visible.
- Under a 500KB page budget. Two font families, three weights, **no monospace** —
  prices are the sans with tabular figures. No WebGL, no video, no particles;
  every effect reachable with CSS and scroll position.

## Deliver

1. A token file and a style page rendering it
2. A component page: button, nav, menu row, form fields, article card, comment,
   pagination, footer — each with default, hover, focus, disabled and loading
   states
3. Every page above, working, at desktop and mobile
4. `src/data/types.ts`, `src/data/content.ts`, `src/data/api.ts` and
   `src/lib/hours.ts` exactly as specified

Name every token and component so I can refer to them later. At the end, list
every file you created and what belongs in it.
