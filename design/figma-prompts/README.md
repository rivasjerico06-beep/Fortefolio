# Figma prompts

One brief per demo site. **Each file is a single prompt — paste the whole thing
into Figma Make in one go.**

The split of work is: **Figma Make builds the front end, we attach the back
end.** That only works if the front end is built with seams in it, which is why
every brief carries a *Data layer* section pinning down where content lives, what
shape it has, and which functions become real calls later. Without that you get
hardcoded arrays buried in components and a refactor before any backend work can
start.

The briefs are also self-contained on content, art direction, build order and a
performance budget, so what comes back can be built rather than only admired.

| Prompt | What it is | Direction |
| --- | --- | --- |
| [lumen-cafe.md](lumen-cafe.md) | Café website | Editorial, warm, photography-led |
| [nimbus.md](nimbus.md) | Developer-tool marketing site | Dark, technical, precise |
| [verde.md](verde.md) | Houseplant shop | Light, tactile, product-led |
| [atlas.md](atlas.md) | Analytics dashboard | Product UI, dense, data-first |

The four directions are deliberately unalike. Four demos in one house style would
show one idea four times; these show range — an editorial site, a technical one,
a retail one, and an application.

## Why each one opens with "Order of work"

That short section near the top of every prompt does the heavy lifting:

> Build the token page and the component page **first**, then design the pages
> using only what is on them.

Without it, these tools start drawing screens immediately and infer a design
system backwards from whatever the pages happened to need — which is how you end
up with six greys, four heading sizes and no reusable anything. With it, the
system leads and the pages consume it, from a single message.

## Then

**Judge the first result on structure, not polish.** Is the page order right? Is
the hierarchy right? Colour and spacing are cheap to iterate; a wrong structure
means starting over.

**Iterate in small, specific instructions.** Vague adjectives get you an average
of everything the model has ever seen, which is the definition of generic. Say
the measurable thing:

| Instead of | Say |
| --- | --- |
| "Make it more premium" | "Double the whitespace above each section heading and increase the hero to 140px" |
| "Make it more modern" | "Remove all drop shadows and rounded corners; use 1px hairline rules instead" |
| "It feels flat" | "Make one image full-bleed edge to edge and let the heading overlap it" |

**Keep the constraints.** If it returns gradient meshes, video backgrounds or a
fifth font, push back — those sections exist because the site has to ship under a
page-weight budget, and that budget is the portfolio's whole argument.

## If one prompt comes back generic

Only then split it in two. Every file cuts at the same place — the `## Pages`
heading (`## Screens` in Atlas) — because everything above it defines the system
and everything below it consumes the system.

1. **First message:** everything down to the end of *Art direction*, plus
   *Constraints*, plus deliverables 1–2. End it with "Deliver only these two
   things. Do not design any pages yet."
2. Look at what came back and fix the type scale and palette now, while there are
   ten things on the canvas rather than two hundred.
3. **Second message, same conversation:** open with "using exactly the tokens and
   components you just built — do not introduce new colours, type sizes or
   spacing values", then paste *Pages* onward.

## Order to build them

Lumen first — it is finished as a site, so a redesign is pure visual work with no
new content or state to invent. Then Nimbus, which is mostly content. Then Verde,
which needs cart state that survives navigation. Atlas last: it is an application
rather than a site, so it will take the most screens and the most states.

## What is needed back for implementation

- The Figma file link with view access
- The token page (colour, type, spacing, easing) — the single most useful export
- Desktop and mobile frames per page
- Any component states that are not obvious from the frames

Exported PNGs alone are not enough to build from faithfully; the token page is
what makes the rebuild match the design instead of approximating it.

## Downstream consequences

These briefs drop the WordPress framing. When the first redesign lands, both of
these need rewriting because they currently sell the opposite story:

- the case-study copy in `src/lib/projects.ts`
- the "demo sites are WordPress layouts" section of the root `README.md`

The photography in `src/app/work/lumen-cafe/media/` can be kept. The Lumen prompt
describes the same subjects, so the design will fit the images already in the
repo.
