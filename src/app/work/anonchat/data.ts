import { cache } from "react";
import { isConfigured, supabaseServer } from "./supabase";

/**
 * Reads for the AnonChat demo.
 *
 * Every function here works in two modes. With a Supabase project configured it
 * queries the real database; without one it returns the same seed content the
 * migration inserts, so a fresh clone of this repo still builds, still
 * prerenders, and still shows a populated feed — just read-only.
 *
 * That is not a mock layer bolted on for tests. It is the difference between a
 * portfolio that survives someone cloning it and one that shows an error page.
 * `isLive` tells the UI which mode it is in so it can say so out loud.
 */

export const BASE = "/work/anonchat";

export type Profile = {
  id: string;
  handle: string;
  displayName: string;
};

export type Post = {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
};

export type Comment = {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
};

/** A message inside a private thread. `fromMe` decides which side it sits on. */
export type DirectMessage = {
  id: string;
  content: string;
  createdAt: string;
  fromMe: boolean;
};

/** A row in the inbox. `other` is the one member who is not you. */
export type Conversation = {
  id: string;
  other: Profile;
  lastMessage: string | null;
  lastAt: string | null;
  lastFromMe: boolean;
};

/** True when a real project is wired up and reachable from this render. */
export const isLive = isConfigured;

/* Seed cast — mirrors the fixed ids in the migration ---------------------- */

const SEED_PROFILES: Record<string, Profile> = {
  elena: {
    id: "11111111-1111-4111-8111-111111111111",
    handle: "erostova",
    displayName: "Elena Rostova",
  },
  alex: {
    id: "22222222-2222-4222-8222-222222222222",
    handle: "arivera",
    displayName: "Alex Rivera",
  },
  marcus: {
    id: "33333333-3333-4333-8333-333333333333",
    handle: "mthorne",
    displayName: "Marcus Thorne",
  },
  sarah: {
    id: "44444444-4444-4444-8444-444444444444",
    handle: "sarahj",
    displayName: "Sarah Jenkins",
  },
};

/** Fixed offsets rather than absolute dates, so the seed never reads as stale. */
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

const SEED_POSTS: Post[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    author: SEED_PROFILES.elena,
    content:
      "Just dropped a new minimal theme for the dashboard. Let me know what you guys think!",
    createdAt: hoursAgo(2),
    likes: 2,
    comments: 1,
    likedByMe: false,
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    author: SEED_PROFILES.alex,
    content:
      "Loving the kinetic minimal aesthetic. Less is always more. Working on some new UI components tonight.",
    createdAt: hoursAgo(3),
    likes: 0,
    comments: 0,
    likedByMe: false,
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    author: SEED_PROFILES.marcus,
    content:
      "The new routing system is finally merged. Build times are looking 40% faster. Great work everyone!",
    createdAt: hoursAgo(4),
    likes: 2,
    comments: 1,
    likedByMe: false,
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    author: SEED_PROFILES.sarah,
    content: "Coffee and code. Best way to start the morning.",
    createdAt: hoursAgo(5),
    likes: 1,
    comments: 0,
    likedByMe: false,
  },
];

const SEED_COMMENTS: Record<string, Comment[]> = {
  "a1111111-1111-4111-8111-111111111111": [
    {
      id: "c1111111-1111-4111-8111-111111111111",
      author: SEED_PROFILES.marcus,
      content: "The contrast on the sidebar is so much better now.",
      createdAt: hoursAgo(1.5),
    },
  ],
  "a3333333-3333-4333-8333-333333333333": [
    {
      id: "c2222222-2222-4222-8222-222222222222",
      author: SEED_PROFILES.sarah,
      content: "40% is a real number, nice. What did you cut?",
      createdAt: hoursAgo(3),
    },
  ],
};

/* Shapes coming back from PostgREST ---------------------------------------- */

type ProfileRow = { id: string; handle: string; display_name: string };

type MemberRow = { talkapo_profiles: ProfileRow | ProfileRow[] | null };

type ConversationRow = {
  talkapo_conversations:
    | {
        id: string;
        talkapo_conversation_members: MemberRow[] | null;
        talkapo_direct_messages:
          { id: string; content: string; created_at: string; author_id: string }[] | null;
      }
    | {
        id: string;
        talkapo_conversation_members: MemberRow[] | null;
        talkapo_direct_messages:
          { id: string; content: string; created_at: string; author_id: string }[] | null;
      }[]
    | null;
};

type PostRow = {
  id: string;
  content: string;
  created_at: string;
  talkapo_profiles: ProfileRow | ProfileRow[] | null;
  talkapo_likes: { profile_id: string }[] | null;
  talkapo_comments: { id: string }[] | null;
};

/** PostgREST returns an embedded row as an object or a one-element array. */
function one<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/**
 * Author embed, named by its foreign key rather than by table.
 *
 * `talkapo_profiles(...)` on its own is ambiguous and PostgREST rejects the
 * whole query with PGRST201: a post reaches a profile two ways — directly
 * through `author_id`, and many-to-many through `talkapo_likes` acting as a
 * junction table. Naming the constraint says which one is meant. Any future
 * table with two paths to profiles needs the same treatment.
 */
const AUTHOR = "talkapo_profiles!talkapo_posts_author_id_fkey(id, handle, display_name)";

/**
 * Report a failed query instead of swallowing it.
 *
 * Falling back to seed content is right when no project is configured. It is
 * badly wrong when a project *is* configured and the query failed, because the
 * page then shows fixtures that look exactly like real data — which is how the
 * ambiguous embed above survived a full test pass unnoticed. The fallback still
 * happens, so a broken query degrades instead of 500ing, but it says so where
 * somebody will see it.
 */
function reportQueryFailure(
  what: string,
  error: { message: string; code?: string },
  fallback = "seed content",
) {
  console.error(
    `[anonchat] ${what} query failed — falling back to ${fallback}. ` +
      `${error.code ? `${error.code}: ` : ""}${error.message}`,
  );
}

function toProfile(row: ProfileRow | null): Profile {
  return row
    ? { id: row.id, handle: row.handle, displayName: row.display_name }
    : { id: "unknown", handle: "unknown", displayName: "Unknown" };
}

/* Reads -------------------------------------------------------------------- */

/**
 * The signed-in visitor's profile, or null when signed out or unconfigured.
 *
 * Wrapped in React's `cache`, which deduplicates it for the duration of one
 * request. Rendering the feed asks for the profile three times — the layout
 * needs it for the nav, the page passes it to the composer, and `getFeed`
 * needs it to work out `likedByMe` — and each call was two more round trips to
 * Supabase, an auth check and a select. Seven trips became three.
 *
 * That is worth more than it looks. Every trip is paid at the distance between
 * the function and the database, so the cost of getting this wrong scales with
 * how far apart they are: negligible when they share a region, and ruinous
 * when they do not. `vercel.json` keeps them together; this keeps the number
 * of trips down in case they ever drift apart.
 */
export const getMyProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("talkapo_profiles")
    .select("id, handle, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? toProfile(data) : null;
});

export async function getFeed(): Promise<Post[]> {
  const supabase = await supabaseServer();
  if (!supabase) return SEED_POSTS;

  const me = await getMyProfile();

  const { data, error } = await supabase
    .from("talkapo_posts")
    .select(
      `id, content, created_at, ${AUTHOR}, talkapo_likes(profile_id), talkapo_comments(id)`,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // An unreachable project must not take the page down — seed content is a
  // better answer than a 500 on somebody's portfolio — but a failure here is
  // logged rather than passed off as data.
  if (error) {
    reportQueryFailure("feed", error);
    return SEED_POSTS;
  }
  if (!data) return SEED_POSTS;

  return (data as unknown as PostRow[]).map((row) => {
    const likes = row.talkapo_likes ?? [];
    return {
      id: row.id,
      author: toProfile(one(row.talkapo_profiles)),
      content: row.content,
      createdAt: row.created_at,
      likes: likes.length,
      comments: (row.talkapo_comments ?? []).length,
      likedByMe: me ? likes.some((like) => like.profile_id === me.id) : false,
    };
  });
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await supabaseServer();
  if (!supabase) return SEED_COMMENTS[postId] ?? [];

  const { data, error } = await supabase
    .from("talkapo_comments")
    .select("id, content, created_at, talkapo_profiles!inner(id, handle, display_name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    reportQueryFailure("comments", error);
    return SEED_COMMENTS[postId] ?? [];
  }
  if (!data) return SEED_COMMENTS[postId] ?? [];

  return data.map((row) => ({
    id: row.id as string,
    author: toProfile(one(row.talkapo_profiles as ProfileRow | ProfileRow[] | null)),
    content: row.content as string,
    createdAt: row.created_at as string,
  }));
}

/* Private messages ---------------------------------------------------------
 *
 * Every read below returns null for a signed-out visitor rather than an empty
 * list, because "you cannot see this" and "there is nothing here" are different
 * states and the UI says different things for them.
 *
 * None of these checks are the security boundary. A conversation, its
 * membership and its messages are visible only to their two members, enforced
 * by policy — an anonymous or uninvited caller gets nothing back from Postgres
 * whatever this code does.
 */

/** One row in the inbox: who it is with, and the last thing said. */
/**
 * When the signed-in account is deleted, as an ISO string.
 *
 * Read from the same `expires_at` column the sweep deletes on, through an RPC,
 * rather than worked out in the browser from a signup time. A countdown that
 * derives its own deadline will eventually disagree with the one being
 * enforced, and the moment it does the page is lying about the one rule the
 * whole demo is built around.
 */
export const getMyExpiry = cache(async (): Promise<string | null> => {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("talkapo_my_expiry");
  if (error) {
    reportQueryFailure("expiry", error, "no countdown (run migration 0004)");
    return null;
  }
  return (data as string | null) ?? null;
});

export async function getConversations(): Promise<Conversation[] | null> {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const me = await getMyProfile();
  if (!me) return null;

  // Only conversations I am in come back at all, so there is nothing to filter.
  const { data, error } = await supabase
    .from("talkapo_conversation_members")
    .select(
      `conversation_id,
       talkapo_conversations!inner(
         id,
         talkapo_conversation_members(talkapo_profiles(id, handle, display_name)),
         talkapo_direct_messages(id, content, created_at, author_id)
       )`,
    )
    .eq("profile_id", me.id);

  if (error) {
    reportQueryFailure("conversations", error);
    return [];
  }
  if (!data) return [];

  const rows = data as unknown as ConversationRow[];

  return rows
    .map((row): Conversation | null => {
      const conversation = one(row.talkapo_conversations);
      if (!conversation) return null;

      // A 1:1 thread has exactly one member who is not me
      const other = (conversation.talkapo_conversation_members ?? [])
        .map((member) => toProfile(one(member.talkapo_profiles)))
        .find((profile) => profile.id !== me.id);
      if (!other) return null;

      const messages = [...(conversation.talkapo_direct_messages ?? [])].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      );
      const latest = messages[0];

      return {
        id: conversation.id,
        other,
        lastMessage: latest?.content ?? null,
        lastAt: latest?.created_at ?? null,
        lastFromMe: latest ? latest.author_id === me.id : false,
      };
    })
    .filter((row): row is Conversation => row !== null)
    .sort((a, b) => Date.parse(b.lastAt ?? "0") - Date.parse(a.lastAt ?? "0"));
}

/** A single thread, or null if it does not exist or is not yours. */
export async function getConversation(
  id: string,
): Promise<{ other: Profile; messages: DirectMessage[] } | null> {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const me = await getMyProfile();
  if (!me) return null;

  const { data: members, error: membersError } = await supabase
    .from("talkapo_conversation_members")
    .select("profile_id, talkapo_profiles(id, handle, display_name)")
    .eq("conversation_id", id);

  if (membersError) {
    reportQueryFailure("conversation members", membersError);
    return null;
  }

  // Empty means the policy refused it — someone else's thread, or no such id.
  if (!members || members.length === 0) return null;

  const rows = members as unknown as MemberRow[];
  const other = rows
    .map((member) => toProfile(one(member.talkapo_profiles)))
    .find((profile) => profile.id !== me.id);
  if (!other) return null;

  const { data, error } = await supabase
    .from("talkapo_direct_messages")
    .select("id, content, created_at, author_id")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    reportQueryFailure("direct messages", error);
    return { other, messages: [] };
  }

  return {
    other,
    messages: (data ?? []).map((row) => ({
      id: row.id as string,
      content: row.content as string,
      createdAt: row.created_at as string,
      fromMe: (row.author_id as string) === me.id,
    })),
  };
}

/**
 * People search, for starting a conversation.
 *
 * Goes through a database function rather than a filtered select so the rule
 * "only accounts that actually exist" lives next to the data. The function
 * excludes anything without an auth user behind it and excludes you, and is
 * executable only by `authenticated`.
 */
export async function searchPeople(term: string): Promise<Profile[]> {
  const supabase = await supabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("talkapo_search_people", { term });

  if (error) {
    reportQueryFailure("people search", error);
    return [];
  }

  return (data ?? []).map((row: ProfileRow) => toProfile(row));
}

/* Presentation helpers ------------------------------------------------------ */

/** "2h", "3d" — the compact form the design uses. */
export function shortAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86_400)}d`;
}

/** Clock time for a chat bubble. */
export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * A stable colour pair per handle, so an avatar is recognisable without a
 * photograph. Two hues from one hash keeps the gradient from going muddy.
 */
export function avatarColors(handle: string) {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) hash = (hash * 31 + handle.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return { from: `hsl(${hue} 70% 55%)`, to: `hsl(${(hue + 48) % 360} 70% 38%)` };
}

export function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}
