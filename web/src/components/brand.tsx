interface LeafVeinProps {
  className?: string;
  strokeWidth?: number;
  title?: string;
}

export function LeafVein({ className, strokeWidth = 1, title }: LeafVeinProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M60 154C60 108 59 58 60 8" />
      <path d="M60 132C45 124 34 112 31 98c14 1 25 9 29 22" />
      <path d="M60 132c15-8 26-20 29-34-14 1-25 9-29 22" />
      <path d="M60 106C43 98 31 84 30 68c15 1 26 11 30 25" />
      <path d="M60 106c17-8 29-22 30-38-15 1-26 11-30 25" />
      <path d="M60 80C45 72 35 60 33 46c14 1 24 10 27 22" />
      <path d="M60 80c15-8 25-20 27-34-14 1-24 10-27 22" />
      <path d="M60 55C48 48 40 38 38 26c12 1 20 9 22 19" />
      <path d="M60 55c12-7 20-17 22-29-12 1-20 9-22 19" />
      <path d="M60 30C52 25 47 18 46 10c8 1 13 6 14 13" />
      <path d="M60 30c8-5 13-12 14-20-8 1-13 6-14 13" />
    </svg>
  );
}

export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 37V17" />
      <path d="M20 31c-5-3-8-7-8-12 5 1 8 5 8 12Z" />
      <path d="M20 31c5-3 8-7 8-12-5 1-8 5-8 12Z" />
      <path d="M20 22c-4-3-6-7-5-12 5 1 7 5 5 12Z" />
      <path d="M20 22c4-3 6-7 5-12-5 1-7 5-5 12Z" />
      <path d="M20 15c-3-2-4-5-3-9 4 1 5 4 3 9Z" />
      <path d="M20 15c3-2 4-5 3-9-4 1-5 4-3 9Z" />
      <circle cx="20" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LeafPattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.8}
      strokeLinecap="round"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <g opacity="0.5">
        <path d="M52 360C52 270 51 180 54 90" />
        <path d="M54 310c-24-14-40-36-44-60 24 2 40 18 44 44" />
        <path d="M54 310c24-14 40-36 44-60-24 2-40 18-44 44" />
        <path d="M54 250c-24-14-40-36-44-60 24 2 40 18 44 44" />
        <path d="M54 250c24-14 40-36 44-60-24 2-40 18-44 44" />
        <path d="M54 190c-20-12-33-30-36-50 20 2 33 15 36 38" />
        <path d="M54 190c20-12 33-30 36-50-20 2-33 15-36 38" />
      </g>
      <g opacity="0.35" transform="translate(280 0)">
        <path d="M52 380C52 280 51 180 54 80" />
        <path d="M54 330c-24-14-40-36-44-60 24 2 40 18 44 44" />
        <path d="M54 330c24-14 40-36 44-60-24 2-40 18-44 44" />
        <path d="M54 260c-24-14-40-36-44-60 24 2 40 18 44 44" />
        <path d="M54 260c24-14 40-36 44-60-24 2-40 18-44 44" />
        <path d="M54 190c-20-12-33-30-36-50 20 2 33 15 36 38" />
        <path d="M54 190c20-12 33-30 36-50-20 2-33 15-36 38" />
      </g>
    </svg>
  );
}

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LeafMark className={`h-9 w-9 shrink-0 ${inverse ? "text-oat" : "text-forest"}`} />
      <span className="leading-none">
        <span
          className={`block font-display text-[1.35rem] tracking-[-0.02em] ${inverse ? "text-oat" : "text-forest"}`}
        >
          Khanya
        </span>
        <span
          className={`mt-0.5 block text-[0.6rem] uppercase tracking-[0.22em] ${inverse ? "text-oat/65" : "text-sage-deep"}`}
        >
          Nature School
        </span>
      </span>
    </span>
  );
}
