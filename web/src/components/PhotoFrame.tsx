"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Cloud, CrayonTexture, ScribbleField, Sun } from "./brand";

export type PhotoShape = "paper" | "wobbly" | "cloud" | "polaroid" | "rounded";
export type PhotoTone = "sun" | "sky" | "meadow" | "poppy";

export interface PhotoFrameProps {
  src: string | null;
  alt: string;
  ratio?: string;
  caption?: string | null;
  placeholder?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  shape?: PhotoShape;
  tone?: PhotoTone;
  hasImage?: boolean;
  asFigure?: boolean;
}

const shapeClasses: Record<PhotoShape, string> = {
  paper: "rounded-[30px_20px_34px_18px]",
  wobbly: "rounded-[44%_56%_38%_62%/42%_36%_64%_58%]",
  cloud: "rounded-[60%_40%_52%_48%/72%_64%_36%_28%]",
  polaroid: "rounded-[6px]",
  rounded: "rounded-[24px]",
};

const toneClasses: Record<PhotoTone, string> = {
  sun: "bg-sun-tint text-sun-deep",
  sky: "bg-sky-tint text-sky-deep",
  meadow: "bg-meadow-tint text-meadow-deep",
  poppy: "bg-poppy-tint text-poppy-deep",
};

export function PhotoFrame({
  src,
  alt,
  ratio = "3 / 2",
  caption,
  placeholder,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
  imageClassName,
  shape = "paper",
  tone = "sky",
  hasImage = false,
  asFigure = true,
}: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && hasImage && !failed;

  const content: ReactNode = (
    <div className={`relative ${shape === "polaroid" ? "polaroid" : ""}`}>
      {shape === "polaroid" ? (
        <span className="washi-tape -top-3 left-6 rotate-[-7deg]" aria-hidden />
      ) : null}
      <div
        className={`relative overflow-hidden ${toneClasses[tone]} ${
          shape === "polaroid"
            ? "rounded-[4px]"
            : `${shapeClasses[shape]} paper-shadow`
        }`}
        style={{ aspectRatio: ratio }}
      >
        {showImage && src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover ${imageClassName ?? ""}`}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 overflow-hidden">
            <CrayonTexture className="absolute inset-0" />
            <ScribbleField className="absolute -bottom-10 -right-10 h-3/4 w-3/4 opacity-30" />
            <Sun className="absolute right-5 top-5 h-14 w-14 rotate-6 opacity-80" />
            <Cloud className="absolute -left-8 bottom-7 h-16 w-32 opacity-25" />
            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
              <span className="sticker w-fit bg-paper/80 text-ink">Photo coming soon</span>
              <div className="max-w-[19rem]">
                <p className="font-display text-[1.05rem] font-bold leading-snug text-ink">
                  {placeholder ?? `Photo: ${alt}`}
                </p>
                <p className="hand mt-1 text-ink/60">We will pop a real photo here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {caption ? <p className="hand mt-3 text-ink/65">{caption}</p> : null}
    </div>
  );

  if (!asFigure) {
    return <div className={className}>{content}</div>;
  }

  return <figure className={className}>{content}</figure>;
}
