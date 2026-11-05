"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { LeafPattern } from "./brand";

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
  arch?: boolean;
  hasImage?: boolean;
  asFigure?: boolean;
}

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
  arch = false,
  hasImage = false,
  asFigure = true,
}: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && hasImage && !failed;

  const content: ReactNode = (
    <>
      <div
        className={`relative overflow-hidden bg-sage-tint ${arch ? "arch" : "rounded-sm"}`}
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
            <LeafPattern className="absolute -right-6 top-0 h-full w-3/5 text-sage-deep opacity-40" />
            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
              <span className="label-caps text-sage-deep">Photograph to come</span>
              <div className="max-w-[17rem]">
                <span className="mb-2 block h-0.5 w-8 bg-ochre" aria-hidden />
                <p className="font-display text-[1.02rem] leading-snug text-forest">
                  {placeholder ?? `Photo: ${alt}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {caption ? (
        <div className="mt-3 text-[0.78rem] leading-relaxed text-bark-soft">{caption}</div>
      ) : null}
    </>
  );

  if (!asFigure) {
    return <div className={className}>{content}</div>;
  }

  return <figure className={className}>{content}</figure>;
}
