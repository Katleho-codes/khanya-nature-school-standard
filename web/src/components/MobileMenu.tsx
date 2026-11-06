"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import type { Branch } from "@/lib/types";
import { Logo, ScribbleField, Sun } from "./brand";
import { ButtonLink } from "./Button";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { phoneHref } from "@/lib/format";
import { branchTone, toneStyle } from "@/lib/tones";

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
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink/15 bg-paper text-ink transition-colors hover:bg-sun-tint lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content className="fixed inset-0 z-50 overflow-y-auto bg-paper p-5 sm:p-8">
          <ScribbleField className="pointer-events-none fixed -right-24 -top-10 h-80 w-80 text-sun opacity-20" />
          <div className="relative mx-auto flex max-w-3xl items-center justify-between">
            <Dialog.Title className="sr-only">Khanya Nature School menu</Dialog.Title>
            <Link href="/" onClick={() => setOpen(false)} aria-label="Khanya Nature School home">
              <Logo />
            </Link>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink/15 bg-paper text-ink hover:bg-poppy-tint"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="relative mx-auto mt-9 max-w-3xl">
            <ul className="grid gap-2">
              {links.map((link, index) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center justify-between gap-4 rounded-[22px_18px_24px_16px] px-4 font-display text-[1.7rem] font-extrabold leading-tight text-ink transition-colors hover:bg-sun-tint"
                  >
                    {link.label}
                    <span className="hand text-base text-ink/40" aria-hidden>
                      0{index + 1}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative mx-auto mt-9 max-w-3xl">
            <p className="inline-flex items-center gap-2 font-display text-xl font-extrabold text-ink">
              <Sun className="h-5 w-5 text-sun-deep" />
              Our branches
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {branches.map((branch) => {
                const style = toneStyle(branchTone(branch.slug));
                return (
                  <li
                    key={branch.id}
                    className={`paper-card-plain ${style.tint} p-4`}
                  >
                    <Link
                      href={`/branches/${branch.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between gap-4 font-display text-lg font-extrabold text-ink"
                    >
                      <span>{branch.name}</span>
                      <span className="hand text-sm text-ink/55">{branch.suburb}</span>
                    </Link>
                    <a
                      href={phoneHref(branch.phone)}
                      className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-ink/65 hover:text-poppy-deep"
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                      {branch.phone}
                    </a>
                  </li>
                );
              })}
            </ul>
            <ButtonLink href="/admissions#enquiry" className="mt-7 w-full" size="md">
              Start an enquiry
            </ButtonLink>
            <p className="hand mt-6 text-center text-ink/55">
              We usually reply within one working day.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
