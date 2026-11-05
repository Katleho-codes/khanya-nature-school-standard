"use client";

import { usePathname } from "next/navigation";
import type { Branch } from "@/lib/types";
import { branchWhatsappMessage, programmeWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

interface Props {
  branches: Branch[];
  programmes: Array<{ slug: string; name: string }>;
  defaultNumber: string;
  defaultMessage: string;
}

export function WhatsAppFloat({
  branches,
  programmes,
  defaultNumber,
  defaultMessage,
}: Props) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  let number = defaultNumber;
  let message = defaultMessage;

  if (parts[0] === "branches" && parts[1]) {
    const branch = branches.find((item) => item.slug === parts[1]);
    if (branch) {
      number = branch.whatsapp;
      message = branchWhatsappMessage(branch.name);
    }
  }

  if (parts[0] === "programmes" && parts[1]) {
    const programme = programmes.find((item) => item.slug === parts[1]);
    if (programme) {
      message = programmeWhatsappMessage(programme.name);
    }
  }

  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat to Khanya Nature School on WhatsApp about ${message.replace("Hello ", "")}`}
      className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full border border-forest-deep bg-forest text-oat shadow-[0_2px_0_0_var(--color-forest-deep)] transition-colors hover:bg-forest-deep md:hidden"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-ochre" aria-hidden />
    </a>
  );
}
