import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveView, totalPages } from "../../archive-view";

type Params = { params: Promise<{ n: string }> };

/** Page 1 is served by /blog itself, so only 2..N are generated here. */
export function generateStaticParams() {
  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
    n: String(index + 2),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Blog — page ${n} — Lumen Café`,
    description: "Notes on what is on the grinder, the kitchen, and opening hours.",
  };
}

export default async function BlogPagedPage({ params }: Params) {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page)) notFound();

  return <ArchiveView page={page} />;
}
