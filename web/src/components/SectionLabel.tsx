interface SectionLabelProps {
  number: string;
  children: string;
  className?: string;
  inverse?: boolean;
}

export function SectionLabel({
  number,
  children,
  className,
  inverse = false,
}: SectionLabelProps) {
  return (
    <p
      className={`label-caps flex items-center gap-2.5 ${inverse ? "text-oat/70" : "text-sage-deep"} ${className ?? ""}`}
    >
      <span className={inverse ? "text-ochre" : "text-forest"}>{number}</span>
      <span aria-hidden className="h-px w-6 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}
