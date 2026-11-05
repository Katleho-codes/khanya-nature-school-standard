"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import type { Branch } from "@/lib/types";
import { Logo } from "./brand";
import { ButtonLink } from "./Button";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { phoneHref } from "@/lib/format";

const links = [
  { href: "/programmes", label: "Programmes" },
  { href: "/branches", label: "Branches" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/admissions", label: "Admissions" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ branches }: { branches: Branch[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong text-forest lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-deep/45" />
        <Dialog.Content className="fixed inset-0 z-50 overflow-y-auto bg-oat p-5 sm:p-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Dialog.Title className="sr-only">Khanya Nature School menu</Dialog.Title>
            <Link href="/" onClick={() => setOpen(false)} aria-label="Khanya Nature School home">
              <Logo />
            </Link>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong text-forest"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="mx-auto mt-10 max-w-3xl">
            <ul className="divide-y divide-line">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3.5 font-display text-[1.9rem] leading-tight text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mx-auto mt-10 max-w-3xl">
            <p className="label-caps text-sage-deep">Our branches</p>
            <ul className="mt-4 space-y-3">
              {branches.map((branch) => (
                <li key={branch.id}>
                  <Link
                    href={`/branches/${branch.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-2 text-forest"
                  >
                    <span>{branch.name}</span>
                    <span className="text-xs text-bark-soft">{branch.suburb}</span>
                  </Link>
                  <a
                    href={phoneHref(branch.phone)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-bark-soft"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {branch.phone}
                  </a>
                </li>
              ))}
            </ul>
            <ButtonLink
              href="/admissions#enquiry"
              className="mt-8 w-full"
              size="md"
            >
              Start an enquiry
            </ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
