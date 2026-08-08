import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * The portfolio's faces live here rather than in the root layout.
 *
 * `next/font` preloads whatever the rendered tree declares. Declaring these on
 * `<html>` meant every demo under `/work` downloaded Geist and Geist Mono too —
 * roughly 150KB of fonts none of them use, since each demo sets its own type.
 * Scoping them to this layout keeps them off those routes entirely.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `font-sans` is re-applied here on purpose: `body` sits outside this div,
    // so it resolves `--font-sans` while `--font-geist-sans` is still undefined
    // and lands on the system fallback. Everything inside inherits from body
    // unless this element re-resolves it now that the variables exist.
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col font-sans`}
    >
      <a
        href="#main"
        className="focus:bg-accent focus:text-accent-ink sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
