"use server";

/**
 * The write seam.
 *
 * A Server Action rather than a plain exported function, for one practical
 * reason: the enquiry form is a client component, and anything it imports ends
 * up in the browser bundle. Keeping the write here means the form can call it
 * directly while the content module — every post body, every image — stays on
 * the server.
 *
 * Nothing is delivered yet. When a real inbox is connected, this function body
 * is the only thing that changes; the form already handles pending, success and
 * failure states around it.
 */

export type EnquirySubject = "General" | "Large order" | "Private hire" | "Working here";

export type EnquiryDraft = {
  name: string;
  email: string;
  subject: EnquirySubject;
  message: string;
};

export type EnquiryResult =
  { ok: true; id: string; sentAt: string } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEnquiry(draft: EnquiryDraft): Promise<EnquiryResult> {
  // Validated again on the server: the client checks are for feedback, not trust
  if (!draft.name.trim()) return { ok: false, error: "Please tell us your name." };
  if (!EMAIL.test(draft.email)) return { ok: false, error: "That email address looks wrong." };
  if (draft.message.trim().length < 10) {
    return { ok: false, error: "Please write a little more so we can help." };
  }

  // Stand-in for the real send. Deliberately not wired to anything.
  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    ok: true,
    id: Math.random().toString(36).slice(2, 10),
    sentAt: new Date().toISOString(),
  };
}
