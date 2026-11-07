"use client";

import { useEffect, useRef, useState } from "react";
import type { OutboxEmail } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/format";
import {
  AdminBadge,
  AdminError,
  AdminPageHeader,
  EmptyState,
  Modal,
  TableSkeleton,
} from "@/components/admin/admin-ui";
import { useAdminData } from "@/components/admin/useAdmin";
import { ArrowUpRightIcon } from "@/components/icons";

export default function AdminOutboxPage() {
  const { data, loading, error, reload } =
    useAdminData<{ emails: OutboxEmail[] }>("/outbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
    reload: reloadDetail,
  } = useAdminData<{ email: OutboxEmail }>(
    selectedId ? `/outbox/${selectedId}` : null,
  );
  const openedFromLink = useRef(false);

  useEffect(() => {
    if (openedFromLink.current) return;
    const id = new URLSearchParams(window.location.search).get("open");
    if (id) {
      openedFromLink.current = true;
      // The browser URL is an external store. Reading it after mount keeps the
      // server render deterministic while still honouring dashboard links.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedId(id);
    }
  }, []);

  const email = detailData?.email ?? null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="School"
        title="Outbox"
        description="Every email the site generates is captured here instead of being sent. Useful for demonstrating enquiry acknowledgements and welcome messages."
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading || !data ? (
        <TableSkeleton rows={4} />
      ) : data.emails.length === 0 ? (
        <EmptyState
          title="The outbox is empty"
          body="Submit an enquiry or add a user, then return here to see the generated email."
        />
      ) : (
        <div className="paper-card-plain overflow-hidden border-2 border-ink/10 bg-paper">
          <div className="hidden grid-cols-[1.5fr_1.2fr_9rem_10rem_5rem] gap-4 border-b-2 border-ink/10 bg-sky-tint/55 px-4 py-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink/60 lg:grid">
            <span>Subject</span>
            <span>To</span>
            <span>Template</span>
            <span>Created</span>
            <span className="text-right">Open</span>
          </div>
          {data.emails.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 border-b-2 border-ink/10 px-4 py-4 last:border-b-0 lg:grid-cols-[1.5fr_1.2fr_9rem_10rem_5rem] lg:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-[0.84rem] font-medium text-ink">
                  {item.subject}
                </p>
                {item.relatedType ? (
                  <p className="text-[0.66rem] text-ink/60">
                    Linked to {item.relatedType}
                  </p>
                ) : null}
              </div>
              <div className="truncate text-[0.74rem] text-ink/60">{item.to}</div>
              <div>
                <AdminBadge tone="neutral">{item.template}</AdminBadge>
              </div>
              <div className="text-[0.72rem] text-ink/60">
                <p>{formatDate(item.createdAt)}</p>
                <p className="text-[0.66rem]">{formatTime(item.createdAt)}</p>
              </div>
              <div className="lg:text-right">
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="inline-flex items-center gap-1 min-h-9 rounded-full border-2 border-b-4 border-ink/15 px-3.5 py-1.5 text-[0.78rem] font-bold text-ink transition-colors hover:bg-sun-tint"
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
        title={email?.subject ?? "Email"}
        description={
          email
            ? `To ${email.to} · ${formatDate(email.createdAt)} at ${formatTime(email.createdAt)}`
            : "Loading the email."
        }
        wide
      >
        {detailLoading && !email ? (
          <TableSkeleton rows={3} />
        ) : detailError && !email ? (
          <AdminError message={detailError} onRetry={reloadDetail} />
        ) : email ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[0.72rem] text-ink/60">
              <AdminBadge tone="neutral">{email.template}</AdminBadge>
              {email.relatedType ? (
                <span>
                  Related to {email.relatedType}
                  {email.relatedId ? ` (${email.relatedId})` : ""}
                </span>
              ) : null}
            </div>

            {email.html ? (
              <iframe
                title={`Preview of ${email.subject}`}
                srcDoc={email.html}
                sandbox=""
                className="h-[28rem] paper-card-plain w-full border-2 border-ink/10 bg-paper"
              />
            ) : (
              <p className="text-[0.8rem] text-ink/60">
                This email has no HTML version.
              </p>
            )}

            {email.text ? (
              <details className="paper-card-plain border-2 border-ink/10 bg-paper p-3">
                <summary className="cursor-pointer text-[0.78rem] text-ink">
                  Plain text version
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-[0.74rem] leading-relaxed text-ink/60">
                  {email.text}
                </pre>
              </details>
            ) : null}

            <p className="text-[0.7rem] text-ink/60">
              This is a demonstration outbox. No email left the server.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
