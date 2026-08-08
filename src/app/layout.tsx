import type { Metadata } from "next";
import { themeInitScript } from "@/components/theme-toggle";
import { revealInitScript, ScrollEngine } from "@/components/motion/scroll-engine";
import { siteConfig } from "@/lib/site-config";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

/**
 * The portfolio's own faces are loaded in `(site)/layout.tsx`, not here.
 *
 * `next/font` preloads whatever the rendered tree declares, so having them on
 * `<html>` meant every demo under /work downloaded Geist and Geist Mono as
 * well — around 150KB of fonts none of them use. The demos each set their own
 * type: Lumen loads Instrument Serif and Inter Tight, and the other three use
 * system stacks on purpose.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.brand} — ${siteConfig.name}, ${siteConfig.role}`,
    template: `%s — ${siteConfig.brand}`,
  },
  description: siteConfig.intro,
  openGraph: {
    title: `${siteConfig.brand} — ${siteConfig.name}`,
    description: siteConfig.intro,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        {/* Both run before first paint: one picks the theme, one arms the
            reveal animations (and a failsafe that un-hides everything if the
            app never hydrates). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: revealInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ScrollEngine />
        {children}
      </body>
    </html>
  );
}
