import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/contact-form";
import { Reveal, WordRise } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Brief",
  description: `Start a project with ${siteConfig.brand}.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
      <Reveal kind="blur">
        <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
          Start a brief
        </p>
      </Reveal>

      <h1 className="mt-8 max-w-4xl text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
        <WordRise as="span" text="Tell me what" className="block" />
        <WordRise as="span" text="you want built." className="block" offset={3} />
      </h1>

      <Reveal kind="up" stagger={1}>
        <p className="text-ink-2 mt-10 max-w-xl text-lg leading-relaxed">
          The more specific you can be about who the site is for and what it needs to do, the
          more useful my first reply will be.
        </p>
      </Reveal>

      <div className="mt-20 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-24">
        <Reveal kind="up" stagger={2}>
          <ContactForm />
        </Reveal>

        <Reveal kind="right" stagger={2}>
          <aside className="space-y-10">
            <div>
              <h2 className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
                Direct
              </h2>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="text-ink-3 mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="link-wipe text-ink-2 hover:text-ink"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="text-ink-3 mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="text-ink-2">{siteConfig.location}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="text-ink-3 mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="text-ink-2">Replies within one business day</span>
                </li>
              </ul>
            </div>

            <div className="border-line bg-surface rounded-3xl border p-7">
              <h2 className="text-sm font-semibold">Good briefs to send me</h2>
              <ul className="mt-4 space-y-3">
                {[
                  "Marketing sites that need to load fast and rank",
                  "Dashboards and internal tools",
                  "Storefronts and product catalogues",
                  "A site that has quietly gotten slow",
                ].map((item) => (
                  <li key={item} className="text-ink-2 flex gap-3 text-sm">
                    <span aria-hidden className="bg-accent mt-2 size-1.5 shrink-0 rotate-45" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
