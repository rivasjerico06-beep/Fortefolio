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

| Command                         | What it does                                           |
| ------------------------------- | ------------------------------------------------------ |
| `npm run dev`                   | Dev server with Turbopack and hot reload               |
| `npm run build`                 | Production build (all routes prerender to static HTML) |
| `npm start`                     | Serve the production build                             |
| `npm run lint`                  | ESLint with the Next.js config                         |
| `npm run typecheck`             | TypeScript with no emit                                |
| `npm run format`                | Prettier, including Tailwind class sorting             |
| `npm run shots`                 | Visual smoke test — see below                          |
| `npm run test:demos`            | Interaction test — drives the demos for real           |
| `node scripts/motion-check.mjs` | Proves no animation can strand content invisible       |

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
      nimbus/        SaaS landing page with interactive pricing
      atlas/         analytics dashboard, charts hand-built in SVG
      verde/         storefront with live filtering and a cart
    layout.tsx       <html>, fonts, pre-paint theme script
    globals.css      design tokens for both themes
  components/        header, footer, theme toggle, cards, reveal
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

**Reads and writes are behind seams.** [`api.ts`](src/app/work/lumen-cafe/api.ts)
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

The whole site prerenders to static HTML, so any static host works. On Vercel:

```bash
npm i -g vercel
vercel
```
