import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { siteConfig, services, skills, marqueeWords } from "@/lib/site-config";
import { projects } from "@/lib/projects";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { Marquee } from "@/components/motion/marquee";
import { Magnetic } from "@/components/motion/magnetic";
import { Counter } from "@/components/motion/counter";
import { PageWeight } from "@/components/motion/page-weight";
import { WeightScene } from "@/components/motion/weight-scene";
import { ScrubText } from "@/components/motion/scrub-text";
import { HorizontalGallery } from "@/components/motion/horizontal-gallery";
import { StackCards } from "@/components/motion/stack-cards";
import { Parallax } from "@/components/motion/parallax";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient light: drifts on its own, and lags the page as you scroll */}
        <Parallax speed={160} className="pointer-events-none absolute inset-0 -z-10">
          <div aria-hidden className="absolute inset-0">
            <div
              className="drift absolute -top-40 -right-24 size-[42rem] rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, var(--accent-wash), transparent 100%)",
              }}
            />
            <div
              className="drift absolute top-1/3 -left-40 size-[34rem] rounded-full opacity-40 blur-3xl"
              style={{
                animationDelay: "-9s",
                background:
                  "radial-gradient(closest-side, var(--accent-wash), transparent 100%)",
              }}
            />
          </div>
        </Parallax>

        <div className="mx-auto max-w-[88rem] px-5 pt-20 pb-16 sm:px-8 sm:pt-28">
          <Reveal kind="blur">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="border-line bg-surface/70 text-ink-2 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase backdrop-blur">
                <span className="bg-accent size-1.5 rounded-full" aria-hidden />
                {siteConfig.availability}
              </span>
              <span className="text-ink-3 font-mono text-[11px] tracking-[0.14em] uppercase">
                {siteConfig.location}
              </span>
            </div>
          </Reveal>

          <h1 className="mt-10 text-[clamp(2.75rem,9.2vw,9rem)] leading-[0.88] font-semibold tracking-[-0.045em]">
            <WordRise as="span" text="The lightest site" className="block" />
            <WordRise as="span" text="that still does" className="block" offset={3} />
            <span className="block">
              <WordRise as="span" text="the" offset={6} />{" "}
              <span className="text-accent relative inline-block">
                <WordRise as="span" text="job." offset={7} />
              </span>
            </span>
          </h1>

          <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
            <Reveal kind="up" stagger={1}>
              <p className="text-ink-2 max-w-md text-lg leading-relaxed">{siteConfig.intro}</p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Magnetic
                  href="/projects"
                  className="group bg-ink text-bg relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-4 text-sm font-medium"
                >
                  <span className="bg-accent absolute inset-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0" />
                  <span className="group-hover:text-accent-ink relative transition-colors">
                    See the work
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="group-hover:text-accent-ink relative size-4 transition-transform duration-500 group-hover:translate-x-1"
                  />
                </Magnetic>
                <Magnetic
                  href="/contact"
                  strength={0.22}
                  className="border-line-strong hover:border-accent hover:text-accent inline-flex items-center gap-2 rounded-full border px-7 py-4 text-sm font-medium transition-colors"
                >
                  Start a brief
                </Magnetic>
              </div>
            </Reveal>

            <Reveal kind="up" stagger={2} className="md:pt-2">
              <p className="text-ink-3 max-w-sm text-sm leading-relaxed">
                {siteConfig.strapline} A page that weighs a tenth of the average one uses a
                tenth of the energy to deliver — on every single visit, forever.
              </p>
              <div className="border-line mt-8 border-t pt-5">
                <PageWeight />
              </div>
            </Reveal>
          </div>

          <Reveal kind="up" stagger={3}>
            <div className="text-ink-3 mt-20 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] uppercase">
              <ArrowDown className="size-3.5 animate-bounce" aria-hidden />
              Scroll
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Marquee band ─────────────────────────────────────────────────── */}
      <section className="border-line bg-surface border-y py-5">
        <Marquee duration={38}>
          {marqueeWords.map((word) => (
            <span key={word} className="flex items-center">
              <span className="px-8 text-[clamp(1.1rem,2.4vw,1.9rem)] font-medium tracking-tight whitespace-nowrap">
                {word}
              </span>
              <span aria-hidden className="bg-accent size-1.5 rotate-45" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── Numbers ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <dl className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: 184, suffix: " KB", label: "Heaviest demo page", decimals: 0 },
            { value: 0.9, suffix: "s", label: "Typical LCP on 4G", decimals: 1 },
            { value: 100, suffix: "", label: "Lighthouse accessibility", decimals: 0 },
            { value: 0, suffix: "", label: "Charting libraries shipped", decimals: 0 },
          ].map((stat, index) => (
            <Reveal key={stat.label} kind="up" stagger={index}>
              <div className="border-line border-t pt-5">
                <dd className="text-[clamp(2.5rem,5vw,3.75rem)] leading-none font-semibold tracking-[-0.04em]">
                  <Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </dd>
                <dt className="text-ink-2 mt-3 text-sm">{stat.label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ── Scrubbed statement ───────────────────────────────────────────── */}
      <section className="border-line border-t">
        <ScrubText
          text="A website is not weightless. It is a bill someone else pays — in bandwidth, in battery, in the coal or gas that moved those bytes across the world to reach one person who only wanted to know your opening hours."
          footnote="The average page has roughly tripled in weight since 2015. Almost none of that went to the visitor."
        />
      </section>

      {/* ── Horizontal work gallery ──────────────────────────────────────── */}
      <section className="border-line bg-surface border-y">
        <HorizontalGallery projects={projects} />
        <div className="mx-auto max-w-[88rem] px-5 pb-16 sm:px-8">
          <Link
            href="/projects"
            className="link-wipe text-ink-2 hover:text-ink inline-flex items-center gap-1.5 text-sm font-medium"
          >
            All projects
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── Pinned scroll scene ──────────────────────────────────────────── */}
      <section className="border-line border-t">
        <WeightScene />
      </section>

      {/* ── Missions ─────────────────────────────────────────────────────── */}
      <section className="border-line bg-surface border-y">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
          <Reveal kind="up">
            <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              The missions
            </p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2rem,4.6vw,3.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              Four commitments every brief gets held against
            </h2>
          </Reveal>

          <StackCards />
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Reveal kind="left">
            <div className="lg:sticky lg:top-28">
              <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
                What I do
              </p>
              <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
                Services
              </h2>
              <p className="text-ink-2 mt-6 max-w-sm leading-relaxed">
                One landing page or a whole application — the process is the same. Work out who
                lands on it, build the shortest path to what they came for, then measure whether
                it worked.
              </p>
              <Magnetic
                href="/contact"
                strength={0.22}
                className="border-line-strong hover:border-accent hover:text-accent mt-8 inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-medium transition-colors"
              >
                Talk about your project
                <ArrowRight className="size-4" aria-hidden />
              </Magnetic>
            </div>
          </Reveal>

          <ul>
            {services.map((service, index) => (
              <Reveal key={service.title} kind="up" stagger={index} as="li">
                <div className="group border-line hover:border-accent border-t py-8 transition-colors last:border-b">
                  <div className="flex gap-6">
                    <span className="text-ink-3 group-hover:text-accent font-mono text-[11px] transition-colors">
                      {service.index}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                        {service.title}
                      </h3>
                      <p className="text-ink-2 mt-2.5 max-w-lg text-sm leading-relaxed">
                        {service.body}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Stack ────────────────────────────────────────────────────────── */}
      <section className="border-line bg-surface border-t">
        <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
          <Reveal kind="up">
            <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              Stack
            </p>
            <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              Tools I reach for
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill, index) => (
              <Reveal key={skill.group} kind="up" stagger={index}>
                <div className="border-line border-t pt-5">
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
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-28 sm:px-8">
        <Reveal kind="scale">
          <div className="border-line bg-surface relative overflow-hidden rounded-[2rem] border px-6 py-20 text-center sm:px-16">
            <div
              aria-hidden
              className="drift pointer-events-none absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, var(--accent-wash), transparent 100%)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-[clamp(2rem,5.4vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-balance">
                Got something that needs building light?
              </h2>
              <p className="text-ink-2 mx-auto mt-6 max-w-md leading-relaxed">
                Tell me what it has to do and who it is for. You get back a scope, a timeline, a
                page-weight budget, and a fixed price.
              </p>
              <Magnetic
                href="/contact"
                className="group bg-ink text-bg relative mt-10 inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-4 text-sm font-medium"
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
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
