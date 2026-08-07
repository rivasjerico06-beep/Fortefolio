import type { Metadata } from "next";
import { DemoBar } from "@/components/demo-bar";
import { SERIF, type WpTheme } from "@/components/wp/theme";
import { WpFooter, WpShell } from "@/components/wp/wp-chrome";
import { Storefront } from "./storefront";

export const metadata: Metadata = {
  title: "Verde Supply — demo site",
  description:
    "A WooCommerce-style shop archive: filter widgets, product grid, star ratings, and a working cart.",
};

/** Garden-centre green — the palette a plant shop would pick from a theme. */
const theme: WpTheme = {
  bg: "#f2f5ee",
  surface: "#ffffff",
  surfaceAlt: "#e7eede",
  ink: "#1f2b1c",
  ink2: "#4c5a47",
  line: "#d3ddc8",
  accent: "#2f5d33",
  accentInk: "#ffffff",
  headerBg: "#ffffff",
  headerInk: "#1f2b1c",
  footerBg: "#1f2b1c",
  footerInk: "#dde6d4",
  headingFont: SERIF,
};

export default function VerdeDemo() {
  return (
    <>
      <DemoBar name="Verde Supply" slug="verde" />

      <WpShell theme={theme}>
        {/* The header lives inside Storefront so the cart count can be live */}
        <Storefront />

        <WpFooter
          credit="Verde Supply — a demo site built for a portfolio. Not a real shop, and nothing here can actually be bought."
          columns={[
            {
              title: "Verde Supply",
              body: (
                <p>
                  Houseplants and supplies, grown in Cavite and delivered across Metro Manila
                  six days a week.
                </p>
              ),
            },
            {
              title: "Shop",
              body: (
                <ul className="space-y-1.5">
                  {["Plants", "Pots & planters", "Care & soil", "Gift cards"].map((item) => (
                    <li key={item}>
                      <a href="#" className="hover:underline">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Customer Care",
              body: (
                <ul className="space-y-1.5">
                  {[
                    "Delivery & returns",
                    "Plant care guides",
                    "Track your order",
                    "Contact",
                  ].map((item) => (
                    <li key={item}>
                      <a href="#" className="hover:underline">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Opening Hours",
              body: (
                <ul className="space-y-1">
                  <li className="flex justify-between gap-3">
                    <span>Mon – Sat</span>
                    <span className="tabular-nums">9:00 – 18:00</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>Sunday</span>
                    <span className="tabular-nums">Closed</span>
                  </li>
                </ul>
              ),
            },
          ]}
        />
      </WpShell>
    </>
  );
}
