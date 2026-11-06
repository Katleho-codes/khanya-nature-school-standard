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
import { ArrowRightIcon, CalendarIcon, DownloadIcon, MapPinIcon } from "./icons";
import { branchTone, programmeTone, toneStyle } from "@/lib/tones";

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
      <article className="paper-card grid gap-5 bg-paper p-4 sm:grid-cols-[6.5rem_1fr] md:grid-cols-[7.5rem_1fr_12rem] md:items-center md:gap-7 md:p-5">
        <div className="flex h-full flex-col justify-center rounded-[18px] bg-sun-tint p-3 text-center">
          <p className="font-display text-[2rem] font-extrabold leading-none text-ink">
            {post.publishedAt ? new Date(post.publishedAt).getDate() : ""}
          </p>
          <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/60">
            {post.publishedAt ? formatDate(post.publishedAt).split(" ").slice(1).join(" ") : ""}
          </p>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag bg-sky-tint text-ink">{categoryLabels[post.category]}</span>
            {post.isPinned ? (
              <span className="tag bg-sun text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-poppy-deep" aria-hidden />
                Pinned
              </span>
            ) : null}
            <span className="text-[0.76rem] font-semibold text-ink/55">
              {post.branch ? post.branch.name : "All branches"}
            </span>
          </div>
          <h3 className="mt-2 font-display text-[1.55rem] font-extrabold leading-[1.1] text-ink">
            <Link href={`/news/${post.slug}`} className="transition-colors hover:text-poppy-deep">
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-ink/65">{post.excerpt}</p>
        </div>
        <div className="hidden md:block">
          <Photo
            src={post.cover?.url ?? null}
            alt={post.cover?.alt ?? post.title}
            ratio="4 / 3"
            shape="paper"
            tone="sun"
            sizes="12rem"
            className="w-full"
          />
        </div>
      </article>
    );
  }

  return (
    <article className="paper-card group flex flex-col bg-paper p-4 sm:p-5">
      <Link href={`/news/${post.slug}`} className="block" tabIndex={-1} aria-hidden>
        <Photo
          src={post.cover?.url ?? null}
          alt={post.cover?.alt ?? post.title}
          ratio="3 / 2"
          shape="paper"
          tone={post.category === "NOTICE" ? "meadow" : post.category === "ANNOUNCEMENT" ? "sky" : "sun"}
          sizes="(min-width: 1024px) 33vw, 100vw"
          priority={priority}
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="tag bg-sun-tint text-ink">{categoryLabels[post.category]}</span>
        <span className="text-[0.76rem] font-semibold text-ink/50">
          {post.publishedAt ? formatDate(post.publishedAt) : ""}
        </span>
      </div>
      <h3 className="mt-2 font-display text-[1.48rem] font-extrabold leading-[1.12] text-ink">
        <Link href={`/news/${post.slug}`} className="transition-colors hover:text-poppy-deep">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-[0.94rem] leading-relaxed text-ink/65">{post.excerpt}</p>
      <Link
        href={`/news/${post.slug}`}
        className="squiggle-link mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-ink"
      >
        Read the story <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function EventRow({ event }: { event: Event }) {
  const tone = toneStyle(branchTone(event.branch?.slug ?? event.branch?.name));
  return (
    <article className="group paper-card grid gap-4 bg-paper p-4 sm:grid-cols-[8.5rem_1fr] sm:items-center sm:gap-7 sm:p-5">
      <div className={`rounded-[20px_16px_22px_14px] ${tone.tint} p-4 text-center`}>
        <CalendarIcon className={`mx-auto h-5 w-5 ${tone.deepText}`} />
        <p className="mt-1 font-display text-[2rem] font-extrabold leading-none text-ink">
          {new Date(event.startsAt).getDate()}
        </p>
        <p className="mt-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink/60">
          {formatDate(event.startsAt).split(" ").slice(1).join(" ")}
        </p>
        <p className="mt-1 text-[0.72rem] text-ink/50">
          {event.allDay ? "All day" : formatEventWhen(event).split(" · ")[1]}
        </p>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`tag ${tone.pill}`}>{event.branch?.name ?? "All branches"}</span>
          <span className="inline-flex items-center gap-1 text-[0.76rem] font-semibold text-ink/55">
            <MapPinIcon className="h-3.5 w-3.5" />
            {event.locationText}
          </span>
        </div>
        <h3 className="mt-2 font-display text-[1.4rem] font-extrabold leading-tight text-ink">
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-poppy-deep">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 max-w-2xl text-[0.92rem] leading-relaxed text-ink/65">
          {event.descriptionMd.replace(/[#*_>`]/g, "").slice(0, 180)}
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="squiggle-link mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-ink"
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
  const tone = toneStyle(programmeTone(programme.slug));
  return (
    <Link
      href={`/programmes/${programme.slug}`}
      className={`group grid gap-3 rounded-[26px_20px_30px_18px] ${tone.tint} p-5 shadow-[0_3px_0_rgb(34_40_74_/_0.12)] transition-transform hover:-rotate-[0.4deg] sm:grid-cols-[3rem_1fr_8rem_9rem_2rem] sm:items-center sm:gap-6 md:p-6`}
    >
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${tone.solid} font-display text-sm font-extrabold text-ink`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span>
        <span className="block font-display text-[1.65rem] font-extrabold leading-tight text-ink md:text-[2rem]">
          {programme.name}
        </span>
        <span className="mt-1 block max-w-xl text-[0.92rem] leading-relaxed text-ink/65">
          {programme.summary}
        </span>
      </span>
      <span className="text-[0.85rem] font-bold text-ink/60 sm:text-right">{programme.ageLabel}</span>
      <span className="text-[0.9rem] font-extrabold text-ink sm:text-right">
        {programme.monthlyFeeCents === null ? "R450 per day" : formatFee(programme.monthlyFeeCents)}
      </span>
      <span className="hidden sm:flex sm:justify-end">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-[0_2px_0_rgb(34_40_74_/_0.12)] transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}

export function BranchCard({ branch }: { branch: import("@/lib/types").Branch }) {
  const tone = toneStyle(branchTone(branch.slug));
  return (
    <article className={`group paper-card overflow-hidden ${tone.tint} p-4 sm:p-5`}>
      <Link href={`/branches/${branch.slug}`} className="block">
        <Photo
          src={branch.heroImage?.url ?? null}
          alt={branch.heroImage?.alt ?? `${branch.name} branch garden`}
          ratio="16 / 9"
          shape="paper"
          tone={branchTone(branch.slug)}
          sizes="(min-width: 1024px) 50vw, 100vw"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-[1.7rem] font-extrabold leading-tight text-ink">
          <Link href={`/branches/${branch.slug}`}>{branch.name}</Link>
        </h3>
        <span className={`tag ${tone.pill}`}>
          <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden />
          {branch.suburb}
        </span>
      </div>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/70">{branch.tagline}</p>
      <dl className="mt-4 space-y-2 text-[0.86rem] text-ink/65">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-bold text-ink/50">Hours</dt>
          <dd>{summariseHours(branch.hours)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-bold text-ink/50">Address</dt>
          <dd>{branch.addressLine1}, {branch.suburb}</dd>
        </div>
      </dl>
      <Link
        href={`/branches/${branch.slug}`}
        className="squiggle-link mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink"
      >
        Visit this garden <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function AlbumCard({ album }: { album: Album }) {
  const tone = toneStyle(branchTone(album.branch?.name));
  return (
    <article className="group paper-card flex flex-col bg-paper p-4">
      <Link href={`/gallery/${album.slug}`} className="block">
        <Photo
          src={album.cover?.url ?? null}
          alt={album.cover?.alt ?? album.title}
          ratio="4 / 3"
          shape="paper"
          tone={branchTone(album.branch?.name)}
          sizes="(min-width: 1024px) 33vw, 100vw"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className={`tag ${tone.pill}`}>{album.branch?.name ?? "Both branches"}</span>
        <span className="text-[0.76rem] font-bold text-ink/50">
          {album._count?.photos ?? album.photos?.length ?? 0} photos
        </span>
      </div>
      <h3 className="mt-2 font-display text-[1.45rem] font-extrabold leading-tight text-ink">
        <Link href={`/gallery/${album.slug}`}>{album.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[0.92rem] leading-relaxed text-ink/65">{album.description}</p>
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
    <article className="paper-card-plain grid gap-4 bg-paper p-4 sm:grid-cols-[1fr_10rem] sm:items-center sm:gap-8 sm:p-5">
      <div>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-poppy-deep">
          {documentLabels[document.category]}
          {document.branch ? ` · ${document.branch.name}` : " · All branches"}
        </p>
        <h3 className="mt-1 font-display text-[1.35rem] font-extrabold leading-tight text-ink">{document.title}</h3>
        <p className="mt-1.5 max-w-2xl text-[0.92rem] leading-relaxed text-ink/65">{document.description}</p>
      </div>
      <a
        href={`/api/public/documents/${document.id}/download`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-12 items-center gap-2 justify-self-start rounded-full border-2 border-ink/15 px-4 py-2.5 text-[0.84rem] font-bold text-ink transition-colors hover:bg-sun-tint sm:justify-self-end"
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
