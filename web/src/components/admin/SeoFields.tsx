"use client";

import { adminInput, adminLabel } from "./admin-ui";

function counterTone(length: number, max: number): string {
  if (length === 0) return "text-bark-soft";
  if (length > max) return "text-clay";
  if (length > max * 0.9) return "text-ochre-deep";
  return "text-sage-deep";
}

export function SeoFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  fallbackTitle,
  fallbackDescription,
  path,
  errors,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
  path: string;
  errors?: { seoTitle?: string; seoDescription?: string };
}) {
  const previewTitle = title.trim() || fallbackTitle || "Page title";
  const previewDescription =
    description.trim() ||
    fallbackDescription ||
    "A short description of this page will appear here in search results.";

  return (
    <section className="rounded-sm border border-line bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[0.82rem] font-medium text-forest">Search engine listing</h3>
        <span className="text-[0.68rem] uppercase tracking-[0.12em] text-sage-deep">
          Optional overrides
        </span>
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="seoTitle" className={adminLabel}>
              SEO title
            </label>
            <span className={`text-[0.68rem] tabular-nums ${counterTone(title.length, 70)}`}>
              {title.length} / 70
            </span>
          </div>
          <input
            id="seoTitle"
            type="text"
            value={title}
            maxLength={70}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={fallbackTitle ?? "Leave blank to use the page title"}
            className={adminInput}
            aria-invalid={Boolean(errors?.seoTitle)}
          />
          {errors?.seoTitle ? (
            <p className="mt-1 text-[0.72rem] text-clay">{errors.seoTitle}</p>
          ) : (
            <p className="mt-1 text-[0.7rem] text-bark-soft">
              Aim for 50 to 60 characters so the title is not cut off.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="seoDescription" className={adminLabel}>
              Meta description
            </label>
            <span
              className={`text-[0.68rem] tabular-nums ${counterTone(description.length, 160)}`}
            >
              {description.length} / 160
            </span>
          </div>
          <textarea
            id="seoDescription"
            rows={3}
            value={description}
            maxLength={160}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder={fallbackDescription ?? "Leave blank to use the page excerpt"}
            className={adminInput}
            aria-invalid={Boolean(errors?.seoDescription)}
          />
          {errors?.seoDescription ? (
            <p className="mt-1 text-[0.72rem] text-clay">{errors.seoDescription}</p>
          ) : (
            <p className="mt-1 text-[0.7rem] text-bark-soft">
              Aim for 140 to 155 characters. This does not affect the page body.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-sm border border-line bg-oat p-4">
        <p className="mb-2 text-[0.65rem] uppercase tracking-[0.14em] text-sage-deep">
          Search preview
        </p>
        <p className="text-[0.72rem] text-sage-deep">
          khanyanatureschool.example{path}
        </p>
        <p className="mt-1 line-clamp-1 text-[1rem] text-forest">{previewTitle}</p>
        <p className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-bark-soft">
          {previewDescription}
        </p>
      </div>
    </section>
  );
}
