import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} — ${project.kind}`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((item) => item.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-24">
      <Reveal kind="blur">
        <Link
          href="/projects"
          className="link-wipe text-ink-2 hover:text-ink inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All work
        </Link>
      </Reveal>

      <header className="border-line mt-10 border-b pb-14">
        <Reveal kind="up">
          <p className="text-ink-3 flex items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] uppercase">
            <span
              aria-hidden
              className="size-2 rotate-45"
              style={{ backgroundColor: project.accent }}
            />
            {project.kind} · {project.year}
          </p>
        </Reveal>

        <h1 className="mt-6 text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
          <WordRise as="span" text={project.name} />
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal kind="up" stagger={1}>
            <p className="text-ink-2 max-w-2xl text-lg leading-relaxed">{project.summary}</p>
          </Reveal>
          <Reveal kind="up" stagger={2}>
            <div className="flex flex-wrap items-start gap-3">
              <Magnetic
                href={`/work/${project.slug}`}
                className="group bg-ink text-bg relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-medium"
              >
                <span className="bg-accent absolute inset-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0" />
                <span className="group-hover:text-accent-ink relative transition-colors">
                  Open the live demo
                </span>
                <ExternalLink
                  aria-hidden
                  className="group-hover:text-accent-ink relative size-4"
                />
              </Magnetic>
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="border-line text-ink-3 rounded-full border px-3 py-2 font-mono text-[10px]"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-3xl space-y-14">
        <Reveal kind="up">
          <section>
            <h2 className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              The brief
            </h2>
            <p className="text-ink-2 mt-5 text-lg leading-relaxed">{project.brief}</p>
          </section>
        </Reveal>

        <Reveal kind="up">
          <section>
            <h2 className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              The hard part
            </h2>
            <p className="text-ink-2 mt-5 text-lg leading-relaxed">{project.challenge}</p>
          </section>
        </Reveal>

        <section>
          <Reveal kind="up">
            <h2 className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              What I did
            </h2>
          </Reveal>
          <ol className="mt-6">
            {project.approach.map((step, stepIndex) => (
              <Reveal key={step} kind="up" stagger={stepIndex} as="li">
                <div className="border-line flex gap-6 border-t py-6 last:border-b">
                  <span className="text-accent font-mono text-[11px]">0{stepIndex + 1}</span>
                  <p className="text-ink-2 leading-relaxed">{step}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        <section>
          <Reveal kind="up">
            <h2 className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              Result
            </h2>
          </Reveal>
          <dl className="mt-6 grid gap-5 sm:grid-cols-3">
            {project.outcome.map((metric, metricIndex) => (
              <Reveal key={metric.label} kind="up" stagger={metricIndex}>
                <div className="border-line-strong border-t pt-5">
                  <dd className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.04em]">
                    {metric.value}
                  </dd>
                  <dt className="mt-3 text-sm font-medium">{metric.label}</dt>
                  <p className="text-ink-3 mt-1.5 text-xs">{metric.note}</p>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>
      </div>

      <Reveal kind="up">
        <nav className="border-line mt-24 border-t pt-10" aria-label="Project">
          <Link href={`/projects/${next.slug}`} className="group block">
            <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              Next project
            </p>
            <p className="mt-4 inline-flex items-center gap-4 text-[clamp(1.75rem,5vw,3.75rem)] leading-none font-semibold tracking-[-0.04em] transition-transform duration-600 ease-out group-hover:translate-x-3">
              {next.name}
              <ArrowRight
                aria-hidden
                className="text-ink-3 group-hover:text-accent size-8 transition-colors"
              />
            </p>
          </Link>
        </nav>
      </Reveal>
    </article>
  );
}
