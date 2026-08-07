import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { projects } from "@/lib/projects";
import { Reveal, WordRise } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies with live, clickable demos — a café site, a SaaS landing page, an analytics dashboard, and a storefront.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
      <Reveal kind="blur">
        <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
          Work — {projects.length} projects
        </p>
      </Reveal>

      <h1 className="mt-8 max-w-4xl text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
        <WordRise as="span" text="Case studies with" className="block" />
        <WordRise as="span" text="demos you can open" className="block" offset={3} />
      </h1>

      <Reveal kind="up" stagger={1}>
        <p className="text-ink-2 mt-10 max-w-xl text-lg leading-relaxed">
          Screenshots hide the parts that matter — how fast it loads, whether the keyboard
          works, what happens at 360 pixels wide. So every project here links to a real, running
          site.
        </p>
      </Reveal>

      <ul className="mt-20">
        {projects.map((project, index) => (
          <Reveal key={project.slug} kind="up" stagger={index} as="li">
            <article className="group border-line relative border-t py-10 last:border-b sm:py-14">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
                <div className="flex items-start gap-5 sm:gap-8">
                  <span className="text-ink-3 mt-2 font-mono text-[11px]">0{index + 1}</span>
                  <div>
                    <h2 className="text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1] font-semibold tracking-[-0.04em]">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-block transition-transform duration-600 ease-out group-hover:translate-x-2 before:absolute before:inset-0"
                      >
                        {project.name}
                      </Link>
                    </h2>
                    <p className="text-ink-3 mt-4 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] uppercase">
                      <span
                        aria-hidden
                        className="size-2 rotate-45"
                        style={{ backgroundColor: project.accent }}
                      />
                      {project.kind} · {project.year}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-ink-2 max-w-xl leading-relaxed">{project.summary}</p>
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <li
                        key={tech}
                        className="border-line text-ink-3 rounded-full border px-3 py-1.5 font-mono text-[10px]"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex items-center gap-6">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="link-wipe relative z-10 inline-flex items-center gap-1.5 text-sm font-medium"
                    >
                      Read the case study
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                    {/* Sits above the card-wide overlay so the demo stays separately clickable */}
                    <Link
                      href={`/work/${project.slug}`}
                      className="link-wipe text-accent relative z-10 inline-flex items-center gap-1.5 text-sm font-medium"
                    >
                      Live demo
                      <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>

              <span
                aria-hidden
                className="bg-accent mt-10 block h-px origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
              />
            </article>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
