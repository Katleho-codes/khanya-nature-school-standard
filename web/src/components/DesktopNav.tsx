"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon } from "./icons";

const links = [
  { href: "/programmes", label: "Programmes" },
  { href: "/branches", label: "Branches" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/admissions", label: "Admissions" },
];

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 text-[0.84rem] tracking-[0.01em] transition-colors ${
              active
                ? "text-forest after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-ochre"
                : "text-bark-soft hover:text-forest"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FooterLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-oat/75 transition-colors hover:text-oat"
    >
      <span className="border-b border-transparent transition-colors group-hover:border-ochre">
        {children}
      </span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
