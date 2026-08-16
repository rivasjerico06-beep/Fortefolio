# ECOmissions

A web-developer portfolio for **Jerico Rivas**, built with Next.js 16,
TypeScript, and Tailwind CSS v4.

The premise: every byte you ship burns someone else's electricity, so the site
is built to a page-weight budget and then _proves it_ — the hero and the pinned
scroll scene both read this page's real transfer size out of the Performance
API as it loads. Nothing about that number is typed in by hand.

The other half: **every case study links to a real, working demo site** hosted
in this same app under `/work/<slug>`. Nothing is a screenshot — you can filter
the catalogue, toggle the pricing, and read the dashboard.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Command                         | What it does                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`                   | Dev server with Turbopack and hot reload                                        |
| `npm run build`                 | Production build (every route prerenders except AnonChat, which is per-session) |
| `npm start`                     | Serve the production build                                                      |
| `npm run lint`                  | ESLint with the Next.js config                                                  |
| `npm run typecheck`             | TypeScript with no emit                                                         |
| `npm run format`                | Prettier, including Tailwind class sorting                                      |
| `npm run shots`                 | Visual smoke test — see below                                                   |
| `npm run test:demos`            | Interaction test — drives the demos for real                                    |
| `node scripts/motion-check.mjs` | Proves no animation can strand content invisible                                |

### Visual smoke test

`npm run shots` drives a real Chromium over every route with Playwright and
fails the run on console errors, non-200 responses, or horizontal overflow at
375px wide. It also writes desktop, mobile, and dark-mode screenshots to
`.screenshots/`.

```bash
npm run build && npm start     # terminal one
npm run shots                  # terminal two
```

It runs with reduced motion forced on, because the scroll reveal is a CSS
scroll-driven animation — a full-page capture would otherwise freeze every
off-screen section at `opacity: 0`.

### Interaction test

`npm run test:demos` backs up the claim that the demos are real. It filters and
sorts the Verde catalogue, adds to the cart and checks the arithmetic, flips the
Nimbus pricing toggle, opens the FAQ, hovers a chart to get a tooltip, and
confirms the theme toggle survives a reload. Same setup as above — build, start,
then run it against the running server.

## The motion layer

Everything animated lives in [`src/components/motion/`](src/components/motion/).

| Piece                    | What it does                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `scroll-engine.tsx`      | Lenis smooth scrolling + the one IntersectionObserver that fires every reveal                      |
| `reveal.tsx`             | `<Reveal>` (fade/slide/clip/blur/scale, with stagger) and `<WordRise>` (per-word masked hero text) |
| `scrub-text.tsx`         | Pinned statement whose words light up one by one as you scroll                                     |
| `horizontal-gallery.tsx` | Pinned section whose work panels slide sideways as you scroll down                                 |
| `weight-scene.tsx`       | Pinned scene where bars fill and numbers count from scroll progress                                |
| `stack-cards.tsx`        | Cards that pile up on each other — pure CSS `sticky`, no JavaScript                                |
| `parallax.tsx`           | Moves its children at a different rate to the page                                                 |
| `magnetic.tsx`           | Buttons that lean toward the cursor                                                                |
| `counter.tsx`            | Numbers that count up when scrolled into view                                                      |
| `marquee.tsx`            | Seamless CSS ticker                                                                                |
| `scroll-progress.tsx`    | Hairline progress bar under the header                                                             |
| `page-weight.tsx`        | The live "this page weighs N KB" readout                                                           |

All the scroll-driven scenes share [`src/lib/scroll.ts`](src/lib/scroll.ts) —
**one** `scroll` listener and **one** animation frame for the whole page, with
every scene painting in the same batched frame. Adding a sixth scene does not
add a sixth listener.

**The rule that governs all of it: content is visible in the server HTML, and
the hidden starting state only exists under a `.js` class** that an inline head
script adds before the body paints. No JavaScript, a failed hydration, or
`prefers-reduced-motion` all yield a complete, readable page. The head script
also arms a 2.5-second failsafe that strips `.js` again if the engine never
mounts, so a crash cannot leave the site blank.

`node scripts/motion-check.mjs` exists to keep that honest. It asserts the hero
settles at full opacity with JS on, that everything is visible with JS **off**,
that reduced motion leaves zero elements under full opacity, and that the pinned
scene's progress really is driven by scroll position.

### How the pinned scroll scene works

This is the pattern behind most "product page" scroll animations, and it is
only three ideas:

1. A tall outer wrapper (`h-[280vh]`) reserves the scroll distance.
2. An inner `sticky top-0 h-screen` panel stays put while you scroll past it.
3. The wrapper's `getBoundingClientRect().top` becomes a 0→1 progress number,
   and every animated property is a function of it.

Progress is written to the DOM as CSS custom properties, **not** React state —
a state update per scroll frame would re-render the subtree 60 times a second.

## Making it yours

Almost everything personal lives in **[`src/lib/site-config.ts`](src/lib/site-config.ts)** —
name, role, tagline, email, social links, nav, skills, and services. Edit that
one file and the whole site follows.

Case studies live in **[`src/lib/projects.ts`](src/lib/projects.ts)**. Each entry
drives its card, its case-study page at `/projects/<slug>`, and its footer link.
If you add a project, add a matching demo page at `src/app/work/<slug>/page.tsx`
or drop the "Live demo" link.

Before deploying, set `siteConfig.url` to your real domain — it feeds
`metadataBase`, `sitemap.xml`, and `robots.txt`.

## Structure

```
src/
  app/
    (site)/          portfolio pages — share the header, footer, and theme
      page.tsx       home
      about/         about
      projects/      work index and [slug] case studies
      contact/       contact form
    work/            the demo sites — no portfolio chrome, own identity each
      lumen-cafe/    local-business marketing site
      usa-equipment/ equipment yard: fleet, unit pages, quote list
      anonchat/      social feed + chat, on Supabase Postgres
      bindery/       Three.js shelf of clothbound volumes
      nimbus/        SaaS landing page with interactive pricing
      atlas/         analytics dashboard, charts hand-built in SVG
      verde/         storefront with live filtering and a cart
    layout.tsx       <html>, fonts, pre-paint theme script
    globals.css      design tokens for both themes
  components/        header, footer, theme toggle, cards, reveal
    bindery/         the book engine — geometry, textures, the scrolled book
    motion/          the scroll/animation layer (see below)
    wp/              the WordPress theme kit the other three demos are built from
  lib/               site config, project data, cn() helper
scripts/
  screenshot.mjs     the visual smoke test
  interactions.mjs   the demo interaction test
  motion-check.mjs   proves the animations can never hide content
```

The `(site)` route group exists so the demos can opt out of the portfolio
header and footer while still sharing the root `<html>` document.

## The demo sites

**Lumen Café is an art-directed editorial site.** It was designed in Figma Make
from the brief in [`design/figma-prompts/lumen-cafe.md`](design/figma-prompts/lumen-cafe.md)
and rebuilt here — see [its own section below](#lumen-café).

**USA Equipment Co. is a rental-and-sales yard.** It came out of an AI design
tool as a single HTML prototype and was rebuilt here as real routes — see
[its own section below](#usa-equipment-co).

**AnonChat is the one demo with a real database.** A social feed and chat client
on Supabase, where the login gate is a row-level security policy rather than a
hidden tab — see [its own section below](#talkapo).

**The Bindery is the one that spends weight instead of saving it.** A Three.js
shelf of seven clothbound volumes — four of them the work above, three left
bound and blank — where every surface is drawn into a canvas at runtime rather
than downloaded. It was built from a public brief and it is the exception this
site's whole argument has to survive; see [its own section below](#the-bindery).

The other three still reproduce a layout clients recognise — a theme with a
pricing plugin, a wp-admin plugin screen, and a WooCommerce shop archive — but
they are **static Next.js, not PHP**, and the case studies say so. That is the
point rather than a caveat: the familiar layout without the weight that normally
comes with it. Each is queued for the same treatment Lumen just had; the briefs
are written and waiting in `design/figma-prompts/`.

They share one kit in [`src/components/wp/`](src/components/wp/). Each demo
passes a `WpTheme` of CSS custom properties, which is how WordPress itself works
— one theme framework, different customiser settings — so four different-looking
sites run off the same components.

The nav dropdowns are CSS-only and the mobile menu and FAQ are native
`<details>`, so the chrome ships **no JavaScript at all**. Headings use a system
serif, so no webfont is downloaded for the period look.

### Lumen Café

An editorial site rather than a theme rebuild: full-bleed photography, display
type, a pinned horizontal strip, and a live open/closed indicator. Three things
in it are worth knowing about.

**The palette is measured, not eyeballed.** The first Figma pass produced
secondary text at 3.54:1 and accent links at 3.85:1 against the bone background —
both under the 4.5:1 the brief asked for. The corrected tokens are in the
`.lumen` block of [`globals.css`](src/app/globals.css), and the accent exists in
two tones because one colour cannot be both a legible body-text colour and a rich
fill. Do not collapse them back into one.

**The open/closed state never renders on the server.** `getOpenState` in
[`hours.ts`](src/app/work/lumen-cafe/hours.ts) is pure and takes `now` as an
argument, and the indicator resolves through `useSyncExternalStore` with a server
snapshot of "unknown". Rendering it during the build would stamp the build-time
answer into static HTML — a café permanently claiming to be open at 2am. The same
applies to the "today" marker in the hours table.

That file also carries a comment about weekday lookups keyed on the _narrow_
format. Do not switch back to it: `Intl` gives "S" for both Sunday and Saturday
and "T" for both Tuesday and Thursday, so a lookup table keyed on it silently
collides and resolves two days a week to the wrong row.

**The shop is real, and the checkout does not trust the browser.** The basket
lives in a module-level store
([`cart-store.ts`](src/app/work/lumen-cafe/shop/cart-store.ts)) read through
`useSyncExternalStore`, not React state — so it survives navigation and reloads,
the server snapshot is explicitly empty, and nothing loads persisted state inside
an effect.

At checkout the browser sends only what was chosen: slug, options, quantity, and
**no prices at all**. `placeOrder` in
[`actions.ts`](src/app/work/lumen-cafe/actions.ts) reprices every line from the
catalogue and re-checks stock. This is the one thing in the whole demo that would
be a security bug rather than a cosmetic one if it were done the easy way — a
checkout that bills the total it was handed can be told to charge zero. Do not
"simplify" it by sending the cart total.

There is deliberately no payment provider. The card fields are rendered
`disabled` with a note saying so, rather than faked.

**Other reads and writes are behind seams too.** [`api.ts`](src/app/work/lumen-cafe/api.ts)
is async even though it resolves local data, so moving the menu and journal to a
CMS touches that file and nothing else. The enquiry form posts to a Server Action
in [`actions.ts`](src/app/work/lumen-cafe/actions.ts) rather than a plain
function, which keeps every post body and image import out of the client bundle.

#### Photography

The café demo carries real photographs, in
[`src/app/work/lumen-cafe/media/`](src/app/work/lumen-cafe/media/). They are
**self-hosted, not hotlinked**, for three reasons: the demo makes no
third-party request, it still works with no network, and a static `import`
gives Next the file's real dimensions at build time — which is what lets
`next/image` reserve the correct box and generate the blur placeholder, so
nothing shifts as the page loads.

Only the featured image sets `preload`. Everything else lazy-loads on approach,
and each `<Image>` declares `sizes` so a phone downloads a phone-sized file
rather than a desktop one.

Photographs are from [Unsplash](https://unsplash.com), used under the
[Unsplash licence](https://unsplash.com/license), which permits commercial use
without attribution. Replacing them means dropping new files in that folder and
updating the imports at the top of
[`src/app/work/lumen-cafe/data.ts`](src/app/work/lumen-cafe/data.ts) — the alt
text lives beside each one, so it is hard to change a picture and forget its
description.

#### Motion

The looping motion — the slow pan on featured images, the notice bar, the
breathing open/closed dot, the scroll cue, the wash behind the statement — is all
CSS keyframes on decoration only, and no animation library is involved. That is
deliberate: the single `prefers-reduced-motion` rule at the foot of
[`src/app/globals.css`](src/app/globals.css) stops every one of them at once, and
none of them can hide content the way a JavaScript-driven reveal could. The
pinned horizontal strip reuses the same scroll module as the portfolio's gallery
via [`PinnedStrip`](src/components/motion/pinned-strip.tsx).

**One trap worth knowing about:** `src/app/work/atlas/charts.tsx` reads
`--series-*`, `--line`, `--ink-*` and `--surface` from the global theme. Because
the wp-admin screen is pinned to a fixed light palette, those variables are
re-declared on the Atlas demo's root with the light steps of the validated
categorical palette. Remove that block and the charts inherit dark-mode steps
against a light panel, quietly breaking their contrast validation.

### USA Equipment Co.

A rental-and-sales yard in Magnolia, Texas: hazard yellow on a concrete ground,
navy for the heavy bands, and mono for every number. It arrived as a handoff
bundle from Claude Design — one HTML prototype with four screens behind a single
component's state — and was rebuilt as four real routes. Four things in it are
worth knowing about.

**The chrome ships no JavaScript.** The mega menus are `:hover` and
`:focus-within` on a wrapper holding both the trigger and the panel, so focusing
a top-level link opens its panel and the whole thing is keyboard operable with
no handler. The mobile menu is a native `<details>`. The unit tabs run on
`:target` — which is why `…/equipment/LT-2214#terms` opens on the rental terms,
why they work with scripting off, and why the back button steps through them.
The rules live in the `.usaeq` block of [`globals.css`](src/app/globals.css); do
not "upgrade" them to state.

**The palette is measured, not eyeballed.** The prototype failed contrast in
four places against the ground each colour actually sits on: the mono meta grey
at 2.83:1, IN YARD at 4.38:1, ON RENT at 3.00:1, and a focus ring in hazard
yellow at 1.35:1 — which is not a focus indicator at all. Every status colour is
now checked against the **darker** of the two grounds it lands on, because a
badge appears on both white cards and the concrete page. The corrected values
and their ratios are in the same `.usaeq` block. The yellow ring survives only
on the navy bands, where it reads at 9.9:1.

**The catalogue is static and still filters instantly.** `/equipment` reads the
URL through `useSearchParams`, which cannot prerender — so it sits inside a
`<Suspense>` whose fallback is
[`StaticFleet`](src/app/work/usa-equipment/equipment/fleet.tsx), the same
catalogue rendered on the server with its filters as real links. That fallback
is what lands in the static HTML, so a crawler and a reader with no JavaScript
get all 24 units and working filter links, hydration swaps in the live version,
and the route still builds to a file. The fallback is not a spinner, and
replacing it with one would quietly cost the page its crawlability.

**No rate is invented.** Every figure is an em dash beside a line telling you to
call, and the footer says the photos and rates are placeholder data. A rental
rate depends on term, delivery radius and damage waiver; a number made up for a
demo is worse than no number. The photo slots are the same idea — a labelled box
at the right aspect ratio, holding its space for the day real files arrive,
rather than stock images of somebody else's machines.

The quote list uses the same module-store pattern as the Lumen basket
([`quote-store.ts`](src/app/work/usa-equipment/quote-store.ts)), so units added
anywhere survive navigation and a reload. `requestQuote` in
[`actions.ts`](src/app/work/usa-equipment/actions.ts) re-resolves every unit
number against the fleet rather than trusting what the browser sent — there is
no total to protect the way a checkout has, but the browser still does not get
to describe the yard's inventory back to it.

### AnonChat

The only demo with a database. A social feed and a shared chat room on Supabase
Postgres, rebuilt from a Figma Make export that had four screens switching on
component state and every post hard-coded.

Setup is five minutes and documented in
[`supabase/README.md`](supabase/README.md). **Skip it and nothing breaks** — the
site still builds and deploys, and AnonChat runs read-only on seed content with a
banner saying so. That fallback is not a test fixture; it is what stops a
portfolio from showing an error page to anyone who clones it without an account.

**The login gate is a database policy, not a hidden tab.** This is the whole
point of the demo. The feed is world-readable, so a signed-out visitor and a
crawler both get the complete list server-rendered. Writing anything needs an
account. And the private tables refuse to return a single row to anyone outside
the conversation — so the Messages screen is not a UI hiding content it has
already fetched, there is genuinely nothing loaded. You can prove it from the
SQL editor:

```sql
set local role anon;
select count(*) from public.talkapo_direct_messages;  -- 0
select count(*) from public.talkapo_conversations;    -- 0
```

Two pieces of that are easy to get wrong later. The membership check is
`security definer`, because a policy on `conversation_members` that queries
`conversation_members` recurses until Postgres gives up. And there is no insert
policy on conversations or members at all — threads exist only through
`talkapo_start_conversation`, so nobody can add themselves to a room they were
not invited into.

Every rule lives in [`supabase/migrations/`](supabase/migrations/), which is the
set of files to read if you want to know what the app can actually do.

**No token ever reaches the browser.** Every write is a Server Action, so the
session stays in an httpOnly cookie the page cannot read, and XSS on this demo
would not yield a session. The client sends intent — "like this post" — and the
database resolves who is asking from the cookie. The one thing the browser talks
to directly is the realtime socket, which is read-only by nature and still
subject to the same policies.

**Nothing survives a day, including the account.** That is the product rather
than a housekeeping detail — it is what the name is about. A profile carries the
same 24-hour `expires_at` its posts do, and two separate mechanisms enforce it,
because either one alone is a lie in a different direction:

- **Reads filter on the deadline**, so an expired account stops existing the
  moment it lapses. Without this there is a window where a dead account can
  still post.
- **A scheduled sweep deletes the auth user**, which cascades to the profile,
  posts, likes, comments and both halves of every private conversation. Without
  this the data is merely hidden while being kept forever, which is worse than
  never having promised.

The sweep is `pg_cron` and is **not** created by the migration — see
[`supabase/README.md`](supabase/README.md) step 2a. Inserts are rate-limited by
a trigger rather than a policy, because a policy can only say no while a trigger
can return a message worth showing. Together that is what makes a publicly
writable feed safe to leave unattended on a portfolio: there is no moderation
burden when the whole thing empties itself overnight.

**AnonChat does not prerender**, and cannot: every screen depends on who is
asking. The feed carries `likedByMe` on every row, so there is no single version
of it to cache and hand to two different people. It is still server-rendered
HTML with the whole feed in it — the property that matters for crawling — just
built per request. Everything outside `/work/anonchat` still prerenders.

The avatars are drawn from a hash of the handle rather than hotlinked from
Unsplash, as the mockup had them: the originals were photographs of real people
standing in for fictional ones, and cost a third-party request each.

The demo was called Talkapo while the messages screen was a single public lobby,
which was a stand-in — the first visitor to a DM demo has nobody to talk to. Once
accounts were real that stopped being necessary, so it became the private 1:1
inbox the design drew, the seeded cast was deleted, and the name changed to match
what the thing actually does. `/work/talkapo` still redirects.

The Postgres tables are still named `talkapo_*`. Renaming live tables opens a
window where the deployed build queries relations that no longer exist, which is
a poor trade for tidiness.

### The Bindery

`/work/bindery` — a Three.js shelf of seven clothbound hardcovers. Browse the
shelf with the wheel, arrow keys, buttons or markers; pull a volume out; orbit,
pan and zoom it; hover the cover to crack it open; click to open to the title
page; drag the pages. Four volumes are Lumen Café, USA Equipment, AnonChat and
this site. Three are bound and blank.

**It was built from someone else's brief, and says so.** Meng To published
[The Complete Shelf](https://github.com/MengTo/complete-shelf) with a
[public build prompt](https://github.com/MengTo/complete-shelf/blob/main/PROMPT.md)
explicitly inviting other people to build their own from it. This is that: the
concept, the interaction list and the verification checklist came from the
brief; the geometry, materials, motion, content and code are written here and
share no source with the original. The colophon on the page carries the credit
where a visitor will actually see it, not only in this file.

The same book engine opens the home page — see
[the scroll-driven book](#the-scroll-driven-book) below.

**This is where the site spends its budget.** Three.js is 139KB gzipped. It is
never imported into any page bundle: both scenes `await import("three")` at
runtime, after checking that a scene is actually going to run, so the two
routes share one deferred chunk and a reader who will not see a scene never
downloads it. The argument was never "small at all costs", it was "nothing you
did not choose". Two things keep it honest:

- **Nothing is only reachable through WebGL.** Every volume and every word
  printed inside them is server-rendered HTML underneath the canvas. A crawler,
  a reader with JavaScript off, and a browser with WebGL disabled all get the
  same content; the 3D scene is a way of reading that page, not the page.
- **No images are downloaded at all.** Cloth weave, foil stamping, paper grain,
  page edges, endpapers, shelf timber and the contact shadows are drawn into a
  2D canvas at runtime from a seeded PRNG, in
  [`textures.ts`](src/components/bindery/textures.ts). The same seed always draws
  the same book.

**Foil is three maps, not a second mesh.** The stamp is drawn in its own colour
on the colour map, and a matching black-and-white mask drives `metalnessMap` and
`roughnessMap`, so the stamped areas alone take a highlight while the cloth
stays matte.

**Nothing is ever reparented.** The brief warns about the last-frame jump when a
selected volume moves between the shelf and an inspection scene graph. The
cheapest way not to have that bug is not to make that move: books stay in one
group for their whole life and the camera travels instead.

**Two kinds of motion, deliberately not interchangeable.** Shelf↔detail
transitions are timed tweens driven off `performance.now()` that write their
exact endpoint on the final frame. Hover, cover angle and page settle are
exponential smoothing on `1 - exp(-k·dt)` with an epsilon snap. Both were bugs
first: the transition originally accumulated a clamped per-frame delta, which
means that on hardware slower than the clamp, time itself runs slow — a 0.9s
transition took nearly five seconds under software rendering.

**The scene stops drawing when nothing moves.** The loop tracks whether anything
actually changed this frame and skips `render()` when it did not, so a shelf
sitting still costs no GPU time. On a site about not burning other people's
electricity, redrawing an unchanged image sixty times a second is the same sin
as shipping four megabytes.

Camera distance is derived from the geometry rather than hardcoded — volumes
differ in height, a book roughly doubles its width when the cover opens, and the
viewport aspect decides which dimension binds. The framing also biases sideways
on wide screens and downward on narrow ones so the volume clears the reading
panel.

### The scroll-driven book

`/` opens with the same book engine, driven by the scrollbar instead of clicks.
Each project is its own clothbound volume: it comes forward, its cover swings
open, its pages turn one at a time, it closes and recedes, and the next one
takes its place. The last page of the last book is the end of the scroll —
there is no closing animation after it, because there is nothing left to go
back to. Scrub upward and the whole thing runs backwards exactly. Underneath it
the home page continues as it was — hero, live page-weight reading, services,
skills, contact.

Books are built on demand rather than all four up front, with the next one
prepared a book ahead. Three extra sets of procedurally drawn cloth, foil and
paper is a long stall on a landing page for volumes the reader may never reach.

It is deliberately the simpler of the two scenes. There is **no state machine
at all**: scroll position maps straight to which book is up, how far its cover
has swung and how far each page has turned, so the frame is a pure function of
`progressThrough(section)`. Nothing is remembered between frames, so there is
nothing to fall out of sync. It subscribes to the shared scroll engine in
[`lib/scroll.ts`](src/lib/scroll.ts) rather than adding a listener of its own.

**Turning a page is not just a rotation.** The front board hinges outside the
text block, so its arc always ends in front of a page swung to the same angle —
by about 0.35 scene units at every angle. Rotation alone cannot close that gap:
turning the page further sinks it behind the open board (the left half of the
book reads as a blank slab), and turning it less leaves it standing off the
board as a foreshortened strip. Both were built before the arithmetic was done.
The hinge has to _travel forward_ over the turn, which is what paper does — a
page lifts off the block and lands on top of the cover. That travel also has to
grow with the page's index, because the stack inverts through the flip: the
sheet turned last belongs on top of the left-hand pile, while its resting
height in the shut book runs the other way.

Three things it refuses to do:

- **Pin under reduced motion.** A scrubbed pin is the effect that setting most
  clearly asks you not to build. That path renders a static hero listing the
  same four projects, at ordinary page height, and never starts a scene.
- **Download Three.js speculatively.** The reduced-motion and WebGL checks run
  _before_ the dynamic import, so most of the visitors who will not see the
  book pay nothing for it. The home page's initial payload is ~235KB gzipped,
  in line with every other page on the site.
- **Be the only copy of the content.** Every project title and blurb is in the
  server HTML, and the projects gallery further down the page is untouched.

A portrait viewport cannot frame a whole open spread and leave the book
readable — fitting the full width puts the camera three times further back than
the height needs. On a narrow screen it frames the page you are reading and
lets the rest run off frame, the way you would hold a book on a phone.

## Notes on some deliberate choices

**Theme.** A small script in `<head>` stamps `data-theme` on `<html>` before
first paint, so there is no flash of the wrong theme. `ThemeToggle` holds no
React state — the current theme lives on the DOM element that actually changes,
which means server and client markup are identical and there is no hydration
mismatch.

**Scroll reveal.** CSS transitions triggered by one shared IntersectionObserver,
rather than an animation library. The first attempt used a motion library, and
screenshots caught the flaw immediately: it ships `opacity: 0` in the server
HTML, so every section below the fold was blank until its JavaScript ran. The
`.js`-gated approach documented above fixes that at the root. Printing is also
explicitly forced visible, since a printed page has no scroll to trigger
anything.

**Charts.** Hand-written SVG, no charting library. The categorical palette is
validated for colour-vision deficiency, each chart has one axis (never two
scales merged), every series carries a legend plus a direct label so identity is
never colour-alone, and there is a table view of the same data.

**Contact form.** Validates client-side, then hands the composed message to the
visitor's mail client — so it works with no backend and no API key. To send
server-side instead, replace `handleSubmit` in
[`src/components/contact-form.tsx`](src/components/contact-form.tsx) with a
Server Action that calls Resend, Postmark, or similar.

## Dependency audit

`npm audit --omit=dev` reports **0 vulnerabilities**. Production dependencies
are clean.

`npm audit` (including dev) reports findings in `brace-expansion`, reached only
through `minimatch@3` inside ESLint and three of its plugins. There is no fix
available: the patch exists only in the `brace-expansion@5` line, which requires
`minimatch@10`, which the plugins pinned by `eslint-config-next` do not use.
Forcing it breaks ESLint outright. The exposure is a denial of service when
expanding attacker-controlled glob patterns — in this project the only patterns
are the ones in the repo's own lint config, and none of it ships to the browser.

`package.json` does carry overrides that fix the findings that _were_ fixable:
`sharp` and `postcss` are pulled forward past their advisories, rather than
accepting npm's suggestion to downgrade Next.js to 9.3.3.

## Deploying

Everything prerenders to static HTML except AnonChat, whose three routes are
all per-session and render on request. Drop AnonChat and the whole site is static
again, and any static host works. On Vercel:

```bash
npm i -g vercel
vercel
```

AnonChat needs two environment variables to go live — see
[`supabase/README.md`](supabase/README.md). Without them the site still builds
and deploys; that demo runs read-only on seed content and says so on the page.

## Why this is one Vercel project, not five

A reasonable instinct is that five demos in one deployment must make each of
them slower, and that splitting them into separate Vercel projects would help.
Measured against production, it would not — and it would cost something real.

Every route here is code-split by Next already: opening `/projects` downloads
none of Lumen's JavaScript, none of the yard's, none of AnonChat's. The fonts are
declared per layout for the same reason, so Lumen's two faces never reach the
other demos. Five of six routes are CDN cache **HIT**s served from the edge
nearest the reader, which is exactly what a separate project would give — the
same CDN, the same file.

What splitting would add: navigating between the portfolio and a demo becomes a
cross-origin page load instead of a client-side transition, React and the Next
runtime get downloaded again per project rather than shared, and every change
touching shared components needs five deploys instead of one.

Measured on production, Manila → `fortefolio-cyan.vercel.app`:

| Route                 | TTFB   | Cache |
| --------------------- | ------ | ----- |
| `/`                   | 245ms  | HIT   |
| `/projects`           | 320ms  | HIT   |
| `/work/lumen-cafe`    | 309ms  | HIT   |
| `/work/usa-equipment` | 322ms  | HIT   |
| `/work/anonchat`      | 1202ms | MISS  |

The odd one out is AnonChat, and sharing a project is not why. It is the only
route that cannot be cached — it reads a session cookie and queries Postgres per
request — so it runs as a function, and the function was running in `iad1`
(Washington DC) while the database sits in AWS `ap-southeast-1` (Singapore) and
the reader is in Manila. Each page view crossed the Pacific twice.

`vercel.json` pins functions to `sin1`, which is beside both the reader and the
database. Median of eight warm samples afterwards:

| Route            | Before | After     |
| ---------------- | ------ | --------- |
| `/projects`      | 320ms  | 291ms     |
| `/work/anonchat` | 1202ms | **401ms** |

The cached route did not move, which is the point — it never touched a function.
The uncached one went to a third of what it was, without splitting anything.

**If the Supabase project is ever moved to another region, move this with it** —
a function pinned to the wrong side of an ocean is slower than one that was
never pinned at all. Single readings here are worth nothing: a first pass showed
every route, including CDN hits, three times slower, which was local network
noise. Take a median.
