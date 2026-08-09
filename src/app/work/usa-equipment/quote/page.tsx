import type { Metadata } from "next";
import { BASE } from "../data";
import { Breadcrumb } from "../parts";
import { QuoteWizard } from "./wizard";

export const metadata: Metadata = {
  title: "Request a quote — USA Equipment Co.",
  description:
    "Build a list of units and send it to the Magnolia yard. No account, no card, and a callback within one business hour.",
};

export default function QuotePage() {
  return (
    <div className="max-w-[65rem] px-4 pt-6 pb-14 sm:px-[5.5vw] sm:pt-10 sm:pb-24 xl:px-20">
      <Breadcrumb trail={[{ label: "Home", href: BASE }, { label: "Request a quote" }]} />

      <h1 className="mb-6 text-[clamp(2.125rem,4.4vw,3.25rem)]">Request a quote</h1>

      <QuoteWizard />
    </div>
  );
}
