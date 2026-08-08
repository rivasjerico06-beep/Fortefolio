import { Instrument_Serif, Inter_Tight } from "next/font/google";
import { DemoBar } from "@/components/demo-bar";
import { LumenFooter, NoticeBar } from "./chrome";
import { LumenHeader } from "./nav";
import { PageTransition } from "./page-transition";
import { CartDrawer } from "./shop/cart";

/**
 * Chrome shared by every Lumen page.
 *
 * The two faces are loaded through `next/font`, which downloads and self-hosts
 * them at build time. That matters twice over: no render-blocking request to a
 * third party, and the font files are served from the same origin as everything
 * else. They are imported here rather than in the root layout so only these
 * routes carry the weight.
 *
 * The `.lumen` class scopes the demo's own palette. It follows the portfolio's
 * light/dark toggle, because the tokens are declared against `[data-theme]`
 * rather than hard-coded.
 */

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-lumen-serif",
});

const sans = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lumen-sans",
});

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`lumen flex min-h-full flex-col ${serif.variable} ${sans.variable}`}>
      <DemoBar name="Lumen Café" slug="lumen-cafe" />
      <NoticeBar />
      <LumenHeader />

      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <LumenFooter />

      {/* Lives in the layout so the basket is reachable from every page and
          survives navigation between them. */}
      <CartDrawer />
    </div>
  );
}
