import type { Metadata } from "next";
import Link from "next/link";
import { WpBreadcrumbs, WpLayout } from "@/components/wp/wp-chrome";
import { BASE, team } from "../data";
import { LumenHeader, LumenSidebar, PageHeading } from "../parts";

export const metadata: Metadata = {
  title: "About — Lumen Café",
  description: "How Lumen started, where the beans are roasted, and who is behind the bar.",
};

export default function AboutPage() {
  return (
    <>
      <LumenHeader active={`${BASE}/about`} />
      <WpBreadcrumbs trail={[{ label: "Home", href: BASE }, { label: "About" }]} />

      <WpLayout sidebar={<LumenSidebar />}>
        <article className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8">
          <PageHeading
            title="About Lumen"
            intro="A twelve-seat coffee bar in Poblacion, open since 2021."
          />

          <section id="story" className="scroll-mt-32">
            <div className="wp-prose mt-6">
              <h2>Our story</h2>
              <p>
                Lumen opened in a former dry-goods shop in the spring of 2021, with a
                second-hand lever machine and eleven chairs. There are twelve chairs now. That
                is roughly the pace of expansion we are comfortable with.
              </p>
              <p>
                The idea was narrow on purpose: do coffee properly, do a short kitchen menu
                properly, and do not try to be a restaurant in the evening. Five years in, that
                has not changed much, other than the kitchen now staying open an hour later on
                Fridays because the room asked for it.
              </p>
            </div>
          </section>

          <section id="roastery" className="scroll-mt-32">
            <div className="wp-prose mt-8">
              <h2>The roastery</h2>
              <p>
                We roast eight kilometres from here, on a 5kg drum, every Tuesday. Everything
                served in the café was roasted within the previous ten days, and anything older
                than three weeks gets pulled off the shelf and drunk by staff.
              </p>
              <p>
                Most of what we buy comes from two co-operatives — one in Benguet, one in Sagada
                — plus whatever single lot has caught Mariel&rsquo;s attention that season. When
                something new goes on the grinder we tend to{" "}
                <Link
                  href={`${BASE}/blog`}
                  className="font-semibold text-[var(--wp-accent)] hover:underline"
                >
                  write about it
                </Link>
                .
              </p>
              <blockquote>
                If you ask what is in the cup, you will get a longer answer than you were
                probably expecting. Consider yourself warned.
              </blockquote>
            </div>
          </section>

          <section id="team" className="mt-10 scroll-mt-32">
            <h2 className="border-b-2 border-[var(--wp-accent)] pb-2 text-2xl font-bold">
              The team
            </h2>
            <ul className="mt-6 space-y-5">
              {team.map((person) => (
                <li key={person.name} className="flex gap-4">
                  <span
                    aria-hidden
                    className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--wp-surface-alt)] text-lg font-bold text-[var(--wp-accent)]"
                    style={{ fontFamily: "var(--wp-heading-font)" }}
                  >
                    {person.name.slice(0, 1)}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold">
                      {person.name}
                      <span className="ml-2 text-[12.5px] font-normal tracking-wide text-[var(--wp-ink-2)] uppercase">
                        {person.role}
                      </span>
                    </h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
                      {person.bio}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 border-t border-[var(--wp-line)] pt-6">
            <p className="text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
              We are usually hiring for weekend shifts. If that sounds like you,{" "}
              <Link
                href={`${BASE}/visit`}
                className="font-semibold text-[var(--wp-accent)] hover:underline"
              >
                come and say so in person
              </Link>{" "}
              — we do not really do CVs.
            </p>
          </div>
        </article>
      </WpLayout>
    </>
  );
}
