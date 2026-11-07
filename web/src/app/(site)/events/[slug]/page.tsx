import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getEvents } from "@/lib/api";
import { formatDateLong, formatEventWhen, formatTime } from "@/lib/format";
import { breadcrumbSchema, pageMetadata } from "@/lib/metadata";
import { renderMarkdown } from "@/lib/markdown";
import { siteUrl } from "@/lib/site";
import { PageIntro } from "@/components/PageIntro";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRightIcon, CalendarIcon, DownloadIcon, MapPinIcon } from "@/components/icons";
import { branchTone, toneStyle } from "@/lib/tones";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEvent(slug);
  if (!result) {
    return pageMetadata({
      title: "Event not found",
      description: "That event could not be found.",
      path: `/events/${slug}`,
    });
  }
  const { event } = result;
  return pageMetadata({
    title: event.seoTitle ?? event.title,
    description:
      event.seoDescription ??
      `${event.title} at Khanya Nature School on ${formatDateLong(event.startsAt)}.`,
    path: `/events/${event.slug}`,
    image: event.cover?.url ?? null,
    type: "article",
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getEvent(slug);
  if (!result) notFound();
  const { event } = result;
  const body = await renderMarkdown(event.descriptionMd);
  const allEvents = await getEvents({ upcoming: true, limit: 4 });
  const later = allEvents.events.filter((item) => item.id !== event.id).slice(0, 3);
  const toneName = branchTone(event.branch?.slug ?? event.branch?.name);
  const tone = toneStyle(toneName);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          startDate: event.startsAt,
          endDate: event.endsAt,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          description: event.descriptionMd.replace(/[#*_>`]/g, "").slice(0, 400),
          image: event.cover?.url
            ? `${siteUrl()}${event.cover.url}`
            : `${siteUrl()}/images/og-default.jpg`,
          location: {
            "@type": "Place",
            name: event.branch?.name ?? "Khanya Nature School",
            address: event.locationText,
          },
          organizer: {
            "@type": "Organization",
            name: "Khanya Nature School",
            url: siteUrl(),
          },
          url: `${siteUrl()}/events/${event.slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: event.title, path: `/events/${event.slug}` },
        ])}
      />

      <PageIntro
        eyebrow={`${event.branch?.name ?? "All branches"} · ${
          event.allDay ? "All day" : `${formatTime(event.startsAt)} to ${formatTime(event.endsAt)}`
        }`}
        title={event.title}
        lead={`${formatDateLong(event.startsAt)} at ${event.locationText}.`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
        aside={
          <div className="mt-6 flex flex-wrap gap-3 paper-card-plain bg-paper p-3">
            <a
              href={`/api/public/events/${event.slug}/ics`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-b-4 border-ink/30 bg-poppy-deep px-5 py-3 text-[0.9rem] font-extrabold text-white transition-colors hover:bg-poppy-deep hover:brightness-110"
            >
              <DownloadIcon className="h-4 w-4" />
              Add to calendar
            </a>
            <ButtonLink href="/events" variant="outline">
              All events
            </ButtonLink>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Photo
              src={event.cover?.url ?? null}
              alt={event.cover?.alt ?? event.title}
              ratio="16 / 8"
              priority
              shape="paper"
              tone={toneName}
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
            <div
              className="prose-playful mt-8 rounded-[28px_22px_30px_18px] bg-paper p-5 sm:p-7"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-32 space-y-6">
              <div className={`paper-card ${tone.tint} p-5`}>
                <p className="hand text-poppy-deep">When</p>
                <p className="mt-1 font-display text-[1.35rem] font-extrabold leading-tight text-ink">
                  {formatDateLong(event.startsAt)}
                </p>
                <p className="mt-1 text-[0.86rem] text-ink/75">
                  {event.allDay
                    ? "All day"
                    : `${formatTime(event.startsAt)} to ${formatTime(event.endsAt)}`}
                </p>
                <p className="mt-1 text-[0.76rem] text-ink/75">
                  Times are South African Standard Time.
                </p>

                <div className="mt-5 border-t border-ink/10 pt-4">
                  <p className="hand text-poppy-deep">Where</p>
                  <p className="mt-1 flex items-start gap-2 text-[0.88rem] leading-relaxed text-ink">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-poppy-deep" />
                    {event.locationText}
                  </p>
                  {event.branch ? (
                    <Link
                      href={`/branches/${event.branch.slug}`}
                      className="squiggle-link mt-2 inline-flex min-h-8 items-center gap-1.5 text-[0.8rem] font-bold text-ink"
                    >
                      About {event.branch.name} <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>

                <a
                  href={`/api/public/events/${event.slug}/ics`}
                  className="squiggle-link mt-5 inline-flex min-h-8 items-center gap-1.5 text-[0.82rem] font-bold text-ink"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Download the calendar file
                </a>
              </div>

              <div className="paper-card-plain bg-paper p-4">
                <p className="hand text-poppy-deep">Need to ask?</p>
                <p className="mt-1 text-[0.84rem] leading-relaxed text-ink/75">
                  The office can help with accessibility, parking, children or
                  anything else that would make the event easier.
                </p>
                <ButtonLink href="/contact" variant="outline" className="mt-3 w-full" size="sm">
                  Contact the office
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {later.length > 0 ? (
        <section className="border-t border-ink/10 bg-meadow-tint/35 section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">Later in the garden</p>
                <h2 className="display-md mt-2 text-ink">Other events</h2>
              </div>
              <ButtonLink href="/events" variant="text" size="sm">
                Calendar <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <ul className="mt-6 space-y-3">
              {later.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/events/${item.slug}`}
                    className="group grid gap-3 paper-card-plain bg-paper p-4 transition-transform hover:-rotate-[0.4deg] sm:grid-cols-[6rem_1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-display text-[1.7rem] font-extrabold leading-none text-poppy-deep">
                        {formatDateLong(item.startsAt).split(" ")[1]}
                      </p>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink/75">
                        {formatDateLong(item.startsAt).split(" ")[2]}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-[1.25rem] font-extrabold text-ink group-hover:text-poppy-deep">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[0.8rem] text-ink/75">
                        {formatEventWhen(item)} · {item.locationText}
                      </p>
                    </div>
                    <ArrowRightIcon className="hidden h-4 w-4 text-ink sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
