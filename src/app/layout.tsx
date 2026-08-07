import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { themeInitScript } from "@/components/theme-toggle";
import { revealInitScript, ScrollEngine } from "@/components/motion/scroll-engine";
import { siteConfig } from "@/lib/site-config";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
