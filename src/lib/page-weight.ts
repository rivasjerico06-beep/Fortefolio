/**
 * Reads how many bytes this page actually transferred, from the Performance
 * API. Returns null when the browser will not tell us — `transferSize` reads 0
 * for cross-origin responses that lack a Timing-Allow-Origin header, and we
 * would rather show nothing than a wrong number.
 */
export function measurePageWeightKb(): number | null {
  if (typeof performance === "undefined") return null;

  const nav = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];

  const total =
    (nav?.transferSize ?? 0) + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

  return total > 0 ? total / 1024 : null;
}

/** Subscribes to the measurement, running it once the page has finished loading. */
export function onPageWeight(callback: (kb: number) => void) {
  const run = () => {
    const kb = measurePageWeightKb();
    if (kb !== null) callback(kb);
  };

  if (document.readyState === "complete") {
    run();
    return () => {};
  }

  window.addEventListener("load", run, { once: true });
  return () => window.removeEventListener("load", run);
}

/**
 * Sustainable Web Design model — grams of CO2e for a first-time visit,
 * global grid average. An estimate, and labelled as one wherever it is shown.
 */
export const GRAMS_PER_MB = 0.494;
