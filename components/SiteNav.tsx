"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import type { MessageKey } from "@/lib/i18n/messages/en";

const LINKS: Array<{ href: string; label: MessageKey }> = [
  { href: "/", label: "nav.caseFile" },
  { href: "/legal-aid", label: "nav.legalAid" },
  { href: "/dlsa", label: "nav.dlsa" },
  { href: "/dashboard", label: "nav.register" },
  { href: "/sources", label: "nav.sources" },
  { href: "/metrics", label: "nav.metrics" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="nav" aria-label={t("nav.main")}>
      {LINKS.map((link) => {
        const current =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
          >
            {t(link.label)}
          </a>
        );
      })}
    </nav>
  );
}
