/**
 * Demo sites opt out of the portfolio chrome entirely — each one carries its
 * own identity, so only the root <html> wrapper is shared.
 */
export default function WorkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}
