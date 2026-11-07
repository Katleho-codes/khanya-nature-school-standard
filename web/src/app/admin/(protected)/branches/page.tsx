"use client";

import { useState } from "react";
import type { Branch, WeekHours } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import { formatDate, summariseHours } from "@/lib/format";
import { branchTone } from "@/lib/tones";
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
import { SeoFields } from "@/components/admin/SeoFields";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { PhotoFrame } from "@/components/PhotoFrame";
import { ArrowRightIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/icons";
import { WEEKDAY_LABELS } from "@/lib/format";

type AdminBranch = Omit<Branch, "programmes"> & {
  programmes?: Branch["programmes"];
};

interface BranchForm {
  slug: string;
  name: string;
  tagline: string;
  addressLine1: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  lat: string;
  lng: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  heroImageId: string;
  isActive: boolean;
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
  hours: WeekHours;
}

const defaultHours: WeekHours = {
  monday: { open: "07:00", close: "17:00" },
  tuesday: { open: "07:00", close: "17:00" },
  wednesday: { open: "07:00", close: "17:00" },
  thursday: { open: "07:00", close: "17:00" },
  friday: { open: "07:00", close: "17:00" },
  saturday: null,
  sunday: null,
};

const emptyForm: BranchForm = {
  slug: "",
  name: "",
  tagline: "",
  addressLine1: "",
  suburb: "",
  city: "Randburg",
  province: "Gauteng",
  postalCode: "",
  lat: "",
  lng: "",
  phone: "",
  whatsapp: "27",
  email: "",
  description: "",
  heroImageId: "",
  isActive: true,
  sortOrder: "0",
  seoTitle: "",
  seoDescription: "",
  hours: defaultHours,
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function branchToForm(branch: AdminBranch): BranchForm {
  return {
    slug: branch.slug,
    name: branch.name,
    tagline: branch.tagline,
    addressLine1: branch.addressLine1,
    suburb: branch.suburb,
    city: branch.city,
    province: branch.province,
    postalCode: branch.postalCode,
    lat: branch.lat === null ? "" : String(branch.lat),
    lng: branch.lng === null ? "" : String(branch.lng),
    phone: branch.phone,
    whatsapp: branch.whatsapp,
    email: branch.email,
    description: branch.description,
    heroImageId: branch.heroImageId ?? "",
    isActive: branch.isActive,
    sortOrder: String(branch.sortOrder),
    seoTitle: branch.seoTitle ?? "",
    seoDescription: branch.seoDescription ?? "",
    hours: branch.hours,
  };
}

export default function AdminBranchesPage() {
  const { data, loading, error, reload } =
    useAdminData<{ branches: AdminBranch[] }>("/branches");
  const { toast } = useToast();
  const [editing, setEditing] = useState<AdminBranch | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminBranch | null>(null);

  function openCreate() {
    setForm({ ...emptyForm, sortOrder: String(data?.branches.length ?? 0) });
    setErrors({});
    setCreating(true);
  }

  function openEdit(branch: AdminBranch) {
    setForm(branchToForm(branch));
    setErrors({});
    setEditing(branch);
  }

  function set<K extends keyof BranchForm>(key: K, value: BranchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function setHours(
    day: keyof WeekHours,
    value: { open: string; close: string } | null,
  ) {
    setForm((current) => ({
      ...current,
      hours: { ...current.hours, [day]: value },
    }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      ...form,
      lat: form.lat.trim() === "" ? null : Number(form.lat),
      lng: form.lng.trim() === "" ? null : Number(form.lng),
      sortOrder: Number(form.sortOrder) || 0,
      heroImageId: form.heroImageId || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    };
    try {
      if (editing) {
        await adminFetch(`/branches/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast(`${form.name} was updated.`);
      } else {
        await adminFetch("/branches", {
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

  async function toggleActive(branch: AdminBranch) {
    try {
      await adminFetch(`/branches/${branch.id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !branch.isActive }),
      });
      toast(
        !branch.isActive
          ? `${branch.name} is now visible on the website.`
          : `${branch.name} is now hidden from public pages.`,
      );
      await reload();
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    }
  }

  async function move(branch: AdminBranch, direction: "up" | "down") {
    try {
      const result = await adminFetch<{ moved: boolean }>(
        `/branches/${branch.id}/move`,
        {
          method: "POST",
          body: JSON.stringify({ direction }),
        },
      );
      if (!result.moved) {
        toast("That branch is already at the edge of the list.", "info");
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
      await adminFetch(`/branches/${deleting.id}`, { method: "DELETE" });
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
        title="Branches"
        description="Each active branch appears in the header, footer, enquiry form, contact page and sitemap. Deactivate a branch to hide it without losing its history."
        actions={
          <AdminButton onClick={openCreate}>Add branch</AdminButton>
        }
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <TableSkeleton rows={3} />
      ) : data.branches.length === 0 ? (
        <EmptyState
          title="No branches yet"
          body="Add the first branch so it appears across the public website."
          action={<AdminButton onClick={openCreate}>Add branch</AdminButton>}
        />
      ) : (
        <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper">
          <div className="hidden grid-cols-[4rem_1.3fr_1fr_8rem_9rem_10rem] gap-4 border-b-2 border-ink/10 bg-sky-tint/55 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/75 lg:grid">
            <span>Order</span>
            <span>Branch</span>
            <span>Contact</span>
            <span>Programmes</span>
            <span>Visibility</span>
            <span className="text-right">Actions</span>
          </div>
          {data.branches.map((branch, index) => (
            <div
              key={branch.id}
              className="grid gap-4 border-b-2 border-ink/10 px-4 py-4 last:border-b-0 lg:grid-cols-[4rem_1.3fr_1fr_8rem_9rem_10rem] lg:items-center"
            >
              <div className="flex items-center gap-1 lg:flex-col lg:items-start">
                <span className="text-[0.68rem] text-ink/75">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(branch, "up")}
                    disabled={index === 0}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink/15 text-ink/75 transition-colors hover:bg-sun-tint disabled:opacity-30"
                    aria-label={`Move ${branch.name} up`}
                  >
                    <ChevronUpIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(branch, "down")}
                    disabled={index === data.branches.length - 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink/15 text-ink/75 transition-colors hover:bg-sun-tint disabled:opacity-30"
                    aria-label={`Move ${branch.name} down`}
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="hidden w-16 shrink-0 sm:block">
                  <PhotoFrame
                    src={branch.heroImage?.url ?? null}
                    alt={branch.heroImage?.alt ?? branch.name}
                    ratio="4 / 3"
                    sizes="64px"
                    hasImage={Boolean(branch.heroImage)}
                  />
                </div>
                <div className="min-w-0">
                  <AdminBadge tone={branchTone(branch.slug)}>
                    {branch.suburb}
                  </AdminBadge>
                  <p className="mt-1 truncate font-display text-[1.15rem] leading-tight text-ink">
                    {branch.name}
                  </p>
                  <p className="mt-0.5 text-[0.68rem] text-ink/75">
                    /branches/{branch.slug}
                  </p>
                </div>
              </div>

              <div className="text-[0.72rem] leading-relaxed text-ink/75">
                <p>{branch.phone}</p>
                <p className="break-all">{branch.email}</p>
                <p className="mt-1">{summariseHours(branch.hours)}</p>
              </div>

              <div className="text-[0.74rem] text-ink/75">
                <p>{branch._count?.programmeBranches ?? 0} programmes</p>
                <p>{branch._count?.enquiries ?? 0} enquiries</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleActive(branch)}
                  className="inline-flex items-center gap-2"
                  aria-label={`${branch.isActive ? "Hide" : "Show"} ${branch.name} on the website`}
                >
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      branch.isActive ? "bg-meadow-deep" : "bg-ink/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-transform ${
                        branch.isActive ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <span className="text-[0.72rem] text-ink/75">
                    {branch.isActive ? "Live" : "Hidden"}
                  </span>
                </button>
                <p className="mt-1 text-[0.65rem] text-ink/75">
                  Updated {formatDate(branch.updatedAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <AdminButton size="sm" variant="outline" onClick={() => openEdit(branch)}>
                  Edit
                </AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => setDeleting(branch)}>
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
        title={editing ? `Edit ${editing.name}` : "Add a branch"}
        description="Fields marked with an asterisk are required. Changes appear on the public site on the next page load."
        wide
      >
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Branch name" htmlFor="branch-name" required error={errors.name}>
              <input
                id="branch-name"
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
                className={adminInput}
                placeholder="Randburg (Ferndale)"
                required
              />
            </Field>
            <Field
              label="URL slug"
              htmlFor="branch-slug"
              required
              error={errors.slug}
              hint="Lower case letters, numbers and single hyphens."
            >
              <div className="flex gap-2">
                <input
                  id="branch-slug"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  className={adminInput}
                  placeholder="randburg"
                  required
                />
                <button
                  type="button"
                  onClick={() => set("slug", toSlug(form.name))}
                  className="mt-1.5 shrink-0 min-h-10 rounded-full border-2 border-b-4 border-ink/15 px-3.5 py-2 text-[0.78rem] font-bold text-ink transition-colors hover:bg-sun-tint"
                >
                  From name
                </button>
              </div>
            </Field>
            <Field
              label="Tagline"
              htmlFor="branch-tagline"
              required
              error={errors.tagline}
              className="sm:col-span-2"
            >
              <input
                id="branch-tagline"
                value={form.tagline}
                onChange={(event) => set("tagline", event.target.value)}
                className={adminInput}
                placeholder="Big trees, chickens and a garden that changes every week."
                required
              />
            </Field>
          </div>

          <fieldset className="rounded-[20px] border-2 border-ink/10 bg-sun-tint/20 p-4">
            <legend className={adminLabel}>Address</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Street address" htmlFor="branch-address" required error={errors.addressLine1} className="sm:col-span-2">
                <input id="branch-address" value={form.addressLine1} onChange={(event) => set("addressLine1", event.target.value)} className={adminInput} required />
              </Field>
              <Field label="Suburb" htmlFor="branch-suburb" required error={errors.suburb}>
                <input id="branch-suburb" value={form.suburb} onChange={(event) => set("suburb", event.target.value)} className={adminInput} required />
              </Field>
              <Field label="City" htmlFor="branch-city" required error={errors.city}>
                <input id="branch-city" value={form.city} onChange={(event) => set("city", event.target.value)} className={adminInput} required />
              </Field>
              <Field label="Province" htmlFor="branch-province" required error={errors.province}>
                <input id="branch-province" value={form.province} onChange={(event) => set("province", event.target.value)} className={adminInput} required />
              </Field>
              <Field label="Postal code" htmlFor="branch-postal" required error={errors.postalCode} hint="Four digits.">
                <input id="branch-postal" value={form.postalCode} onChange={(event) => set("postalCode", event.target.value)} className={adminInput} required inputMode="numeric" />
              </Field>
              <Field label="Latitude" htmlFor="branch-lat" error={errors.lat} hint="Optional. Used for the directions link.">
                <input id="branch-lat" type="number" step="any" value={form.lat} onChange={(event) => set("lat", event.target.value)} className={adminInput} />
              </Field>
              <Field label="Longitude" htmlFor="branch-lng" error={errors.lng} hint="Optional. Used for the directions link.">
                <input id="branch-lng" type="number" step="any" value={form.lng} onChange={(event) => set("lng", event.target.value)} className={adminInput} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-[20px] border-2 border-ink/10 bg-sun-tint/20 p-4">
            <legend className={adminLabel}>Contact</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="branch-phone" required error={errors.phone}>
                <input id="branch-phone" value={form.phone} onChange={(event) => set("phone", event.target.value)} className={adminInput} required />
              </Field>
              <Field label="WhatsApp number" htmlFor="branch-whatsapp" required error={errors.whatsapp} hint="Digits with country code, for example 27115550114.">
                <input id="branch-whatsapp" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} className={adminInput} required />
              </Field>
              <Field label="Email" htmlFor="branch-email" required error={errors.email} className="sm:col-span-2">
                <input id="branch-email" type="email" value={form.email} onChange={(event) => set("email", event.target.value)} className={adminInput} required />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-[20px] border-2 border-ink/10 bg-sun-tint/20 p-4">
            <legend className={adminLabel}>Opening hours</legend>
            <div className="mt-3 space-y-2">
              {WEEKDAY_LABELS.map(({ key, label }) => {
                const value = form.hours[key as keyof WeekHours];
                return (
                  <div key={key} className="grid grid-cols-[5.5rem_auto_1fr] items-center gap-3">
                    <span className="text-[0.76rem] text-ink/75">{label}</span>
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[0.76rem] font-semibold text-ink/75">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) =>
                          setHours(
                            key as keyof WeekHours,
                            event.target.checked
                              ? { open: "07:00", close: "17:00" }
                              : null,
                          )
                        }
                        className="admin-check"
                      />
                      Open
                    </label>
                    {value ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={value.open}
                          onChange={(event) =>
                            setHours(key as keyof WeekHours, {
                              ...value,
                              open: event.target.value,
                            })
                          }
                          className={`${adminInput} mt-0 w-auto`}
                          aria-label={`${label} opening time`}
                        />
                        <span className="text-[0.72rem] text-ink/75">to</span>
                        <input
                          type="time"
                          value={value.close}
                          onChange={(event) =>
                            setHours(key as keyof WeekHours, {
                              ...value,
                              close: event.target.value,
                            })
                          }
                          className={`${adminInput} mt-0 w-auto`}
                          aria-label={`${label} closing time`}
                        />
                      </div>
                    ) : (
                      <span className="text-[0.72rem] text-ink/75">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>

          <Field
            label="Branch description"
            htmlFor="branch-description"
            required
            error={errors.description}
            hint="Markdown is supported. Paragraphs and headings are enough."
          >
            <textarea
              id="branch-description"
              rows={8}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              className={adminTextarea}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaSelect
              id="branch-hero"
              label="Hero image"
              value={form.heroImageId}
              onChange={(value) => set("heroImageId", value)}
              hint="Landscape, at least 1920 × 1080 pixels."
            />
            <div className="space-y-4">
              <Field label="Sort order" htmlFor="branch-sort" hint="Lower numbers appear first.">
                <input id="branch-sort" type="number" min={0} value={form.sortOrder} onChange={(event) => set("sortOrder", event.target.value)} className={adminInput} />
              </Field>
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.82rem] font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => set("isActive", event.target.checked)}
                  className="admin-check"
                />
                Show this branch on the public website
              </label>
            </div>
          </div>

          <SeoFields
            title={form.seoTitle}
            description={form.seoDescription}
            onTitleChange={(value) => set("seoTitle", value)}
            onDescriptionChange={(value) => set("seoDescription", value)}
            fallbackTitle={`${form.name} | Khanya Nature School`}
            fallbackDescription={form.tagline}
            path={`/branches/${form.slug || "branch"}`}
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
              {saving ? "Saving" : editing ? "Save changes" : "Create branch"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "branch"}?`}
        body="This cannot be undone. If the branch has enquiries linked to it, the API will refuse the delete and ask you to deactivate it instead."
        confirmLabel="Delete branch"
        onConfirm={remove}
      />
    </div>
  );
}
