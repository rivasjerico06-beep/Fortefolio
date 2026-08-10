import { Inter, Outfit } from "next/font/google";
import { DemoBar } from "@/components/demo-bar";
import { getMyProfile } from "./data";
import { TalkapoNav } from "./nav";

/**
 * Chrome shared by every Talkapo screen.
 *
 * The two faces go through `next/font`, self-hosted at build time, rather than
 * the mockup's `@import` from fonts.googleapis.com — that import blocks
 * rendering on a third-party round trip and is the single slowest thing in the
 * original export.
 *
 * The app is a fixed-height two-pane layout rather than a scrolling document,
 * which is what the design is: the rail and the column headers stay put and the
 * feed scrolls inside its own pane.
 */

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-tk-sans",
});

const display = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-tk-display",
});

export default async function TalkapoLayout({ children }: { children: React.ReactNode }) {
  const me = await getMyProfile();

  return (
    <div className={`talkapo flex min-h-full flex-col ${sans.variable} ${display.variable}`}>
      <DemoBar name="Talkapo" slug="talkapo" />

      {/* 2.75rem is the demo bar; the app fills exactly what is left */}
      <div className="flex h-[calc(100dvh-2.75rem)] overflow-hidden text-sm">
        <TalkapoNav me={me} />
        {children}
      </div>
    </div>
  );
}
