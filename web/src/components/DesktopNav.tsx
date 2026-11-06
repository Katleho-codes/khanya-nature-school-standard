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
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-[0.88rem] font-bold transition-colors ${
              active
                ? "bg-sun text-ink"
                : "text-ink/70 hover:bg-sun-tint hover:text-ink"
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
      className="group inline-flex items-center gap-1.5 font-semibold text-paper/75 transition-colors hover:text-sun"
    >
      <span className="decoration-sun decoration-2 underline-offset-4 group-hover:underline">
        {children}
      </span>
      <ArrowRightIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
