/**
 * Interaction test for the demo sites. The portfolio's central claim is that
 * every demo is real and clickable, so this drives the actual interactive
 * parts — catalogue filtering, the cart maths, the pricing toggle, the FAQ,
 * a chart tooltip, and theme persistence — against a running server.
 *
 *   npm run build && npm start     (in one terminal)
 *   npm run test:demos             (in another)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const fails = [];
const ok = (label, cond, detail = "") =>
  cond
    ? console.log(`  PASS  ${label}${detail && " — " + detail}`)
    : fails.push(`${label}${detail && " — got: " + detail}`);

// --- Verde: filtering, sorting, cart ----------------------------------------
await page.goto(`${BASE}/work/verde`, { waitUntil: "networkidle" });
const count = () => page.getByText(/Showing \d+ of \d+ results/).innerText();

ok("verde shows full catalogue", (await count()).includes("14 of 14"), await count());

await page.getByLabel("Category").selectOption("Pots");
ok("category filter narrows results", (await count()).includes("3 of 14"), await count());

await page.getByLabel("Category").selectOption("All");
await page.getByLabel("Pet safe only").check();
ok("pet-safe filter applies", (await count()).includes("9 of 14"), await count());

await page.getByLabel("Pet safe only").uncheck();
await page.getByLabel("Light").selectOption("Full sun");
await page.getByLabel("Category").selectOption("Care");
ok(
  "empty state appears for an impossible filter combination",
  await page.getByText("No products were found matching your selection.").isVisible(),
);

// Two exist: one always in the sidebar, one inside the empty-state notice.
// Use the sidebar's, which is present regardless of filter state.
await page.getByLabel("Shop filters").getByRole("button", { name: "Clear filters" }).click();
ok("clear filters restores the catalogue", (await count()).includes("14 of 14"), await count());

await page.getByLabel("Sort").selectOption("Price: low to high");
// ul.products is WooCommerce's own archive markup, so this stays specific to
// the product grid rather than matching the first list on the page
const cheapest = await page.locator("ul.products > li h2").first().innerText();
ok("sort by price puts the cheapest first", cheapest === "Liquid Plant Feed, 500ml", cheapest);

const monstera = page.locator("li", { hasText: "Monstera Deliciosa" });
await monstera.getByRole("button", { name: "Add to cart" }).click();
await monstera.getByRole("button", { name: "Add to cart" }).click();
const cartLabel = await page.getByRole("button", { name: /Cart/ }).innerText();
ok("cart count increments", cartLabel.includes("2"), cartLabel.replace(/\s+/g, " "));

await page.getByRole("button", { name: /Cart/ }).click();
ok(
  "cart subtotal computes (2 x P1,450 = P2,900)",
  await page.getByText("₱2,900").first().isVisible(),
);

await page.getByRole("button", { name: /Decrease quantity/ }).click();
ok(
  "decrementing quantity updates the subtotal",
  await page.getByText("₱1,450").first().isVisible(),
);

// --- Nimbus: pricing toggle and FAQ -----------------------------------------
await page.goto(`${BASE}/work/nimbus`, { waitUntil: "networkidle" });
ok("annual pricing is the default", await page.getByText("$19", { exact: true }).isVisible());

await page.getByRole("button", { name: /^Monthly/ }).click();
ok("monthly toggle raises the price", await page.getByText("$24", { exact: true }).isVisible());

// Not `.first()`: the themed header's mobile menu is also a <details>, and it
// comes earlier in the DOM. Target the FAQ item by its content.
const faq = page.locator("details").filter({ hasText: "Dockerfile" }).first();
await faq.locator("summary").click();
ok("FAQ accordion opens", await faq.evaluate((el) => el.open));

// --- Atlas: chart tooltip ----------------------------------------------------
await page.goto(`${BASE}/work/atlas`, { waitUntil: "networkidle" });
await page
  .locator("svg[role=img]")
  .first()
  .hover({ position: { x: 300, y: 120 } });
await page.waitForTimeout(250);
ok("chart hover reveals a tooltip", await page.getByText("Organic search").nth(1).isVisible());

// --- Portfolio: theme toggle persists ---------------------------------------
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const before = await page.evaluate(() => document.documentElement.dataset.theme);
await page.getByRole("button", { name: /Toggle light and dark theme/ }).click();
const after = await page.evaluate(() => document.documentElement.dataset.theme);
ok("theme toggle flips the document theme", before !== after, `${before} -> ${after}`);

await page.reload({ waitUntil: "networkidle" });
const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
ok("theme survives a reload", persisted === after, persisted);

await browser.close();

if (fails.length) {
  console.log(`\nFAILED — ${fails.length} check(s):`);
  for (const fail of fails) console.log(`  · ${fail}`);
  process.exit(1);
}
console.log("\nAll interaction checks passed.");
