"use client";

import Link from "next/link";
import { useState } from "react";
import type { Album, AlbumPhoto } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
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
  TableSkeleton,
  adminInput,
  adminLabel,
  adminTextarea,
} from "@/components/admin/admin-ui";
import { MediaSelect } from "@/components/admin/MediaSelect";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { PhotoFrame } from "@/components/PhotoFrame";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/icons";

type AlbumDetail = Album & { photos: AlbumPhoto[] };

interface PhotoForm {
  mediaId: string;
  caption: string;
  alt: string;
}

const emptyPhotoForm: PhotoForm = { mediaId: "", caption: "", alt: "" };

export function GalleryDetail({ albumId }: { albumId: string }) {
  const { data, loading, error, reload } = useAdminData<{
    album: AlbumDetail;
  }>(`/albums/${albumId}`);
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [photoForm, setPhotoForm] = useState<PhotoForm>(emptyPhotoForm);
  const [photoErrors, setPhotoErrors] = useState<Record<string, string>>({});
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<AlbumPhoto | null>(null);
  const [editForm, setEditForm] = useState({ caption: "", alt: "" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<AlbumPhoto | null>(null);

  const album = data?.album;

  async function addPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPhoto(true);
    setPhotoErrors({});
    try {
      await adminFetch(`/albums/${albumId}/photos`, {
        method: "POST",
        body: JSON.stringify(photoForm),
      });
      toast("The photograph was added to the album.");
      setAdding(false);
      setPhotoForm(emptyPhotoForm);
      await reload();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setPhotoErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSavingPhoto(false);
    }
  }

  function openEdit(photo: AlbumPhoto) {
    setEditForm({ caption: photo.caption, alt: photo.alt });
    setEditErrors({});
    setEditingPhoto(photo);
  }

  async function savePhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPhoto) return;
    setSavingEdit(true);
    setEditErrors({});
    try {
      await adminFetch(`/albums/${albumId}/photos/${editingPhoto.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      toast("Photo details were updated.");
      setEditingPhoto(null);
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

  async function removePhoto() {
    if (!deletingPhoto) return;
    try {
      await adminFetch(`/albums/${albumId}/photos/${deletingPhoto.id}`, {
        method: "DELETE",
      });
      toast("The photograph was removed from the album.");
      setDeletingPhoto(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  async function setCover(photo: AlbumPhoto) {
    try {
      await adminFetch(`/albums/${albumId}/cover`, {
        method: "PATCH",
        body: JSON.stringify({ mediaId: photo.mediaId }),
      });
      toast("The album cover was updated.");
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  async function movePhoto(photo: AlbumPhoto, direction: "up" | "down") {
    if (!album) return;
    const index = album.photos.findIndex((item) => item.id === photo.id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= album.photos.length) return;
    const ids = album.photos.map((item) => item.id);
    const current = ids[index];
    const neighbour = ids[target];
    if (!current || !neighbour) return;
    ids[index] = neighbour;
    ids[target] = current;
    try {
      await adminFetch(`/albums/${albumId}/photos/reorder`, {
        method: "POST",
        body: JSON.stringify({ photoIds: ids }),
      });
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/galleries"
          className="inline-flex items-center gap-1 text-[0.76rem] text-bark-soft transition-colors hover:text-forest"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
          All galleries
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Gallery"
        title={album?.title ?? "Album"}
        description={
          album
            ? `${album.description} ${album.branch?.name ?? "Whole school"}${album.takenOn ? ` · ${formatDate(album.takenOn)}` : ""}.`
            : "Manage the photographs in this album."
        }
        actions={
          <>
            {album?.isPublished ? (
              <Link
                href={`/gallery/${album.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-4 py-2 text-[0.82rem] text-forest transition-colors hover:bg-forest-tint"
              >
                View album
              </Link>
            ) : null}
            <AdminButton onClick={() => setAdding(true)}>Add photograph</AdminButton>
          </>
        }
      />

      {album ? (
        <div className="flex flex-wrap items-center gap-2">
          <AdminBadge tone={album.isPublished ? "green" : "neutral"}>
            {album.isPublished ? "Published" : "Draft"}
          </AdminBadge>
          <span className="text-[0.74rem] text-bark-soft">
            {album.photos.length} photographs
          </span>
          <span className="text-[0.74rem] text-bark-soft">·</span>
          <span className="text-[0.74rem] text-bark-soft">/gallery/{album.slug}</span>
        </div>
      ) : null}

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !album ? (
        <TableSkeleton rows={3} />
      ) : album.photos.length === 0 ? (
        <EmptyState
          title="No photographs in this album"
          body="Add the first photograph, then write a caption and a plain description of what is happening."
          action={<AdminButton onClick={() => setAdding(true)}>Add photograph</AdminButton>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {album.photos.map((photo, index) => (
            <article
              key={photo.id}
              className="overflow-hidden rounded-sm border border-line bg-paper"
            >
              <PhotoFrame
                src={photo.media.url}
                alt={photo.alt}
                ratio="3 / 2"
                sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                hasImage
              />
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.64rem] uppercase tracking-[0.12em] text-sage-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {album.coverId === photo.mediaId ? (
                    <AdminBadge tone="ochre">Cover</AdminBadge>
                  ) : null}
                </div>
                <p className="text-[0.82rem] leading-snug text-forest">{photo.caption}</p>
                <p className="text-[0.7rem] leading-relaxed text-bark-soft">
                  Alt: {photo.alt}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(photo, "up")}
                    disabled={index === 0}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-line text-bark-soft transition-colors hover:bg-forest-tint disabled:opacity-30"
                    aria-label={`Move ${photo.caption} earlier`}
                  >
                    <ChevronUpIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(photo, "down")}
                    disabled={index === album.photos.length - 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-line text-bark-soft transition-colors hover:bg-forest-tint disabled:opacity-30"
                    aria-label={`Move ${photo.caption} later`}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </button>
                  <AdminButton size="sm" variant="outline" onClick={() => openEdit(photo)}>
                    Edit
                  </AdminButton>
                  {album.coverId === photo.mediaId ? null : (
                    <AdminButton size="sm" variant="ghost" onClick={() => setCover(photo)}>
                      Set cover
                    </AdminButton>
                  )}
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingPhoto(photo)}
                  >
                    Remove
                  </AdminButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={adding}
        onOpenChange={(value) => {
          if (!value) {
            setAdding(false);
            setPhotoForm(emptyPhotoForm);
            setPhotoErrors({});
          }
        }}
        title="Add a photograph"
        description="Choose a file from the media library. Upload new files under Media first."
      >
        <form onSubmit={addPhoto} className="space-y-5">
          <MediaSelect
            id="photo-media"
            label="Photograph"
            value={photoForm.mediaId}
            onChange={(value) => setPhotoForm((current) => ({ ...current, mediaId: value }))}
            allowEmpty={false}
            hint="Images only. The file must already be in the media library."
          />
          {photoErrors.mediaId ? (
            <p className="text-[0.74rem] text-clay">{photoErrors.mediaId}</p>
          ) : null}
          <Field
            label="Caption"
            htmlFor="photo-caption"
            required
            error={photoErrors.caption}
            hint="Shown under the photograph in the album."
          >
            <input
              id="photo-caption"
              value={photoForm.caption}
              onChange={(event) =>
                setPhotoForm((current) => ({ ...current, caption: event.target.value }))
              }
              className={adminInput}
              required
            />
          </Field>
          <Field
            label="Alt text"
            htmlFor="photo-alt"
            required
            error={photoErrors.alt}
            hint="Describe what is happening for someone who cannot see the image. Do not start with Image of."
          >
            <textarea
              id="photo-alt"
              rows={3}
              value={photoForm.alt}
              onChange={(event) =>
                setPhotoForm((current) => ({ ...current, alt: event.target.value }))
              }
              className={adminTextarea}
              required
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <AdminButton
              variant="outline"
              onClick={() => setAdding(false)}
              disabled={savingPhoto}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={savingPhoto}>
              {savingPhoto ? "Adding" : "Add photograph"}
              {!savingPhoto ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={editingPhoto !== null}
        onOpenChange={(value) => !value && setEditingPhoto(null)}
        title="Edit photograph details"
        description="Keep the caption short and the alt text descriptive."
      >
        <form onSubmit={savePhoto} className="space-y-5">
          <Field
            label="Caption"
            htmlFor="edit-photo-caption"
            required
            error={editErrors.caption}
          >
            <input
              id="edit-photo-caption"
              value={editForm.caption}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, caption: event.target.value }))
              }
              className={adminInput}
              required
            />
          </Field>
          <Field
            label="Alt text"
            htmlFor="edit-photo-alt"
            required
            error={editErrors.alt}
          >
            <textarea
              id="edit-photo-alt"
              rows={3}
              value={editForm.alt}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, alt: event.target.value }))
              }
              className={adminTextarea}
              required
            />
          </Field>
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <AdminButton
              variant="outline"
              onClick={() => setEditingPhoto(null)}
              disabled={savingEdit}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={savingEdit}>
              {savingEdit ? "Saving" : "Save details"}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingPhoto)}
        onOpenChange={(value) => !value && setDeletingPhoto(null)}
        title="Remove this photograph?"
        body="It will be removed from this album. The file stays in the media library, so it can be used again."
        confirmLabel="Remove photograph"
        onConfirm={removePhoto}
      />

      <div className="rounded-sm border border-line bg-paper p-4">
        <p className={adminLabel}>Album tip</p>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-bark-soft">
          Order photographs as you want families to move through them. The first
          image or the one marked Cover appears on gallery cards.
        </p>
      </div>
    </div>
  );
}
