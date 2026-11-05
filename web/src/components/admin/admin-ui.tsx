"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";

export const adminInput =
  "mt-1.5 w-full rounded-sm border border-line-strong bg-paper px-3 py-2 text-[0.86rem] text-bark placeholder:text-bark-soft/60 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15 disabled:cursor-not-allowed disabled:bg-sage-tint/50";

export const adminTextarea =
  "mt-1.5 w-full rounded-sm border border-line-strong bg-paper px-3 py-2 text-[0.86rem] leading-relaxed text-bark placeholder:text-bark-soft/60 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15";

export const adminLabel =
  "block text-[0.74rem] font-medium tracking-[0.02em] text-forest";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="label-caps text-sage-deep">{eyebrow}</p> : null}
        <h1 className="display-md mt-1.5 text-forest">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[0.86rem] leading-relaxed text-bark-soft">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={adminLabel}>
        {label}
        {required ? <span className="ml-1 text-clay">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[0.74rem] text-clay">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[0.72rem] leading-relaxed text-bark-soft">{hint}</p>
      ) : null}
    </div>
  );
}

const badgeTones = {
  green: "border-sage-deep/25 bg-sage-tint text-sage-deep",
  ochre: "border-ochre-deep/25 bg-ochre/15 text-ochre-deep",
  clay: "border-clay/25 bg-clay/10 text-clay",
  neutral: "border-line-strong bg-oat text-bark-soft",
  forest: "border-forest bg-forest text-oat",
} as const;

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.08em] ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-line-strong bg-paper/60 px-6 py-12 text-center">
      <p className="font-display text-[1.35rem] text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.84rem] leading-relaxed text-bark-soft">
        {body}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-sm border-l-2 border-clay bg-clay/5 px-4 py-3">
      <p className="text-[0.84rem] text-clay">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-[0.78rem] font-medium text-clay underline underline-offset-2"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-sm border border-line bg-paper" aria-hidden>
      <div className="h-10 border-b border-line bg-sage-tint/60" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0"
        >
          <div className="h-3 w-1/4 animate-pulse rounded bg-sage-tint" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-sage-tint" />
          <div className="h-3 w-16 animate-pulse rounded bg-sage-tint" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded bg-sage-tint" />
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-forest-deep/45 backdrop-blur-[1px]" />
        <Dialog.Content
          className={`fixed inset-y-0 right-0 z-[61] w-full overflow-y-auto bg-oat p-5 shadow-2xl sm:p-7 ${
            wide ? "sm:max-w-3xl" : "sm:max-w-xl"
          }`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <Dialog.Title className="font-display text-[1.45rem] leading-tight text-forest">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-[0.78rem] leading-relaxed text-bark-soft">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line-strong text-forest transition-colors hover:bg-forest-tint"
                aria-label="Close"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !busy && onOpenChange(value)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-forest-deep/55" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-line bg-oat p-6 shadow-2xl">
          <Dialog.Title className="font-display text-[1.35rem] text-forest">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[0.86rem] leading-relaxed text-bark-soft">
            {body}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={busy}
                className="rounded-sm border border-line-strong px-4 py-2 text-[0.82rem] text-forest transition-colors hover:bg-forest-tint disabled:opacity-50"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className="rounded-sm border border-clay bg-clay px-4 py-2 text-[0.82rem] font-medium text-oat transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "Working" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
  disabled,
  size = "md",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline" | "ghost" | "danger";
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const variants = {
    solid:
      "border-forest bg-forest text-oat hover:border-forest-deep hover:bg-forest-deep",
    outline:
      "border-line-strong bg-transparent text-forest hover:border-forest hover:bg-forest-tint",
    ghost:
      "border-transparent bg-transparent text-forest hover:bg-forest-tint",
    danger: "border-clay bg-clay text-oat hover:opacity-90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-sm border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
        size === "sm" ? "px-3 py-1.5 text-[0.76rem]" : "px-4 py-2 text-[0.82rem]"
      } ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
