"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Event } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import {
  buildQuery,
  dateTimeInputValue,
  saDateTimeToIso,
  toSlug,
} from "@/lib/admin-utils";
import { formatEventWhen } from "@/lib/format";
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

interface EventForm {
  slug: string;
  title: string;
  descriptionMd: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  locationText: string;
  branchId: string;
  coverId: string;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: EventForm = {
  slug: "",
  title: "",
  descriptionMd: "",
  startsAt: "",
  endsAt: "",
  allDay: false,
  locationText: "",
  branchId: "",
  coverId: "",
  isPublished: false,
  seoTitle: "",
  seoDescription: "",
};

function eventToForm(event: Event): EventForm {
  return {
    slug: event.slug,
    title: event.title,
    descriptionMd: event.descriptionMd,
    startsAt: dateTimeInputValue(event.startsAt),
    endsAt: dateTimeInputValue(event.endsAt),
    allDay: event.allDay,
    locationText: event.locationText,
    branchId: event.branchId ?? "",
    coverId: event.coverId ?? "",
    isPublished: event.isPublished,
    seoTitle: event.seoTitle ?? "",
    seoDescription: event.seoDescription ?? "",
  };
}

export default function AdminEventsPage() {
  const [filters, setFilters] = useState({ q: "", published: "", branch: "" });
  const [applied, setApplied] = useState(filters);
  const query = useMemo(
    () =>
      buildQuery({
        q: applied.q,
        published: applied.published,
        branch: applied.branch,
      }),
    [applied],
  );
  const { data, loading, error, reload } = useAdminData<{ events: Event[] }>(
    `/events${query}`,
  );
  const { branches } = useBranches();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Event | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setCreating(true);
  }

  function openEdit(event: Event) {
    setForm(eventToForm(event));
    setErrors({});
    setEditing(event);
  }

  function set<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(filters);
  }

  function clearFilters() {
    const cleared = { q: "", published: "", branch: "" };
    setFilters(cleared);
    setApplied(cleared);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const startsAt = saDateTimeToIso(form.startsAt);
    const endsAt = saDateTimeToIso(form.endsAt);
    if (!startsAt || !endsAt) {
      setErrors({ startsAt: "Choose a start and end date." });
      setSaving(false);
      return;
    }
    const payload = {
      slug: form.slug,
      title: form.title,
      descriptionMd: form.descriptionMd,
      startsAt,
      endsAt,
      allDay: form.allDay,
      locationText: form.locationText,
      branchId: form.branchId || null,
      coverId: form.coverId || null,
      isPublished: form.isPublished,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    };
    try {
      if (editing) {
        await adminFetch(`/events/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast(`${form.title} was updated.`);
      } else {
        await adminFetch("/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast(`${form.title} was created.`);
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
      await adminFetch(`/events/${deleting.id}`, { method: "DELETE" });
      toast(`${deleting.title} was deleted.`);
      setDeleting(null);
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  const open = creating || editing !== null;
  const filtered =
    applied.q !== "" || applied.published !== "" || applied.branch !== "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Events"
        description="Events appear on the calendar, branch pages and the public event page. Each published event has a downloadable calendar file."
        actions={<AdminButton onClick={openCreate}>Add event</AdminButton>}
      />

      <form
        onSubmit={applyFilters}
        className="paper-card-plain grid gap-3 border-2 border-ink/10 bg-paper p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]"
      >
        <Field label="Search" htmlFor="event-search">
          <input
            id="event-search"
            value={filters.q}
            onChange={(event) =>
              setFilters((current) => ({ ...current, q: event.target.value }))
            }
            className={adminInput}
            placeholder="Event title"
          />
        </Field>
        <Field label="Visibility" htmlFor="event-published">
          <select
            id="event-published"
            value={filters.published}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                published: event.target.value,
              }))
            }
            className={adminInput}
          >
            <option value="">All events</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </Field>
        <Field label="Branch" htmlFor="event-branch">
          <select
            id="event-branch"
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
      ) : data.events.length === 0 ? (
        <EmptyState
          title={filtered ? "No events match those filters" : "No events yet"}
          body={
            filtered
              ? "Try a different search term or clear the filters."
              : "Add an open day, market or parents evening."
          }
          action={
            filtered ? (
              <AdminButton variant="outline" onClick={clearFilters}>
                Clear filters
              </AdminButton>
            ) : (
              <AdminButton onClick={openCreate}>Add event</AdminButton>
            )
          }
        />
      ) : (
        <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper">
          <div className="hidden grid-cols-[1.5fr_11rem_9rem_8rem_9rem_9rem] gap-4 border-b-2 border-ink/10 bg-sky-tint/55 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/60 lg:grid">
            <span>Event</span>
            <span>When</span>
            <span>Branch</span>
            <span>Status</span>
            <span>Calendar</span>
            <span className="text-right">Actions</span>
          </div>
          {data.events.map((event) => {
            return (
              <div
                key={event.id}
                className="grid gap-4 border-b-2 border-ink/10 px-4 py-4 last:border-b-0 lg:grid-cols-[1.5fr_11rem_9rem_8rem_9rem_9rem] lg:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="hidden w-16 shrink-0 sm:block">
                    <PhotoFrame
                      src={event.cover?.url ?? null}
                      alt={event.cover?.alt ?? event.title}
                      ratio="4 / 3"
                      sizes="64px"
                      hasImage={Boolean(event.cover)}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[1.08rem] leading-tight text-ink">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-ink/60">
                      {event.locationText}
                    </p>
                    <p className="mt-0.5 text-[0.65rem] text-ink/60">
                      /events/{event.slug}
                    </p>
                  </div>
                </div>

                <div className="text-[0.74rem] leading-relaxed text-ink/60">
                  <p>{formatEventWhen(event)}</p>
                </div>
                <div className="text-[0.74rem] text-ink/60">
                  {event.branch?.name ?? "Whole school"}
                </div>
                <div>
                  <AdminBadge tone={event.isPublished ? "meadow" : "neutral"}>
                    {event.isPublished ? "Published" : "Draft"}
                  </AdminBadge>
                </div>
                <div className="text-[0.7rem] text-ink/60">
                  {event.allDay ? "All day" : "Timed"}
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {event.isPublished ? (
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 min-h-9 rounded-full border-2 border-b-4 border-ink/15 px-3.5 py-1.5 text-[0.78rem] font-bold text-ink transition-colors hover:bg-sun-tint"
                    >
                      View
                    </Link>
                  ) : null}
                  <AdminButton size="sm" variant="outline" onClick={() => openEdit(event)}>
                    Edit
                  </AdminButton>
                  <AdminButton size="sm" variant="ghost" onClick={() => setDeleting(event)}>
                    Delete
                  </AdminButton>
                </div>
              </div>
            );
          })}
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
        title={editing ? "Edit event" : "Add an event"}
        description="Times are entered in South African time (Africa/Johannesburg)."
        wide
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event title" htmlFor="event-title" required error={errors.title} className="sm:col-span-2">
              <input
                id="event-title"
                value={form.title}
                onChange={(event) => set("title", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
            <Field label="URL slug" htmlFor="event-slug" required error={errors.slug}>
              <div className="flex gap-2">
                <input
                  id="event-slug"
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
            <Field label="Location" htmlFor="event-location" required error={errors.locationText}>
              <input
                id="event-location"
                value={form.locationText}
                onChange={(event) => set("locationText", event.target.value)}
                className={adminInput}
                placeholder="Randburg (Ferndale) campus"
                required
              />
            </Field>
            <Field label="Starts" htmlFor="event-starts" required error={errors.startsAt}>
              <input
                id="event-starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => set("startsAt", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
            <Field label="Ends" htmlFor="event-ends" required error={errors.endsAt}>
              <input
                id="event-ends"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => set("endsAt", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.82rem] font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(event) => set("allDay", event.target.checked)}
              className="admin-check"
            />
            This is an all day event
          </label>

          <Field
            label="Event description"
            htmlFor="event-description"
            required
            error={errors.descriptionMd}
            hint="Markdown is supported. Include what families should bring or expect."
          >
            <textarea
              id="event-description"
              rows={9}
              value={form.descriptionMd}
              onChange={(event) => set("descriptionMd", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaSelect
              id="event-cover"
              label="Cover image"
              value={form.coverId}
              onChange={(value) => set("coverId", value)}
              hint="Landscape, at least 1600 × 1000 pixels."
            />
            <div className="space-y-4">
              <BranchSelect
                id="event-form-branch"
                label="Branch"
                value={form.branchId}
                onChange={(value) => set("branchId", value)}
                emptyLabel="Whole school"
              />
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.82rem] font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => set("isPublished", event.target.checked)}
                  className="admin-check"
                />
                Publish this event
              </label>
            </div>
          </div>

          <SeoFields
            title={form.seoTitle}
            description={form.seoDescription}
            onTitleChange={(value) => set("seoTitle", value)}
            onDescriptionChange={(value) => set("seoDescription", value)}
            fallbackTitle={`${form.title} | Khanya Nature School`}
            fallbackDescription={form.descriptionMd.slice(0, 150)}
            path={`/events/${form.slug || "event"}`}
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
              {saving ? "Saving" : editing ? "Save changes" : "Create event"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.title ?? "event"}?`}
        body="This cannot be undone. The public page, calendar entry and calendar file will disappear immediately."
        confirmLabel="Delete event"
        onConfirm={remove}
      />
    </div>
  );
}
