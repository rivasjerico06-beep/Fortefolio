import type { Metadata } from "next";

import { DemoBar } from "@/components/demo-bar";

import { Shelf } from "./shelf";
import { isUnwritten, volumes } from "./volumes";

export const metadata: Metadata = {
  title: "The Bindery — demo site",
  description:
    "An interactive Three.js shelf of seven clothbound volumes. Browse the shelf, pull one out, orbit the binding and drag through its pages.",
};

/**
 * The one page in this portfolio that spends its weight budget rather than
 * saving it — and it is code-split, so no other route pays for it.
 *
 * The collection below the canvas is not a fallback bolted on afterwards. It
 * is the page's content, server-rendered, and the shelf is a way of reading
 * it. A crawler, a reader with JavaScript off and a browser with WebGL
 * disabled all get the same seven volumes and every word printed inside them.
 */
export default function BinderyPage() {
  return (
    <>
      <DemoBar name="The Bindery" slug="bindery" />

      <main className="bg-[#12100e] text-[#e8e2d6]">
        <Shelf />

        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-24">
          <header className="border-b border-white/10 pb-6">
            <p className="text-[11px] font-medium tracking-[0.16em] text-white/40 uppercase">
              The collection
            </p>
            <h1 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">
              Seven volumes, four of them written
            </h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/60">
              Three demos from this portfolio that were designed and then built, plus the site
              itself. The other three volumes are bound and blank. They are not an oversight — a
              shelf with room left on it is a truer picture of a body of work than one padded
              out to look full.
            </p>
          </header>

          <ol className="mt-10 space-y-10">
            {volumes.map((volume, index) => {
              const blank = isUnwritten(volume);
              return (
                <li key={index} className="grid gap-4 sm:grid-cols-[3rem_1fr]">
                  <div
                    className="hidden h-full w-8 rounded-[2px] sm:block"
                    style={{ background: volume.cloth }}
                    aria-hidden
                  />
                  <div>
                    <p
                      className="text-[11px] font-medium tracking-[0.14em] uppercase"
                      style={{ color: volume.foil ?? "#8d877b" }}
                    >
                      Volume {index + 1} · {volume.year}
                    </p>
                    <h2 className="mt-1.5 font-serif text-xl">
                      {blank ? "Unwritten" : volume.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-white/45">
                      {volume.subtitle} · {volume.binding}
                    </p>
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/70">
                      {volume.blurb}
                    </p>

                    {volume.spreads.length > 0 && (
                      <dl className="mt-4 space-y-3 border-l border-white/10 pl-4">
                        {volume.spreads.map((spread) => (
                          <div key={spread.heading}>
                            <dt className="text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase">
                              {spread.heading}
                            </dt>
                            <dd className="mt-1 max-w-prose text-sm leading-relaxed text-white/65">
                              {spread.body}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {volume.href && (
                      <p className="mt-4">
                        <a
                          href={volume.href}
                          className="text-xs text-white/70 underline underline-offset-4 transition hover:text-white"
                        >
                          {volume.slug ? "Read the case study" : "Visit the site"}
                        </a>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <footer className="mt-16 border-t border-white/10 pt-6">
            <h2 className="text-[11px] font-medium tracking-[0.16em] text-white/40 uppercase">
              Colophon
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/55">
              Built with Three.js. Every surface — cloth weave, foil stamp, paper grain, page
              edges, endpapers, shelf timber and the contact shadows — is drawn into a canvas at
              runtime from a seeded random number generator, so the demo downloads no images and
              the same seed always draws the same book.
            </p>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/55">
              The idea is not original to this studio. It was built from{" "}
              <a
                href="https://github.com/MengTo/complete-shelf/blob/main/PROMPT.md"
                className="underline underline-offset-4 transition hover:text-white/80"
                rel="noreferrer noopener"
                target="_blank"
              >
                the public build brief
              </a>{" "}
              published by{" "}
              <a
                href="https://github.com/MengTo/complete-shelf"
                className="underline underline-offset-4 transition hover:text-white/80"
                rel="noreferrer noopener"
                target="_blank"
              >
                Meng To for The Complete Shelf
              </a>
              , which invites exactly this. The brief supplied the concept, the interaction list
              and the verification checklist; the geometry, materials, motion, content and code
              here were written for this portfolio and share no source with the original.
            </p>
          </footer>
        </section>
      </main>
    </>
  );
}
