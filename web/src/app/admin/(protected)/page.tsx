"use client";

import Link from "next/link";
import { formatDate, formatTime } from "@/lib/format";
import type { DashboardData, EnquiryStatus } from "@/lib/types";
import {
  AdminPageHeader,
  AdminBadge,
  AdminError,
  TableSkeleton,
} from "@/components/admin/admin-ui";
import { useAdminData } from "@/components/admin/useAdmin";
import { ArrowRightIcon } from "@/components/icons";

const statusTone: Record<EnquiryStatus, "meadow" | "sun" | "neutral" | "poppy"> = {
  NEW: "sun",
  CONTACTED: "meadow",
  VISIT_ARRANGED: "meadow",
  ENROLLED: "meadow",
  NOT_PROCEEDING: "neutral",
};

const statusLabel: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_ARRANGED: "Visit arranged",
  ENROLLED: "Enrolled",
  NOT_PROCEEDING: "Not proceeding",
};

export default function DashboardPage() {
  const { data, loading, error, reload } =
    useAdminData<DashboardData>("/dashboard");

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="What needs attention today, and what changed recently."
        actions={
          <>
            <Link
              href="/admin/news"
              className="press inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-b-4 border-ink/15 bg-paper px-4 py-2 text-[0.84rem] font-bold text-ink transition-colors hover:bg-sun-tint"
            >
              Write a post
            </Link>
            <Link
              href="/admin/enquiries"
              className="press inline-flex min-h-11 items-center gap-1.5 rounded-full border-b-4 border-sun-deep bg-sun px-4 py-2 text-[0.84rem] font-extrabold text-ink transition-colors hover:bg-sun-deep"
            >
              Open enquiries <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </>
        }
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="paper-card-plain h-28 animate-pulse border-2 border-ink/10 bg-paper"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "New enquiries",
              value: data.stats.newEnquiries,
              note: "In the last seven days",
              accent: "bg-sun",
            },
            {
              label: "Upcoming events",
              value: data.stats.upcomingEvents,
              note: "Published and still to come",
              accent: "bg-sky",
            },
            {
              label: "Draft posts",
              value: data.stats.draftPosts,
              note: `${data.stats.publishedPosts} published`,
              accent: "bg-meadow",
            },
            {
              label: "Library",
              value: data.stats.albumCount + data.stats.documentCount,
              note: `${data.stats.albumCount} albums, ${data.stats.documentCount} documents`,
              accent: "bg-poppy-deep",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="paper-card-plain relative overflow-hidden border-2 border-ink/10 bg-paper p-5"
            >
              <span className={`absolute inset-y-0 left-0 w-1.5 ${stat.accent}`} aria-hidden />
              <p className="text-[0.8rem] font-bold text-ink/70">{stat.label}</p>
              <p className="mt-2 font-display text-[2.6rem] font-extrabold leading-none text-ink">
                {stat.value}
              </p>
              <p className="mt-2 text-[0.78rem] text-ink/60">{stat.note}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="xl:col-span-8" aria-labelledby="recent-enquiries">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink/10 pb-3">
            <div>
              <p className="hand text-[1.15rem] text-poppy-deep">Admissions</p>
              <h2 id="recent-enquiries" className="mt-1 font-display text-[1.5rem] font-extrabold text-ink">
                Recent enquiries
              </h2>
            </div>
            <Link
              href="/admin/enquiries"
              className="inline-flex min-h-11 items-center text-[0.82rem] font-bold text-sky-deep squiggle-link"
            >
              View all
            </Link>
          </div>
          {loading || !data ? (
            <div className="mt-4">
              <TableSkeleton rows={4} />
            </div>
          ) : data.recentEnquiries.length === 0 ? (
            <div className="paper-card mt-4 bg-sun-tint/45 px-5 py-8 text-center">
              <p className="font-display text-[1.2rem] font-extrabold text-ink">
                The enquiry list is quiet.
              </p>
              <p className="hand mt-1 text-[1.1rem] text-ink/60">
                A family will land here soon.
              </p>
            </div>
          ) : (
            <div className="paper-card-plain mt-4 overflow-x-auto border-2 border-ink/10 bg-paper">
              <table className="w-full min-w-[38rem] text-left">
                <thead>
                  <tr className="border-b-2 border-ink/10 bg-sky-tint/55 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-ink/60">
                    <th scope="col" className="px-3 py-2.5">Family</th>
                    <th scope="col" className="px-3 py-2.5">Branch</th>
                    <th scope="col" className="px-3 py-2.5">Received</th>
                    <th scope="col" className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="border-b-2 border-ink/10 last:border-b-0">
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/enquiries?open=${enquiry.id}`}
                          className="text-[0.86rem] font-bold text-ink squiggle-link"
                        >
                          {enquiry.parentName}
                        </Link>
                        <p className="text-[0.7rem] text-ink/60">
                          {enquiry.childName} · {enquiry.reference}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[0.78rem] text-ink/60">
                        {enquiry.branch.name}
                      </td>
                      <td className="px-3 py-3 text-[0.75rem] text-ink/60">
                        {formatDate(enquiry.createdAt)}
                        <span className="block text-[0.68rem]">{formatTime(enquiry.createdAt)}</span>
                      </td>
                      <td className="px-3 py-3">
                        <AdminBadge tone={statusTone[enquiry.status]}>
                          {statusLabel[enquiry.status]}
                        </AdminBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="xl:col-span-4" aria-labelledby="recent-emails">
          <div className="flex items-end justify-between gap-4 border-b-2 border-ink/10 pb-3">
            <div>
              <p className="hand text-[1.15rem] text-poppy-deep">Mail</p>
              <h2 id="recent-emails" className="mt-1 font-display text-[1.5rem] font-extrabold text-ink">
                Recent emails
              </h2>
            </div>
            <Link
              href="/admin/outbox"
              className="inline-flex min-h-11 items-center text-[0.82rem] font-bold text-sky-deep squiggle-link"
            >
              Outbox
            </Link>
          </div>
          {loading || !data ? (
            <div className="paper-card-plain mt-4 h-44 animate-pulse border-2 border-ink/10 bg-paper" />
          ) : data.recentEmails.length === 0 ? (
            <div className="paper-card mt-4 bg-sky-tint/40 px-5 py-8 text-center">
              <p className="font-display text-[1.15rem] font-extrabold text-ink">
                No letters in the outbox.
              </p>
              <p className="hand mt-1 text-[1.05rem] text-ink/60">
                Send one when a family writes in.
              </p>
            </div>
          ) : (
            <ul className="paper-card-plain mt-4 divide-y divide-ink/10 border-2 border-ink/10 bg-paper">
              {data.recentEmails.map((email) => (
                <li key={email.id}>
                  <Link
                    href={`/admin/outbox?open=${email.id}`}
                    className="block px-4 py-3 transition-colors hover:bg-sky-tint/40"
                  >
                    <p className="line-clamp-1 text-[0.84rem] font-bold text-ink">
                      {email.subject}
                    </p>
                    <p className="mt-0.5 truncate text-[0.7rem] text-ink/60">
                      To {email.to}
                    </p>
                    <p className="mt-0.5 text-[0.65rem] text-ink/60">
                      {formatDate(email.createdAt)} · {formatTime(email.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="paper-card mt-6 rotate-[0.6deg] bg-sky-tint/45 p-4">
            <p className="hand text-[1.15rem] text-ink/65">Quick links</p>
            <div className="mt-3 grid gap-2">
              {[
                { href: "/admin/branches", label: "Branch opening hours" },
                { href: "/admin/documents", label: "Admission documents" },
                { href: "/admin/media", label: "Upload a photograph" },
                { href: "/admin/settings", label: "Site title and WhatsApp message" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-10 items-center justify-between gap-2 text-[0.82rem] font-semibold text-ink squiggle-link"
                >
                  {link.label}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
