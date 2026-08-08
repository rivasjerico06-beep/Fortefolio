/**
 * Verifies the motion layer without trusting it.
 *
 * The risk with any scroll-animation system is content that starts hidden and
 * never becomes visible. These checks prove the opposite in the three cases
 * that matter: JavaScript on, JavaScript off, and reduced motion.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOT_DIR ?? ".screenshots/motion";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const fails = [];
const ok = (label, cond, detail = "") =>
  cond
    ? console.log(`  PASS  ${label}${detail && " — " + detail}`)
    : fails.push(`${label}${detail && " — got: " + detail}`);

/* 1. With JavaScript: hero words animate in, content ends up visible --------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fails.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  const heroWord = page.locator(".word-rise span span").first();
  ok("hero words are visible after animating", await heroWord.isVisible());

  // Wait for the transition to actually settle rather than guessing a duration —
  // the reveal starts when the observer fires, not when the page loads.
  const settled = await page
    .waitForFunction(
      () => {
        const el = document.querySelector(".word-rise span span");
        return el !== null && getComputedStyle(el).opacity === "1";
      },
      null,
      { timeout: 6000 },
    )
    .then(() => true)
    .catch(() => false);
  ok("hero word settles at full opacity", settled);
  await page.screenshot({ path: `${OUT}/hero.png` });

  // Scroll to a mid-page section and confirm its reveal fired
  const missions = page.getByRole("heading", { name: /commitments every brief/i });
  await missions.scrollIntoViewIfNeeded();

  // Wait for the transition to settle rather than guessing a duration — a
  // fixed timeout catches it mid-flight at 0.999 and reads as a failure.
  const settledMid = await missions
    .evaluate(
      (el) =>
        new Promise((resolve) => {
          const wrap = el.closest("[data-reveal]");
          if (!wrap) return resolve("no wrapper");
          const deadline = Date.now() + 5000;
          const tick = () => {
            const value = getComputedStyle(wrap).opacity;
            if (value === "1") return resolve("1");
            if (Date.now() > deadline) return resolve(value);
            requestAnimationFrame(tick);
          };
          tick();
        }),
    )
    .catch(() => "threw");
  ok("mid-page reveal reaches opacity 1", settledMid === "1", String(settledMid));

  await ctx.close();
}

/* 2. The pinned scroll scene actually responds to scroll --------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  const readBar = () =>
    page.evaluate(() => {
      const panel = document.querySelector('[data-scene="weight"]');
      return panel ? getComputedStyle(panel).getPropertyValue("--b0").trim() : "";
    });

  // Step through the scene and capture the middle of it
  const wrapBox = await page.locator('[data-scene-wrap="weight"]').boundingBox();
  if (wrapBox) {
    await page.evaluate((y) => window.scrollTo(0, y), wrapBox.y + wrapBox.height * 0.45);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/scene-mid.png` });

    const mid = await readBar();
    ok(
      "pinned scene progress is driven by scroll",
      mid !== "" && Number(mid) > 0,
      `--b0=${mid}`,
    );

    await page.evaluate((y) => window.scrollTo(0, y), wrapBox.y + wrapBox.height * 0.95);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/scene-end.png` });
  } else {
    fails.push("could not locate the pinned scene wrapper");
  }

  await ctx.close();
}

/* 2b. Scrub text and horizontal gallery respond to scroll -------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  // boundingBox() is viewport-relative, which goes wrong the moment the page is
  // already scrolled. Measure in document space instead.
  const rectOf = (selector) =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return { y: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight };
    }, selector);

  // Scrub statement: dim at the start of its scene, fully lit by the end
  const scrubBox = await rectOf('[data-scene-wrap="scrub"]');
  const lastWordOpacity = () =>
    page.evaluate(() => {
      const words = document.querySelectorAll(".scrub-word");
      const last = words[words.length - 1];
      return last ? Number(getComputedStyle(last).opacity) : -1;
    });

  await page.evaluate((y) => window.scrollTo(0, y), scrubBox.y + 40);
  await page.waitForTimeout(500);
  const dim = await lastWordOpacity();

  await page.evaluate((y) => window.scrollTo(0, y), scrubBox.y + scrubBox.height - 950);
  await page.waitForTimeout(500);
  const lit = await lastWordOpacity();

  ok("scrub text starts dim", dim < 0.5, `opacity=${dim.toFixed(2)}`);
  ok("scrub text ends fully lit", lit > 0.95, `opacity=${lit.toFixed(2)}`);
  await page.screenshot({ path: `${OUT}/scrub-lit.png` });

  // Horizontal gallery: the track should translate as the page scrolls
  const galleryBox = await rectOf('[data-scene-wrap="gallery"]');
  const trackX = () =>
    page.evaluate(() => {
      const track = document.querySelector(".hscene-track");
      return track ? getComputedStyle(track).transform : "none";
    });

  await page.evaluate((y) => window.scrollTo(0, y), galleryBox.y + 40);
  await page.waitForTimeout(500);
  const startX = await trackX();

  await page.evaluate((y) => window.scrollTo(0, y), galleryBox.y + galleryBox.height * 0.6);
  await page.waitForTimeout(500);
  const midX = await trackX();
  await page.screenshot({ path: `${OUT}/gallery-mid.png` });

  ok("horizontal gallery track moves with scroll", startX !== midX, `${startX} → ${midX}`);
  ok("horizontal gallery actually translates left", /matrix\(1, 0, 0, 1, -\d/.test(midX), midX);

  await ctx.close();
}

/* 3. Without JavaScript: everything must still be readable ------------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });

  const heroWord = page.locator(".word-rise span span").first();
  ok("no-JS: hero text visible", await heroWord.isVisible());
  ok(
    "no-JS: hero text at full opacity",
    (await heroWord.evaluate((el) => getComputedStyle(el).opacity)) === "1",
  );

  const missions = page.getByRole("heading", { name: /commitments every brief/i });
  ok("no-JS: below-the-fold section visible", await missions.isVisible());

  // The scrub statement must be lit, not stuck dim, when nothing drives --p
  const scrubLit = await page.evaluate(() => {
    const words = document.querySelectorAll(".scrub-word");
    const last = words[words.length - 1];
    return last ? Number(getComputedStyle(last).opacity) : -1;
  });
  ok("no-JS: scrub statement fully lit", scrubLit > 0.95, `opacity=${scrubLit}`);

  // The gallery must fall back to a reachable horizontal scroller
  const galleryScrollable = await page.evaluate(() => {
    const panel = document.querySelector(".hscene-panel");
    if (!panel) return false;
    const style = getComputedStyle(panel);
    return style.overflowX === "auto" && panel.scrollWidth > panel.clientWidth;
  });
  ok("no-JS: work gallery is a reachable horizontal scroller", galleryScrollable);

  await page.screenshot({ path: `${OUT}/no-js.png`, fullPage: true });
  await ctx.close();
}

/* 4. Reduced motion: no hidden states at all --------------------------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 1,
      ).length,
  );
  ok("reduced motion: zero elements left under full opacity", hidden === 0, `${hidden} hidden`);
  await ctx.close();
}

/* 5. The café menu — the one demo page that animates its own content ---------
   Its menu rows are reveals, so the same guarantee has to hold here: readable
   with no JavaScript, and nothing left hidden under reduced motion. The looping
   decoration is checked too, since a stalled marquee is a visible bug. */
{
  const MENU = `${BASE}/work/lumen-cafe/menu`;
  const rowCount = (page) => page.evaluate(() => document.querySelectorAll("li.lc-row").length);
  const hiddenRows = (page) =>
    page.evaluate(
      () =>
        [...document.querySelectorAll("li.lc-row")].filter(
          (el) => Number(getComputedStyle(el).opacity) < 1,
        ).length,
    );

  {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      javaScriptEnabled: false,
    });
    const page = await ctx.newPage();
    await page.goto(MENU, { waitUntil: "load" });

    const rows = await rowCount(page);
    ok("no-JS: menu rows are present", rows === 14, `${rows} rows`);
    ok("no-JS: every menu row is fully visible", (await hiddenRows(page)) === 0);
    ok(
      "no-JS: the featured image still renders",
      await page.locator("#espresso img").first().isVisible(),
    );
    await page.screenshot({ path: `${OUT}/menu-no-js.png`, fullPage: true });
    await ctx.close();
  }

  {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(MENU, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    ok("reduced motion: no menu row left hidden", (await hiddenRows(page)) === 0);

    // Every looping animation must have come to rest, not merely slowed down.
    // Asks the document rather than a list of selectors: the demo grew a lot of
    // loops, and a hand-maintained list would quietly stop covering them.
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => a.animationName ?? "unnamed"),
    );
    ok(
      "reduced motion: every animation on the page is stopped",
      running.length === 0,
      `${running.length} running${running.length ? ": " + [...new Set(running)].join(", ") : ""}`,
    );
    await ctx.close();
  }

  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(MENU, { waitUntil: "networkidle" });

    // ...and with motion allowed, it must actually be moving
    const track = page.locator(".marquee").first();
    const before = await track.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(900);
    const after = await track.evaluate((el) => getComputedStyle(el).transform);
    ok("notice bar keeps scrolling", before !== after, `${before} → ${after}`);

    // Jumping to a section must reveal that section. Rows further up are
    // skipped over entirely and stay unrevealed until they are scrolled back
    // to, which is the intended behaviour — so only assert on where we landed.
    await page.locator("#kitchen").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    // The invariant that matters: nothing squarely on screen sits at opacity 0.
    // The observer's root is inset 10% at the bottom, so a row clipped by the
    // fold has legitimately not fired yet — measure against that same box.
    const hiddenOnScreen = await page.evaluate(() => {
      const fold = window.innerHeight * 0.9;
      return [...document.querySelectorAll("li.lc-row")].filter((el) => {
        const box = el.getBoundingClientRect();
        const settled = box.top >= 0 && box.bottom <= fold;
        return settled && Number(getComputedStyle(el).opacity) < 1;
      }).length;
    });
    ok(
      "jumping to a section reveals what lands on screen",
      hiddenOnScreen === 0,
      `${hiddenOnScreen} hidden`,
    );

    // Walking the page normally must leave nothing behind
    await page.evaluate(() => window.scrollTo(0, 0));
    for (let y = 0; y < 5000; y += 400) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(1200);
    ok("scrolling through reveals every row", (await hiddenRows(page)) === 0);
    await page.screenshot({ path: `${OUT}/menu-revealed.png`, fullPage: true });
    await ctx.close();
  }
}

await browser.close();

if (fails.length) {
  console.log(`\nFAILED — ${fails.length} check(s):`);
  for (const fail of fails) console.log(`  · ${fail}`);
  process.exit(1);
}
console.log("\nAll motion checks passed.");
