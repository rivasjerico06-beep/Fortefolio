import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PostMeta, WpBreadcrumbs, WpComments, WpLayout } from "@/components/wp/wp-chrome";
import { BASE, getPost, posts } from "../../data";
import { LumenHeader, LumenSidebar, PageHeading, PostBody } from "../../parts";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Lumen Café`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // posts are newest-first, so the previous post is the next index along
  const index = posts.findIndex((item) => item.slug === slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index < posts.length - 1 ? posts[index + 1] : null;

  return (
    <>
      <LumenHeader active={`${BASE}/blog`} />
      <WpBreadcrumbs
        trail={[
          { label: "Home", href: BASE },
          { label: "Blog", href: `${BASE}/blog` },
          { label: post.title },
        ]}
      />

      <WpLayout sidebar={<LumenSidebar />}>
        <article className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-8">
          <PageHeading title={post.title} />
          <PostMeta
            date={post.date}
            author="Lumen"
            category={post.category}
            categoryHref={`${BASE}/blog`}
            comments={post.comments.length}
            commentsHref="#respond"
          />

          <PostBody blocks={post.body} />

          {/* Inline tag list — the sidebar already carries the titled Tags widget */}
          <footer className="mt-8 flex flex-wrap items-center gap-2 border-t border-[var(--wp-line)] pt-5">
            <span className="text-[12.5px] tracking-wide text-[var(--wp-ink-2)] uppercase">
              Tagged
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--wp-line)] px-2 py-1 text-[12px] text-[var(--wp-ink-2)]"
              >
                {tag}
              </span>
            ))}
          </footer>

          <WpComments comments={post.comments} />
        </article>

        {/* Older / newer post navigation */}
        <nav aria-label="Posts" className="mt-8 grid gap-4 sm:grid-cols-2">
          {older ? (
            <Link
              href={`${BASE}/blog/${older.slug}`}
              className="group border border-[var(--wp-line)] bg-[var(--wp-surface)] p-5 hover:border-[var(--wp-accent)]"
            >
              <span className="flex items-center gap-1.5 text-[12px] tracking-wide text-[var(--wp-ink-2)] uppercase">
                <ArrowLeft className="size-3.5" aria-hidden />
                Older post
              </span>
              <span className="mt-2 block font-bold group-hover:text-[var(--wp-accent)]">
                {older.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {newer && (
            <Link
              href={`${BASE}/blog/${newer.slug}`}
              className="group border border-[var(--wp-line)] bg-[var(--wp-surface)] p-5 text-right hover:border-[var(--wp-accent)] sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1.5 text-[12px] tracking-wide text-[var(--wp-ink-2)] uppercase">
                Newer post
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
              <span className="mt-2 block font-bold group-hover:text-[var(--wp-accent)]">
                {newer.title}
              </span>
            </Link>
          )}
        </nav>
      </WpLayout>
    </>
  );
}
