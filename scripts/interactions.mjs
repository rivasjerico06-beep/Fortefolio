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

// --- Lumen: the shop, end to end --------------------------------------------
// The whole point of the shop is that it works, so this walks a real purchase:
// filter, pick a variant, add, navigate away, reload, check out, and confirm the
// server's own total. Prices are never sent from the browser, so the number on
// the confirmation is the one that matters.
{
  const LUMEN = `${BASE}/work/lumen-cafe`;
  const showing = async () =>
    (await page.locator('p:has-text("Showing")').first().innerText()).toLowerCase();
  const basket = () =>
    page.locator('header button[aria-label*="asket"]').first().getAttribute("aria-label");

  await page.goto(`${LUMEN}/shop`, { waitUntil: "networkidle" });
  ok("lumen shop lists the catalogue", (await showing()).includes("10 of 10"), await showing());

  await page.getByRole("button", { name: "Brewing", exact: true }).click();
  await page.waitForTimeout(250);
  ok(
    "category filter narrows the shop",
    (await showing()).includes("2 of 10"),
    await showing(),
  );

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByLabel("Sort products").selectOption("price-asc");
  await page.waitForTimeout(250);
  const cheapest = await page.locator("ul li.lc-row span.tabular-nums").first().innerText();
  ok("sorting puts the cheapest first", cheapest.trim() === "₱390", cheapest.trim());

  // A sold-out product must not be buyable
  await page.goto(`${LUMEN}/shop/sidama-natural`, { waitUntil: "networkidle" });
  ok(
    "sold-out product has no add button",
    (await page.locator('button:has-text("Add to basket")').count()) === 0,
  );

  // A variant with a price delta must move the price
  await page.goto(`${LUMEN}/shop/washed-benguet`, { waitUntil: "networkidle" });
  const basePrice = (await page.locator("p.tabular-nums").first().innerText()).trim();
  await page.getByRole("button", { name: "1kg", exact: false }).first().click();
  await page.waitForTimeout(200);
  const sizedPrice = (await page.locator("p.tabular-nums").first().innerText()).trim();
  ok(
    "size variant changes the price",
    basePrice !== sizedPrice,
    `${basePrice} -> ${sizedPrice}`,
  );

  await page.getByRole("button", { name: "Add to basket" }).click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  ok("adding opens the basket drawer", true);

  await page.locator('[role="dialog"] button:has-text("Close")').click();
  await page.goto(`${LUMEN}/shop/lumen-mug`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to basket" }).click();
  await page.waitForTimeout(400);
  await page.locator('[role="dialog"] button:has-text("Close")').click();

  await page.goto(`${LUMEN}/menu`, { waitUntil: "networkidle" });
  ok("basket survives navigation", (await basket()).includes("2 items"), await basket());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  ok("basket survives a reload", (await basket()).includes("2 items"), await basket());

  await page.goto(`${LUMEN}/checkout`, { waitUntil: "networkidle" });
  const summaryTotal = (await page.locator("aside dd.tabular-nums").last().innerText()).trim();

  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(250);
  ok(
    "checkout blocks an empty name",
    (await page.locator('[role="alert"]').first().innerText()).includes("name"),
  );

  await page.fill("#co-name", "Jerico Rivas");
  await page.fill("#co-email", "nope");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(250);
  ok(
    "checkout blocks a malformed email",
    (await page.locator('[role="alert"]').first().innerText()).includes("email"),
  );

  await page.fill("#co-email", "jerico@example.com");
  await page.fill("#co-phone", "09171234567");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);
  await page.fill("#co-line1", "114 Kalayaan Avenue");
  await page.fill("#co-city", "Makati");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);
  ok("payment fields are disabled, not fake", await page.locator("#co-card").isDisabled());

  await page.getByRole("button", { name: "Place order" }).click();

  // Not waitForSelector("h1") — the checkout page already has one, so that
  // resolves instantly and never waits for the round trip. Wait for the
  // heading to actually become the confirmation.
  const confirmed = await page
    .waitForFunction(
      () => document.querySelector("h1")?.textContent?.trim().startsWith("Order "),
      null,
      { timeout: 30000 },
    )
    .then(() => true)
    .catch(() => false);
  ok("order confirmation appears", confirmed);

  const heading = (await page.locator("h1").first().innerText()).trim();
  ok("order is placed and referenced", heading.startsWith("Order LUM-"), heading);

  // Scoped to the confirmation's own list — the footer has an hours table too
  const confirmedTotal = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("main dl > div")];
    const last = rows[rows.length - 1];
    return last?.querySelector("dd")?.textContent?.trim() ?? "";
  });
  ok(
    "server's total matches the basket",
    confirmedTotal === summaryTotal,
    `basket ${summaryTotal} vs confirmation ${confirmedTotal}`,
  );

  ok("basket is emptied after ordering", (await basket()).includes("empty"), await basket());
}

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
