import { Fragment, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealKind = "up" | "left" | "right" | "scale" | "clip" | "blur";

/**
 * Marks an element for the scroll reveal. Renders as plain markup — the hidden
 * starting state lives in CSS under `.js`, so this is a server component and
 * costs no JavaScript.
 *
 * `stagger` offsets the transition so a group animates in sequence.
 */
export function Reveal({
  children,
  kind = "up",
  stagger = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  kind?: RevealKind;
  stagger?: number;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag
      data-reveal={kind}
      style={stagger ? ({ "--stagger": stagger } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}

/**
 * Splits a line into words that rise out of a mask, one after the next. The
 * text stays a single readable string for screen readers and for anyone
 * without JavaScript.
 */
export function WordRise({
  text,
  className,
  as: Tag = "span",
  offset = 0,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  offset?: number;
}) {
  const words = text.split(" ");

  return (
    <Tag className={cn("word-rise", className)}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {/* The mask clips the word; the space sits outside it so it survives */}
          <span>
            <span style={{ "--w": index + offset } as React.CSSProperties}>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
