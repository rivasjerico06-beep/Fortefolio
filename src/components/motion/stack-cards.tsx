import { missions } from "@/lib/site-config";

/**
 * Cards that pile up as you scroll past them.
 *
 * Entirely CSS: each card is `position: sticky` at a slightly lower offset than
 * the one before, so each new card slides over the last and parks just below
 * it. No scroll handler, no JavaScript, works everywhere sticky works — and
 * degrades to a plain stacked list where it does not.
 */
export function StackCards() {
  return (
    <div className="mt-16">
      {missions.map((mission, index) => (
        <div
          key={mission.number}
          className="stack-item pb-6"
          style={{
            top: `calc(6.5rem + ${index * 1.75}rem)`,
            zIndex: index + 1,
          }}
        >
          <article className="border-line bg-surface overflow-hidden rounded-[1.75rem] border p-8 shadow-[0_1px_0_0_var(--line)] sm:p-12">
            <div className="grid gap-6 sm:grid-cols-[5rem_1fr] sm:gap-10">
              <span className="text-accent font-mono text-sm tracking-[0.14em]">
                {mission.number}
              </span>
              <div>
                <h3 className="text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
                  {mission.title}
                </h3>
                <p className="text-ink-2 mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
                  {mission.body}
                </p>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
