import Link from "next/link";
import { notFound } from "next/navigation";
import { PostMeta, WpBreadcrumbs, WpLayout, WpPagination } from "@/components/wp/wp-chrome";
import { BASE, POSTS_PER_PAGE, posts } from "../data";
import { LumenHeader, LumenSidebar, PageHeading } from "../parts";

export const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

/** Page 1 lives at /blog; later pages at /blog/page/N, as WordPress does it. */
export function pageHref(page: number) {
  return page === 1 ? `${BASE}/blog` : `${BASE}/blog/page/${page}`;
}

/** Shared by the archive's first page and every paged route after it. */
export function ArchiveView({ page }: { page: number }) {
  if (page < 1 || page > totalPages) notFound();

  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <>
      <LumenHeader active={`${BASE}/blog`} />
      <WpBreadcrumbs
        trail={[
          { label: "Home", href: BASE },
          ...(page === 1
            ? [{ label: "Blog" }]
            : [{ label: "Blog", href: `${BASE}/blog` }, { label: `Page ${page}` }]),
        ]}
      />

      <WpLayout sidebar={<LumenSidebar />}>
        <PageHeading
          title="Blog"
          intro="What is on the grinder, what has changed in the kitchen, and the occasional note about opening hours."
        />

        {page > 1 && (
          <p className="mt-4 text-[13px] text-[var(--wp-ink-2)]">
            Page {page} of {totalPages}
          </p>
        )}

        <div className="mt-6 space-y-6">
          {visible.map((post) => (
            <article
              key={post.slug}
              className="border border-[var(--wp-line)] bg-[var(--wp-surface)] p-6 sm:p-7"
            >
              <h2 className="text-2xl font-bold">
                <Link
                  href={`${BASE}/blog/${post.slug}`}
                  className="hover:text-[var(--wp-accent)]"
                >
                  {post.title}
                </Link>
              </h2>
              <PostMeta
                date={post.date}
                author="Lumen"
                category={post.category}
                categoryHref={`${BASE}/blog`}
                comments={post.comments.length}
                commentsHref={`${BASE}/blog/${post.slug}#respond`}
              />
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--wp-ink-2)]">
                {post.excerpt}
              </p>
              <Link
                href={`${BASE}/blog/${post.slug}`}
                className="mt-4 inline-block border border-[var(--wp-line)] px-4 py-2 text-[12.5px] font-semibold tracking-wide uppercase hover:border-[var(--wp-accent)] hover:text-[var(--wp-accent)]"
              >
                Continue reading
              </Link>
            </article>
          ))}
        </div>

        <WpPagination pages={totalPages} current={page} hrefFor={pageHref} />
      </WpLayout>
    </>
  );
}
