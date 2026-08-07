"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * Validates client-side, then hands the composed message to the visitor's mail
 * client. That keeps the form working with no backend or API key. To send
 * server-side instead, swap `handleSubmit` for a Server Action — see README.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: Errors = {};
    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Please enter a valid email address.";
    if (message.length < 10)
      nextErrors.message = "A little more detail helps — at least 10 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      budget ? `Budget: ${budget}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      `Project enquiry from ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const fieldClass =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`mt-2 ${fieldClass}`}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1.5 text-xs text-[#d03b3b]">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`mt-2 ${fieldClass}`}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-[#d03b3b]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium">
          Budget <span className="text-ink-3 font-normal">(optional)</span>
        </label>
        <select id="budget" name="budget" className={`mt-2 ${fieldClass}`} defaultValue="">
          <option value="">Prefer not to say</option>
          <option>Under $1,000</option>
          <option>$1,000 – $5,000</option>
          <option>$5,000 – $15,000</option>
          <option>$15,000+</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          What are you building?
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="A few lines about the project, who it is for, and any deadline you are working to."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`mt-2 resize-y ${fieldClass}`}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1.5 text-xs text-[#d03b3b]">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-accent text-accent-ink hover:bg-accent-hover inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors"
      >
        Send message
        <Send className="size-4" aria-hidden />
      </button>

      <p role="status" aria-live="polite" className="text-ink-2 text-sm">
        {sent
          ? "Your mail app should be opening with the message ready to send. If nothing happened, email me directly at " +
            siteConfig.email +
            "."
          : ""}
      </p>
    </form>
  );
}
