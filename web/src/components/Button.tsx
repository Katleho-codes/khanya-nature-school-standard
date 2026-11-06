import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "solid" | "secondary" | "outline" | "light" | "text";

const styles: Record<Variant, string> = {
  solid:
    "bg-sun text-ink border-b-4 border-sun-deep hover:bg-sun-deep hover:border-ink/25",
  secondary:
    "bg-poppy-deep text-white border-b-4 border-ink/30 hover:bg-poppy hover:border-poppy-deep",
  outline:
    "bg-paper text-ink border-2 border-ink/20 border-b-4 border-b-ink/25 hover:bg-sun-tint",
  light:
    "bg-paper text-ink border-b-4 border-ink/25 hover:bg-sun-tint",
  text:
    "bg-transparent text-ink underline decoration-sun-deep decoration-[3px] underline-offset-[6px] hover:decoration-poppy-deep px-1 py-1 border-0",
};

const sizes: Record<"sm" | "md", string> = {
  sm: "min-h-12 px-5 py-2.5 text-[0.86rem]",
  md: "min-h-[3.25rem] px-6 py-3 text-[0.95rem]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-extrabold tracking-[0.005em] transition-[transform,background-color,border-color,box-shadow] duration-150 active:translate-y-[3px] active:border-b-0 active:pt-[calc(0.75rem+3px)] disabled:cursor-not-allowed disabled:opacity-55";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "solid",
  size = "md",
  className,
  target,
  rel,
  ariaLabel,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={`${base} ${variant === "text" ? "" : sizes[size]} ${styles[variant]} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Button({
  children,
  variant = "solid",
  size = "md",
  className,
  type = "button",
  onClick,
  disabled,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${variant === "text" ? "" : sizes[size]} ${styles[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
