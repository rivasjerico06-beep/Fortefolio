"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowRight, Check } from "lucide-react";
import { sendEnquiry, type EnquirySubject } from "../actions";
import { hoursRows, todayRowIndex } from "../hours";

/* ---------------------------------------------------------------------------
   Hours table

   Which row is "today" depends on the clock, so it is resolved on the client
   for the same reason the open indicator is: rendering it on the server would
   bake the build-time day into the HTML and mark the wrong row forever after.
   The table itself is in the server HTML; only the marker waits.
--------------------------------------------------------------------------- */

const subscribeDay = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};

export function HoursTable() {
  const today = useSyncExternalStore(
    subscribeDay,
    () => todayRowIndex(new Date()),
    () => -1,
  );

  return (
    <dl>
      {hoursRows.map((row, index) => {
        const isToday = index === today;
        return (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-6 border-b py-4"
            style={{
              borderColor: "var(--lc-line)",
              color: isToday ? "var(--lc-fg)" : undefined,
            }}
          >
            <dt className="flex items-center gap-3">
              <span
                className="text-[16px]"
                style={{ color: isToday ? "var(--lc-fg)" : "var(--lc-fg-2)" }}
              >
                {row.label}
              </span>
              {isToday && (
                <span
                  className="lc-eyebrow px-2 py-0.5 text-white"
                  style={{ backgroundColor: "var(--lc-accent-solid)", color: "#fff" }}
                >
                  Today
                </span>
              )}
            </dt>
            <dd className="text-[16px] tabular-nums">{row.time}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/* ---------------------------------------------------------------------------
   Enquiry form
--------------------------------------------------------------------------- */

const SUBJECTS: EnquirySubject[] = ["General", "Large order", "Private hire", "Working here"];

type Status = "idle" | "sending" | "sent";

const fieldClass =
  "w-full border-b bg-transparent py-3 text-[16px] outline-none transition-colors focus:border-[var(--lc-accent-text)]";

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setStatus("sending");
    setError(null);

    const result = await sendEnquiry({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? "General") as EnquirySubject,
      message: String(data.get("message") ?? ""),
    });

    if (result.ok) {
      setStatus("sent");
    } else {
      setStatus("idle");
      setError(result.error);
    }
  }

  if (status === "sent") {
    return (
      <div
        className="border p-8 sm:p-10"
        style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
      >
        <Check aria-hidden className="size-8" style={{ color: "var(--lc-accent)" }} />
        <p className="mt-5 text-[clamp(1.5rem,3vw,2rem)] leading-tight">Message received.</p>
        <p className="mt-3 text-[16px] leading-relaxed" style={{ color: "var(--lc-fg-2)" }}>
          On the real site this would land in the café&rsquo;s inbox and someone would reply
          within a day. On this demo it goes nowhere — no inbox is connected yet.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="lc-link lc-eyebrow mt-8"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="enquiry-name" className="lc-eyebrow block">
            Name
          </label>
          <input
            id="enquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={fieldClass}
            style={{ borderColor: "var(--lc-line-strong)" }}
          />
        </div>
        <div>
          <label htmlFor="enquiry-email" className="lc-eyebrow block">
            Email
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldClass}
            style={{ borderColor: "var(--lc-line-strong)" }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="enquiry-subject" className="lc-eyebrow block">
          What is it about
        </label>
        <select
          id="enquiry-subject"
          name="subject"
          defaultValue="General"
          className={`${fieldClass} appearance-none rounded-none`}
          style={{ borderColor: "var(--lc-line-strong)" }}
        >
          {SUBJECTS.map((subject) => (
            <option key={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="enquiry-message" className="lc-eyebrow block">
          Message
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={5}
          required
          className={`${fieldClass} resize-none`}
          style={{ borderColor: "var(--lc-line-strong)" }}
        />
      </div>

      {error && (
        <p role="alert" className="text-[15px]" style={{ color: "var(--lc-accent-text)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="lc-btn group inline-flex items-center gap-3 px-8 py-4 text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--lc-accent-solid)" }}
      >
        <span className="lc-eyebrow" style={{ color: "inherit" }}>
          {status === "sending" ? "Sending" : "Send enquiry"}
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-500 group-hover:translate-x-1"
        />
      </button>

      <p className="text-[13px]" style={{ color: "var(--lc-fg-2)" }}>
        This is a portfolio demo. The form validates and shows every state, but no inbox is
        connected, so nothing is delivered.
      </p>
    </form>
  );
}
