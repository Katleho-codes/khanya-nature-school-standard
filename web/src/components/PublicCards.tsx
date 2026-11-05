import Link from "next/link";
import type { Album, Document, Event, Post, ProgrammeSummary } from "@/lib/types";
import {
  formatDate,
  formatEventWhen,
  formatFee,
  formatRand,
  summariseHours,
} from "@/lib/format";
import { Photo } from "./Photo";
import { ArrowRightIcon, DownloadIcon } from "./icons";

const categoryLabels: Record<Post["category"], string> = {
  NEWS: "News",
  ANNOUNCEMENT: "Announcement",
  NOTICE: "Notice",
};

export function PostCard({
  post,
  layout = "stack",
  priority = false,
}: {
  post: Post;
  layout?: "stack" | "row";
  priority?: boolean;
}) {
  if (layout === "row") {
    return (
      <article className="grid gap-5 border-t border-line py-7 sm:grid-cols-[7rem_1fr] md:grid-cols-[8rem_1fr_13rem] md:gap-8">
        <div className="text-sm text-bark-soft">
          <p className="font-display text-[1.5rem] leading-none text-forest">
            {post.publishedAt ? new Date(post.publishedAt).getDate() : ""}
          </p>
          <p className="mt-1 text-[0.72rem] uppercase tracking-[0.15em]">
            {post.publishedAt ? formatDate(post.publishedAt).split(" ").slice(1).join(" ") : ""}
          </p>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
            <span>{categoryLabels[post.category]}</span>
            {post.isPinned ? (
              <span className="inline-flex items-center gap-1.5 text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-ochre" aria-hidden />
                Pinned
              </span>
            ) : null}
            {post.branch ? <span>· {post.branch.name}</span> : <span>· All branches</span>}
          </div>
          <h3 className="mt-2 font-display text-[1.55rem] leading-[1.15] text-forest">
            <Link href={`/news/${post.slug}`} className="transition-colors hover:text-sage-deep">
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bark-soft">{post.excerpt}</p>
        </div>
        <div className="hidden md:block">
          <Photo
            src={post.cover?.url ?? null}
            alt={post.cover?.alt ?? post.title}
            ratio="3 / 2"
            sizes="13rem"
            className="w-full"
          />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/news/${post.slug}`} className="block" tabIndex={-1} aria-hidden>
        <Photo
          src={post.cover?.url ?? null}
          alt={post.cover?.alt ?? post.title}
          ratio="3 / 2"
          sizes="(min-width: 1024px) 33vw, 100vw"
          priority={priority}
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-4 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-sage-deep">
        <span>{categoryLabels[post.category]}</span>
        <span aria-hidden>·</span>
        <span>{post.publishedAt ? formatDate(post.publishedAt) : ""}</span>
      </div>
      <h3 className="mt-2 font-display text-[1.42rem] leading-[1.18] text-forest">
        <Link href={`/news/${post.slug}`} className="transition-colors hover:text-sage-deep">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-bark-soft">{post.excerpt}</p>
      <Link
        href={`/news/${post.slug}`}
        className="mark-link mt-4 inline-flex w-fit items-center gap-1.5 text-sm text-forest"
      >
        Read the story <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function EventRow({ event }: { event: Event }) {
  return (
    <article className="group grid gap-4 border-t border-line py-6 sm:grid-cols-[8.5rem_1fr] sm:gap-8">
      <div>
        <p className="font-display text-[1.9rem] leading-none text-forest">
          {new Date(event.startsAt).getDate()}
        </p>
        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-sage-deep">
          {formatDate(event.startsAt).split(" ").slice(1).join(" ")}
        </p>
        <p className="mt-2 text-[0.72rem] text-bark-soft">
          {event.allDay ? "All day" : formatEventWhen(event).split(" · ")[1]}
        </p>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
          <span>{event.branch?.name ?? "All branches"}</span>
          <span aria-hidden>·</span>
          <span>{event.locationText}</span>
        </div>
        <h3 className="mt-1.5 font-display text-[1.4rem] leading-tight text-forest">
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-sage-deep">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-bark-soft">
          {event.descriptionMd.replace(/[#*_>`]/g, "").slice(0, 180)}
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="mark-link mt-3 inline-flex items-center gap-1.5 text-[0.82rem] text-forest"
        >
          Event details <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function ProgrammeRow({
  programme,
  index,
}: {
  programme: ProgrammeSummary;
  index: number;
}) {
  return (
    <Link
      href={`/programmes/${programme.slug}`}
      className="group grid gap-3 border-t border-line py-6 transition-colors hover:bg-paper/70 sm:grid-cols-[3rem_1fr_8rem_9rem_2rem] sm:items-baseline sm:gap-6 md:py-8"
    >
      <span className="text-[0.72rem] tracking-[0.16em] text-sage-deep">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span>
        <span className="block font-display text-[1.65rem] leading-tight text-forest transition-colors group-hover:text-sage-deep md:text-[2rem]">
          {programme.name}
        </span>
        <span className="mt-1 block max-w-xl text-sm leading-relaxed text-bark-soft">
          {programme.summary}
        </span>
      </span>
      <span className="text-[0.8rem] text-bark-soft sm:text-right">{programme.ageLabel}</span>
      <span className="text-[0.82rem] text-forest sm:text-right">
        {programme.monthlyFeeCents === null ? "R450 per day" : formatFee(programme.monthlyFeeCents)}
      </span>
      <span className="hidden sm:flex sm:justify-end">
        <ArrowRightIcon className="h-5 w-5 text-forest transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function BranchCard({ branch }: { branch: import("@/lib/types").Branch }) {
  return (
    <article className="group">
      <Link href={`/branches/${branch.slug}`} className="block">
        <Photo
          src={branch.heroImage?.url ?? null}
          alt={branch.heroImage?.alt ?? `${branch.name} branch garden`}
          ratio="16 / 9"
          sizes="(min-width: 1024px) 50vw, 100vw"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h3 className="font-display text-[1.7rem] leading-tight text-forest">
          <Link href={`/branches/${branch.slug}`}>{branch.name}</Link>
        </h3>
        <span className="text-[0.72rem] uppercase tracking-[0.14em] text-sage-deep">
          {branch.suburb}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-bark-soft">{branch.tagline}</p>
      <dl className="mt-4 space-y-1.5 text-[0.8rem] text-bark-soft">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-sage-deep">Hours</dt>
          <dd>{summariseHours(branch.hours)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-sage-deep">Address</dt>
          <dd>{branch.addressLine1}, {branch.suburb}</dd>
        </div>
      </dl>
    </article>
  );
}

export function AlbumCard({ album }: { album: Album }) {
  return (
    <article className="group">
      <Link href={`/gallery/${album.slug}`} className="block">
        <Photo
          src={album.cover?.url ?? null}
          alt={album.cover?.alt ?? album.title}
          ratio="4 / 3"
          sizes="(min-width: 1024px) 33vw, 100vw"
          imageClassName={`transition-transform duration-700 group-hover:scale-[1.02] ${album.branch ? "" : ""}`}
        />
      </Link>
      <div className="mt-4 flex items-center justify-between gap-3 text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        <span>{album.branch?.name ?? "Both branches"}</span>
        <span>{album._count?.photos ?? album.photos?.length ?? 0} photos</span>
      </div>
      <h3 className="mt-2 font-display text-[1.4rem] leading-tight text-forest">
        <Link href={`/gallery/${album.slug}`}>{album.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-bark-soft">{album.description}</p>
    </article>
  );
}

const documentLabels: Record<Document["category"], string> = {
  ADMISSION_FORM: "Admission form",
  FEE_SCHEDULE: "Fee schedule",
  POLICY: "Policy",
  OTHER: "Information",
};

export function DocumentRow({ document }: { document: Document }) {
  return (
    <article className="grid gap-4 border-t border-line py-5 sm:grid-cols-[1fr_10rem] sm:items-center sm:gap-8">
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-sage-deep">
          {documentLabels[document.category]}
          {document.branch ? ` · ${document.branch.name}` : " · All branches"}
        </p>
        <h3 className="mt-1 font-display text-[1.32rem] leading-tight text-forest">{document.title}</h3>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-bark-soft">{document.description}</p>
      </div>
      <a
        href={`/api/public/documents/${document.id}/download`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 justify-self-start rounded-sm border border-line-strong px-4 py-2.5 text-[0.8rem] text-forest transition-colors hover:border-forest hover:bg-forest-tint sm:justify-self-end"
      >
        <DownloadIcon className="h-4 w-4" />
        Download PDF
      </a>
    </article>
  );
}

export function formatProgrammeFee(programme: ProgrammeSummary): string {
  if (programme.monthlyFeeCents === null) {
    return programme.feeNote ?? "On request";
  }
  return `${formatRand(programme.monthlyFeeCents)} per month`;
}
