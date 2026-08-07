import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { siteConfig, skills, missions } from "@/lib/site-config";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";

export const metadata: Metadata = {
  title: "Studio",
  description: siteConfig.intro,
};

const timeline = [
  {
    period: "Now",
    title: "Running ECOmissions",
    body: "Freelance web development for small teams — usually the only developer on the project, from design handoff through to deploy. Every build ships against a page-weight budget agreed up front.",
  },
  {
    period: "Recent",
    title: "Front-end work in React and Next.js",
    body: "Component libraries, design-system implementation, and migrating older pages onto the App Router without losing their search rankings.",
  },
  {
    period: "Ongoing",
    title: "Performance and accessibility audits",
    body: "Finding the specific reason a page feels slow — usually an unsized image or a render-blocking font — and fixing that, rather than guessing at it.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
      <Reveal kind="blur">
        <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
          The studio
        </p>
      </Reveal>

      <h1 className="mt-8 max-w-5xl text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
        <WordRise as="span" text="Websites cost" className="block" />
        <span className="block">
          <WordRise as="span" text="the planet" offset={2} />{" "}
          <span className="text-accent">
            <WordRise as="span" text="something." offset={4} />
          </span>
        </span>
      </h1>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-24">
        <Reveal kind="left">
          <div className="lg:sticky lg:top-28">
            <p className="text-ink-2 text-lg leading-relaxed">
              I&rsquo;m {siteConfig.name}. I build front-end for people who need a website that
              does a specific job — sell something, answer a question, get someone through a
              form without giving up halfway.
            </p>
            <p className="text-ink-2 mt-6 leading-relaxed">
              ECOmissions is the name I put on that work, because the framing turned out to be
              useful. The web runs on electricity. The average page is now heavier than the
              original Doom install, and almost none of that weight is doing anything the
              visitor asked for. Treating bytes as a cost rather than a free resource happens to
              produce exactly the same decisions that make a site fast, accessible, and cheap to
              run.
            </p>
            <p className="text-ink-2 mt-6 leading-relaxed">
              So it is not really an environmental pitch. It is a discipline that has a pleasant
              side effect.
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal kind="up">
            <h2 className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              What I&rsquo;ve been doing
            </h2>
          </Reveal>

          <div className="mt-8">
            {timeline.map((entry, index) => (
              <Reveal key={entry.title} kind="up" stagger={index}>
                <div className="group border-line hover:border-accent grid gap-3 border-t py-8 transition-colors last:border-b sm:grid-cols-[6rem_1fr] sm:gap-8">
                  <p className="text-ink-3 font-mono text-[11px] tracking-[0.14em] uppercase sm:pt-1.5">
                    {entry.period}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                      {entry.title}
                    </h3>
                    <p className="text-ink-2 mt-3 leading-relaxed">{entry.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Missions */}
      <section className="mt-28">
        <Reveal kind="up">
          <h2 className="border-line border-b pb-8 text-[clamp(1.75rem,4vw,3rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
            How I work
          </h2>
        </Reveal>
        <div className="grid gap-x-10 gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {missions.map((mission, index) => (
            <Reveal key={mission.number} kind="up" stagger={index}>
              <div className="border-line-strong border-t pt-6">
                <span className="text-accent font-mono text-[11px] tracking-[0.14em]">
                  {mission.number}
                </span>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em]">
                  {mission.title}
                </h3>
                <p className="text-ink-2 mt-3 text-sm leading-relaxed">{mission.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Toolkit */}
      <section className="mt-28">
        <Reveal kind="up">
          <h2 className="border-line border-b pb-8 text-[clamp(1.75rem,4vw,3rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
            Toolkit
          </h2>
        </Reveal>
        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, index) => (
            <Reveal key={skill.group} kind="up" stagger={index}>
              <div>
                <h3 className="text-sm font-semibold">{skill.group}</h3>
                <ul className="mt-4 space-y-2.5">
                  {skill.items.map((item) => (
                    <li
                      key={item}
                      className="text-ink-2 hover:text-accent font-mono text-[13px] transition-colors"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal kind="scale">
        <section className="border-line bg-surface mt-28 rounded-[2rem] border p-10 sm:p-14">
          <h2 className="max-w-2xl text-[clamp(1.75rem,4vw,3rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
            Want to work together?
          </h2>
          <p className="text-ink-2 mt-5 max-w-md leading-relaxed">
            {siteConfig.availability}. Send over what you have in mind and I&rsquo;ll come back
            with a scope and a number.
          </p>
          <Magnetic
            href="/contact"
            className="group bg-ink text-bg relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-4 text-sm font-medium"
          >
            <span className="bg-accent absolute inset-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0" />
            <span className="group-hover:text-accent-ink relative transition-colors">
              Start a brief
            </span>
            <ArrowRight
              aria-hidden
              className="group-hover:text-accent-ink relative size-4 transition-transform duration-500 group-hover:translate-x-1"
            />
          </Magnetic>
        </section>
      </Reveal>
    </div>
  );
}
