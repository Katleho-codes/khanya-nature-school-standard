"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Post, PostCategory, PostStatus } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import {
  buildQuery,
  dateTimeInputValue,
  postCategoryLabels,
  saDateTimeToIso,
  toSlug,
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
  TableSkeleton,
  adminInput,
  adminTextarea,
} from "@/components/admin/admin-ui";
import { BranchSelect, useBranches } from "@/components/admin/BranchPicker";
import { MediaSelect } from "@/components/admin/MediaSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { PhotoFrame } from "@/components/PhotoFrame";
import { ArrowRightIcon } from "@/components/icons";

interface NewsForm {
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  coverId: string;
  category: PostCategory;
  branchId: string;
  isPinned: boolean;
  status: PostStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: NewsForm = {
  slug: "",
  title: "",
  excerpt: "",
  bodyMd: "",
  coverId: "",
  category: "NEWS",
  branchId: "",
  isPinned: false,
  status: "DRAFT",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

function postToForm(post: Post): NewsForm {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    bodyMd: post.bodyMd ?? "",
    coverId: post.coverId ?? "",
    category: post.category,
    branchId: post.branchId ?? "",
    isPinned: post.isPinned,
    status: post.status,
    publishedAt: dateTimeInputValue(post.publishedAt),
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
  };
}

export default function AdminNewsPage() {
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    category: "",
    branch: "",
  });
  const [applied, setApplied] = useState(filters);
  const query = useMemo(
    () =>
      buildQuery({
        q: applied.q,
        status: applied.status,
        category: applied.category,
        branch: applied.branch,
      }),
    [applied],
  );
  const { data, loading, error, reload } = useAdminData<{ posts: Post[] }>(
    `/posts${query}`,
  );
  const { branches } = useBranches();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Post | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setCreating(true);
  }

  function openEdit(post: Post) {
    setForm(postToForm(post));
    setErrors({});
    setEditing(post);
  }

  function set<K extends keyof NewsForm>(key: K, value: NewsForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(filters);
  }

  function clearFilters() {
    const cleared = { q: "", status: "", category: "", branch: "" };
    setFilters(cleared);
    setApplied(cleared);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      bodyMd: form.bodyMd,
      coverId: form.coverId || null,
      category: form.category,
      branchId: form.branchId || null,
      isPinned: form.isPinned,
      status: form.status,
      publishedAt: form.publishedAt ? saDateTimeToIso(form.publishedAt) : null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    };
    try {
      if (editing) {
        await adminFetch(`/posts/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast(`${form.title} was updated.`);
      } else {
        await adminFetch("/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast(
          form.status === "PUBLISHED"
            ? `${form.title} was published.`
            : `${form.title} was saved as a draft.`,
        );
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
      await adminFetch(`/posts/${deleting.id}`, { method: "DELETE" });
      toast(`${deleting.title} was deleted.`);
      setDeleting(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  const open = creating || editing !== null;
  const filtered =
    applied.q !== "" ||
    applied.status !== "" ||
    applied.category !== "" ||
    applied.branch !== "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="News and notices"
        description="Posts appear on the news page, the home page and any linked branch page. Drafts stay private until you publish them."
        actions={<AdminButton onClick={openCreate}>Write a post</AdminButton>}
      />

      <form
        onSubmit={applyFilters}
        className="paper-card-plain grid gap-3 border-2 border-ink/10 bg-paper p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
      >
        <Field label="Search" htmlFor="news-search">
          <input
            id="news-search"
            value={filters.q}
            onChange={(event) =>
              setFilters((current) => ({ ...current, q: event.target.value }))
            }
            className={adminInput}
            placeholder="Title or excerpt"
          />
        </Field>
        <Field label="Status" htmlFor="news-status">
          <select
            id="news-status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
            className={adminInput}
          >
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </Field>
        <Field label="Category" htmlFor="news-category">
          <select
            id="news-category"
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({ ...current, category: event.target.value }))
            }
            className={adminInput}
          >
            <option value="">All categories</option>
            <option value="NEWS">News</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="NOTICE">Notice</option>
          </select>
        </Field>
        <Field label="Branch" htmlFor="news-branch">
          <select
            id="news-branch"
            value={filters.branch}
            onChange={(event) =>
              setFilters((current) => ({ ...current, branch: event.target.value }))
            }
            className={adminInput}
          >
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.slug}>
                {branch.name}
              </option>
            ))}
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
        <TableSkeleton rows={5} />
      ) : data.posts.length === 0 ? (
        <EmptyState
          title={filtered ? "No posts match those filters" : "No posts yet"}
          body={
            filtered
              ? "Try a different search term or clear the filters."
              : "Write the first news item or notice for families."
          }
          action={
            filtered ? (
              <AdminButton variant="outline" onClick={clearFilters}>
                Clear filters
              </AdminButton>
            ) : (
              <AdminButton onClick={openCreate}>Write a post</AdminButton>
            )
          }
        />
      ) : (
        <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper">
          <div className="hidden grid-cols-[1.6fr_8rem_9rem_8rem_9rem_10rem] gap-4 border-b-2 border-ink/10 bg-sky-tint/55 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/60 lg:grid">
            <span>Post</span>
            <span>Category</span>
            <span>Branch</span>
            <span>Status</span>
            <span>Published</span>
            <span className="text-right">Actions</span>
          </div>
          {data.posts.map((post) => (
            <div
              key={post.id}
              className="grid gap-4 border-b-2 border-ink/10 px-4 py-4 last:border-b-0 lg:grid-cols-[1.6fr_8rem_9rem_8rem_9rem_10rem] lg:items-center"
            >
              <div className="flex items-start gap-3">
                <div className="hidden w-16 shrink-0 sm:block">
                  <PhotoFrame
                    src={post.cover?.url ?? null}
                    alt={post.cover?.alt ?? post.title}
                    ratio="4 / 3"
                    sizes="64px"
                    hasImage={Boolean(post.cover)}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.isPinned ? <AdminBadge tone="sun">Pinned</AdminBadge> : null}
                    <p className="truncate font-display text-[1.08rem] leading-tight text-ink">
                      {post.title}
                    </p>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-relaxed text-ink/60">
                    {post.excerpt}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-ink/60">
                    /news/{post.slug} · {post.author.name}
                  </p>
                </div>
              </div>

              <div className="text-[0.74rem] text-ink/60">
                {postCategoryLabels[post.category]}
              </div>
              <div className="text-[0.74rem] text-ink/60">
                {post.branch?.name ?? "Whole school"}
              </div>
              <div>
                <AdminBadge tone={post.status === "PUBLISHED" ? "meadow" : "neutral"}>
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </AdminBadge>
              </div>
              <div className="text-[0.72rem] text-ink/60">
                {post.publishedAt ? formatDate(post.publishedAt) : "Not yet"}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {post.status === "PUBLISHED" ? (
                  <Link
                    href={`/news/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 min-h-9 rounded-full border-2 border-b-4 border-ink/15 px-3.5 py-1.5 text-[0.78rem] font-bold text-ink transition-colors hover:bg-sun-tint"
                  >
                    View
                  </Link>
                ) : null}
                <AdminButton size="sm" variant="outline" onClick={() => openEdit(post)}>
                  Edit
                </AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => setDeleting(post)}>
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
        title={editing ? "Edit post" : "Write a post"}
        description="Use South African English and plain sentences. Markdown is supported in the body."
        wide
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="news-title" required error={errors.title} className="sm:col-span-2">
              <input
                id="news-title"
                value={form.title}
                onChange={(event) => set("title", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
            <Field label="URL slug" htmlFor="news-slug" required error={errors.slug}>
              <div className="flex gap-2">
                <input
                  id="news-slug"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  className={adminInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => set("slug", toSlug(form.title))}
                  className="mt-1.5 shrink-0 min-h-10 rounded-full border-2 border-b-4 border-ink/15 px-3.5 py-2 text-[0.78rem] font-bold text-ink transition-colors hover:bg-sun-tint"
                >
                  From title
                </button>
              </div>
            </Field>
            <Field label="Category" htmlFor="news-form-category" required error={errors.category}>
              <select
                id="news-form-category"
                value={form.category}
                onChange={(event) => set("category", event.target.value as PostCategory)}
                className={adminInput}
              >
                <option value="NEWS">News</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="NOTICE">Notice</option>
              </select>
            </Field>
          </div>

          <Field
            label="Excerpt"
            htmlFor="news-excerpt"
            required
            error={errors.excerpt}
            hint="One or two sentences for cards and search results."
          >
            <textarea
              id="news-excerpt"
              rows={3}
              maxLength={320}
              value={form.excerpt}
              onChange={(event) => set("excerpt", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <Field
            label="Body"
            htmlFor="news-body"
            required
            error={errors.bodyMd}
            hint="Markdown: leave a blank line between paragraphs. Use ## for a heading."
          >
            <textarea
              id="news-body"
              rows={14}
              value={form.bodyMd}
              onChange={(event) => set("bodyMd", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaSelect
              id="news-cover"
              label="Cover image"
              value={form.coverId}
              onChange={(value) => set("coverId", value)}
              hint="Landscape, at least 1600 × 1000 pixels."
            />
            <div className="space-y-4">
              <BranchSelect
                id="news-form-branch"
                label="Branch"
                value={form.branchId}
                onChange={(value) => set("branchId", value)}
                emptyLabel="Whole school"
                hint="Leave on whole school for news that applies everywhere."
              />
              <Field label="Publish date and time" htmlFor="news-published" error={errors.publishedAt} hint="Optional. Leave blank to use the moment you publish.">
                <input
                  id="news-published"
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(event) => set("publishedAt", event.target.value)}
                  className={adminInput}
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 rounded-[20px] border-2 border-ink/10 bg-sun-tint/20 p-4 sm:grid-cols-2">
            <Field label="Publication status" htmlFor="news-form-status" required>
              <select
                id="news-form-status"
                value={form.status}
                onChange={(event) => set("status", event.target.value as PostStatus)}
                className={adminInput}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-1 text-[0.78rem] text-ink">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(event) => set("isPinned", event.target.checked)}
                className="admin-check"
              />
              Pin to the top of the news page
            </label>
          </div>

          <SeoFields
            title={form.seoTitle}
            description={form.seoDescription}
            onTitleChange={(value) => set("seoTitle", value)}
            onDescriptionChange={(value) => set("seoDescription", value)}
            fallbackTitle={`${form.title} | Khanya Nature School`}
            fallbackDescription={form.excerpt}
            path={`/news/${form.slug || "post"}`}
            errors={errors}
          />

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
              {saving ? "Saving" : editing ? "Save changes" : "Save post"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "post"}?`}
        body="This cannot be undone. The public page and its search listing will disappear immediately."
        confirmLabel="Delete post"
        onConfirm={remove}
      />
    </div>
  );
}
