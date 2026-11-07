"use client";

import { useMemo, useRef, useState } from "react";
import type { Media } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import {
  buildQuery,
  formatBytes,
} from "@/lib/admin-utils";
import { formatDate } from "@/lib/format";
import {
  AdminBadge,
  AdminButton,
  AdminError,
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  adminInput,
  adminLabel,
  adminTextarea,
} from "@/components/admin/admin-ui";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { PhotoFrame } from "@/components/PhotoFrame";
import { DownloadIcon } from "@/components/icons";

export default function AdminMediaPage() {
  const [filters, setFilters] = useState({ q: "", type: "" });
  const [applied, setApplied] = useState(filters);
  const query = useMemo(
    () => buildQuery({ q: applied.q, type: applied.type }),
    [applied],
  );
  const { data, loading, error, reload } = useAdminData<{ media: Media[] }>(
    `/media${query}`,
  );
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Media | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState<Media | null>(null);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(filters);
  }

  function clearFilters() {
    const cleared = { q: "", type: "" };
    setFilters(cleared);
    setApplied(cleared);
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setUploadErrors({ file: "Choose a file to upload." });
      return;
    }
    setUploading(true);
    setUploadErrors({});
    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", uploadAlt);
    try {
      await adminFetch("/media", { method: "POST", body: formData });
      toast(`${file.name} was uploaded.`);
      setUploadAlt("");
      if (fileRef.current) fileRef.current.value = "";
      await reload();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setUploadErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setUploading(false);
    }
  }

  function openEdit(media: Media) {
    setEditAlt(media.alt ?? "");
    setEditErrors({});
    setEditing(media);
  }

  async function saveAlt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setEditErrors({});
    try {
      await adminFetch(`/media/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ alt: editAlt }),
      });
      toast("The description was updated.");
      setEditing(null);
      await reload();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setEditErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function copyUrl(media: Media) {
    try {
      await navigator.clipboard.writeText(media.url);
      toast("File path copied.", "info");
    } catch {
      toast("The path could not be copied. Select it manually.", "error");
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await adminFetch(`/media/${deleting.id}`, { method: "DELETE" });
      toast(`${deleting.originalName} was deleted.`);
      setDeleting(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  const filtered = applied.q !== "" || applied.type !== "";
  const images =
    data?.media.filter((item) => item.mimeType.startsWith("image/")).length ?? 0;
  const documents = (data?.media.length ?? 0) - images;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Library"
        title="Media"
        description="Upload photographs and PDFs once, then use them across the site. Images need a description before they can be uploaded."
      />

      <form
        onSubmit={upload}
        className="paper-card-plain grid gap-4 border-2 border-ink/10 bg-paper p-4 lg:grid-cols-[1.2fr_1.6fr_auto]"
      >
        <Field
          label="File"
          htmlFor="media-file"
          required
          error={uploadErrors.file}
          hint="JPG, PNG, WebP or PDF. Up to 8 MB."
        >
          <input
            ref={fileRef}
            id="media-file"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            className={`${adminInput} file:mr-3 file:rounded-full file:border-0 file:bg-poppy-deep file:px-3.5 file:py-2 file:text-[0.78rem] file:font-bold file:text-white`}
          />
        </Field>
        <Field
          label="Image description"
          htmlFor="media-alt"
          error={uploadErrors.alt}
          hint="Required for images. Say what is happening, not Image of."
        >
          <textarea
            id="media-alt"
            rows={2}
            maxLength={240}
            value={uploadAlt}
            onChange={(event) => setUploadAlt(event.target.value)}
            className={adminTextarea}
            placeholder="Children planting seedlings in the vegetable garden"
          />
        </Field>
        <div className="flex items-end">
          <AdminButton type="submit" disabled={uploading}>
            {uploading ? "Uploading" : "Upload file"}
          </AdminButton>
        </div>
      </form>

      <form
        onSubmit={applyFilters}
        className="paper-card-plain grid gap-3 border-2 border-ink/10 bg-paper p-4 sm:grid-cols-[1.6fr_1fr_auto]"
      >
        <Field label="Search" htmlFor="media-search">
          <input
            id="media-search"
            value={filters.q}
            onChange={(event) =>
              setFilters((current) => ({ ...current, q: event.target.value }))
            }
            className={adminInput}
            placeholder="File name or description"
          />
        </Field>
        <Field label="Type" htmlFor="media-type">
          <select
            id="media-type"
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({ ...current, type: event.target.value }))
            }
            className={adminInput}
          >
            <option value="">All files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
          </select>
        </Field>
        <div className="flex items-end gap-2">
          <AdminButton type="submit">Filter</AdminButton>
          {filtered ? (
            <AdminButton variant="ghost" onClick={clearFilters}>
              Clear
            </AdminButton>
          ) : null}
        </div>
      </form>

      {!loading && data ? (
        <p className="text-[0.76rem] text-ink/75">
          {data.media.length} files shown
          {filtered ? " for these filters" : ""}. {images} images, {documents} documents.
        </p>
      ) : null}

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse paper-card-plain border-2 border-ink/10 bg-paper"
            />
          ))}
        </div>
      ) : data.media.length === 0 ? (
        <EmptyState
          title={filtered ? "No files match those filters" : "The library is empty"}
          body={
            filtered
              ? "Try a different search term or clear the filters."
              : "Upload a photograph or PDF using the form above."
          }
          action={
            filtered ? (
              <AdminButton variant="outline" onClick={clearFilters}>
                Clear filters
              </AdminButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.media.map((item) => {
            const isImage = item.mimeType.startsWith("image/");
            return (
              <article
                key={item.id}
                className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper"
              >
                {isImage ? (
                  <PhotoFrame
                    src={item.url}
                    alt={item.alt ?? item.originalName}
                    ratio="3 / 2"
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    hasImage
                  />
                ) : (
                  <div className="flex aspect-[3/2] flex-col items-center justify-center gap-2 bg-sky-tint/60 p-6 text-center">
                    <DownloadIcon className="h-7 w-7 text-ink/75" />
                    <p className="text-[0.72rem] uppercase tracking-[0.12em] text-ink/75">
                      PDF document
                    </p>
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminBadge tone={isImage ? "meadow" : "neutral"}>
                      {isImage ? "Image" : "PDF"}
                    </AdminBadge>
                    <span className="text-[0.66rem] text-ink/75">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="truncate text-[0.82rem] font-medium text-ink">
                    {item.originalName}
                  </p>
                  <p className="text-[0.7rem] text-ink/75">
                    {formatBytes(item.sizeBytes)}
                    {item.width && item.height
                      ? ` · ${item.width} × ${item.height} pixels`
                      : ""}
                  </p>
                  <p className="line-clamp-2 text-[0.7rem] leading-relaxed text-ink/75">
                    {item.alt ?? "No description yet."}
                  </p>
                  <p className="truncate rounded-full bg-paper px-2 py-1 text-[0.65rem] text-ink/75">
                    {item.url}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <AdminButton size="sm" variant="outline" onClick={() => openEdit(item)}>
                      {isImage ? "Edit description" : "Edit note"}
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" onClick={() => copyUrl(item)}>
                      Copy path
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" onClick={() => setDeleting(item)}>
                      Delete
                    </AdminButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={editing !== null}
        onOpenChange={(value) => !value && setEditing(null)}
        title="Edit file description"
        description={
          editing?.mimeType.startsWith("image/")
            ? "This text is used wherever the image appears without a more specific alt."
            : "An internal note for this document."
        }
      >
        <form onSubmit={saveAlt} className="space-y-5">
          <Field
            label="Description"
            htmlFor="edit-media-alt"
            error={editErrors.alt}
            hint={
              editing?.mimeType.startsWith("image/")
                ? "At least five characters. Say what is happening in the image."
                : "Optional."
            }
          >
            <textarea
              id="edit-media-alt"
              rows={4}
              maxLength={240}
              value={editAlt}
              onChange={(event) => setEditAlt(event.target.value)}
              className={adminTextarea}
            />
          </Field>
          <div className="flex justify-end gap-2 border-t-2 border-ink/10 pt-4">
            <AdminButton
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={savingEdit}>
              {savingEdit ? "Saving" : "Save description"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.originalName ?? "file"}?`}
        body="This cannot be undone. If the file is still used on a page, the system will refuse the delete so you can remove it from that content first."
        confirmLabel="Delete file"
        onConfirm={remove}
      />

      <div className="paper-card-plain border-2 border-ink/10 bg-paper p-4">
        <p className={adminLabel}>Upload guidance</p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-ink/75">
          Landscape photographs work best at 1920 × 1280 pixels. Portraits used
          in arched frames should be at least 1200 × 1600 pixels. Keep files
          under 8 MB so pages stay quick on mobile data.
        </p>
      </div>
    </div>
  );
}
