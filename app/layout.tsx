import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "479 — BNSS Section 479 Undertrial Release Eligibility Engine",
  description:
    "Computes BNSS Section 479 1/3 / 1/2 eligibility dates and drafts release applications (English + Hindi). Legal information tool, not legal advice.",
};

const DISCLAIMER =
  "Legal information tool, not legal advice. Verify with DLSA/advocate.";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a className="brand" href="/">
            479<span>entre</span>
          </a>
          <nav>
            <a href="/">Eligibility + draft</a>
            <a href="/dashboard">DLSA dashboard</a>
            <a href="/sources">Sources</a>
            <a href="/metrics">Metrics</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>
            <strong>479</strong> — BNSS Section 479 undertrial release eligibility
            engine. {DISCLAIMER}
          </p>
          <p className="muted">
            Statutes: Bharatiya Nagarik Suraksha Sanhita, 2023 &amp; Bharatiya
            Nyaya Sanhita, 2023 via India Code. Scale: NCRB Prison Statistics
            India 2024 — 5,11,542 prisoners end-2024, 3,71,440 undertrials
            (72.6%). See /sources for citations and live-data status.
          </p>
        </footer>
      </body>
    </html>
  );
}
