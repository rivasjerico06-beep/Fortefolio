import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { projects } from "@/lib/projects";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { Reveal } from "@/components/motion/reveal";

export function SiteFooter() {
  return (
    <footer className="border-line bg-surface relative mt-auto overflow-hidden border-t">
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
        {/* Oversized wordmark, clipped by the section edge */}
        <Reveal kind="clip">
          <p
            aria-hidden
            className="text-ink-3/15 pointer-events-none -mb-2 text-[clamp(3rem,13vw,11rem)] leading-[0.85] font-semibold tracking-[-0.045em] select-none"
          >
            <span className="text-accent/25">{siteConfig.brandLead}</span>
            {siteConfig.brandRest}
          </p>
        </Reveal>

        <div className="border-line mt-14 grid gap-12 border-t pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="max-w-sm text-lg leading-relaxed tracking-tight text-balance">
              {siteConfig.strapline}
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="link-wipe text-ink-2 hover:text-ink mt-6 inline-flex items-center gap-2 text-sm"
            >
              <Mail className="size-4" aria-hidden />
              {siteConfig.email}
            </a>
            <div className="mt-6 flex items-center gap-2">
              <a
                href={siteConfig.socials.github}
                aria-label="GitHub"
                className="border-line text-ink-2 hover:border-accent hover:text-accent grid size-10 place-items-center rounded-full border transition-colors"
              >
                <GithubIcon className="size-4" />
              </a>
              <a
                href={siteConfig.socials.linkedin}
                aria-label="LinkedIn"
                className="border-line text-ink-2 hover:border-accent hover:text-accent grid size-10 place-items-center rounded-full border transition-colors"
              >
                <LinkedinIcon className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">Site</p>
            <ul className="mt-5 space-y-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-wipe text-ink-2 hover:text-ink text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              Live demos
            </p>
            <ul className="mt-5 space-y-3">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/work/${project.slug}`}
                    className="group text-ink-2 hover:text-ink inline-flex items-center gap-1 text-sm"
                  >
                    <span className="link-wipe">{project.name}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-line border-t">
        <div className="text-ink-3 mx-auto flex max-w-[88rem] flex-col gap-2 px-5 py-6 font-mono text-[11px] tracking-wide sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.brand}
          </p>
          <p>{siteConfig.location} · Built light on purpose</p>
        </div>
      </div>
    </footer>
  );
}
