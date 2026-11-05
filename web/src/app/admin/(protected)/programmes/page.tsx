"use client";

import Link from "next/link";
import { useState } from "react";
import type { Programme } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import { centsFromRand, randValue, toSlug } from "@/lib/admin-utils";
import { formatFee } from "@/lib/format";
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
import { BranchCheckboxes } from "@/components/admin/BranchPicker";
import { MediaSelect } from "@/components/admin/MediaSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { PhotoFrame } from "@/components/PhotoFrame";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
} from "@/components/icons";

interface RhythmItem {
  time: string;
  label: string;
}

interface ProgrammeForm {
  slug: string;
  name: string;
  ageFromMonths: string;
  ageToMonths: string;
  ageLabel: string;
  summary: string;
  description: string;
  dailyRhythm: RhythmItem[];
  hoursLabel: string;
  monthlyFee: string;
  feeNote: string;
  imageId: string;
  isPublished: boolean;
  sortOrder: string;
  branchIds: string[];
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: ProgrammeForm = {
  slug: "",
  name: "",
  ageFromMonths: "0",
  ageToMonths: "12",
  ageLabel: "",
  summary: "",
  description: "",
  dailyRhythm: [
    { time: "07:00", label: "Arrival and free play" },
    { time: "10:00", label: "Snack and story" },
  ],
  hoursLabel: "07:00 to 17:00",
  monthlyFee: "",
  feeNote: "",
  imageId: "",
  isPublished: false,
  sortOrder: "0",
  branchIds: [],
  seoTitle: "",
  seoDescription: "",
};

function programmeToForm(programme: Programme): ProgrammeForm {
  return {
    slug: programme.slug,
    name: programme.name,
    ageFromMonths: String(programme.ageFromMonths),
    ageToMonths: String(programme.ageToMonths),
    ageLabel: programme.ageLabel,
    summary: programme.summary,
    description: programme.description,
    dailyRhythm: programme.dailyRhythm,
    hoursLabel: programme.hoursLabel,
    monthlyFee: randValue(programme.monthlyFeeCents),
    feeNote: programme.feeNote ?? "",
    imageId: programme.imageId ?? "",
    isPublished: programme.isPublished ?? false,
    sortOrder: String(programme.sortOrder ?? 0),
    branchIds: programme.branchIds ?? [],
    seoTitle: programme.seoTitle ?? "",
    seoDescription: programme.seoDescription ?? "",
  };
}

export default function AdminProgrammesPage() {
  const { data, loading, error, reload } =
    useAdminData<{ programmes: Programme[] }>("/programmes");
  const { toast } = useToast();
  const [editing, setEditing] = useState<Programme | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProgrammeForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Programme | null>(null);

  function openCreate() {
    setForm({
      ...emptyForm,
      sortOrder: String(data?.programmes.length ?? 0),
    });
    setErrors({});
    setCreating(true);
  }

  function openEdit(programme: Programme) {
    setForm(programmeToForm(programme));
    setErrors({});
    setEditing(programme);
  }

  function set<K extends keyof ProgrammeForm>(
    key: K,
    value: ProgrammeForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function setRhythm(index: number, patch: Partial<RhythmItem>) {
    setForm((current) => ({
      ...current,
      dailyRhythm: current.dailyRhythm.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addRhythm() {
    setForm((current) => ({
      ...current,
      dailyRhythm: [...current.dailyRhythm, { time: "", label: "" }],
    }));
  }

  function removeRhythm(index: number) {
    setForm((current) => ({
      ...current,
      dailyRhythm: current.dailyRhythm.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      slug: form.slug,
      name: form.name,
      ageFromMonths: Number(form.ageFromMonths) || 0,
      ageToMonths: Number(form.ageToMonths) || 0,
      ageLabel: form.ageLabel,
      summary: form.summary,
      description: form.description,
      dailyRhythm: form.dailyRhythm,
      hoursLabel: form.hoursLabel,
      monthlyFeeCents: centsFromRand(form.monthlyFee),
      feeNote: form.feeNote || null,
      imageId: form.imageId || null,
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0,
      branchIds: form.branchIds,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    };
    try {
      if (editing) {
        await adminFetch(`/programmes/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast(`${form.name} was updated.`);
      } else {
        await adminFetch("/programmes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast(`${form.name} was created.`);
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

  async function move(programme: Programme, direction: "up" | "down") {
    try {
      const result = await adminFetch<{ moved: boolean }>(
        `/programmes/${programme.id}/move`,
        { method: "POST", body: JSON.stringify({ direction }) },
      );
      if (!result.moved) {
        toast("That programme is already at the edge of the list.", "info");
        return;
      }
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await adminFetch(`/programmes/${deleting.id}`, { method: "DELETE" });
      toast(`${deleting.name} was deleted.`);
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
        title="Programmes"
        description="Programmes power the programme pages, branch pages and enquiry form. Unpublished programmes stay hidden from the public site."
        actions={
          <AdminButton onClick={openCreate}>Add programme</AdminButton>
        }
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <TableSkeleton rows={4} />
      ) : data.programmes.length === 0 ? (
        <EmptyState
          title="No programmes yet"
          body="Add the first programme so families can compare ages, fees and daily rhythm."
          action={
            <AdminButton onClick={openCreate}>Add programme</AdminButton>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          <div className="hidden grid-cols-[4rem_1.4fr_1fr_9rem_8rem_10rem] gap-4 border-b border-line bg-sage-tint/45 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-sage-deep lg:grid">
            <span>Order</span>
            <span>Programme</span>
            <span>Fee and branches</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="text-right">Actions</span>
          </div>
          {data.programmes.map((programme, index) => (
            <div
              key={programme.id}
              className="grid gap-4 border-b border-line px-4 py-4 last:border-b-0 lg:grid-cols-[4rem_1.4fr_1fr_9rem_8rem_10rem] lg:items-center"
            >
              <div className="flex items-center gap-1 lg:flex-col lg:items-start">
                <span className="text-[0.68rem] text-bark-soft">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(programme, "up")}
                    disabled={index === 0}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-line text-bark-soft transition-colors hover:bg-forest-tint disabled:opacity-30"
                    aria-label={`Move ${programme.name} up`}
                  >
                    <ChevronUpIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(programme, "down")}
                    disabled={index === data.programmes.length - 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-line text-bark-soft transition-colors hover:bg-forest-tint disabled:opacity-30"
                    aria-label={`Move ${programme.name} down`}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="hidden w-20 shrink-0 sm:block">
                  <PhotoFrame
                    src={programme.image?.url ?? null}
                    alt={programme.image?.alt ?? programme.name}
                    ratio="4 / 3"
                    sizes="80px"
                    hasImage={Boolean(programme.image)}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.7rem] text-bark-soft">{programme.ageLabel}</p>
                  <p className="truncate font-display text-[1.1rem] leading-tight text-forest">
                    {programme.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-relaxed text-bark-soft">
                    {programme.summary}
                  </p>
                </div>
              </div>

              <div className="text-[0.74rem] leading-relaxed text-bark-soft">
                <p className="font-medium text-forest">
                  {formatFee(programme.monthlyFeeCents)}
                </p>
                <p>
                  {programme.branches && programme.branches.length > 0
                    ? programme.branches.map((branch) => branch.name).join(", ")
                    : "No branch linked"}
                </p>
                <p>{programme.dailyRhythm.length} rhythm moments</p>
              </div>

              <div>
                <AdminBadge tone={programme.isPublished ? "green" : "neutral"}>
                  {programme.isPublished ? "Published" : "Draft"}
                </AdminBadge>
              </div>

              <div className="text-[0.7rem] text-bark-soft">
                <p>/programmes/{programme.slug}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Link
                  href={`/programmes/${programme.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-sm border border-line-strong px-3 py-1.5 text-[0.76rem] text-forest transition-colors hover:bg-forest-tint"
                >
                  View
                </Link>
                <AdminButton
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(programme)}
                >
                  Edit
                </AdminButton>
                <AdminButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleting(programme)}
                >
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
        title={editing ? `Edit ${editing.name}` : "Add a programme"}
        description="Fields marked with an asterisk are required. Publish when the copy and fee are ready for families."
        wide
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Programme name" htmlFor="programme-name" required error={errors.name}>
              <input
                id="programme-name"
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
                className={adminInput}
                placeholder="Seedlings"
                required
              />
            </Field>
            <Field
              label="URL slug"
              htmlFor="programme-slug"
              required
              error={errors.slug}
              hint="Lower case letters, numbers and single hyphens."
            >
              <div className="flex gap-2">
                <input
                  id="programme-slug"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  className={adminInput}
                  placeholder="seedlings"
                  required
                />
                <button
                  type="button"
                  onClick={() => set("slug", toSlug(form.name))}
                  className="mt-1.5 shrink-0 rounded-sm border border-line-strong px-3 py-2 text-[0.72rem] text-forest transition-colors hover:bg-forest-tint"
                >
                  From name
                </button>
              </div>
            </Field>
            <Field label="Age label" htmlFor="programme-age-label" required error={errors.ageLabel} hint="For example 18 months to 3 years.">
              <input
                id="programme-age-label"
                value={form.ageLabel}
                onChange={(event) => set("ageLabel", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
            <Field label="Hours label" htmlFor="programme-hours" required error={errors.hoursLabel} hint="For example 07:00 to 17:00, Monday to Friday.">
              <input
                id="programme-hours"
                value={form.hoursLabel}
                onChange={(event) => set("hoursLabel", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
            <Field label="Age from (months)" htmlFor="programme-age-from" required error={errors.ageFromMonths}>
              <input
                id="programme-age-from"
                type="number"
                min={0}
                max={120}
                value={form.ageFromMonths}
                onChange={(event) => set("ageFromMonths", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
            <Field label="Age to (months)" htmlFor="programme-age-to" required error={errors.ageToMonths}>
              <input
                id="programme-age-to"
                type="number"
                min={1}
                max={144}
                value={form.ageToMonths}
                onChange={(event) => set("ageToMonths", event.target.value)}
                className={adminInput}
                required
              />
            </Field>
          </div>

          <Field
            label="Short summary"
            htmlFor="programme-summary"
            required
            error={errors.summary}
            hint="One or two sentences used on cards and in search results."
          >
            <textarea
              id="programme-summary"
              rows={3}
              maxLength={300}
              value={form.summary}
              onChange={(event) => set("summary", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <Field
            label="Full description"
            htmlFor="programme-description"
            required
            error={errors.description}
            hint="Markdown is supported. Use short paragraphs and headings."
          >
            <textarea
              id="programme-description"
              rows={9}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <fieldset className="rounded-sm border border-line p-4">
            <legend className={adminLabel}>Daily rhythm</legend>
            <p className="mt-1 text-[0.72rem] text-bark-soft">
              The small moments that shape the day. Keep it to six or eight rows.
            </p>
            <div className="mt-3 space-y-2">
              {form.dailyRhythm.length === 0 ? (
                <p className="text-[0.76rem] text-bark-soft">No moments yet.</p>
              ) : null}
              {form.dailyRhythm.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[6rem_1fr_2.25rem] items-start gap-2"
                >
                  <input
                    type="time"
                    value={item.time}
                    onChange={(event) => setRhythm(index, { time: event.target.value })}
                    className={adminInput}
                    aria-label={`Rhythm moment ${index + 1} time`}
                  />
                  <input
                    value={item.label}
                    onChange={(event) => setRhythm(index, { label: event.target.value })}
                    className={adminInput}
                    placeholder="What happens"
                    aria-label={`Rhythm moment ${index + 1} description`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRhythm(index)}
                    className="mt-1.5 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line text-bark-soft transition-colors hover:bg-clay/10 hover:text-clay"
                    aria-label={`Remove rhythm moment ${index + 1}`}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRhythm}
              className="mt-3 rounded-sm border border-line-strong px-3 py-1.5 text-[0.74rem] text-forest transition-colors hover:bg-forest-tint"
            >
              Add moment
            </button>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Monthly fee in rand"
              htmlFor="programme-fee"
              error={errors.monthlyFeeCents}
              hint="Leave blank to show On request. Do not include the R."
            >
              <input
                id="programme-fee"
                type="number"
                min={0}
                step={1}
                value={form.monthlyFee}
                onChange={(event) => set("monthlyFee", event.target.value)}
                className={adminInput}
                placeholder="4200"
              />
            </Field>
            <Field
              label="Fee note"
              htmlFor="programme-fee-note"
              error={errors.feeNote}
              hint="Optional, for example Includes meals and outings."
            >
              <input
                id="programme-fee-note"
                value={form.feeNote}
                onChange={(event) => set("feeNote", event.target.value)}
                className={adminInput}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaSelect
              id="programme-image"
              label="Programme image"
              value={form.imageId}
              onChange={(value) => set("imageId", value)}
              hint="Landscape, at least 1600 × 1200 pixels."
            />
            <div className="space-y-4">
              <Field label="Sort order" htmlFor="programme-sort" hint="Lower numbers appear first.">
                <input
                  id="programme-sort"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(event) => set("sortOrder", event.target.value)}
                  className={adminInput}
                />
              </Field>
              <label className="flex items-center gap-2 text-[0.78rem] text-forest">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => set("isPublished", event.target.checked)}
                  className="h-4 w-4 accent-forest"
                />
                Publish this programme
              </label>
            </div>
          </div>

          <BranchCheckboxes
            values={form.branchIds}
            onChange={(values) => set("branchIds", values)}
            hint="Only linked branches show the programme on their branch page and in the enquiry form."
          />

          <SeoFields
            title={form.seoTitle}
            description={form.seoDescription}
            onTitleChange={(value) => set("seoTitle", value)}
            onDescriptionChange={(value) => set("seoDescription", value)}
            fallbackTitle={`${form.name} | Khanya Nature School`}
            fallbackDescription={form.summary}
            path={`/programmes/${form.slug || "programme"}`}
            errors={errors}
          />

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
              {saving
                ? "Saving"
                : editing
                  ? "Save changes"
                  : "Create programme"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "programme"}?`}
        body="This cannot be undone. Enquiries linked to the programme will keep their history but lose the programme reference."
        confirmLabel="Delete programme"
        onConfirm={remove}
      />
    </div>
  );
}
