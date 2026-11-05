import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "solid" | "outline" | "light" | "text";

const styles: Record<Variant, string> = {
  solid:
    "bg-forest text-oat hover:bg-forest-deep border border-forest hover:border-forest-deep",
  outline:
    "bg-transparent text-forest border border-line-strong hover:border-forest hover:bg-forest-tint",
  light:
    "bg-oat text-forest border border-oat hover:bg-paper hover:border-paper",
  text:
    "bg-transparent text-forest underline decoration-ochre decoration-2 underline-offset-4 hover:decoration-4 px-0 py-0 border-0",
};

const sizes: Record<"sm" | "md", string> = {
  sm: "px-4 py-2.5 text-[0.82rem]",
  md: "px-5 py-3 text-[0.9rem]",
};

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
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-[0.01em] transition-colors duration-200 ${variant === "text" ? "" : sizes[size]} ${styles[variant]} ${className ?? ""}`}
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
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-[0.01em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${variant === "text" ? "" : sizes[size]} ${styles[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
