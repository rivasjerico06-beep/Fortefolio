import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getNeighbours, getPost, listComments } from "../../api";
import { BASE, gallery, posts, type Block } from "../../data";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found — Lumen Café" };
  return { title: `${post.title} — Lumen Café`, description: post.excerpt };
}

/** Renders a post body's blocks into the article's prose styling. */
function PostBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={index} className="pt-6 text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="lc-display border-l-2 py-2 pl-6 text-[clamp(1.35rem,2.6vw,1.9rem)] leading-[1.3]"
                style={{ borderColor: "var(--lc-accent)" }}
              >
                {block.text}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={index} className="space-y-3 pl-1">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 text-[17px] leading-relaxed"
                    style={{ color: "var(--lc-fg-2)" }}
                  >
                    <span aria-hidden style={{ color: "var(--lc-accent)" }}>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p
                key={index}
                className="text-[17px] leading-relaxed"
                style={{ color: "var(--lc-fg-2)" }}
              >
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [comments, { newer, older }] = await Promise.all([
    listComments(slug),
    getNeighbours(slug),
  ]);

  const lead = gallery[posts.findIndex((p) => p.slug === slug) % gallery.length];

  return (
    <article>
      {/* Lead */}
      <header className="mx-auto max-w-[90rem] px-5 pt-16 sm:px-10 sm:pt-24">
        <Link href={`${BASE}/blog`} className="lc-eyebrow inline-flex items-center gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Journal
        </Link>
        <p className="lc-eyebrow mt-10">
          {post.date} · {post.category}
        </p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.92]">
          {post.title}
        </h1>
      </header>

      <Reveal kind="scale" className="mt-12">
        <div
          className="ken-burns relative aspect-[21/9] w-full overflow-hidden border-y"
          style={{ borderColor: "var(--lc-line)" }}
        >
          <Image
            src={lead.image}
            alt={lead.alt}
            fill
            preload
            sizes="100vw"
            placeholder="blur"
            className="object-cover"
          />
        </div>
      </Reveal>

      {/* Body */}
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-3">
            <div className="lc-sticky">
              <p className="lc-eyebrow">Tagged</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border px-2.5 py-1 text-[12px]"
                    style={{ borderColor: "var(--lc-line)", color: "var(--lc-fg-2)" }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8 lg:col-start-5">
            <p className="lc-display text-[clamp(1.35rem,2.8vw,2rem)] leading-[1.25]">
              {post.excerpt}
            </p>
            <div className="mt-10">
              <PostBody blocks={post.body} />
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <section
        id="comments"
        className="scroll-mt-32 border-t py-16 sm:py-24"
        style={{ borderColor: "var(--lc-line)", backgroundColor: "var(--lc-surface)" }}
      >
        <div className="mx-auto max-w-[52rem] px-5 sm:px-10">
          <p className="lc-eyebrow">
            {comments.length === 0
              ? "No comments yet"
              : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
          </p>

          {comments.length > 0 && (
            <ol className="mt-8 space-y-8">
              {comments.map((comment, index) => (
                <li
                  key={`${comment.author}-${index}`}
                  className={comment.reply ? "ml-6 sm:ml-12" : ""}
                >
                  <div
                    className="border-l-2 pl-5"
                    style={{
                      borderColor: comment.reply ? "var(--lc-accent)" : "var(--lc-line-strong)",
                    }}
                  >
                    <p className="lc-eyebrow" style={{ color: "var(--lc-fg)" }}>
                      {comment.author}
                      <span style={{ color: "var(--lc-fg-2)" }}> · {comment.date}</span>
                    </p>
                    <p
                      className="mt-3 text-[16px] leading-relaxed"
                      style={{ color: "var(--lc-fg-2)" }}
                    >
                      {comment.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <p
            className="mt-10 border-t pt-6 text-[14px] leading-relaxed"
            style={{ borderColor: "var(--lc-line)", color: "var(--lc-fg-2)" }}
          >
            Comments are shown as they would be on the real site. There is no form here yet —
            posting one needs somewhere to store it, and nothing is connected.
          </p>
        </div>
      </section>

      {/* Older / newer */}
      <nav
        aria-label="More from the journal"
        className="mx-auto grid max-w-[90rem] gap-px px-5 py-16 sm:grid-cols-2 sm:px-10"
      >
        {newer ? (
          <Link href={`${BASE}/blog/${newer.slug}`} className="group py-6">
            <span className="lc-eyebrow inline-flex items-center gap-2">
              <ArrowLeft className="size-4" aria-hidden />
              Newer
            </span>
            <span className="mt-3 block text-[clamp(1.25rem,2.4vw,1.75rem)] leading-tight transition-colors group-hover:text-[var(--lc-accent-text)]">
              {newer.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {older && (
          <Link href={`${BASE}/blog/${older.slug}`} className="group py-6 sm:text-right">
            <span className="lc-eyebrow inline-flex items-center gap-2">
              Older
              <ArrowRight className="size-4" aria-hidden />
            </span>
            <span className="mt-3 block text-[clamp(1.25rem,2.4vw,1.75rem)] leading-tight transition-colors group-hover:text-[var(--lc-accent-text)]">
              {older.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
