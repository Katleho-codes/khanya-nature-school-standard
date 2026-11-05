import type { ReactNode } from "react";
import type { WeekHours } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { whatsappLink } from "@/lib/whatsapp";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${
        align === "center" ? "text-center md:flex-col md:items-center" : ""
      }`}
    >
      <div className={align === "center" ? "mx-auto max-w-3xl" : "max-w-2xl"}>
        {eyebrow ? <p className="label-caps text-sage-deep">{eyebrow}</p> : null}
        <h2 className="display-lg mt-3 text-forest">{title}</h2>
        {lead ? <p className="lead mt-4 max-w-xl">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function HoursTable({ hours }: { hours: WeekHours }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {WEEKDAY_LABELS.map(({ key, label }) => {
        const value = hours[key as keyof WeekHours];
        return (
          <div key={key} className="grid grid-cols-[1fr_auto] gap-4 py-2.5 text-[0.84rem]">
            <dt className="text-bark-soft">{label}</dt>
            <dd className="tabular-nums text-forest">
              {value ? `${value.open} to ${value.close}` : "Closed"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function WhatsAppButton({
  number,
  message,
  label = "Chat on WhatsApp",
  className,
}: {
  number: string;
  message: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-sm border border-forest px-5 py-3 text-[0.9rem] font-medium text-forest transition-colors hover:bg-forest hover:text-oat ${className ?? ""}`}
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label}
    </a>
  );
}

export function Fact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="label-caps text-sage-deep">{label}</dt>
      <dd className="mt-1.5 text-[0.92rem] leading-relaxed text-bark">{children}</dd>
    </div>
  );
}

export function EditorialQuote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="border-l-2 border-ochre pl-5 md:pl-7">
      <blockquote className="font-display text-[1.45rem] leading-[1.4] text-forest md:text-[1.8rem]">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-4 text-[0.72rem] uppercase tracking-[0.16em] text-sage-deep">
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
