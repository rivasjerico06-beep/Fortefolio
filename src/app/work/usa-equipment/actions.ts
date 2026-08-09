"use server";

import { UNITS } from "./data";

/**
 * Sending a quote request.
 *
 * A Server Action rather than a plain function, for the same reason Lumen's
 * enquiry form is one: the composed request never touches the client bundle,
 * and wiring this to a real inbox or a yard-management API is a change to this
 * file alone.
 *
 * The browser sends **unit numbers and quantities, and nothing else about the
 * units**. Names, categories and statuses are re-read from the fleet here. A
 * request that arrived claiming `LT-2214` is a "Free Excavator" would be
 * resolved back to what LT-2214 actually is — the browser does not get to
 * describe the yard's own inventory to it.
 */

export type QuoteLineInput = { id: string; qty: number };

export type QuoteResult =
  { ok: true; reference: string; units: number } | { ok: false; errors: string[] };

const MAX_PER_LINE = 20;

export async function requestQuote(
  lines: QuoteLineInput[],
  contact: Record<string, string>,
): Promise<QuoteResult> {
  const errors: string[] = [];

  // Resolve every line against the real fleet, dropping anything unknown
  const resolved = lines.flatMap((line) => {
    const unit = UNITS.find((candidate) => candidate.id === line.id);
    if (!unit) return [];
    const qty = Math.min(Math.max(1, Math.floor(Number(line.qty) || 1)), MAX_PER_LINE);
    return [{ unit, qty }];
  });

  if (resolved.length === 0) errors.push("Add at least one unit to the list.");

  const name = (contact.name ?? "").trim();
  const phone = (contact.phone ?? "").trim();
  if (name.length < 2) errors.push("Tell us who to ask for.");
  // Deliberately loose: the yard would rather receive a malformed number and
  // call it than reject a customer over a formatting rule.
  if (phone.replace(/\D/g, "").length < 7)
    errors.push("We need a phone number to call back on.");

  if (errors.length > 0) return { ok: false, errors };

  /* Where a real build would write to the yard's system and email the desk.
     There is deliberately no integration here — a demo that silently pretends
     to have sent something is worse than one that says it did not. */

  const reference = `Q-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return {
    ok: true,
    reference,
    units: resolved.reduce((sum, line) => sum + line.qty, 0),
  };
}
