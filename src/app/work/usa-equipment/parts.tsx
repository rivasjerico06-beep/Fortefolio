import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BASE, STATUS, photoFor, statusLabel, type PhotoKey, type Unit } from "./data";
import { PHOTOS } from "./data";
import { AddToQuote } from "./quote-ui";

/**
 * The frame a yard photograph sits in.
 *
 * With a `photo` it renders the picture; without one it renders as what it is —
 * a measured, labelled space at the right aspect ratio. Both hold the same box,
 * so a card with a photograph and a card still waiting for one are the same
 * size and the grid never reflows between them.
 *
 * `sizes` is required whenever the image is not full-bleed, so a phone
 * downloads a phone-sized file rather than the desktop one.
 */
export function PhotoSlot({
  photo,
  label,
  tag,
  className = "",
  sizes,
  priority,
}: {
  photo?: { src: import("next/image").StaticImageData; alt: string };
  label: string;
  tag?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      // `cn` rather than template interpolation: the hero passes
      // `absolute inset-0`, which has to beat the `relative` below instead of
      // fighting it. Concatenating leaves both on the element and whichever
      // Tailwind emitted last wins — which collapsed the hero box to nothing.
      className={cn("relative overflow-hidden bg-[var(--ue-surface-alt)]", className)}
      style={
        photo
          ? undefined
          : {
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0 9px, rgba(22,25,28,0.045) 9px 18px)",
            }
      }
    >
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes ?? "100vw"}
          placeholder="blur"
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span className="ue-mono absolute inset-0 flex items-center justify-center px-3 text-center text-[10px] leading-snug text-[var(--ue-ink-3)]">
          {label}
        </span>
      )}
      {tag ? (
        <span className="ue-mono absolute top-0 right-0 bg-[var(--ue-ink)] px-2.5 py-1.5 text-[11px] tracking-[0.1em] text-[var(--ue-yellow)]">
          {tag}
        </span>
      ) : null}
    </div>
  );
}

/** Convenience for the places that render a named photograph directly. */
export function photo(key: PhotoKey) {
  return PHOTOS[key];
}

/** The bordered status pill — a colour, a label, and never colour alone. */
export function StatusBadge({ unit, large }: { unit: Unit; large?: boolean }) {
  const status = STATUS[unit.status];

  return (
    <span
      className={`inline-flex items-center gap-2 self-start border-2 ${
        large ? "px-2.5 py-1.5" : "px-2 py-1"
      }`}
      style={{ borderColor: status.color }}
    >
      <span
        aria-hidden
        className={`${large ? "ue-led size-2.5" : "size-2"} shrink-0 rounded-[2px]`}
        style={{ background: status.color, color: status.color }}
      />
      <span
        className={`ue-mono font-medium ${large ? "text-[12px]" : "text-[11px]"}`}
        style={{ color: status.color }}
      >
        {statusLabel(unit)}
        {large ? ` · ${status.note}` : ""}
      </span>
    </span>
  );
}

/** The four registration marks every card wears at its corners. */
function CornerMarks() {
  const dot = "absolute size-1 rounded-full bg-[var(--ue-ink-3)]";
  return (
    <span aria-hidden>
      <span className={`${dot} top-[15px] left-2.5`} />
      <span className={`${dot} top-[15px] right-2.5`} />
      <span className={`${dot} bottom-2.5 left-2.5`} />
      <span className={`${dot} right-2.5 bottom-2.5`} />
    </span>
  );
}

/** The rate strip. Every figure is an em dash on purpose — see `data.ts`. */
export function RateStrip() {
  return (
    <div className="ue-mono mb-3.5 flex justify-between border-t border-[var(--ue-line)] pt-3 text-[13px] text-[var(--ue-ink-2)]">
      <span>Day $—</span>
      <span>Wk $—</span>
      <span>Mo $—</span>
    </div>
  );
}

/**
 * One machine on the grid.
 *
 * `reveal` is off for the first row: those are already on screen at load, and
 * an element that waits for an intersection it has already missed reads as a
 * flicker.
 */
export function UnitCard({
  unit,
  stagger = 0,
  reveal = true,
  showSpecs = false,
}: {
  unit: Unit;
  stagger?: number;
  reveal?: boolean;
  showSpecs?: boolean;
}) {
  const status = STATUS[unit.status];

  return (
    <article
      data-reveal={reveal ? "up" : undefined}
      data-unit={unit.id}
      style={
        {
          "--stagger": stagger,
          transitionTimingFunction: "var(--ue-ease)",
        } as React.CSSProperties
      }
      // `w-full` matters: as a flex child of its <li> the card would otherwise
      // size to its own content, and a short unit name would leave the grid
      // track wider than the card sitting in it.
      className="group relative flex w-full flex-col border-2 border-[var(--ue-ink)] bg-white transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_6px_0_0_var(--ue-ink)]"
    >
      <span aria-hidden className="h-[5px]" style={{ background: status.color }} />

      <div className="flex flex-1 flex-col p-5">
        <CornerMarks />

        <PhotoSlot
          photo={photoFor(unit)}
          label={`Photo — ${unit.category}`}
          tag={unit.id}
          className="mb-4 aspect-3/2 border border-[var(--ue-line)]"
          sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 300px"
        />

        <StatusBadge unit={unit} />

        <h3 className="mt-3 text-[22px] font-bold">{unit.name}</h3>
        <p className="mb-4 text-sm text-[var(--ue-ink-2)]">{unit.sub}</p>

        {showSpecs ? (
          <dl className="ue-mono mb-3 border-t border-[var(--ue-line)] pt-3 text-[13px] normal-case">
            {[{ k: "Unit", v: unit.id }, ...unit.specs.slice(0, 2)].map((row) => (
              <div key={row.k} className="flex justify-between py-[3px]">
                <dt className="text-[var(--ue-ink-2)] uppercase">{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-auto">
          <RateStrip />
          <div className="flex gap-2">
            <AddToQuote unit={unit} className="flex-1" />
            <Link
              href={`${BASE}/equipment/${unit.id}`}
              className="flex h-11 items-center border-2 border-[var(--ue-ink)] px-3.5 text-[13px] font-semibold uppercase transition-colors duration-150 hover:bg-[var(--ue-bg)]"
            >
              Details<span className="sr-only"> for {unit.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/** The fleet grid. Shared so the interactive catalogue and the static one it
    falls back to cannot drift apart. */
export function UnitGrid({
  units,
  reveal = false,
}: {
  units: readonly Unit[];
  reveal?: boolean;
}) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(16.5rem,1fr))] gap-6">
      {units.map((unit) => (
        <li key={unit.id} className="flex">
          <UnitCard unit={unit} reveal={reveal} />
        </li>
      ))}
    </ul>
  );
}

/** The small mono line that sits above a section heading. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="ue-mono text-[11px] text-[var(--ue-ink-3)]">{children}</p>;
}

export function Breadcrumb({ trail }: { trail: readonly { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="ue-mono mb-5 text-[11px] text-[var(--ue-ink-3)]">
      <ol className="flex flex-wrap gap-2">
        {trail.map((crumb, index) => (
          <li key={crumb.label} className="flex gap-2">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-[var(--ue-ink-2)] hover:text-[var(--ue-ink)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-[var(--ue-ink)]">
                {crumb.label}
              </span>
            )}
            {index < trail.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
