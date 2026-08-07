# Figma prompt — Atlas Analytics

The odd one out: a **product UI**, not a marketing site. Screens and states
rather than pages and scroll. Its selling point is that the numbers are hard to
misread — keep that, it is the most distinctive thing in the whole portfolio.

Paste the block below into Figma Make.

---

Design the application interface for **Atlas Analytics**, a product-analytics
dashboard. This is a working tool people open every morning, not a landing page.
Dense, calm and fast to read. The design goal is unusual and specific: **make the
numbers hard to get wrong.**

## Order of work

Build the token page and the component page **first**, then design the screens
using only what is on them. Do not use a colour, type size or spacing value that
is not in the token page — if you need a new one, add it there first and say so.

## The principle behind it

Dashboards fail quietly — nobody reports a chart they misread. So:

- **Never merge two scales onto one chart.** If two things have different units,
  they are two charts.
- **Identity is never carried by colour alone.** Every series gets a legend *and*
  a direct label at the end of its line.
- **The palette is fixed and assigned per entity**, so filtering never repaints a
  series and last week's screenshot still matches.
- **Every chart has a table view** of the same data behind a toggle.
- Everything must survive being printed in greyscale and read by someone with
  colour-vision deficiency.

## Art direction

Restrained, near-invisible chrome so the data is the only thing with weight.

- **Palette.** Canvas `#F7F8F9`, surface `#FFFFFF`, border `#E3E6E9`, primary
  text `#1A1D21`, muted `#6B7280`. Interface accent `#2563EB` for selection and
  primary actions only.
- **Data palette — this matters most.** Three categorical steps, validated for
  colour-vision deficiency: blue `#2A78D6`, orange `#EB6834`, green `#1BAF7A`.
  Keep at least ΔE 8 separation between any pair under deuteranopia and
  protanopia. Those three are for **data marks only**. Change indicators are
  text, so they need darker tones to stay legible: positive `#14825B`, negative
  `#CA4339` — and both must also carry an arrow glyph and a sign, never colour
  alone.
- **Type.** *Inter* throughout, with tabular figures on every number so columns
  align and digits do not jitter as values update. Metric values 32–40px,
  labels 12px uppercase with wide tracking, body 14px, table cells 13px.
- **Density.** 4pt spacing scale. Hairline 1px borders, 4px radius, no shadows
  except on overlays. Tight but not cramped — 40px row height in tables.
- Design a **dark theme** from the same tokens, re-tuning the data palette for a
  dark canvas rather than reusing the light steps.

## The shell

A collapsible left sidebar with sections — Overview, Traffic, Audience, Revenue,
Reports, Settings — and a top bar carrying breadcrumbs, a global date-range
picker, a search field and an account menu. Content sits in a scrollable region;
the top bar stays fixed.

## Screens

**Overview.** Four metric cards across the top with real figures: Sessions
**43.1k**, Signups **1,268**, Conversion **2.94%**, MRR **$54.2k** — each with a
change against the previous month, shown as an arrow, a sign and a percentage, in
that order. Below, a sessions-over-time line chart with direct labels; a traffic-
sources breakdown (Organic search, Referral, Direct, Social); and a recent-
activity table.

**Traffic.** A source-over-time chart with a legend and end-of-line labels, a
date comparison toggle, and a sortable table of pages with sessions, bounce rate
and average duration. Include the **table view toggle** for the chart.

**Revenue.** MRR over time, plan mix, and churn — as **three separate charts**,
never combined. Show explicitly that they are three, with a note in the design
about why.

**Reports.** A saved-reports list with owner, schedule and last-run columns, plus
a builder panel for creating one — metric picker, dimension picker, filter rows,
preview.

**Settings.** Tabbed: general, team members with roles, and data sources.

## States to design — not optional

Empty (no data yet), loading (skeleton, not a spinner), partial data with a "this
range is incomplete" note, error with a retry, and a no-results state for a
filtered table. A dashboard that has only been designed full of data is a
dashboard that breaks on day one.

## Interaction

- Hovering a chart shows a crosshair and a tooltip listing every series at that
  point, with its value — not just the nearest one
- Clicking a legend item dims the other series rather than hiding them
- The date-range picker as an open overlay with presets and a two-month calendar
- Tables: sortable headers with a direction arrow, sticky header on scroll, row
  hover, and a selection state with a bulk-action bar
- Chart-to-table toggle as a small segmented control on each chart
- Keyboard focus visible on every control, and a visible skip-to-content link

Motion is functional only: 120–200ms fades and slides. Numbers may count up on
first load, once. Nothing loops, nothing parallaxes, nothing bounces.

## Constraints

- Design 1440px desktop and 390px mobile. On mobile the sidebar becomes a drawer,
  metric cards go 2-up, and tables scroll horizontally with the first column
  pinned.
- 4.5:1 on all text including muted labels and axis ticks.
- Annotate each chart with the accessibility features it carries: legend, direct
  labels, table fallback, greyscale-safe.
- Charts must be drawable as plain SVG — no 3D, no gradients inside data marks,
  no charting-library ornament.

## Deliver in the file

1. A token page: both themes, the categorical data palette with its CVD
   simulation swatches, type scale with tabular figures, spacing, radius
2. A component page with default, hover, focus, active, disabled, loading and
   error variants: button, input, select, date picker, tab, table row, metric
   card, chart container, legend, tooltip, badge, toast, modal, sidebar item
3. Desktop and mobile frames for all five screens, plus every state listed above
4. A clickable prototype: switching date range, sorting a table, toggling a chart
   to its table view, dimming a series from the legend

Name every token and component so I can refer to them later.
