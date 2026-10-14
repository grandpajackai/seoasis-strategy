import type { Metadata } from "next";
import "./globals.css";
import "./interview.css";
export const metadata: Metadata = {
  title: "SEOasis — Strategist Workspace",
  description:
    "An independent Shopify client strategy workspace prototype, demonstrated with SEOasis public research, assessments, and a revenue-led 90-day framework.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
