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
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  // A real browser identity: Vercel challenges obviously-headless clients when
  // a suite hammers a production URL, and a 403 challenge page reads as a site
  // failure when it is actually bot mitigation doing its job.
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
});

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

  // The drawer claims aria-modal, so focus has to actually stay inside it —
  // otherwise Tab walks into the page behind, where nobody can see the ring.
  const inDialog = () =>
    page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
  ok("focus moves into the open drawer", await inDialog());

  let escaped = false;
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Tab");
    if (!(await inDialog())) {
      escaped = true;
      break;
    }
  }
  ok("focus is trapped in the drawer", !escaped);

  // The drawer plays an exit animation before it unmounts, so it is still in
  // the DOM for a beat after Escape — marked `data-closing`. Both halves matter:
  // the flag proves the animation ran, the count proves it actually left.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(60);
  ok(
    "Escape starts the drawer's exit animation",
    (await page.locator('[role="dialog"][data-closing="true"]').count()) === 1,
  );

  await page.waitForTimeout(700);
  ok("Escape closes the drawer", (await page.locator('[role="dialog"]').count()) === 0);

  // The sideways gallery's own scrollbar is hidden — it is scroll-driven, and a
  // native bar underneath it gives the effect away
  await page.goto(`${BASE}/work/lumen-cafe`, { waitUntil: "networkidle" });
  const galleryBar = await page.evaluate(() => {
    const panel = document.querySelector(".hscene-panel");
    return panel ? getComputedStyle(panel).scrollbarWidth : "missing";
  });
  ok("the pinned gallery hides its scrollbar", galleryBar === "none", galleryBar);

  await page.goto(`${LUMEN}/shop/lumen-mug`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to basket" }).click();
  await page.waitForTimeout(600);
  await page.locator('[role="dialog"] button:has-text("Close")').click();
  await page.waitForTimeout(400);

  await page.goto(`${LUMEN}/menu`, { waitUntil: "networkidle" });
  ok("basket survives navigation", (await basket()).includes("2 items"), await basket());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  ok("basket survives a reload", (await basket()).includes("2 items"), await basket());

  // The page-arrival animation starts every route at opacity 0, so it has to be
  // provably able to finish. Two ways it could strand a whole page: never
  // starting (a CSS animation waits for the first rendered frame), or ending on
  // a lingering transform, which would make the wrapper a containing block and
  // unstick every sticky panel under it.
  {
    // A product page, because it has both the wrapper and a sticky buy panel
    await page.goto(`${LUMEN}/shop/lumen-mug`, { waitUntil: "networkidle" });
    const rest = await page.evaluate(async () => {
      const el = document.querySelector("main > .lc-enter");
      if (!el) return { missing: true };
      await Promise.all(el.getAnimations().map((a) => a.finished));
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, transform: cs.transform };
    });
    ok(
      "the page arrival animation finishes clean",
      rest.opacity === "1" && rest.transform === "none",
      JSON.stringify(rest),
    );

    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(400);
    const stickyTop = await page.evaluate(() => {
      const el = document.querySelector(".lc-sticky");
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    });
    ok("sticky panels still stick under the wrapper", stickyTop === 112, `top=${stickyTop}px`);
    await page.evaluate(() => window.scrollTo(0, 0));
  }

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

// --- Lumen: every hover actually does something ------------------------------
/**
 * A hover written in the markup is not proof of a hover that happens.
 *
 * Two ways one dies silently here. Everything in globals.css is unlayered and
 * Tailwind's utilities live in `@layer utilities` — unlayered beats layered
 * whatever the specificity, so `.lc-eyebrow { color: … }` quietly outranked
 * every `hover:text-[…]` written on an eyebrow element. And an inline `style`
 * colour beats all of it, so any element coloured inline could never change on
 * hover at all. Between them that was around eight dead links per page, each
 * one looking perfectly correct in the JSX.
 *
 * So this points at each element and asks the browser whether anything moved.
 */
{
  const snapshot = (el) => {
    const read = (node, pseudo) => {
      const s = getComputedStyle(node, pseudo);
      return [
        s.color,
        s.backgroundColor,
        s.borderTopColor,
        s.opacity,
        s.transform,
        s.translate,
        s.scale,
        s.filter,
        s.backgroundSize,
        s.textDecorationLine,
      ].join("~");
    };
    return [
      read(el, null),
      read(el, "::before"),
      read(el, "::after"),
      ...[...el.querySelectorAll("*")].map((k) => read(k, null) + read(k, "::after")),
    ].join("|");
  };

  const dead = [];
  let checked = 0;

  for (const route of [
    "",
    "/menu",
    "/shop",
    "/shop/washed-benguet",
    "/blog",
    "/visit",
    "/about",
  ]) {
    await page.goto(`${BASE}/work/lumen-cafe${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    for (const handle of await page.$$("a, button, summary")) {
      if (!(await handle.isVisible())) continue;
      if (await handle.evaluate((el) => el.disabled === true)) continue;

      await page.mouse.move(2, 2);
      await page.waitForTimeout(60);
      const before = await handle.evaluate(snapshot);
      try {
        await handle.hover({ timeout: 1000 });
      } catch {
        continue; // off-screen or covered; not what this is testing
      }
      checked += 1;
      await page.waitForTimeout(400);
      if ((await handle.evaluate(snapshot)) === before) {
        const label = await handle.evaluate((el) =>
          (el.getAttribute("aria-label") || el.textContent || "icon").trim().slice(0, 30),
        );
        dead.push(`${route || "/"} — ${label.replace(/\s+/g, " ")}`);
      }
    }
  }

  ok(
    "every hover in the demo actually responds",
    dead.length === 0,
    dead.length
      ? `${dead.length}/${checked} dead: ${dead.slice(0, 5).join("; ")}`
      : `${checked} checked`,
  );
}

// --- USA Equipment: filtering, the quote list, and the CSS-only tabs --------
// The three claims worth proving here: the fleet filters without a round trip,
// the quote list survives navigation *and* a reload because it lives outside
// React, and the unit tabs work off :target rather than a click handler.
{
  const YARD = `${BASE}/work/usa-equipment`;
  const shown = () => page.locator('p[aria-live="polite"]').first().innerText();
  // Read the badge's own attribute. Matching on text would also catch the mega
  // menu's "1 hr callback", which is inside the header and starts with a digit.
  const listed = async () => {
    const badge = page.locator("[data-quote-count]");
    return (await badge.count())
      ? Number(await badge.first().getAttribute("data-quote-count"))
      : 0;
  };

  await page.goto(`${YARD}/equipment`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.removeItem("usaeq-quote"));
  await page.reload({ waitUntil: "networkidle" });

  ok("yard shows the full fleet", (await shown()).startsWith("24"), await shown());

  await page.getByRole("button", { name: /^In yard/ }).click();
  ok("status filter narrows the fleet", (await shown()).startsWith("15"), await shown());

  await page.getByRole("button", { name: /^Light Towers$/ }).click();
  ok("category and status filter together", (await shown()).startsWith("2"), await shown());

  await page.getByRole("button", { name: /Clear all/ }).click();
  ok("clear all restores the fleet", (await shown()).startsWith("24"), await shown());

  // Search is a controlled input, so typing filters without submitting
  await page.getByLabel("Search the fleet").fill("trash pump");
  ok("search narrows by spec text", (await shown()).startsWith("1"), await shown());
  await page.getByLabel("Search the fleet").fill("");

  // Add two different units from the grid
  await page.locator('[data-unit="LT-2214"]').getByRole("button", { name: /Add/ }).click();
  ok("toast confirms the add", await page.getByText("LT-2214 added").isVisible());
  await page.locator('[data-unit="GN-1140"]').getByRole("button", { name: /Add/ }).click();
  ok("quote badge counts both units", (await listed()) === 2, String(await listed()));

  // Navigate to a unit page: the list must not reset
  await page.goto(`${YARD}/equipment/LT-2214`, { waitUntil: "networkidle" });
  ok("quote list survives navigation", (await listed()) === 2, String(await listed()));

  await page.reload({ waitUntil: "networkidle" });
  ok("quote list survives a reload", (await listed()) === 2, String(await listed()));

  // Tabs are :target, so the panel swaps on an ordinary anchor click
  const terms = page.locator("#terms");
  ok("specs tab is the default panel", await page.locator("#specs").isVisible());
  ok("terms panel starts hidden", !(await terms.isVisible()));
  await page.getByRole("link", { name: "Rental terms" }).first().click();
  ok("clicking a tab reveals its panel", await terms.isVisible());
  ok("and hides the previous one", !(await page.locator("#specs").isVisible()));

  // Adding the unit already on the list should raise its quantity, not add a row
  // The full model name: "Night-Lite" alone also matches the V-Series in the
  // related-units strip, which is the same category by design.
  await page.getByRole("button", { name: /Add Allmand Night-Lite Pro II to quote/ }).click();
  ok("re-adding a unit increments it", (await listed()) === 3, String(await listed()));

  // The quote wizard, end to end
  await page.goto(`${YARD}/quote`, { waitUntil: "networkidle" });
  ok(
    "both units are on the list",
    (await page.locator("li:has(button:text('Remove'))").count()) === 2,
  );

  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByLabel(/^Name/).fill("Jordan Reyes");
  await page.getByLabel(/^Phone/).fill("(281) 555-0142");
  await page.getByRole("button", { name: /Review/ }).click();
  ok("review lists the units", await page.getByText("LT-2214 · Allmand").isVisible());

  await page.getByRole("button", { name: /Send request/ }).click();
  await page.waitForTimeout(500);
  ok(
    "the server action confirms the request",
    await page.getByText("Request sent.").isVisible(),
  );
  ok("and the list is emptied afterwards", (await listed()) === 0, String(await listed()));
}

// --- Talkapo: the feed reads publicly, everything else is gated -------------
// These run whether or not a Supabase project is configured, because the claim
// being tested holds in both modes: the feed is readable by a signed-out
// visitor, and every write and the whole lobby are not.
{
  const TK = `${BASE}/work/talkapo`;

  await page.goto(TK, { waitUntil: "networkidle" });

  /* Not a post count. Nothing on this feed is permanent any more — the seeded
     cast was deleted when accounts became real, and everything a visitor
     writes expires after 24 hours — so an empty feed is a correct state, not a
     failure. What has to hold is that a signed-out visitor gets a working
     page: either posts, or the empty state that invites them to make one. */
  const posts = page.locator("main li:has(time)");
  const empty = await page
    .getByText("Nothing here yet")
    .isVisible()
    .catch(() => false);
  ok(
    "talkapo feed renders for a signed-out visitor",
    (await posts.count()) > 0 || empty,
    `${await posts.count()} posts${empty ? ", empty state shown" : ""}`,
  );

  /* The feed has to be in the HTML, not painted in by script — that is the
     difference between a crawlable page and a client-rendered one. Asserted
     against whatever is actually on the page rather than against a known post:
     the seeded cast was deleted once accounts became real, and a test pinned to
     a fixture starts failing for reasons that have nothing to do with the
     claim it is making. */
  const html = await (await page.request.get(TK)).text();
  const shown = await posts.count();
  const firstPostText = shown
    ? (await posts.first().locator("p").first().innerText()).trim()
    : null;
  ok(
    "feed is server-rendered, not fetched by the client",
    html.includes("For You") && (firstPostText === null || html.includes(firstPostText)),
    shown ? `${shown} posts, first one present in raw HTML` : "feed empty",
  );

  ok(
    "composer is replaced by a login prompt",
    await page.getByText("Log in to post to the feed.").isVisible(),
  );

  // Liking while signed out must explain itself rather than silently failing
  await page.getByRole("button", { name: "Like" }).first().click();
  await page.waitForTimeout(250);
  ok(
    "liking signed out prompts for an account",
    await page.getByText("Log in to like posts.").first().isVisible(),
  );
  ok(
    "and offers the log-in link",
    await page.getByText("Have an account? Log in").first().isVisible(),
  );

  // Private conversations are refused by the database, so the page has
  // nothing to reveal — not even the inbox list.
  await page.goto(`${TK}/messages`, { waitUntil: "networkidle" });
  ok("messages are gated", await page.getByText("Messages are private").isVisible());

  /* What must not reach a signed-out visitor is the inbox itself and anything
     in it — the people search, a conversation list, a thread link. The empty
     "Pick a conversation" panel does appear in the flight payload, because it
     is a sibling segment Next renders even though the layout never displays
     it; it is fixed copy with no data in it, so that is noise rather than a
     leak, and asserting on it would only make this test brittle. */
  const dmHtml = await (await page.request.get(`${TK}/messages`)).text();
  ok(
    "no inbox reaches a signed-out visitor",
    !dmHtml.includes("Search people") &&
      !dmHtml.includes("No conversations yet") &&
      !/\/work\/talkapo\/messages\/[0-9a-f-]{36}/.test(dmHtml),
  );

  /* Probing a thread id while signed out returns the same gate as the inbox
     rather than a 404: the layout stops before the thread page runs. That is
     the friendlier answer and leaks nothing. What has to hold is that the
     response does not depend on whether the id exists, so it cannot be used to
     test for one. The 404 path is for a *signed-in* caller opening someone
     else's thread, which needs two accounts and is covered by the live
     end-to-end run instead. */
  const probe = await page.request.get(`${TK}/messages/00000000-0000-4000-8000-000000000000`);
  const other = await page.request.get(`${TK}/messages/ffffffff-ffff-4fff-8fff-ffffffffffff`);
  const probeBody = await probe.text();
  ok(
    "probing a thread id signed out reveals nothing",
    probeBody.includes("Messages are private") && !probeBody.includes("Search people"),
  );
  ok(
    "and answers identically for any id",
    probe.status() === other.status() && probeBody.length === (await other.text()).length,
    `${probe.status()} vs ${other.status()}`,
  );

  // Nav items the demo does not implement say so instead of going nowhere
  await page.goto(TK, { waitUntil: "networkidle" });
  const explore = page.getByTitle("Explore is not part of this demo");
  ok("unimplemented nav is disabled, not a dead link", (await explore.count()) === 1);
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
