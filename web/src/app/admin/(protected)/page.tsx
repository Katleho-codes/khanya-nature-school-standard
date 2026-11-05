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

const statusTone: Record<EnquiryStatus, "green" | "ochre" | "neutral" | "clay"> = {
  NEW: "ochre",
  CONTACTED: "green",
  VISIT_ARRANGED: "green",
  ENROLLED: "green",
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
              className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-4 py-2 text-[0.82rem] text-forest transition-colors hover:bg-forest-tint"
            >
              Write a post
            </Link>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1.5 rounded-sm border border-forest bg-forest px-4 py-2 text-[0.82rem] font-medium text-oat transition-colors hover:bg-forest-deep"
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
            <div key={index} className="h-28 animate-pulse rounded-sm border border-line bg-paper" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "New enquiries",
              value: data.stats.newEnquiries,
              note: "In the last seven days",
              accent: "bg-ochre",
            },
            {
              label: "Upcoming events",
              value: data.stats.upcomingEvents,
              note: "Published and still to come",
              accent: "bg-sage",
            },
            {
              label: "Draft posts",
              value: data.stats.draftPosts,
              note: `${data.stats.publishedPosts} published`,
              accent: "bg-sage-deep",
            },
            {
              label: "Library",
              value: data.stats.albumCount + data.stats.documentCount,
              note: `${data.stats.albumCount} albums, ${data.stats.documentCount} documents`,
              accent: "bg-forest",
            },
          ].map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-sm border border-line bg-paper p-5">
              <span className={`absolute inset-y-0 left-0 w-1 ${stat.accent}`} aria-hidden />
              <p className="text-[0.66rem] uppercase tracking-[0.14em] text-sage-deep">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-[2.4rem] leading-none text-forest">
                {stat.value}
              </p>
              <p className="mt-2 text-[0.74rem] text-bark-soft">{stat.note}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="xl:col-span-8" aria-labelledby="recent-enquiries">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <div>
              <p className="label-caps text-sage-deep">Admissions</p>
              <h2 id="recent-enquiries" className="mt-1 font-display text-[1.45rem] text-forest">
                Recent enquiries
              </h2>
            </div>
            <Link
              href="/admin/enquiries"
              className="mark-link text-[0.78rem] text-forest"
            >
              View all
            </Link>
          </div>
          {loading || !data ? (
            <div className="mt-4">
              <TableSkeleton rows={4} />
            </div>
          ) : data.recentEnquiries.length === 0 ? (
            <p className="py-8 text-[0.84rem] text-bark-soft">
              No enquiries yet. The public form will add them here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-sm border border-line bg-paper">
              <table className="w-full min-w-[38rem] text-left">
                <thead>
                  <tr className="border-b border-line bg-sage-tint/45 text-[0.62rem] uppercase tracking-[0.12em] text-sage-deep">
                    <th scope="col" className="px-3 py-2.5 font-medium">Family</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Branch</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Received</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="border-b border-line last:border-b-0">
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/enquiries?open=${enquiry.id}`}
                          className="text-[0.82rem] font-medium text-forest hover:text-sage-deep"
                        >
                          {enquiry.parentName}
                        </Link>
                        <p className="text-[0.7rem] text-bark-soft">
                          {enquiry.childName} · {enquiry.reference}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[0.78rem] text-bark-soft">
                        {enquiry.branch.name}
                      </td>
                      <td className="px-3 py-3 text-[0.75rem] text-bark-soft">
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
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <div>
              <p className="label-caps text-sage-deep">Mail</p>
              <h2 id="recent-emails" className="mt-1 font-display text-[1.45rem] text-forest">
                Recent emails
              </h2>
            </div>
            <Link href="/admin/outbox" className="mark-link text-[0.78rem] text-forest">
              Outbox
            </Link>
          </div>
          {loading || !data ? (
            <div className="mt-4 h-44 animate-pulse rounded-sm border border-line bg-paper" />
          ) : data.recentEmails.length === 0 ? (
            <p className="py-8 text-[0.84rem] text-bark-soft">
              No email has been generated yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-sm border border-line bg-paper">
              {data.recentEmails.map((email) => (
                <li key={email.id}>
                  <Link
                    href={`/admin/outbox?open=${email.id}`}
                    className="block px-4 py-3 transition-colors hover:bg-sage-tint/40"
                  >
                    <p className="line-clamp-1 text-[0.8rem] font-medium text-forest">
                      {email.subject}
                    </p>
                    <p className="mt-0.5 truncate text-[0.7rem] text-bark-soft">
                      To {email.to}
                    </p>
                    <p className="mt-0.5 text-[0.65rem] text-bark-soft">
                      {formatDate(email.createdAt)} · {formatTime(email.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-sm border border-line bg-paper p-4">
            <p className="text-[0.66rem] uppercase tracking-[0.14em] text-sage-deep">
              Quick links
            </p>
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
                  className="flex items-center justify-between gap-2 text-[0.78rem] text-forest transition-colors hover:text-sage-deep"
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
