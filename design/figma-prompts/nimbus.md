# Figma prompt — Nimbus

Developer-tooling marketing site. Dark-first, technical, precise — the opposite
end of the range from Lumen's warm editorial look.

Paste the block below into Figma Make.

---

Design a complete marketing website for **Nimbus**, a container platform for
development teams. Dark-first, technical and precise — the kind of site Linear,
Railway or Vercel would ship. Confident restraint, not decoration.

## Order of work

Build the token page and the component page **first**, then design the pages
using only what is on them. Do not use a colour, type size or spacing value that
is not in the token page — if you need a new one, add it there first and say so.

## The product

Nimbus runs the same container on your laptop and in production, so "works on my
machine" stops being a root cause. Every branch ships to its own URL. Secrets are
encrypted at rest, injected at runtime, never written to the build log, and can
be rotated without redeploying.

The audience is engineers. They are allergic to marketing language. Write the way
good documentation is written: precise, concrete, unhurried. Show a real command
or a real config file rather than describing one. Never write "seamless",
"powerful", "revolutionise" or "unlock".

## Art direction

- **Palette.** Near-black `#0B0D0E` base, elevated surface `#141719`, hairline
  borders `#22262A`, primary text `#E8EAED`, muted `#8B949E`. One electric
  accent, `#3D7BFF`, used only for primary actions and active states. A signal
  green `#3FB950` reserved strictly for build/health status — never decorative.
  Design dark first, then a light theme from the same tokens.
- **Type.** *Inter Tight* for interface and headings, *JetBrains Mono* for code,
  metrics, labels and any number. Headlines tight: -2% letter spacing, 56–80px
  desktop. Body 16px at 1.65. Small mono labels in uppercase with wide tracking
  for section eyebrows.
- **Structure.** A visible 1px grid: hairline rules dividing every section,
  bordered cards that share edges, corner ticks at intersections. 1440px frame,
  1200px content, 8pt spacing. The layout should feel drawn on graph paper.
- **Texture.** Real syntax-highlighted code blocks with a window chrome bar. A
  terminal panel with a blinking cursor. An architecture diagram with labelled
  nodes and animated flow along the connectors. Deployment logs that stream. No
  stock illustration, no 3D blobs, no floating glass panels.

## Pages

**Home.**
- Hero: one sentence stating what it does, a secondary line, a primary button and
  a copyable `npx nimbus init` command block. To the side, a terminal panel
  streaming a real deploy log.
- Logo strip of companies, low contrast.
- Three feature blocks, each pairing a sentence with a real artefact: the same
  container running twice, a preview URL per branch, a secrets panel with values
  masked.
- An architecture diagram section explaining the build → preview → production
  path, revealed as you scroll.
- A metrics band in mono: cold start, regions, uptime.
- Pricing (below), then FAQ, then a closing call to action.

**Pricing.** Three tiers with a monthly/annual toggle where annual shows the
saving. Exact content:
- **Hobby**, $0 — "For side projects and trying things out." 1 project · 10k
  requests / month · Community support · Shared runners. Button: Start free.
- **Team**, $24/month — "For small teams shipping to production." Unlimited
  projects · 2M requests / month · Email support, 1-day reply · Dedicated runners
  · Preview environments · Audit log. Button: Start 14-day trial. **This is the
  recommended tier** — mark it with a border in the accent and a small label, not
  a scale-up or a glow.
- **Enterprise**, custom pricing — "For orgs with compliance requirements."
  Everything in Team · SSO and SCIM · 99.99% uptime SLA · Private networking ·
  Named support engineer. Button: Talk to sales.

Below the tiers, a full feature-comparison table with mono row labels and tick
marks, and the FAQ accordion. Real questions: "How is this different from just
using a Dockerfile?", "What happens when I hit the request limit?", "How do I get
my data out?", "Can I run this on my own infrastructure?"

**Docs.** A three-column documentation layout: left sidebar tree, centre content,
right on-this-page rail that tracks scroll. Code blocks with tabs for npm/pnpm/
yarn and a copy button. Callout blocks for note, warning and danger.

**Changelog.** A dated vertical timeline, version tags in mono, entries labelled
Added / Fixed / Changed with a colour-coded dot each.

**Contact.** A short form — name, work email, company size, message — beside a
panel of alternative routes: docs, community, status page.

## Motion and interaction

- Deploy logs typing out line by line in the hero terminal
- Flow animating along the connectors of the architecture diagram on scroll
- Pricing toggle: the number rolls between monthly and annual, digits sliding
- Cards lighting their border on hover; the accent border draws from one corner
- Code blocks showing a "Copied" state on click
- A command palette overlay (⌘K) as a static frame, showing search results
- Section eyebrows sticking to the top of the viewport while their section passes

Easing `cubic-bezier(0.16, 1, 0.3, 1)`, 150–250ms for interface response, 500ms
for scroll reveals. Interface motion should feel instant; only storytelling
motion is slow.

## Constraints

- Design 1440px desktop and 390px mobile for every page. On mobile the docs
  sidebar becomes a drawer and the pricing tiers stack with the recommended one
  first.
- Body text 4.5:1 minimum on both themes. Never carry meaning in colour alone —
  build status needs an icon and a word, not just a green dot.
- Two font families, three weights total. No WebGL, no video, no particle fields.
  Every effect must be reachable with CSS and scroll position.

## Deliver in the file

1. A token page: both themes, type scale, spacing, border and easing values
2. A component page with variants for default, hover, focus, active and disabled:
   buttons, input, select, tabs, code block, table row, pricing card, accordion,
   nav, status badge
3. Desktop and mobile frames for all five pages
4. A clickable prototype: the pricing toggle, the FAQ accordion, the docs
   sidebar, and the command palette opening

Name every token and component so I can refer to them later.
