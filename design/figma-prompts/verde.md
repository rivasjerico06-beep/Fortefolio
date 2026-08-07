# Figma prompt — Verde Supply

**Front end only.** Figma Make builds the complete, working storefront; the back
end gets attached afterwards. That only works if the data lives in one place, so
the *Data layer* section below is the part that matters most — it is what turns
this from a demo into something a real catalogue, cart and order pipeline can be
plugged into without touching a single component.

Paste everything below the `---` into Figma Make as one prompt.

Notes for us, not for Figma:

- Contrast-corrected: warm stone is `#797368` (the original `#8C8578` only
  reached 3.50:1 on paper) and terracotta is split into a fill tone and a
  darker text tone.
- Figma Make scaffolds Vite + React. That is fine — the prompt keeps routing and
  data out of components, so porting into the Next.js app is mechanical.
- Backend provisioning (catalogue, orders, payment) is a separate job and gets
  chosen properly when we build it. The prompt deliberately names no provider.

---

Build the complete front end for **Verde Supply**, a houseplant shop in Manila
selling plants, pots and care supplies. Not a mockup — a working storefront in
React and TypeScript, with real filtering, a real cart and a real checkout flow,
running entirely on local mock data.

A back end will be attached to this later. Follow the **Data layer** rules
exactly; they are what make that possible.

## Order of work

1. The token and component layer first — colour, type, spacing, and the
   components listed at the end.
2. The data layer — types, mock catalogue, and the async accessors.
3. The pages, consuming both.

Do not use a colour, type size or spacing value that is not in the token file.

## The shop

Fourteen products across three categories. Verde's whole argument is that most
people kill plants by buying the wrong one for their room, so **light level is a
first-class fact** — as prominent as price — and every product says plainly
whether it is safe around pets.

The voice is warm but factual, never twee. No "plant babies", no "green thumb",
no puns. Say the useful thing: "Tolerates a north-facing room and three weeks of
neglect."

## Data layer — follow this exactly

**Every rule here exists so a real API can replace the mock data without any
component changing.**

Put all types in `src/data/types.ts`:

```ts
export type Category = "Plants" | "Pots" | "Care";
export type LightLevel = "Low" | "Bright indirect" | "Full sun";

export type Product = {
  id: string;          // stable slug, e.g. "monstera-deliciosa"
  name: string;
  category: Category;
  price: number;       // whole pesos — an integer, no symbol, no decimals
  light: LightLevel;
  petSafe: boolean;
  rating: number;      // 0–5, one decimal place
  reviewCount: number;
  image: string;
  blurb: string;       // one line, for the card
  description: string; // two or three sentences, for the product page
  care: { water: string; humidity: string; matureSize: string };
  stock: number;
};

export type CartLine = { productId: string; quantity: number };

export type OrderDraft = {
  lines: CartLine[];
  contact: { name: string; email: string; phone: string };
  delivery: { line1: string; city: string; postcode: string; notes?: string };
};

export type Order = OrderDraft & {
  id: string;
  subtotal: number;
  shipping: number;
  total: number;
  placedAt: string;    // ISO 8601
};
```

Put the fourteen products in `src/data/catalog.ts` as `Product[]`, and nowhere
else. **No component may contain product data.**

Put every read and write in `src/data/api.ts`, and make them **async even though
they return mock data today** — that is the whole point, so swapping in a network
call later changes nothing above them:

```ts
export async function listProducts(): Promise<Product[]>
export async function getProduct(id: string): Promise<Product | null>
export async function placeOrder(draft: OrderDraft): Promise<Order>
```

Filtering and sorting happen **in the UI over the array returned by
`listProducts()`**, not inside `api.ts` — that keeps them instant now and lets
them move server-side later without changing the contract.

Cart state goes in `src/state/cart.tsx` as a single React context, persisted to
`localStorage` under one key, exposing exactly:

```
lines, add(productId), remove(productId), setQuantity(productId, n),
clear(), count, subtotal
```

Money is formatted in one helper, `formatPeso(n)`, used everywhere. Never inline
a `₱` in a component.

Components take data as **props** and never import `catalog.ts` directly. Keep
routing out of them too — a component should not know what page it is on.

Do **not** add authentication, a database, a payment SDK, or any network call.
`placeOrder` resolves with a mock order after a short delay. Leave those seams
empty and clearly marked.

## The catalogue

Real products and prices, in Philippine pesos:

**Plants** — Monstera Deliciosa ₱1,450 (bright indirect) · Fiddle Leaf Fig ₱2,350
(bright indirect) · Calathea Orbifolia ₱1,780 (bright indirect) · Golden Barrel
Cactus ₱1,120 (full sun) · ZZ Plant ₱980 (low) · Snake Plant ₱850 (low) · Golden
Pothos ₱620 (low) · Spider Plant ₱540 (bright indirect)

**Pots** — Hanging Ceramic Pot ₱890 · Stoneware Planter ₱760 · Terracotta Pot ₱380

**Care** — Brass Mister ₱680 · Aroid Potting Mix ₱450 · Liquid Plant Feed ₱320

Pet-safe: Calathea, Spider Plant, Golden Barrel Cactus, and everything in Pots
and Care. Not pet-safe: Monstera, Fiddle Leaf Fig, ZZ Plant, Snake Plant, Golden
Pothos. Write ratings, review counts, stock and care facts yourself, plausibly.

## Art direction

Light, tactile and product-led — the quiet confidence of Aesop, applied to
plants. Browsing should feel like wandering a shop, not filling in a form.

- **Palette.** Paper `#FBFAF7`, deep forest ink `#14301F`, soft sage `#DCE4D8`
  for section fills, warm stone `#797368` for secondary text. Terracotta as the
  one accent, in two tones because one cannot do both jobs legibly: `#C4603C`
  for filled areas and large type, `#B55938` when it is body-sized text or a
  link. Accent is for sale flags and primary buttons only. Generous white space;
  the products supply the colour.
- **Type.** A warm high-contrast serif for headings and product names —
  *Newsreader* or *Fraunces* — with *Inter* for interface, prices and controls.
  Product names 20–24px, section headings 48–72px. Prices in tabular figures,
  always. Two font families, three weights, and no monospace.
- **Layout.** 12 columns, 1440px frame, 64px margins. Product grid 3-up desktop,
  2-up tablet, 1-up mobile, cards mostly image. Square photography on plain warm
  backgrounds, one plant per frame. 4px radius, hairline borders, no heavy
  shadows.
- **Detail.** A three-step light indicator (Low / Bright indirect / Full sun) on
  every card, a pet-safe leaf mark, star ratings with the review count beside
  them.

## Pages

**Home.** Full-bleed opening image with the shop's one line over it.
Shop-by-light: three large entry panels for Low, Bright indirect and Full sun,
each linking into the shop pre-filtered — this is the main navigation, because
it is how people should actually be choosing. Then a featured row, a three-step
"how we pack and ship" strip, a care-guide teaser, footer.

**Shop.** The main event, and fully working. A filter rail — category, light
level, pet-safe, price range — beside the grid, with a live result count and a
sort control (price low→high, high→low, rating, name). Filters apply instantly
and appear as removable chips above the grid with a clear-all. Filter state
belongs in the URL query string so a filtered view can be linked. Design and
build the **empty state** for an impossible combination, with a way back.

**Product.** Gallery with thumbnails, name, price, rating, quantity stepper,
add-to-cart. A care panel laid out as facts — light, water, humidity, pet-safe,
mature size. Description, a "pairs with" row of pots, reviews. Show an
out-of-stock state when `stock` is 0, with the button disabled and explained.

**Cart.** A slide-over drawer, not a page. Line items with thumbnails and
quantity steppers, subtotal, a shipping note, checkout button. Build the empty
state too.

**Checkout.** Three steps — contact, delivery, payment — with an order summary
fixed beside it on desktop and collapsing to an expandable bar on mobile.
Validate each step before advancing, with inline error messages. On submit call
`placeOrder`, show a pending state, then a confirmation screen with the order id.
The payment step collects nothing real: render the fields disabled with a clear
note that payment is not connected yet.

**Care guides.** An index of short articles and one article template.

## Motion and interaction

- Filtering re-flows the grid with a fast staggered fade, never a spinner
- Product card image scales gently under the cursor; add-to-cart rises in
- Adding to cart animates the item toward the cart icon, which bumps its count
- Cart drawer slides from the right over a dimmed backdrop
- Gallery images cross-fade; thumbnails show an active border
- A sticky add-to-cart bar appears once the main one scrolls away
- Scroll reveals on home sections, staggered 60ms

Easing `cubic-bezier(0.22, 1, 0.36, 1)`. Shop interactions 150–250ms — a filter
that feels slow feels broken. Storytelling reveals 500–700ms.

## Constraints

- Desktop and mobile for every page. On mobile the filter rail becomes a bottom
  sheet showing how many filters are active.
- 4.5:1 on body text. Light level and pet-safe must read without colour — icon
  plus label, always. Visible focus ring on every control. The cart drawer traps
  focus and closes on Escape.
- Under a 500KB page budget. No WebGL, no video, no 3D. Product photography does
  the work.

## Deliver

1. A token file and a style page rendering it
2. A component page: button, input, select, quantity stepper, filter chip,
   checkbox, product card, rating, light indicator, cart line, badge, empty
   state — each with default, hover, focus, disabled and loading states
3. Every page above, working, at desktop and mobile
4. `src/data/types.ts`, `src/data/catalog.ts`, `src/data/api.ts` and
   `src/state/cart.tsx` exactly as specified

Name every token and component so I can refer to them later. At the end, list
every file you created and what belongs in it.
