"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth-server";
import type { Media } from "@/lib/types";
import { PhotoFrame } from "@/components/PhotoFrame";
import { adminInput, adminLabel } from "./admin-ui";

export function MediaSelect({
  id,
  label,
  value,
  onChange,
  type = "image",
  allowEmpty = true,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "image" | "document";
  allowEmpty?: boolean;
  hint?: string;
}) {
  const [media, setMedia] = useState<Media[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ media: Media[] }>(`/media?type=${type}`)
      .then((data) => {
        if (!cancelled) setMedia(data.media);
      })
      .catch(() => {
        if (!cancelled) setError("The media library could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const selected = media?.find((item) => item.id === value) ?? null;

  return (
    <div>
      <label htmlFor={id} className={adminLabel}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!media}
        className={adminInput}
      >
        {allowEmpty ? <option value="">None</option> : null}
        {!media ? <option value="">Loading media...</option> : null}
        {media?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.alt ?? item.originalName}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1 text-[0.7rem] text-ink/60">{hint}</p> : null}
      {error ? <p className="mt-1 text-[0.72rem] text-poppy-deep">{error}</p> : null}
      {value && !selected && !media ? (
        <p className="mt-1 text-[0.7rem] text-ink/60">Current selection is loading.</p>
      ) : null}
      {selected ? (
        <div className="mt-3 flex items-start gap-3">
          {type === "image" ? (
            <div className="w-28 shrink-0">
              <PhotoFrame
                src={selected.url}
                alt={selected.alt ?? selected.originalName}
                ratio="3 / 2"
                sizes="112px"
                hasImage
              />
            </div>
          ) : null}
          <div className="min-w-0 text-[0.72rem] leading-relaxed text-ink/60">
            <p className="truncate font-medium text-ink">{selected.originalName}</p>
            {selected.width && selected.height ? (
              <p>
                {selected.width} × {selected.height} pixels
              </p>
            ) : null}
            <p>{Math.round(selected.sizeBytes / 1024)} KB</p>
          </div>
        </div>
      ) : null}
      {media && media.length === 0 ? (
        <p className="mt-1 text-[0.72rem] text-ink/60">
          Nothing in the library yet. Upload files under Media first.
        </p>
      ) : null}
    </div>
  );
}
