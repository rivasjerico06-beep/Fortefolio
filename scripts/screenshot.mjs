/**
 * Visual smoke test. Loads every route against a running server, screenshots it
 * at desktop and mobile width, and reports console errors, bad status codes,
 * and horizontal overflow.
 *
 * Runs with reducedMotion: "reduce" so the scroll-driven reveal animations are
 * disabled — otherwise a full-page capture freezes every off-screen section at
 * opacity 0 and the screenshots come out blank.
 *
 *   npm run build && npm start          (in one terminal)
 *   npm run shots                       (in another)
 *
 * Screenshots land in .screenshots/ (git-ignored).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOT_DIR ?? ".screenshots";
mkdirSync(OUT, { recursive: true });

const routes = [
  ["home", "/"],
  ["projects", "/projects"],
  ["case-study", "/projects/atlas"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["work-lumen", "/work/lumen-cafe"],
  ["work-lumen-menu", "/work/lumen-cafe/menu"],
  ["work-lumen-about", "/work/lumen-cafe/about"],
  ["work-lumen-blog", "/work/lumen-cafe/blog"],
  ["work-lumen-blog-2", "/work/lumen-cafe/blog/page/2"],
  ["work-lumen-post", "/work/lumen-cafe/blog/washed-benguet-on-the-grinder"],
  ["work-lumen-visit", "/work/lumen-cafe/visit"],
  ["work-lumen-shop", "/work/lumen-cafe/shop"],
  ["work-lumen-product", "/work/lumen-cafe/shop/washed-benguet"],
  ["work-lumen-soldout", "/work/lumen-cafe/shop/sidama-natural"],
  ["work-lumen-checkout", "/work/lumen-cafe/checkout"],
  ["work-nimbus", "/work/nimbus"],
  ["work-atlas", "/work/atlas"],
  ["work-verde", "/work/verde"],
];

const browser = await chromium.launch();
const problems = [];

/**
 * Capture, with one retry.
 *
 * Chromium intermittently answers `Page.captureScreenshot` with "Unable to
 * capture screenshot" on the taller pages here — the home page is over
 * 10,000px, so a full-page capture is a ~55MB bitmap and the compositor
 * occasionally is not ready for it. It is a harness flake rather than a page
 * fault, so retry once from the top of the page; if it fails twice, record it
 * and carry on so the rest of the routes still get checked.
 */
async function capture(page, path) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.screenshot({ path, fullPage: true });
      return;
    } catch (error) {
      if (attempt === 2) {
        problems.push(`${path} could not be captured: ${error.message.split("\n")[0]}`);
        return;
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    }
  }
}

for (const [name, path] of routes) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`${path} console: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`${path} pageerror: ${e.message}`));

  const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  if (!res || res.status() !== 200) problems.push(`${path} returned HTTP ${res?.status()}`);

  await capture(page, `${OUT}/${name}.png`);
  await ctx.close();

  // Mobile gets its own context and a *fresh load*, not a resize of the desktop
  // one. Resizing after load hides a whole class of bug: a reveal that starts
  // translated sideways overflows the viewport only until it fires, and by the
  // time you have resized, it already has. That is exactly how an 8px
  // horizontal scroll on two pages went unnoticed.
  for (const width of [375, 390]) {
    const mobileCtx = await browser.newContext({
      viewport: { width, height: 800 },
      reducedMotion: "reduce",
    });
    const mobile = await mobileCtx.newPage();
    mobile.on("console", (m) => {
      if (m.type() === "error") problems.push(`${path} @${width} console: ${m.text()}`);
    });
    mobile.on("pageerror", (e) => problems.push(`${path} @${width} pageerror: ${e.message}`));

    await mobile.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const overflow = await mobile.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1)
      problems.push(`${path} scrolls horizontally at ${width}px (${overflow}px)`);

    if (width === 390) await capture(mobile, `${OUT}/${name}-mobile.png`);
    await mobileCtx.close();
  }
}

// Dark-theme pass over the portfolio pages
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("theme", "dark"));
for (const [name, path] of [
  ["home", "/"],
  ["projects", "/projects"],
  ["work-atlas", "/work/atlas"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await capture(page, `${OUT}/${name}-dark.png`);
}
await ctx.close();
await browser.close();

if (problems.length) {
  console.log(`FAIL — ${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
}
console.log(`OK — ${routes.length} routes, no console errors, no overflow. Shots in ${OUT}/`);
