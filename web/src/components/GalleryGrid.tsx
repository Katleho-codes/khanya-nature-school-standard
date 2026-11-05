"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useState } from "react";
import { PhotoFrame } from "./PhotoFrame";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";

export interface GalleryPhoto {
  src: string | null;
  alt: string;
  caption: string;
  hasImage: boolean;
}

const ratios = ["3 / 4", "3 / 2", "1 / 1", "4 / 5", "3 / 2", "1 / 1"];

export function GalleryGrid({
  photos,
  albumTitle,
}: {
  photos: GalleryPhoto[];
  albumTitle: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const current = index !== null ? photos[index] : null;

  const move = useCallback(
    (direction: 1 | -1) => {
      setIndex((value) => {
        if (value === null) return value;
        return (value + direction + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  if (photos.length === 0) {
    return (
      <p className="border-t border-line py-10 text-sm text-bark-soft">
        Photographs for this album are still being sorted. Please check back soon.
      </p>
    );
  }

  return (
    <>
      <ul className="columns-2 gap-4 md:columns-3 md:gap-5">
        {photos.map((photo, photoIndex) => (
          <li key={`${photo.caption}-${photoIndex}`} className="mb-4 break-inside-avoid md:mb-5">
            <button
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-label={`Open photograph ${photoIndex + 1} of ${photos.length}: ${photo.caption}`}
              className="group block w-full cursor-zoom-in text-left"
            >
              <PhotoFrame
                src={photo.src}
                alt={photo.alt}
                ratio={ratios[photoIndex % ratios.length] ?? "3 / 2"}
                sizes="(min-width: 768px) 33vw, 50vw"
                hasImage={photo.hasImage}
                asFigure={false}
                className="w-full"
                imageClassName="transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="mt-2 block text-[0.72rem] leading-snug text-bark-soft">
                {photo.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={open} onOpenChange={(value) => setIndex(value ? (index ?? 0) : null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-deep/85" />
          <Dialog.Content
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh] max-w-4xl -translate-y-1/2 overflow-y-auto rounded-sm bg-oat p-4 sm:inset-x-8 sm:p-6"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                move(-1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                move(1);
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <Dialog.Title className="font-display text-[1.2rem] text-forest">
                  {albumTitle}
                </Dialog.Title>
                <p className="mt-0.5 text-[0.72rem] uppercase tracking-[0.14em] text-sage-deep">
                  Photograph {index !== null ? index + 1 : 0} of {photos.length}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-line-strong text-forest transition-colors hover:bg-forest-tint"
                  aria-label="Close photograph"
                >
                  <CloseIcon />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description className="sr-only">
              Use the left and right arrow keys to move between photographs. Press Escape to close.
            </Dialog.Description>

            {current ? (
              <>
                <PhotoFrame
                  src={current.src}
                  alt={current.alt}
                  ratio="3 / 2"
                  sizes="90vw"
                  hasImage={current.hasImage}
                  className="w-full"
                />
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-bark-soft">{current.caption}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => move(-1)}
                      aria-label="Previous photograph"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-forest transition-colors hover:bg-forest-tint"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(1)}
                      aria-label="Next photograph"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-forest transition-colors hover:bg-forest-tint"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
