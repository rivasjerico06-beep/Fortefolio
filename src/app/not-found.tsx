import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-ink-3 font-mono text-sm">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page does not exist</h1>
      <p className="text-ink-2 mt-4">
        The link may be out of date, or the page may have moved. The work is all still here.
      </p>
      <Link
        href="/"
        className="bg-accent text-accent-ink hover:bg-accent-hover mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back home
      </Link>
    </div>
  );
}
