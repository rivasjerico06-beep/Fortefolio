import type { Metadata } from "next";
import { ArchiveView } from "./archive-view";

export const metadata: Metadata = {
  title: "Journal — Lumen Café",
  description: "Notes on what is on the grinder, the kitchen, and opening hours.",
};

export default function BlogPage() {
  return <ArchiveView page={1} />;
}
