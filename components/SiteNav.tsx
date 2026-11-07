"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Case file" },
  { href: "/legal-aid", label: "Legal aid" },
  { href: "/dlsa", label: "DLSA desk" },
  { href: "/dashboard", label: "Register" },
  { href: "/sources", label: "Sources" },
  { href: "/metrics", label: "Metrics" },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      {LINKS.map((link) => {
        const current =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
