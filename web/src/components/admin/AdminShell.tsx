"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth-server";
import { Logo } from "@/components/brand";
import { CloseIcon, MenuIcon, ArrowUpRightIcon } from "@/components/icons";
import { useToast } from "./toast";

const groups: Array<{
  label: string;
  items: Array<{ href: string; label: string; adminOnly?: boolean }>;
}> = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/branches", label: "Branches" },
      { href: "/admin/programmes", label: "Programmes" },
      { href: "/admin/news", label: "News" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/galleries", label: "Galleries" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/documents", label: "Documents" },
    ],
  },
  {
    label: "School",
    items: [
      { href: "/admin/enquiries", label: "Enquiries" },
      { href: "/admin/users", label: "Users", adminOnly: true },
      { href: "/admin/outbox", label: "Outbox" },
    ],
  },
  {
    label: "Configuration",
    items: [{ href: "/admin/settings", label: "Site settings", adminOnly: true }],
  },
];

function NavList({
  user,
  onNavigate,
}: {
  user: SessionUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="space-y-6">
      {groups.map((group) => {
        const items = group.items.filter(
          (item) => !item.adminOnly || user.role === "admin",
        );
        if (items.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="px-3 text-[0.6rem] uppercase tracking-[0.18em] text-oat/70">
              {group.label}
            </p>
            <ul className="mt-2 space-y-0.5">
              {items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin" || pathname === "/admin/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-sm px-3 py-2 text-[0.82rem] transition-colors ${
                        active
                          ? "bg-oat/12 text-oat"
                          : "text-oat/65 hover:bg-oat/7 hover:text-oat"
                      }`}
                    >
                      {item.label}
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-ochre" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "same-origin",
      });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast("Sign out failed. Please try again.", "error");
      setSigningOut(false);
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-oat/12 px-5 py-5">
        <Link href="/admin" aria-label="Khanya admin home">
          <Logo inverse />
        </Link>
        <p className="mt-2 pl-[2.9rem] text-[0.58rem] uppercase tracking-[0.2em] text-oat/70">
          School admin
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-5">
        <NavList user={user} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="border-t border-oat/12 p-3">
        <div className="rounded-sm bg-oat/7 px-3 py-3">
          <p className="truncate text-[0.8rem] text-oat">{user.name}</p>
          <p className="truncate text-[0.68rem] text-oat/70">{user.email}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="rounded-full border border-oat/20 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.12em] text-oat/80">
              {user.role ?? "editor"}
            </span>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="text-[0.7rem] text-oat/80 transition-colors hover:text-ochre disabled:opacity-50"
            >
              {signingOut ? "Signing out" : "Sign out"}
            </button>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-sm border border-oat/15 px-3 py-2 text-[0.72rem] text-oat/80 transition-colors hover:border-oat/35 hover:text-oat"
        >
          View website <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-oat lg:flex">
      <aside className="hidden w-64 shrink-0 bg-forest lg:sticky lg:top-0 lg:block lg:h-screen">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-forest-deep/55"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-forest shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-oat/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-forest"
            aria-label="Open admin menu"
          >
            <MenuIcon />
          </button>
          <Logo />
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-forest"
            aria-label="View website"
          >
            <ArrowUpRightIcon />
          </Link>
        </header>

        <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminMobileClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong text-forest"
      aria-label="Close"
    >
      <CloseIcon className="h-4 w-4" />
    </button>
  );
}
