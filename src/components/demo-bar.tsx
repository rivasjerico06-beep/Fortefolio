import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

/**
 * Fixed strip across every demo site. The demos are deliberately styled as
 * standalone client work, so this is the only thing tying them back to the
 * portfolio.
 */
export function DemoBar({ name, slug }: { name: string; slug: string }) {
  return (
    <div className="sticky top-0 z-[100] bg-[#0b0b0b] text-white">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-3 px-4 text-[13px]">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Back to portfolio</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <p className="truncate text-white/50">
          <span className="hidden sm:inline">Live demo — </span>
          <span className="text-white/80">{name}</span>
        </p>

        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <FileText className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Case study</span>
          <span className="sm:hidden">Study</span>
        </Link>
      </div>
    </div>
  );
}
