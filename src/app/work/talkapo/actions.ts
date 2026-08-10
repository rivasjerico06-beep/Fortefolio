"use server";

import { revalidatePath } from "next/cache";
import { BASE } from "./data";
import { supabaseServer } from "./supabase";

/**
 * Writes for the Talkapo demo.
 *
 * Every one of these is a Server Action rather than a client-side call to
 * Supabase, for one reason: the session cookie is httpOnly, so the browser
 * cannot read it, and an attacker who lands XSS on the page cannot steal it.
 * The client sends intent — "like this post" — and the server resolves who is
 * asking from the cookie it already holds.
 *
 * None of them trust the caller's claim about identity. The author of a post is
 * always `talkapo_me()` as resolved by the database from the session; a request
 * that names somebody else's profile id is refused by the RLS policy, not by a
 * check written here.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED =
  "This demo has no database attached, so it is running read-only on seed content.";
const SIGNED_OUT = "You need an account to do that.";

/** Turn a Postgres or GoTrue error into something worth showing a person. */
function readable(message: string) {
  const lower = message.toLowerCase();

  if (message.includes("Slow down")) return message;
  if (message.includes("duplicate key")) return "You have already done that.";
  if (message.includes("row-level security")) return SIGNED_OUT;
  if (lower.includes("invalid login")) return "Wrong email or password.";
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "That email already has an account — log in instead.";
  }

  /* The two failures a misconfigured project produces, both of which look like
     the visitor's fault and are not. Supabase only sends a confirmation mail
     when "Confirm email" is left on, and its built-in mailer allows a handful
     an hour — so the third person to try a demo gets refused. Turning that
     setting off removes both. See supabase/README.md, step 3. */
  if (lower.includes("email rate limit") || lower.includes("over_email_send_rate_limit")) {
    return "Sign-ups are temporarily unavailable — the demo's mail quota is used up. Try again shortly.";
  }
  if (lower.includes("is invalid") && lower.includes("email")) {
    return "That email address was rejected. Try a different one.";
  }

  return message;
}

async function client() {
  const supabase = await supabaseServer();
  return supabase;
}

/** The caller's profile id, resolved server-side from their session cookie. */
async function myProfileId(supabase: NonNullable<Awaited<ReturnType<typeof supabaseServer>>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("talkapo_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

/* Auth --------------------------------------------------------------------- */

export async function signUp(formData: FormData): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const handle = String(formData.get("handle") ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
  const displayName = String(formData.get("displayName") ?? "").trim() || handle;

  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    return { ok: false, error: "Handle must be 3–20 letters, numbers or underscores." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: readable(error.message) };
  if (!data.user) return { ok: false, error: "Could not create that account." };

  // The profile carries the handle, which auth.users has no column for.
  const { error: profileError } = await supabase.from("talkapo_profiles").insert({
    user_id: data.user.id,
    handle,
    display_name: displayName,
  });

  if (profileError) {
    return {
      ok: false,
      error: profileError.message.includes("duplicate")
        ? "That handle is taken."
        : readable(profileError.message),
    };
  }

  revalidatePath(BASE, "layout");
  return { ok: true };
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return { ok: false, error: readable(error.message) };

  revalidatePath(BASE, "layout");
  return { ok: true };
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  await supabase.auth.signOut();
  revalidatePath(BASE, "layout");
  return { ok: true };
}

/* Feed --------------------------------------------------------------------- */

export async function createPost(content: string): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };
  if (trimmed.length > 280) return { ok: false, error: "Posts are capped at 280 characters." };

  const me = await myProfileId(supabase);
  if (!me) return { ok: false, error: SIGNED_OUT };

  const { error } = await supabase
    .from("talkapo_posts")
    .insert({ author_id: me, content: trimmed });

  if (error) return { ok: false, error: readable(error.message) };

  revalidatePath(BASE);
  return { ok: true };
}

/**
 * Like or unlike. The button is a toggle, so the action is too — asking the
 * client which way it meant would let a double click end up out of step with
 * the row that actually exists.
 */
export async function toggleLike(postId: string): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const me = await myProfileId(supabase);
  if (!me) return { ok: false, error: SIGNED_OUT };

  const { data: existing } = await supabase
    .from("talkapo_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("profile_id", me)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("talkapo_likes").delete().eq("post_id", postId).eq("profile_id", me)
    : await supabase.from("talkapo_likes").insert({ post_id: postId, profile_id: me });

  if (error) return { ok: false, error: readable(error.message) };

  revalidatePath(BASE);
  return { ok: true };
}

export async function addComment(postId: string, content: string): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };
  if (trimmed.length > 280)
    return { ok: false, error: "Comments are capped at 280 characters." };

  const me = await myProfileId(supabase);
  if (!me) return { ok: false, error: SIGNED_OUT };

  const { error } = await supabase
    .from("talkapo_comments")
    .insert({ post_id: postId, author_id: me, content: trimmed });

  if (error) return { ok: false, error: readable(error.message) };

  revalidatePath(BASE);
  return { ok: true };
}

/* Private messages ---------------------------------------------------------- */

/**
 * Open a conversation with someone, or return the one that already exists.
 *
 * The whole thing is a single database function. Finding the existing pair,
 * creating the thread and adding both members has to happen atomically, or two
 * people messaging each other at the same moment end up with two threads. It
 * also has to insert the *other* person's membership row, which the caller's
 * own policies rightly do not allow.
 */
export async function startConversation(
  otherProfileId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const me = await myProfileId(supabase);
  if (!me) return { ok: false, error: SIGNED_OUT };

  const { data, error } = await supabase.rpc("talkapo_start_conversation", {
    other_profile: otherProfileId,
  });

  if (error) return { ok: false, error: readable(error.message) };
  if (!data) return { ok: false, error: "Could not open that conversation." };

  revalidatePath(`${BASE}/messages`);
  return { ok: true, id: data as string };
}

export async function sendDirectMessage(
  conversationId: string,
  content: string,
): Promise<ActionResult> {
  const supabase = await client();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };
  if (trimmed.length > 2000) {
    return { ok: false, error: "Messages are capped at 2000 characters." };
  }

  const me = await myProfileId(supabase);
  if (!me) return { ok: false, error: SIGNED_OUT };

  /* There is deliberately no check here that the caller belongs to this
     conversation. The insert policy requires membership, so a forged
     conversation id is refused by Postgres. Repeating the rule here would only
     create a second place for it to be wrong. */
  const { error } = await supabase
    .from("talkapo_direct_messages")
    .insert({ conversation_id: conversationId, author_id: me, content: trimmed });

  if (error) return { ok: false, error: readable(error.message) };

  revalidatePath(`${BASE}/messages`);
  revalidatePath(`${BASE}/messages/${conversationId}`);
  return { ok: true };
}
