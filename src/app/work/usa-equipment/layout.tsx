import { Archivo, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import { DemoBar } from "@/components/demo-bar";
import { UsaFooter, UsaHeader, YardBar } from "./chrome";
import { ViewportExtras } from "./quote-ui";

/**
 * Chrome shared by every page of the yard site.
 *
 * The three faces go through `next/font`, which downloads and self-hosts them
 * at build time — no render-blocking request to Google, and the files come off
 * the same origin as everything else. They are declared here rather than in the
 * root layout so only these routes carry the weight; the mockup's three
 * `<link>` tags to fonts.googleapis.com would have cost a preconnect, a
 * stylesheet round trip and a third-party dependency on every page.
 *
 * Only the weights actually used are requested. Archivo ships 700 and 800,
 * Public Sans 400 and 600, IBM Plex Mono 400 and 500 — six faces rather than
 * the full variable range.
 *
 * `.usaeq` scopes the palette. Unlike Lumen it does not follow the portfolio's
 * light/dark toggle: the identity is a painted machine, and there is no dark
 * version of a painted machine.
 */

const display = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-ue-display",
});

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-ue-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-ue-mono",
});

export default function UsaEquipmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`usaeq flex min-h-full flex-col ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <DemoBar name="USA Equipment Co." slug="usa-equipment" />

      {/* The strip and the header travel together, pinned under the demo bar */}
      <div className="sticky top-11 z-40">
        <YardBar />
        <UsaHeader />
      </div>

      <main className="flex-1">{children}</main>

      <UsaFooter />

      <ViewportExtras />
    </div>
  );
}
