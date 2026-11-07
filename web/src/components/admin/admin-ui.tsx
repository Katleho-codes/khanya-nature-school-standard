"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";

export const adminInput =
  "mt-1.5 w-full rounded-[14px] border-2 border-ink/15 bg-paper px-3.5 py-2.5 text-[0.9rem] text-ink placeholder:text-ink/40 transition-colors focus:border-poppy-deep focus:outline-none focus:ring-4 focus:ring-poppy-tint disabled:cursor-not-allowed disabled:bg-sky-tint/50";

export const adminTextarea =
  "mt-1.5 w-full rounded-[14px] border-2 border-ink/15 bg-paper px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-ink placeholder:text-ink/40 transition-colors focus:border-poppy-deep focus:outline-none focus:ring-4 focus:ring-poppy-tint";

export const adminLabel =
  "block text-[0.78rem] font-bold tracking-[0.01em] text-ink";

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
    <div className="flex flex-col gap-4 border-b-2 border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="sticker bg-sun text-ink">{eyebrow}</p> : null}
        <h1 className="display-md mt-2 text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[0.86rem] leading-relaxed text-ink/75">
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
        {required ? <span className="ml-1 text-poppy-deep">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[0.76rem] font-semibold field-error text-poppy-deep">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[0.74rem] leading-relaxed text-ink/75">{hint}</p>
      ) : null}
    </div>
  );
}

const badgeTones = {
  meadow: "border-meadow-deep/25 bg-meadow-tint text-meadow-deep",
  sun: "border-sun-deep/30 bg-sun-tint text-ink",
  sky: "border-sky-deep/25 bg-sky-tint text-sky-deep",
  poppy: "border-poppy-deep/25 bg-poppy-tint text-poppy-deep",
  neutral: "border-ink/15 bg-paper text-ink/75",
  ink: "border-ink bg-ink text-paper",
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
      className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.06em] ${badgeTones[tone]}`}
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
    <div className="paper-card bg-sun-tint/45 px-6 py-12 text-center">
      <p className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper text-[1.4rem]">
        *
      </p>
      <p className="mt-3 font-display text-[1.35rem] font-extrabold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-relaxed text-ink/75">
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
    <div className="rounded-[18px] border-2 border-poppy-deep bg-poppy-tint px-4 py-3">
      <p className="text-[0.86rem] font-semibold field-error text-poppy-deep">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex min-h-9 items-center text-[0.8rem] font-bold text-poppy-deep underline underline-offset-2"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper" aria-hidden>
      <div className="h-10 border-b-2 border-ink/10 bg-sky-tint/60" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b-2 border-ink/10 px-4 py-4 last:border-b-0"
        >
          <div className="h-3 w-1/4 animate-pulse rounded bg-sky-tint" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-sky-tint" />
          <div className="h-3 w-16 animate-pulse rounded bg-sky-tint" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded bg-sky-tint" />
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
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/45 backdrop-blur-[1px]" />
        <Dialog.Content
          className={`fixed inset-y-0 right-0 z-[61] w-full overflow-y-auto rounded-l-[28px] border-l-2 border-ink/10 bg-paper p-5 shadow-2xl sm:p-7 ${
            wide ? "sm:max-w-3xl" : "sm:max-w-xl"
          }`}
        >
          <div className="flex items-start justify-between gap-4 border-b-2 border-ink/10 pb-4">
            <div>
              <Dialog.Title className="font-display text-[1.45rem] font-extrabold leading-tight text-ink">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-[0.8rem] leading-relaxed text-ink/75">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 text-ink transition-colors hover:bg-sun-tint"
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
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[26px_20px_28px_18px] border-2 border-ink/10 bg-paper p-6 shadow-2xl">
          <Dialog.Title className="font-display text-[1.35rem] font-extrabold text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[0.88rem] leading-relaxed text-ink/75">
            {body}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={busy}
                className="inline-flex min-h-11 items-center rounded-full border-2 border-ink/15 px-4 py-2 text-[0.84rem] font-bold text-ink transition-colors hover:bg-sun-tint disabled:opacity-50"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className="inline-flex min-h-11 items-center rounded-full border-b-4 border-poppy-deep bg-poppy-deep px-4 py-2 text-[0.84rem] font-bold text-white transition-colors hover:bg-poppy-deep hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
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
      "border-b-4 border-sun-deep bg-sun text-ink hover:bg-sun-deep",
    outline:
      "border-2 border-b-4 border-ink/20 bg-paper text-ink hover:border-ink/35 hover:bg-sun-tint",
    ghost:
      "border-transparent bg-transparent text-ink hover:bg-sun-tint",
    danger:
      "border-b-4 border-poppy-deep bg-poppy-deep text-white hover:bg-poppy-deep hover:brightness-110",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border font-bold transition-all active:translate-y-[2px] active:border-b-2 disabled:cursor-not-allowed disabled:opacity-55 ${
        size === "sm" ? "min-h-10 px-3.5 py-1.5 text-[0.8rem]" : "min-h-12 px-5 py-2.5 text-[0.86rem]"
      } ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
