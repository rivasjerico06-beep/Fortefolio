"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Runs before first paint (injected in the document head) so the correct theme
 * is on <html> before anything renders and the page never flashes. Colour
 * transitions are enabled one frame later, so the first paint is instant but
 * later theme swaps animate.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
  requestAnimationFrame(function () {
    document.documentElement.classList.add("theme-transition");
  });
})();
`;

/**
 * Holds no React state: the current theme lives on the <html> element, which is
 * the thing that actually needs to change. That keeps server and client markup
 * identical, so there is no hydration mismatch and no mounted flag.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked (private mode) — the toggle still works for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className="border-line text-ink-2 hover:border-line-strong hover:text-ink grid size-9 place-items-center rounded-lg border transition-colors"
    >
      {/* Both icons render; CSS picks the one that matches the active theme */}
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
