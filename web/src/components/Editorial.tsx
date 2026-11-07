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
        {eyebrow ? <p className="sticker bg-sun-tint text-ink">{eyebrow}</p> : null}
        <h2 className="display-lg mt-3 text-ink">{title}</h2>
        {lead ? <p className="lead mt-4 max-w-xl">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function HoursTable({ hours }: { hours: WeekHours }) {
  return (
    <dl className="overflow-hidden rounded-[20px_16px_22px_14px] border-2 border-ink/10 bg-paper">
      {WEEKDAY_LABELS.map(({ key, label }) => {
        const value = hours[key as keyof WeekHours];
        return (
          <div
            key={key}
            className="grid grid-cols-[1fr_auto] gap-4 border-b border-ink/10 px-4 py-2.5 text-[0.88rem] last:border-b-0"
          >
            <dt className="font-semibold text-ink/75">{label}</dt>
            <dd className="font-bold tabular-nums text-ink">
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
  onInk = false,
}: {
  number: string;
  message: string;
  label?: string;
  className?: string;
  onInk?: boolean;
}) {
  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 px-5 py-3 text-[0.9rem] font-extrabold transition-colors ${
        onInk
          ? "border-paper/25 bg-paper text-ink hover:bg-sun"
          : "border-ink/15 bg-paper text-ink hover:bg-meadow-tint"
      } ${className ?? ""}`}
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
    <div className="rounded-[18px_14px_20px_12px] bg-sun-tint/60 px-4 py-3">
      <dt className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-poppy-deep">{label}</dt>
      <dd className="mt-1 text-[0.92rem] font-semibold leading-relaxed text-ink">{children}</dd>
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
    <figure className="relative rounded-[28px_22px_30px_8px] bg-sky-tint p-5 shadow-[0_3px_0_rgb(34_40_74_/_0.1)] md:p-6">
      <span aria-hidden className="absolute -top-3 left-5 font-display text-[3.6rem] leading-none text-sky-deep/35">
        &ldquo;
      </span>
      <blockquote className="relative font-display text-[1.4rem] font-bold leading-[1.25] text-ink md:text-[1.65rem]">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="hand mt-3 text-ink/75">{attribution}</figcaption>
      ) : null}
    </figure>
  );
}
