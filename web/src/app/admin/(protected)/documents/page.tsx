"use client";

import { useMemo, useState } from "react";
import type { Document, DocumentCategory } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import {
  buildQuery,
  documentCategoryLabels,
  formatBytes,
} from "@/lib/admin-utils";
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
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";

interface DocumentForm {
  title: string;
  description: string;
  category: DocumentCategory;
  mediaId: string;
  branchId: string;
  sortOrder: string;
  isPublished: boolean;
}

const emptyForm: DocumentForm = {
  title: "",
  description: "",
  category: "ADMISSION_FORM",
  mediaId: "",
  branchId: "",
  sortOrder: "0",
  isPublished: false,
};

function documentToForm(document: Document): DocumentForm {
  return {
    title: document.title,
    description: document.description,
    category: document.category,
    mediaId: document.mediaId,
    branchId: document.branchId ?? "",
    sortOrder: String(document.sortOrder),
    isPublished: document.isPublished,
  };
}

export default function AdminDocumentsPage() {
  const [filters, setFilters] = useState({ q: "", category: "" });
  const [applied, setApplied] = useState(filters);
  const query = useMemo(
    () => buildQuery({ q: applied.q, category: applied.category }),
    [applied],
  );
  const { data, loading, error, reload } = useAdminData<{
    documents: Document[];
  }>(`/documents${query}`);
  const { toast } = useToast();
  const [editing, setEditing] = useState<Document | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<DocumentForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Document | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setCreating(true);
  }

  function openEdit(document: Document) {
    setForm(documentToForm(document));
    setErrors({});
    setEditing(document);
  }

  function set<K extends keyof DocumentForm>(key: K, value: DocumentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(filters);
  }

  function clearFilters() {
    const cleared = { q: "", category: "" };
    setFilters(cleared);
    setApplied(cleared);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      mediaId: form.mediaId,
      branchId: form.branchId || null,
      sortOrder: Number(form.sortOrder) || 0,
      isPublished: form.isPublished,
    };
    try {
      if (editing) {
        await adminFetch(`/documents/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast(`${form.title} was updated.`);
      } else {
        await adminFetch("/documents", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast(`${form.title} was added.`);
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

  async function remove() {
    if (!deleting) return;
    try {
      await adminFetch(`/documents/${deleting.id}`, { method: "DELETE" });
      toast(`${deleting.title} was deleted.`);
      setDeleting(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  const open = creating || editing !== null;
  const filtered = applied.q !== "" || applied.category !== "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admissions"
        title="Documents"
        description="Publish the admission form, fee schedule and policies on the admissions page and in the footer."
        actions={<AdminButton onClick={openCreate}>Add document</AdminButton>}
      />

      <form
        onSubmit={applyFilters}
        className="paper-card-plain grid gap-3 border-2 border-ink/10 bg-paper p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_auto]"
      >
        <Field label="Search" htmlFor="document-search">
          <input
            id="document-search"
            value={filters.q}
            onChange={(event) =>
              setFilters((current) => ({ ...current, q: event.target.value }))
            }
            className={adminInput}
            placeholder="Document title"
          />
        </Field>
        <Field label="Category" htmlFor="document-category">
          <select
            id="document-category"
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className={adminInput}
          >
            <option value="">All categories</option>
            <option value="ADMISSION_FORM">Admission form</option>
            <option value="FEE_SCHEDULE">Fee schedule</option>
            <option value="POLICY">Policy</option>
            <option value="OTHER">Other</option>
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

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <TableSkeleton rows={4} />
      ) : data.documents.length === 0 ? (
        <EmptyState
          title={filtered ? "No documents match those filters" : "No documents yet"}
          body={
            filtered
              ? "Try a different search term or clear the filters."
              : "Upload a PDF under Media, then add it here so families can download it."
          }
          action={
            filtered ? (
              <AdminButton variant="outline" onClick={clearFilters}>
                Clear filters
              </AdminButton>
            ) : (
              <AdminButton onClick={openCreate}>Add document</AdminButton>
            )
          }
        />
      ) : (
        <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper">
          <div className="hidden grid-cols-[1.5fr_9rem_9rem_7rem_7rem_9rem] gap-4 border-b-2 border-ink/10 bg-sky-tint/55 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/60 lg:grid">
            <span>Document</span>
            <span>Category</span>
            <span>Branch</span>
            <span>Order</span>
            <span>Downloads</span>
            <span className="text-right">Actions</span>
          </div>
          {data.documents.map((document) => (
            <div
              key={document.id}
              className="grid gap-4 border-b-2 border-ink/10 px-4 py-4 last:border-b-0 lg:grid-cols-[1.5fr_9rem_9rem_7rem_7rem_9rem] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-display text-[1.05rem] leading-tight text-ink">
                    {document.title}
                  </p>
                  <AdminBadge tone={document.isPublished ? "meadow" : "neutral"}>
                    {document.isPublished ? "Published" : "Draft"}
                  </AdminBadge>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-relaxed text-ink/60">
                  {document.description}
                </p>
                <p className="mt-1 truncate text-[0.65rem] text-ink/60">
                  {document.media.originalName} · {formatBytes(document.media.sizeBytes)}
                </p>
              </div>
              <div className="text-[0.74rem] text-ink/60">
                {documentCategoryLabels[document.category]}
              </div>
              <div className="text-[0.74rem] text-ink/60">
                {document.branch?.name ?? "Whole school"}
              </div>
              <div className="text-[0.74rem] text-ink/60">{document.sortOrder}</div>
              <div className="text-[0.74rem] text-ink/60">
                {document.downloadCount}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <a
                  href={document.media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 min-h-9 rounded-full border-2 border-b-4 border-ink/15 px-3.5 py-1.5 text-[0.78rem] font-bold text-ink transition-colors hover:bg-sun-tint"
                >
                  <DownloadIcon className="h-3.5 w-3.5" /> File
                </a>
                <AdminButton size="sm" variant="outline" onClick={() => openEdit(document)}>
                  Edit
                </AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => setDeleting(document)}>
                  Delete
                </AdminButton>
              </div>
            </div>
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
        title={editing ? "Edit document" : "Add a document"}
        description="Documents must be uploaded to the media library first. Choose the PDF below."
        wide
      >
        <form onSubmit={save} className="space-y-5">
          <Field label="Title" htmlFor="document-title" required error={errors.title}>
            <input
              id="document-title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              className={adminInput}
              placeholder="2027 admission form"
              required
            />
          </Field>
          <Field
            label="Description"
            htmlFor="document-description"
            required
            error={errors.description}
            hint="Tell families what the document contains and who it is for."
          >
            <textarea
              id="document-description"
              rows={4}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="document-form-category" required error={errors.category}>
              <select
                id="document-form-category"
                value={form.category}
                onChange={(event) =>
                  set("category", event.target.value as DocumentCategory)
                }
                className={adminInput}
              >
                <option value="ADMISSION_FORM">Admission form</option>
                <option value="FEE_SCHEDULE">Fee schedule</option>
                <option value="POLICY">Policy</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Sort order" htmlFor="document-sort" error={errors.sortOrder} hint="Lower numbers appear first.">
              <input
                id="document-sort"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) => set("sortOrder", event.target.value)}
                className={adminInput}
              />
            </Field>
          </div>

          <MediaSelect
            id="document-media"
            label="PDF file"
            value={form.mediaId}
            onChange={(value) => set("mediaId", value)}
            type="document"
            allowEmpty={false}
            hint="Upload a PDF under Media if it is not in the list."
          />
          {errors.mediaId ? (
            <p className="text-[0.74rem] text-poppy-deep">{errors.mediaId}</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <BranchSelect
              id="document-branch"
              label="Branch"
              value={form.branchId}
              onChange={(value) => set("branchId", value)}
              emptyLabel="Whole school"
            />
            <label className="flex items-center gap-2 self-end pb-1 text-[0.78rem] text-ink">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => set("isPublished", event.target.checked)}
                className="admin-check"
              />
              Publish this document
            </label>
          </div>

          {Object.keys(errors).length > 0 ? (
            <p className="text-[0.76rem] text-poppy-deep">
              Some fields need attention. Check the messages above.
            </p>
          ) : null}

          <div className="sticky bottom-0 flex justify-end gap-2 border-t-2 border-ink/10 bg-paper py-3">
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
              {saving ? "Saving" : editing ? "Save changes" : "Add document"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "document"}?`}
        body="This removes the document listing. The PDF stays in the media library and can be used again."
        confirmLabel="Delete document"
        onConfirm={remove}
      />
    </div>
  );
}
