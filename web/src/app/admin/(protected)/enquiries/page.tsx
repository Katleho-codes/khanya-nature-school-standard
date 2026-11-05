"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Branch,
  Enquiry,
  EnquiryNote,
  EnquirySource,
  EnquiryStatus,
} from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import {
  buildQuery,
  enquiryStatusLabels,
  enquiryStatusOptions,
  enquiryStatusTones,
} from "@/lib/admin-utils";
import {
  formatDate,
  formatMonth,
  formatTime,
  phoneHref,
} from "@/lib/format";
import {
  AdminBadge,
  AdminButton,
  AdminError,
  AdminPageHeader,
  EmptyState,
  Field,
  Modal,
  TableSkeleton,
  adminInput,
  adminLabel,
  adminTextarea,
} from "@/components/admin/admin-ui";
import { useBranches } from "@/components/admin/BranchPicker";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";

type EnquiryDetail = Omit<Enquiry, "branch" | "notes"> & {
  branch: Branch;
  notes: EnquiryNote[];
};

const sourceLabels: Record<EnquirySource, string> = {
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  PHONE: "Phone",
  WALK_IN: "Walk in",
};

export default function AdminEnquiriesPage() {
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    branch: "",
    from: "",
    to: "",
  });
  const [applied, setApplied] = useState(filters);
  const query = useMemo(
    () =>
      buildQuery({
        q: applied.q,
        status: applied.status,
        branch: applied.branch,
        from: applied.from,
        to: applied.to,
      }),
    [applied],
  );
  const { data, loading, error, reload } = useAdminData<{
    enquiries: Enquiry[];
  }>(`/enquiries${query}`);
  const { branches } = useBranches();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
    reload: reloadDetail,
  } = useAdminData<{ enquiry: EnquiryDetail }>(
    selectedId ? `/enquiries/${selectedId}` : null,
  );
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const openedFromLink = useRef(false);

  function openEnquiry(id: string) {
    setNoteBody("");
    setNoteError(null);
    setSelectedId(id);
  }

  useEffect(() => {
    if (openedFromLink.current) return;
    const id = new URLSearchParams(window.location.search).get("open");
    if (id) {
      openedFromLink.current = true;
      // The browser URL is an external store. Reading it after mount keeps the
      // server render deterministic while still honouring dashboard links.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openEnquiry(id);
    }
  }, []);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied(filters);
  }

  function clearFilters() {
    const cleared = { q: "", status: "", branch: "", from: "", to: "" };
    setFilters(cleared);
    setApplied(cleared);
  }

  async function updateStatus(status: EnquiryStatus) {
    if (!selectedId) return;
    setSavingStatus(true);
    try {
      await adminFetch(`/enquiries/${selectedId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast(`Status changed to ${enquiryStatusLabels[status].toLowerCase()}.`);
      await Promise.all([reload(), reloadDetail()]);
    } catch (caught) {
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    setSavingNote(true);
    setNoteError(null);
    try {
      await adminFetch(`/enquiries/${selectedId}/notes`, {
        method: "POST",
        body: JSON.stringify({ body: noteBody }),
      });
      setNoteBody("");
      toast("The note was added.");
      await reloadDetail();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields?.body) {
        setNoteError(caught.fields.body);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSavingNote(false);
    }
  }

  const detail = detailData?.enquiry ?? null;
  const filtered =
    applied.q !== "" ||
    applied.status !== "" ||
    applied.branch !== "" ||
    applied.from !== "" ||
    applied.to !== "";
  const exportHref = `/api/admin/enquiries/export.csv${query}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admissions"
        title="Enquiries"
        description="Search, filter and follow up every family that contacts the school. Notes and status changes stay with the enquiry."
        actions={
          <a
            href={exportHref}
            className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-4 py-2 text-[0.82rem] text-forest transition-colors hover:bg-forest-tint"
          >
            <DownloadIcon className="h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-sm border border-line bg-paper p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]"
      >
        <Field label="Search" htmlFor="enquiry-search">
          <input
            id="enquiry-search"
            value={filters.q}
            onChange={(event) =>
              setFilters((current) => ({ ...current, q: event.target.value }))
            }
            className={adminInput}
            placeholder="Reference, parent, child, email or phone"
          />
        </Field>
        <Field label="Status" htmlFor="enquiry-status">
          <select
            id="enquiry-status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
            className={adminInput}
          >
            <option value="">All statuses</option>
            {enquiryStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Branch" htmlFor="enquiry-branch">
          <select
            id="enquiry-branch"
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
        <Field label="From" htmlFor="enquiry-from">
          <input
            id="enquiry-from"
            type="date"
            value={filters.from}
            onChange={(event) =>
              setFilters((current) => ({ ...current, from: event.target.value }))
            }
            className={adminInput}
          />
        </Field>
        <Field label="To" htmlFor="enquiry-to">
          <input
            id="enquiry-to"
            type="date"
            value={filters.to}
            onChange={(event) =>
              setFilters((current) => ({ ...current, to: event.target.value }))
            }
            className={adminInput}
          />
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
        <TableSkeleton rows={6} />
      ) : data.enquiries.length === 0 ? (
        <EmptyState
          title={filtered ? "No enquiries match those filters" : "No enquiries yet"}
          body={
            filtered
              ? "Try a wider date range, a different status or clear the filters."
              : "When a family submits the admissions form, their enquiry will appear here."
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
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          <div className="hidden grid-cols-[1.4fr_1.2fr_8rem_8rem_9rem_5rem] gap-4 border-b border-line bg-sage-tint/45 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-sage-deep lg:grid">
            <span>Family</span>
            <span>Contact</span>
            <span>Branch</span>
            <span>Status</span>
            <span>Received</span>
            <span className="text-right">Open</span>
          </div>
          {data.enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="grid gap-4 border-b border-line px-4 py-4 last:border-b-0 lg:grid-cols-[1.4fr_1.2fr_8rem_8rem_9rem_5rem] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[0.84rem] font-medium text-forest">
                    {enquiry.parentName}
                  </p>
                  <span className="text-[0.66rem] text-bark-soft">
                    {enquiry.reference}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.74rem] text-bark-soft">
                  {enquiry.childName}
                  {enquiry.programme ? ` · ${enquiry.programme.name}` : ""}
                </p>
              </div>
              <div className="min-w-0 text-[0.72rem] text-bark-soft">
                <p className="truncate">{enquiry.email}</p>
                <p>{enquiry.phone}</p>
              </div>
              <div className="text-[0.74rem] text-bark-soft">
                {enquiry.branch.name}
              </div>
              <div>
                <AdminBadge tone={enquiryStatusTones[enquiry.status]}>
                  {enquiryStatusLabels[enquiry.status]}
                </AdminBadge>
              </div>
              <div className="text-[0.72rem] text-bark-soft">
                <p>{formatDate(enquiry.createdAt)}</p>
                <p className="text-[0.66rem]">{formatTime(enquiry.createdAt)}</p>
              </div>
              <div className="lg:text-right">
                <button
                  type="button"
                  onClick={() => openEnquiry(enquiry.id)}
                  className="inline-flex items-center gap-1 rounded-sm border border-line-strong px-3 py-1.5 text-[0.76rem] text-forest transition-colors hover:bg-forest-tint"
                >
                  Open <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={selectedId !== null}
        onOpenChange={(value) => !value && setSelectedId(null)}
        title={detail ? `Enquiry ${detail.reference}` : "Enquiry"}
        description={
          detail
            ? `Received ${formatDate(detail.createdAt)} at ${formatTime(detail.createdAt)}`
            : "Loading the enquiry."
        }
        wide
      >
        {detailLoading && !detail ? (
          <TableSkeleton rows={4} />
        ) : detailError && !detail ? (
          <AdminError message={detailError} onRetry={reloadDetail} />
        ) : detail ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <AdminBadge tone={enquiryStatusTones[detail.status]}>
                {enquiryStatusLabels[detail.status]}
              </AdminBadge>
              <span className="text-[0.72rem] text-bark-soft">
                {sourceLabels[detail.source]}
              </span>
              {detail.programme ? (
                <span className="text-[0.72rem] text-bark-soft">
                  · {detail.programme.name}
                </span>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <section>
                <p className={adminLabel}>Parent or guardian</p>
                <p className="mt-1 text-[0.9rem] text-forest">{detail.parentName}</p>
                <div className="mt-1 space-y-1 text-[0.78rem] text-bark-soft">
                  <p>
                    <a className="underline underline-offset-2 hover:text-forest" href={`mailto:${detail.email}`}>
                      {detail.email}
                    </a>
                  </p>
                  <p>
                    <a className="underline underline-offset-2 hover:text-forest" href={phoneHref(detail.phone)}>
                      {detail.phone}
                    </a>
                  </p>
                </div>
              </section>
              <section>
                <p className={adminLabel}>Child</p>
                <p className="mt-1 text-[0.9rem] text-forest">{detail.childName}</p>
                <div className="mt-1 space-y-1 text-[0.78rem] text-bark-soft">
                  <p>
                    Date of birth:{" "}
                    {detail.childDateOfBirth
                      ? formatDate(detail.childDateOfBirth)
                      : "Not given"}
                  </p>
                  <p>
                    Preferred start:{" "}
                    {detail.preferredStart
                      ? formatMonth(detail.preferredStart)
                      : "Not given"}
                  </p>
                </div>
              </section>
              <section>
                <p className={adminLabel}>Branch</p>
                <p className="mt-1 text-[0.82rem] text-forest">
                  {detail.branch.name}
                </p>
                <p className="text-[0.74rem] text-bark-soft">
                  {detail.branch.suburb}, {detail.branch.city}
                </p>
              </section>
              <section>
                <p className={adminLabel}>POPIA consent</p>
                <p className="mt-1 text-[0.8rem] text-forest">
                  {detail.consentPopia ? "Given" : "Not given"}
                </p>
                <p className="text-[0.72rem] text-bark-soft">
                  {formatDate(detail.consentAt)} at {formatTime(detail.consentAt)}
                </p>
              </section>
            </div>

            <section className="rounded-sm border border-line bg-paper p-4">
              <p className={adminLabel}>Message from the family</p>
              <p className="mt-2 whitespace-pre-line text-[0.84rem] leading-relaxed text-bark">
                {detail.message}
              </p>
            </section>

            <section className="rounded-sm border border-line bg-paper p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className={adminLabel}>Follow up status</p>
                  <p className="mt-1 text-[0.72rem] text-bark-soft">
                    This is visible to staff only.
                  </p>
                </div>
                <select
                  value={detail.status}
                  onChange={(event) =>
                    updateStatus(event.target.value as EnquiryStatus)
                  }
                  disabled={savingStatus}
                  className={`${adminInput} mt-0 w-auto`}
                  aria-label="Enquiry status"
                >
                  {enquiryStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3 border-b border-line pb-2">
                <p className={adminLabel}>Internal notes</p>
                <span className="text-[0.68rem] text-bark-soft">
                  {detail.notes.length} notes
                </span>
              </div>
              {detail.notes.length === 0 ? (
                <p className="py-4 text-[0.8rem] text-bark-soft">
                  No notes yet. Record calls, visits and next steps here.
                </p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {detail.notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-sm border-l-2 border-sage-deep/40 bg-sage-tint/25 px-3 py-2"
                    >
                      <p className="whitespace-pre-line text-[0.8rem] leading-relaxed text-bark">
                        {note.body}
                      </p>
                      <p className="mt-1 text-[0.66rem] text-bark-soft">
                        {note.author.name} · {formatDate(note.createdAt)} at{" "}
                        {formatTime(note.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              <form onSubmit={addNote} className="mt-4 space-y-2">
                <label htmlFor="enquiry-note" className={adminLabel}>
                  Add a note
                </label>
                <textarea
                  id="enquiry-note"
                  rows={3}
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  className={adminTextarea}
                  placeholder="Called the family, visit booked for Thursday at 09:00."
                  required
                />
                {noteError ? (
                  <p className="text-[0.74rem] text-clay">{noteError}</p>
                ) : null}
                <div className="flex justify-end">
                  <AdminButton type="submit" size="sm" disabled={savingNote}>
                    {savingNote ? "Saving" : "Add note"}
                  </AdminButton>
                </div>
              </form>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              <p className="text-[0.68rem] text-bark-soft">
                Updated {formatDate(detail.updatedAt)} at {formatTime(detail.updatedAt)}
              </p>
              <a
                href={`mailto:${detail.email}?subject=${encodeURIComponent(
                  `Your enquiry ${detail.reference} at Khanya Nature School`,
                )}`}
                className="inline-flex items-center gap-1.5 rounded-sm border border-forest bg-forest px-4 py-2 text-[0.8rem] font-medium text-oat transition-colors hover:bg-forest-deep"
              >
                Reply by email <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
