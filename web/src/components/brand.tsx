import type { ReactNode } from "react";

interface DecorativeProps {
  className?: string;
  title?: string;
}

function accessible(title?: string) {
  return title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true } as const);
}

export function PaperFilters() {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter id="crayon-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045 0.09"
            numOctaves="3"
            seed="8"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="crayon-coarse" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022 0.06"
            numOctaves="2"
            seed="14"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </defs>
    </svg>
  );
}

export function Sun({
  className,
  title,
  faceColor = "var(--color-ink)",
}: DecorativeProps & { faceColor?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...accessible(title)}>
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" filter="url(#crayon-rough)">
        <path d="M60 6v15" />
        <path d="M60 99v15" />
        <path d="M6 60h15" />
        <path d="M99 60h15" />
        <path d="M22 22l11 11" />
        <path d="M87 87l11 11" />
        <path d="M98 22 87 33" />
        <path d="M33 87 22 98" />
      </g>
      <circle cx="60" cy="60" r="31" fill="currentColor" filter="url(#crayon-rough)" />
      <g fill="none" stroke={faceColor} strokeWidth="4" strokeLinecap="round">
        <path d="M49 57c1.5-2 4-2 5.5 0" />
        <path d="M66 57c1.5-2 4-2 5.5 0" />
        <path d="M52 68c4 4.5 12 4.5 16 0" />
      </g>
    </svg>
  );
}

export function SunMark({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Sun
      className={className}
      faceColor={inverse ? "var(--color-paper)" : "var(--color-ink)"}
      title="Khanya sun"
    />
  );
}

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <SunMark
        className={`h-10 w-10 shrink-0 ${inverse ? "text-sun" : "text-sun-deep"}`}
        inverse={inverse}
      />
      <span className="leading-none">
        <span
          className={`block font-display text-[1.45rem] font-extrabold tracking-[-0.025em] ${inverse ? "text-paper" : "text-ink"}`}
        >
          Khanya
        </span>
        <span
          className={`mt-1 block font-hand text-[1.02rem] leading-none ${inverse ? "text-paper/75" : "text-ink/75"}`}
        >
          Nature School
        </span>
      </span>
    </span>
  );
}

export function Cloud({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 180 90" className={className} fill="currentColor" {...accessible(title)}>
      <path d="M24 74c-11 0-19-8-18-18 1-9 8-16 18-16 2-14 14-24 29-24 12 0 22 6 27 16 4-2 8-3 13-3 13 0 23 9 24 21 12 1 21 9 21 21 0 2 0 3-1 3H24Z" />
    </svg>
  );
}

export function HillDivider({
  className,
  flip = false,
  title,
}: DecorativeProps & { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 130"
      className={className}
      preserveAspectRatio="none"
      {...accessible(title)}
    >
      <g transform={flip ? "translate(0 130) scale(1 -1)" : undefined}>
        <path
          d="M0 80c105-36 178-16 278 4 98 20 165 1 257-20 94-22 164-8 257 15 94 23 164 8 254-17 89-25 166-18 254 8 49 14 92 17 140 10v50H0V80Z"
          fill="var(--color-meadow-tint)"
        />
        <path
          d="M0 99c95-25 174-4 267 11 96 16 167-6 254-21 88-14 159-2 251 16 96 19 167 3 257-17 88-20 172-17 261 7 51 13 96 17 150 11v24H0V99Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export function Sunflower({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 120 160" className={className} {...accessible(title)}>
      <g filter="url(#crayon-rough)">
        <path d="M60 68v83" stroke="var(--color-meadow-deep)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M60 112c-20 2-31-9-34-26 18-1 30 8 34 26Z" fill="var(--color-meadow)" />
        <path d="M60 126c18 1 28-9 31-24-16-1-27 7-31 24Z" fill="var(--color-meadow-deep)" />
        <g fill="var(--color-sun)">
          <ellipse cx="60" cy="17" rx="10" ry="16" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(45 60 46)" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(90 60 46)" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(135 60 46)" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(180 60 46)" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(225 60 46)" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(270 60 46)" />
          <ellipse cx="60" cy="17" rx="10" ry="16" transform="rotate(315 60 46)" />
        </g>
        <circle cx="60" cy="46" r="18" fill="var(--color-sun-deep)" />
        <g fill="none" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round">
          <path d="M53 43c1-1.4 2.6-1.4 3.6 0" />
          <path d="M64 43c1-1.4 2.6-1.4 3.6 0" />
          <path d="M55 51c3 2.8 7 2.8 10 0" />
        </g>
      </g>
    </svg>
  );
}

export function Worm({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 150 100" className={className} {...accessible(title)}>
      <g filter="url(#crayon-rough)">
        <path
          d="M17 73c12-28 39-19 47-3 7 14 27 17 39 5 10-10 8-26-2-33"
          fill="none"
          stroke="currentColor"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <circle cx="103" cy="38" r="18" fill="currentColor" />
        <g fill="none" stroke="var(--color-ink)" strokeWidth="2.6" strokeLinecap="round">
          <path d="M97 35c1-1.4 2.6-1.4 3.6 0" />
          <path d="M106 35c1-1.4 2.6-1.4 3.6 0" />
          <path d="M99 43c2.5 2.2 5.5 2.2 8 0" />
        </g>
        <path d="M120 23c6-6 11-8 17-8v4c-6 0-10 2-15 7" fill="var(--color-poppy)" />
      </g>
    </svg>
  );
}

export function WateringCan({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} {...accessible(title)}>
      <g filter="url(#crayon-rough)">
        <path d="M42 44h64l-5 55H47Z" fill="currentColor" />
        <path d="M48 47c-15-1-25-9-27-22 12-1 22 5 27 16" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        <path d="M104 52c24-9 37 3 37 19" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        <path d="M48 30h52" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        <path d="M55 7c8-4 19-4 28 0" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="68" cy="70" r="5" fill="var(--color-sun)" />
        <circle cx="84" cy="82" r="4" fill="var(--color-poppy)" />
        <circle cx="92" cy="64" r="3.5" fill="var(--color-sky)" />
      </g>
    </svg>
  );
}

export function Drop({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 40 56" className={className} fill="currentColor" {...accessible(title)}>
      <path d="M20 4c8 12 16 21 16 31a16 16 0 0 1-32 0C4 25 12 16 20 4Z" />
    </svg>
  );
}

export function Chicken({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 130 120" className={className} {...accessible(title)}>
      <g filter="url(#crayon-rough)">
        <path d="M44 76c-17-7-24-22-17-36 7-14 25-18 38-9 12 8 14 25 6 37-6 9-16 12-27 8Z" fill="currentColor" />
        <circle cx="77" cy="35" r="19" fill="currentColor" />
        <path d="M76 15c-1-8 3-13 9-15 1 6-1 10-5 13 5-2 10-1 13 3-4 4-9 5-15 2" fill="var(--color-poppy)" />
        <path d="M95 38l15 6-15 7Z" fill="var(--color-sun-deep)" />
        <circle cx="82" cy="31" r="2.8" fill="var(--color-ink)" />
        <path d="M54 58c10 5 21 5 31-1" fill="none" stroke="var(--color-sun)" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 78l-5 19M66 80l4 17" stroke="var(--color-sun-deep)" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Reed({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 80 170" className={className} {...accessible(title)}>
      <g filter="url(#crayon-rough)" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M38 168c-2-48 0-95 4-142" />
        <path d="M40 103c-17-2-27-12-29-28 16 1 26 11 29 28Z" fill="currentColor" stroke="none" />
        <path d="M41 83c15-4 23-13 24-28-14 2-22 12-24 28Z" fill="currentColor" stroke="none" />
        <path d="M43 44c-10-3-16-8-18-17 9 0 15 6 18 17Z" fill="currentColor" stroke="none" />
        <path d="M41 11c8-5 16-5 24 0-8 6-16 6-24 0Z" fill="var(--color-sun-deep)" stroke="none" />
      </g>
    </svg>
  );
}

export function MudPot({ className, title }: DecorativeProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} {...accessible(title)}>
      <g filter="url(#crayon-rough)">
        <path d="M23 35h74l-7 52c-18 7-43 7-60 0Z" fill="currentColor" />
        <path d="M20 35c0-7 18-12 40-12s40 5 40 12-18 12-40 12-40-5-40-12Z" fill="var(--color-sun-deep)" />
        <path d="M43 20c2-9 9-14 18-13 8 1 13 7 13 15" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="48" cy="60" r="6" fill="var(--color-sky)" />
        <circle cx="72" cy="72" r="4" fill="var(--color-meadow)" />
      </g>
    </svg>
  );
}

export function ScribbleField({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 280"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <g filter="url(#crayon-coarse)" opacity="0.55">
        <path d="M26 64c30-32 56 20 86-10s56 26 90-2 58 22 92-8 64 20 98 4" />
        <path d="M18 132c34-26 58 24 92-4s60 28 96 0 62 24 100-6 58 18 92 2" />
        <path d="M28 206c28-24 52 18 80-6s52 24 84 4 54 18 86-4 56 20 88 8" />
        <path d="M68 28c-18 26 16 36 2 62s18 38 4 64" />
        <path d="M206 18c-16 30 18 36 4 66s18 34 2 64" />
        <path d="M342 28c-14 28 16 38 2 66s18 34 4 56" />
      </g>
      <g fill="currentColor" stroke="none" opacity="0.4">
        <circle cx="124" cy="88" r="8" />
        <circle cx="312" cy="130" r="7" />
        <circle cx="182" cy="226" r="9" />
        <circle cx="370" cy="228" r="6" />
      </g>
    </svg>
  );
}

export function ScribbleUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path d="M8 13c35-9 74-7 112-4 39 3 78 5 112-3" filter="url(#crayon-coarse)" />
    </svg>
  );
}

export function ScribbleCircle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 140"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M115 11c61-2 100 24 98 56-2 37-48 60-103 58C54 123 12 103 11 68 10 35 53 13 115 11Z"
        filter="url(#crayon-coarse)"
      />
    </svg>
  );
}

export function ScribbleCross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 4c5 6 9 10 14 16" filter="url(#crayon-rough)" />
      <path d="M19 5c-5 5-10 9-14 15" filter="url(#crayon-rough)" />
    </svg>
  );
}

export function ScribbleArrow({ className }: { className?: string }) {  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 13c34 4 59 18 71 47" filter="url(#crayon-rough)" />
      <path d="m64 49 17 13 5-21" filter="url(#crayon-rough)" />
    </svg>
  );
}

export function CrayonTexture({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 300 200" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.36">
        <g filter="url(#crayon-coarse)">
          <path d="M-10 38c38-20 70 20 108 0s70 20 108 0 70 20 108 0" />
          <path d="M-8 88c36-20 68 20 106 0s70 20 108 0 70 20 108 0" />
          <path d="M-12 138c40-20 72 20 110 0s70 20 108 0 70 20 108 0" />
          <path d="M-8 188c36-20 68 20 106 0s70 20 108 0 70 20 108 0" />
        </g>
      </svg>
      {children}
    </div>
  );
}
