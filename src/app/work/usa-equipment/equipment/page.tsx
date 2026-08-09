import type { Metadata } from "next";
import { Suspense } from "react";
import { BASE, CATEGORIES, getStatusCounts, getUnits } from "../data";
import { Breadcrumb } from "../parts";
import { Catalog } from "./catalog";
import { StaticFleet } from "./fleet";

export const metadata: Metadata = {
  title: "Equipment — USA Equipment Co.",
  description:
    "The whole fleet: light towers, generators, compaction, pumps, lifts and washers, with live yard status on every unit.",
};

export default async function EquipmentPage() {
  const units = await getUnits();
  const counts = await getStatusCounts();

  return (
    <div className="px-4 pt-6 pb-14 sm:px-[5.5vw] sm:pt-10 sm:pb-20 xl:px-20">
      <Breadcrumb trail={[{ label: "Home", href: BASE }, { label: "Equipment" }]} />

      {/* The fallback is not a spinner — it is the complete catalogue, rendered
          on the server with its filters as links. `Catalog` reads the URL and
          so cannot prerender, so this is what lands in the static HTML and what
          a crawler or a no-JavaScript reader actually gets. Keeping the route
          static is the point: every page in this app builds to a file. */}
      <Suspense
        fallback={<StaticFleet units={units} counts={counts} categories={CATEGORIES} />}
      >
        <Catalog units={units} counts={counts} categories={CATEGORIES} />
      </Suspense>
    </div>
  );
}
