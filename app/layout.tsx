import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "479 — BNSS Section 479 release file",
  description:
    "Compute a BNSS Section 479 release date, prepare a printable A4 application, check Section 12 legal-aid eligibility, and find a sourced DLSA office. Legal information, not legal advice.",
};

const DISCLAIMER =
  "Legal information, not legal advice. Verify with the DLSA or an advocate.";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <a className="brand" href="/" aria-label="479 case file — home">
              <span className="brand-mark" aria-hidden="true">
                479
              </span>
              <span className="brand-text">
                <span className="brand-title">Undertrial release file</span>
                <span className="brand-sub">BNSS Section 479 · India</span>
              </span>
            </a>
            <SiteNav />
          </div>
        </header>

        <div className="disclaimer-bar" role="note">
          <div className="shell">
            <strong>Legal information, not legal advice.</strong>
            <span>
              Verify every date and draft with the District Legal Services
              Authority or an advocate before filing.
            </span>
          </div>
        </div>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="shell">
            <div className="footer-grid">
              <div>
                <p className="footer-title">479</p>
                <p>
                  A case-file tool for the BNSS Section 479 release clock:
                  compute the date, print the application, and route the family
                  to free legal aid.
                </p>
                <p className="footer-fine">{DISCLAIMER}</p>
              </div>
              <div>
                <p className="footer-title">The law</p>
                <p>
                  <a
                    href="https://www.indiacode.nic.in/handle/123456789/20099"
                    target="_blank"
                    rel="noreferrer"
                  >
                    BNSS, 2023 — India Code
                  </a>
                </p>
                <p>
                  <a
                    href="https://www.indiacode.nic.in/handle/123456789/20062"
                    target="_blank"
                    rel="noreferrer"
                  >
                    BNS, 2023 — India Code
                  </a>
                </p>
                <p>
                  <a
                    href="https://nalsa.gov.in/the-legal-services-authorities-act-1987/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Legal Services Authorities Act, 1987
                  </a>
                </p>
              </div>
              <div>
                <p className="footer-title">Get help</p>
                <p>
                  NALSA legal-aid helpline:{" "}
                  <a href="tel:15100">15100</a>
                </p>
                <p>
                  <a href="/legal-aid">Check Section 12 eligibility</a>
                </p>
                <p>
                  <a href="/dlsa">Find a sourced DLSA office</a>
                </p>
              </div>
            </div>
            <p className="footer-fine">
              Scale: NCRB, Prison Statistics India 2024 — 5,11,542 prisoners at
              end-2024, 3,71,440 undertrials (72.6%). DLSA contacts transcribed
              from NALSA State Legal Services Authority pages on 6 November
              2026. State undertrial rows from data.gov.in, as on 31 December
              2022. Every figure on the site carries its own source and date.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
