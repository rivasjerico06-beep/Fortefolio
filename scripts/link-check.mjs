/**
 * Link integrity for the demo sites.
 *
 * The thing that makes a demo read as a mockup is a link that goes nowhere, so
 * this fails the run on three separate faults:
 *
 *   1. a bare `href="#"` — a link with no destination at all
 *   2. an in-page anchor (`#foo`) whose target id is not on the page
 *   3. an internal route that does not return 200
 *
 * External links (http, mailto, tel) are reported but not fetched.
 *
 *   npm run build && npm start     (in one terminal)
 *   npm run test:links             (in another)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * Demos that have been built out into real multi-page sites. These are held to
 * the full standard and a single dead link fails the run.
 */
const strict = [
  "/work/lumen-cafe",
  "/work/lumen-cafe/menu",
  "/work/lumen-cafe/about",
  "/work/lumen-cafe/blog",
  "/work/lumen-cafe/blog/page/2",
  "/work/lumen-cafe/blog/washed-benguet-on-the-grinder",
  "/work/lumen-cafe/visit",
];

/**
 * Demos still waiting their turn. Their placeholder links are counted and
 * reported so the remaining work stays visible, but they do not fail the run.
 * Move a route up to `strict` as soon as its demo is finished.
 */
const pending = ["/work/nimbus", "/work/verde", "/work/atlas"];

const pages = [...strict, ...pending];
const isStrict = (path) => strict.includes(path);

const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [];
const deferred = new Map(); // route → count of known placeholder links
const statusCache = new Map();
let checked = 0;
let external = 0;

function report(path, message) {
  if (isStrict(path)) problems.push(message);
  else deferred.set(path, (deferred.get(path) ?? 0) + 1);
}

async function statusOf(path) {
  if (statusCache.has(path)) return statusCache.get(path);
  const response = await page.request.get(`${BASE}${path}`);
  statusCache.set(path, response.status());
  return response.status();
}

for (const path of pages) {
  const response = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  if (!response || response.status() !== 200) {
    problems.push(`${path} itself returned HTTP ${response?.status()}`);
    continue;
  }

  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a")].map((a) => ({
      href: a.getAttribute("href"),
      text: (a.textContent || "").trim().slice(0, 40),
    })),
  );

  const ids = await page.evaluate(() =>
    [...document.querySelectorAll("[id]")].map((el) => el.id),
  );

  for (const link of links) {
    const { href, text } = link;
    if (href === null) continue;

    if (href === "#") {
      report(path, `${path} — dead link "${text}" (href="#")`);
      continue;
    }

    if (href.startsWith("#")) {
      const target = href.slice(1);
      if (!ids.includes(target)) {
        report(path, `${path} — anchor "${text}" points at #${target}, not on the page`);
      }
      checked += 1;
      continue;
    }

    if (href.startsWith("/")) {
      const clean = href.split("#")[0];
      const status = await statusOf(clean);
      if (status !== 200) report(path, `${path} — "${text}" → ${clean} returned ${status}`);
      checked += 1;
      continue;
    }

    external += 1;
  }
}

await browser.close();

console.log(
  `Checked ${checked} internal links across ${pages.length} pages (${external} external, not fetched).`,
);

if (deferred.size) {
  const total = [...deferred.values()].reduce((sum, n) => sum + n, 0);
  console.log(`\n${total} placeholder link(s) in demos not yet built out:`);
  for (const [path, count] of deferred) console.log(`  · ${path} — ${count}`);
}

if (problems.length) {
  console.log(`\nFAILED — ${problems.length} problem(s) in finished demos:`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
}
console.log(`\nFinished demos are clean: no dead links, broken anchors, or bad routes.`);
