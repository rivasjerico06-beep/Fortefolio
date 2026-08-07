import type { CSSProperties } from "react";

/**
 * The contract every "theme" in the kit fills in.
 *
 * This mirrors how WordPress actually works: one theme framework, and each site
 * differs by what the customiser sets. Here that is a handful of CSS custom
 * properties scoped to the demo's root element, so all four demos share the
 * same components while looking like four different theme installs.
 */
export type WpTheme = {
  /** Page background behind the content column */
  bg: string;
  /** Content card / widget background */
  surface: string;
  /** A slightly recessed fill, used for widget headers and table stripes */
  surfaceAlt: string;
  ink: string;
  ink2: string;
  line: string;
  accent: string;
  accentInk: string;
  headerBg: string;
  headerInk: string;
  footerBg: string;
  footerInk: string;
  /** Heading face — most classic themes pair a serif with a sans body */
  headingFont: string;
};

/** Zero-download faces. Nothing here adds a byte to the page. */
export const SERIF = "Georgia, 'Times New Roman', Times, serif";
export const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Turns a theme into the inline custom properties the kit's CSS reads. */
export function themeVars(theme: WpTheme): CSSProperties {
  return {
    colorScheme: "light",
    "--wp-bg": theme.bg,
    "--wp-surface": theme.surface,
    "--wp-surface-alt": theme.surfaceAlt,
    "--wp-ink": theme.ink,
    "--wp-ink-2": theme.ink2,
    "--wp-line": theme.line,
    "--wp-accent": theme.accent,
    "--wp-accent-ink": theme.accentInk,
    "--wp-header-bg": theme.headerBg,
    "--wp-header-ink": theme.headerInk,
    "--wp-footer-bg": theme.footerBg,
    "--wp-footer-ink": theme.footerInk,
    "--wp-heading-font": theme.headingFont,
  } as CSSProperties;
}
