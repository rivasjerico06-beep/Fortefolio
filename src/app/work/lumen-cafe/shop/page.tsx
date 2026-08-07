import type { Metadata } from "next";
import { PageTitle } from "../chrome";
import { FREE_DELIVERY_OVER, formatPeso } from "./catalog";
import { ShopGrid } from "./shop-grid";

export const metadata: Metadata = {
  title: "Shop — Lumen Café",
  description:
    "Beans roasted eight kilometres away, brewing kit we actually use, and a few things off the shelf.",
};

export default function ShopPage() {
  return (
    <>
      <PageTitle
        index="05"
        label="Shop"
        title="Shop"
        intro={`Beans roasted every Tuesday, the kit we use on the bar, and a few things off the shelf. Delivery across Metro Manila is free over ${formatPeso(FREE_DELIVERY_OVER)}.`}
      />

      <div className="mx-auto max-w-[90rem] px-5 pt-10 pb-24 sm:px-10">
        <ShopGrid />
      </div>
    </>
  );
}
