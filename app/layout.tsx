import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { I18nProvider } from "@/components/I18nProvider";
import { getI18n } from "@/lib/i18n/server";
import { INDIC_FONTS_HREF } from "@/lib/i18n/fonts";
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

export function generateMetadata(): Metadata {
  const { t } = getI18n();
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const { locale, dir, t } = getI18n();
  return (
    <html lang={locale} dir={dir} className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={INDIC_FONTS_HREF} rel="stylesheet" />
      </head>
      <body>
        <I18nProvider initialLocale={locale}>
        <header className="site-header">
          <div className="shell header-inner">
            <a className="brand" href="/" aria-label={t("brand.homeAria")}>
              <span className="brand-mark" aria-hidden="true">
                479
              </span>
              <span className="brand-text">
                <span className="brand-title">{t("brand.title")}</span>
                <span className="brand-sub">{t("brand.sub")}</span>
              </span>
            </a>
            <SiteNav />
            <LanguageSwitcher className="header-lang" />
          </div>
        </header>

        <div className="disclaimer-bar" role="note">
          <div className="shell">
            <strong>{t("disclaimer.short")}</strong>
            <span>{t("disclaimer.verify")}</span>
          </div>
        </div>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="shell">
            <div className="footer-grid">
              <div>
                <p className="footer-title">479</p>
                <p>{t("footer.about")}</p>
                <p className="footer-fine">{t("disclaimer.full")}</p>
              </div>
              <div>
                <p className="footer-title">{t("footer.law")}</p>
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
                <p className="footer-title">{t("footer.help")}</p>
                <p>
                  {t("footer.helplineLabel")}{" "}
                  <a href="tel:15100">15100</a>
                </p>
                <p>
                  <a href="/legal-aid">{t("footer.checkAid")}</a>
                </p>
                <p>
                  <a href="/dlsa">{t("footer.findDlsa")}</a>
                </p>
              </div>
            </div>
            <p className="footer-fine">{t("footer.fine")}</p>
          </div>
        </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
