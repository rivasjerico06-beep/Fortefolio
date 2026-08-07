"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/projects";
import { subscribeScroll, progressThrough, prefersReducedMotion } from "@/lib/scroll";

/**
 * Pinned section whose track slides sideways as you scroll down.
 *
 * Degrades to an ordinary horizontal scroller: the `.js`-gated CSS only turns
 * it into a pinned scene when the motion layer is live, so no-JS and
 * reduced-motion readers get a normal, swipeable row of panels.
 */
export function HorizontalGallery({ projects }: { projects: readonly Project[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!wrap || !panel || !track) return;
    if (prefersReducedMotion()) return;

    let travel = 0;

    const measure = () => {
      // offsetWidth, not scrollWidth: the track is sized by `width: max-content`
      travel = Math.max(track.offsetWidth - panel.clientWidth, 0);
      // Scroll distance = one screen to pin, plus the horizontal distance
      wrap.style.setProperty("--scene-height", `${window.innerHeight + travel}px`);
    };

    const paint = () => {
      track.style.setProperty("--x", String(progressThrough(wrap) * travel));
    };

    measure();
    const resizeObserver = new ResizeObserver(() => {
      measure();
      paint();
    });
    resizeObserver.observe(track);
    resizeObserver.observe(panel);

    // Keyboard: tabbing into a panel must move the page, not the hidden
    // overflow — otherwise the browser scrolls the container and desyncs
    // it from our transform.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>("[data-panel-index]");
      if (!card) return;
      panel.scrollLeft = 0;
      const index = Number(card.dataset.panelIndex ?? 0);
      const ratio = projects.length > 1 ? index / (projects.length - 1) : 0;
      window.scrollTo({
        top: wrap.offsetTop + ratio * travel,
        behavior: "smooth",
      });
    };

    panel.addEventListener("focusin", onFocusIn);
    const unsubscribe = subscribeScroll(paint);

    return () => {
      resizeObserver.disconnect();
      panel.removeEventListener("focusin", onFocusIn);
      unsubscribe();
    };
  }, [projects.length]);

  return (
    <div ref={wrapRef} data-scene-wrap="gallery" className="hscene relative">
      <div ref={panelRef} data-scene="gallery" className="hscene-panel">
        <div ref={trackRef} className="hscene-track">
          {/* Leading title panel, so the section introduces itself */}
          <div className="flex w-[78vw] shrink-0 flex-col justify-center sm:w-[42vw] lg:w-[30vw]">
            <p className="text-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase">
              Selected work
            </p>
            <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.5rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
              Four sites you can actually click through
            </h2>
            <p className="text-ink-2 mt-5 max-w-xs text-sm leading-relaxed">
              Keep scrolling — they move sideways. Every one links to a running site, not a
              screenshot.
            </p>
          </div>

          {projects.map((project, index) => (
            <article
              key={project.slug}
              data-panel-index={index}
              className="group border-line bg-surface relative flex w-[82vw] shrink-0 flex-col justify-between overflow-hidden rounded-[1.75rem] border p-8 sm:w-[56vw] lg:w-[38vw] lg:p-10"
              style={{ height: "min(70vh, 34rem)" }}
            >
              {/* Accent wash that grows on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(closest-side, ${project.accent}, transparent)`,
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-ink-3 font-mono text-[11px]">0{index + 1}</span>
                  <span
                    aria-hidden
                    className="size-2.5 rotate-45"
                    style={{ backgroundColor: project.accent }}
                  />
                </div>
                <p className="text-ink-3 mt-8 font-mono text-[11px] tracking-[0.14em] uppercase">
                  {project.kind}
                </p>
                <h3 className="mt-3 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1] font-semibold tracking-[-0.035em]">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="before:absolute before:inset-0"
                  >
                    {project.name}
                  </Link>
                </h3>
                <p className="text-ink-2 mt-5 max-w-sm text-sm leading-relaxed">
                  {project.summary}
                </p>
              </div>

              <div className="relative">
                <ul className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="border-line text-ink-3 rounded-full border px-2.5 py-1 font-mono text-[10px]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
                <div className="border-line mt-6 flex items-center justify-between border-t pt-5">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    Case study
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <Link
                    href={`/work/${project.slug}`}
                    className="link-wipe text-accent relative z-10 inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    Live demo
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {/* Trailing spacer so the last panel can reach the left edge */}
          <div aria-hidden className="w-[12vw] shrink-0" />
        </div>
      </div>
    </div>
  );
}
