"use client";

import Link from "next/link";
import { useState } from "react";
import type { Album } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import { dateInputFromIso, saDateToIso, toSlug } from "@/lib/admin-utils";
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
  adminTextarea,
} from "@/components/admin/admin-ui";
import { BranchSelect } from "@/components/admin/BranchPicker";
import { MediaSelect } from "@/components/admin/MediaSelect";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { PhotoFrame } from "@/components/PhotoFrame";
import { ArrowRightIcon } from "@/components/icons";

interface AlbumForm {
  slug: string;
  title: string;
  description: string;
  coverId: string;
  branchId: string;
  takenOn: string;
  isPublished: boolean;
}

const emptyForm: AlbumForm = {
  slug: "",
  title: "",
  description: "",
  coverId: "",
  branchId: "",
  takenOn: "",
  isPublished: false,
};

function albumToForm(album: Album): AlbumForm {
  return {
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverId: album.coverId ?? "",
    branchId: album.branchId ?? "",
    takenOn: dateInputFromIso(album.takenOn),
    isPublished: album.isPublished,
  };
}

export default function AdminGalleriesPage() {
  const { data, loading, error, reload } =
    useAdminData<{ albums: Album[] }>("/albums");
  const { toast } = useToast();
  const [editing, setEditing] = useState<Album | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AlbumForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Album | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setCreating(true);
  }

  function openEdit(album: Album) {
    setForm(albumToForm(album));
    setErrors({});
    setEditing(album);
  }

  function set<K extends keyof AlbumForm>(key: K, value: AlbumForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function payloadFromForm() {
    return {
      slug: form.slug,
      title: form.title,
      description: form.description,
      coverId: form.coverId || null,
      branchId: form.branchId || null,
      takenOn: form.takenOn ? saDateToIso(form.takenOn) : null,
      isPublished: form.isPublished,
    };
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editing) {
        await adminFetch(`/albums/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payloadFromForm()),
        });
        toast(`${form.title} was updated.`);
      } else {
        await adminFetch("/albums", {
          method: "POST",
          body: JSON.stringify(payloadFromForm()),
        });
        toast(`${form.title} was created. Add photographs from its detail page.`);
      }
      setEditing(null);
      setCreating(false);
      await reload();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(album: Album) {
    try {
      await adminFetch(`/albums/${album.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          slug: album.slug,
          title: album.title,
          description: album.description,
          coverId: album.coverId,
          branchId: album.branchId,
          takenOn: album.takenOn,
          isPublished: !album.isPublished,
        }),
      });
      toast(
        album.isPublished
          ? `${album.title} is now hidden from the gallery.`
          : `${album.title} is now visible in the gallery.`,
      );
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await adminFetch(`/albums/${deleting.id}`, { method: "DELETE" });
      toast(`${deleting.title} was deleted.`);
      setDeleting(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  const open = creating || editing !== null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Galleries"
        description="Albums group photographs by term, outing or branch. Every photo needs a real description for screen reader users."
        actions={<AdminButton onClick={openCreate}>Add album</AdminButton>}
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <TableSkeleton rows={4} />
      ) : data.albums.length === 0 ? (
        <EmptyState
          title="No albums yet"
          body="Create an album, then add photographs and choose a cover."
          action={<AdminButton onClick={openCreate}>Add album</AdminButton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.albums.map((album) => (
            <article
              key={album.id}
              className="overflow-hidden rounded-sm border border-line bg-paper"
            >
              <Link href={`/admin/galleries/${album.id}`} className="block">
                <PhotoFrame
                  src={album.cover?.url ?? null}
                  alt={album.cover?.alt ?? album.title}
                  ratio="3 / 2"
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                  hasImage={Boolean(album.cover)}
                />
              </Link>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge tone={album.isPublished ? "green" : "neutral"}>
                    {album.isPublished ? "Published" : "Draft"}
                  </AdminBadge>
                  <span className="text-[0.68rem] text-bark-soft">
                    {album._count?.photos ?? 0} photos
                  </span>
                </div>
                <Link
                  href={`/admin/galleries/${album.id}`}
                  className="mt-2 block font-display text-[1.2rem] leading-tight text-forest hover:text-sage-deep"
                >
                  {album.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-[0.74rem] leading-relaxed text-bark-soft">
                  {album.description}
                </p>
                <p className="mt-2 text-[0.68rem] text-bark-soft">
                  {album.branch?.name ?? "Whole school"}
                  {album.takenOn ? ` · ${formatDate(album.takenOn)}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/galleries/${album.id}`}
                    className="inline-flex items-center gap-1 rounded-sm border border-line-strong px-3 py-1.5 text-[0.76rem] text-forest transition-colors hover:bg-forest-tint"
                  >
                    Manage photos <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                  <AdminButton size="sm" variant="outline" onClick={() => openEdit(album)}>
                    Edit
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePublished(album)}
                  >
                    {album.isPublished ? "Hide" : "Publish"}
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleting(album)}
                  >
                    Delete
                  </AdminButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            setCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? `Edit ${editing.title}` : "Add an album"}
        description="Create the album first. Photographs are added from the album detail page so you can set captions, alt text and order."
        wide
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Album title" htmlFor="album-title" required error={errors.title} className="sm:col-span-2">
              <input
                id="album-title"
                value={form.title}
                onChange={(event) => set("title", event.target.value)}
                className={adminInput}
                placeholder="Autumn in the garden"
                required
              />
            </Field>
            <Field label="URL slug" htmlFor="album-slug" required error={errors.slug}>
              <div className="flex gap-2">
                <input
                  id="album-slug"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  className={adminInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => set("slug", toSlug(form.title))}
                  className="mt-1.5 shrink-0 rounded-sm border border-line-strong px-3 py-2 text-[0.72rem] text-forest transition-colors hover:bg-forest-tint"
                >
                  From title
                </button>
              </div>
            </Field>
            <Field label="Date taken" htmlFor="album-taken" error={errors.takenOn} hint="Optional. Used for sorting and display.">
              <input
                id="album-taken"
                type="date"
                value={form.takenOn}
                onChange={(event) => set("takenOn", event.target.value)}
                className={adminInput}
              />
            </Field>
          </div>

          <Field
            label="Album description"
            htmlFor="album-description"
            required
            error={errors.description}
            hint="Where the photographs come from and what families will see."
          >
            <textarea
              id="album-description"
              rows={4}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaSelect
              id="album-cover"
              label="Cover image"
              value={form.coverId}
              onChange={(value) => set("coverId", value)}
              hint="You can also choose a cover from the album photos later."
            />
            <div className="space-y-4">
              <BranchSelect
                id="album-branch"
                label="Branch"
                value={form.branchId}
                onChange={(value) => set("branchId", value)}
                emptyLabel="Whole school"
              />
              <label className="flex items-center gap-2 text-[0.78rem] text-forest">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => set("isPublished", event.target.checked)}
                  className="h-4 w-4 accent-forest"
                />
                Publish this album
              </label>
            </div>
          </div>

          {Object.keys(errors).length > 0 ? (
            <p className="text-[0.76rem] text-clay">
              Some fields need attention. Check the messages above.
            </p>
          ) : null}

          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-oat py-3">
            <AdminButton
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              disabled={saving}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving" : editing ? "Save changes" : "Create album"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "album"}?`}
        body="This cannot be undone. The album and its photo links will be removed. The photographs stay in the media library."
        confirmLabel="Delete album"
        onConfirm={remove}
      />
    </div>
  );
}
