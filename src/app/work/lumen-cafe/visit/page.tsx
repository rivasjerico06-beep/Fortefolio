import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PageTitle, SectionHead } from "../chrome";
import { BASE, address, gallery } from "../data";
import { EnquiryForm, HoursTable } from "./parts";

export const metadata: Metadata = {
  title: "Visit — Lumen Café",
  description:
    "114 Kalayaan Avenue, Poblacion. Opening hours, how to get here, and how to reach us.",
};

const gettingHere = [
  "Two minutes on foot from the Kalayaan jeepney stop, heading away from the main road.",
  "There is no parking directly out front. The lot behind the building is free after 18:00.",
  "The entrance is a single step up. Ask and we will happily bring your order out to you.",
  "Twelve seats, first come first served. We do not take bookings.",
];

export default function VisitPage() {
  return (
    <>
      <PageTitle
        index="04"
        label="Visit"
        title="Visit"
        intro="We are on Kalayaan Avenue, open from seven every day. The twelve seats are first come, first served."
      />

      {/* Address and hours */}
      <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="lc-eyebrow">01 — Where</p>
            <address className="mt-6 text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.25] not-italic">
              {address.street}
              <br />
              {address.area}
              <br />
              <span style={{ color: "var(--lc-fg-2)" }}>{address.postcode}</span>
            </address>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <a
                href={`tel:${address.phone.replace(/\s/g, "")}`}
                className="lc-accented lc-eyebrow inline-flex items-center gap-2"
              >
                <Phone className="size-4" aria-hidden />
                {address.phone}
              </a>
              <a
                href="https://maps.google.com"
                className="lc-accented lc-eyebrow inline-flex items-center gap-2"
              >
                <MapPin className="size-4" aria-hidden />
                Open in Maps
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="lc-eyebrow">02 — When</p>
            <div className="mt-6">
              <HoursTable />
            </div>
            <p className="mt-5 text-[15px] leading-relaxed" style={{ color: "var(--lc-fg-2)" }}>
              The kitchen closes an hour before we do, and the last coffee goes out fifteen
              minutes before close. That is not us being difficult — it is the only way the
              machine gets cleaned before midnight.
            </p>
          </div>
        </div>
      </section>

      {/* Map / room */}
      <Reveal kind="scale">
        <div
          className="ken-burns relative aspect-[21/9] w-full overflow-hidden border-y"
          style={{ borderColor: "var(--lc-line)" }}
        >
          <Image
            src={gallery[3].image}
            alt={gallery[3].alt}
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
        </div>
      </Reveal>

      {/* Getting here */}
      <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <SectionHead index="03" label="Getting here" />
        <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {gettingHere.map((line, index) => (
            <Reveal as="li" key={line} kind="up" stagger={index} className="flex gap-5">
              <span
                className="lc-eyebrow shrink-0 pt-1"
                style={{ color: "var(--lc-accent-text)" }}
              >
                0{index + 1}
              </span>
              <span className="text-[17px] leading-relaxed" style={{ color: "var(--lc-fg-2)" }}>
                {line}
              </span>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Enquiry */}
      <section
        className="border-t py-16 sm:py-24"
        style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
      >
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lc-sticky">
              <p className="lc-eyebrow">04 — Ask us something</p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.25rem)] leading-[0.95]">
                Large orders, private hire, or anything this page has not answered
              </h2>
              <p
                className="mt-6 max-w-xs text-[16px] leading-relaxed"
                style={{ color: "var(--lc-fg-2)" }}
              >
                If it is quicker to phone, phone. Otherwise this reaches the same place.
              </p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <EnquiryForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 pb-8 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-6 py-14">
          <p className="text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
            Wondering what to order?
          </p>
          <Link href={`${BASE}/menu`} className="lc-link lc-eyebrow">
            Have a look at the menu
          </Link>
        </div>
      </section>
    </>
  );
}
