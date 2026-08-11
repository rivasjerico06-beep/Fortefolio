import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

/** Nothing selected: the empty half of a two-pane inbox. */
export default function MessagesIndex() {
  return (
    <div className="hidden flex-1 items-center justify-center p-6 sm:flex">
      <div className="max-w-xs text-center">
        <span
          aria-hidden
          className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-[var(--ac-border)] bg-[var(--ac-card)]"
        >
          <MessageSquare size={20} className="text-[var(--ac-muted)]" />
        </span>
        <h2 className="ac-display mb-1.5 text-lg">Pick a conversation</h2>
        <p className="text-sm leading-relaxed text-[var(--ac-muted)]">
          Or start a new one — the pencil opens a search of everyone with an account.
        </p>
      </div>
    </div>
  );
}
