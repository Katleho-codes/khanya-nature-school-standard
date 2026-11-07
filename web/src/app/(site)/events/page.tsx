import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "@/lib/api";
import { getNav } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { formatDateLong, formatEventWhen, monthKey } from "@/lib/format";
import { PageIntro } from "@/components/PageIntro";
import { EventsCalendar } from "@/components/EventsCalendar";
import { ButtonLink } from "@/components/Button";
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from "@/components/icons";

interface PageProps {
  searchParams: Promise<{ branch?: string; month?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Events and open days",
    description:
      "Open mornings, family evenings, fire circles and garden days at Khanya Nature School in Randburg and Fourways. See the calendar and add events to yours.",
    path: "/events",
  });
}

function monthParam(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value;
  return monthKey(new Date());
}

function branchHref(branch: string | undefined): string {
  return branch ? `/events?branch=${branch}` : "/events";
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const branch = params.branch ?? "";
  const initialMonth = monthParam(params.month);
  const [{ events }, { events: upcomingEvents }, nav] = await Promise.all([
    getEvents({ branch: branch || undefined, limit: 100 }),
    getEvents({ branch: branch || undefined, upcoming: true, limit: 100 }),
    getNav(),
  ]);
  const activeBranch = nav.branches.find((item) => item.slug === branch);
  const next = upcomingEvents[0] ?? null;

  return (
    <>
      <PageIntro
        eyebrow="Events"
        title={
          <>
            The garden has a <span className="text-poppy-deep">calendar.</span>
          </>
        }
        lead="Open mornings, family evenings, fire circles and the occasional working bee. Most events are free. Some need a reply so we can set enough chairs."
        crumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
      />

      {next ? (
        <section className="page-container pb-12">
          <div className="grid gap-8 paper-card rotate-[-0.3deg] bg-sun p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="flex items-center gap-2 hand text-poppy-deep">
                <CalendarIcon className="h-4 w-4" />
                Next event
              </p>
              <h2 className="display-md mt-1 text-ink">{next.title}</h2>
              <p className="mt-2 text-[0.9rem] font-semibold text-ink/70">
                {formatDateLong(next.startsAt)} · {formatEventWhen(next)}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.82rem] text-ink/65">
                <MapPinIcon className="h-3.5 w-3.5" />
                {next.locationText}
                {next.branch ? ` · ${next.branch.name}` : " · All branches"}
              </p>
            </div>
            <ButtonLink href={`/events/${next.slug}`}>
              Event details <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      ) : null}

      <section className="page-container pb-10">
        <div className="flex flex-col gap-4 rounded-[24px] bg-sky-tint/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-hand text-[1.05rem] text-ink/65">Branch</span>
            <Link
              href={branchHref(undefined)}
              aria-current={!branch ? "page" : undefined}
              className={`inline-flex min-h-9 items-center rounded-full border-2 px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${
                !branch
                  ? "border-ink bg-sun text-ink"
                  : "border-ink/15 bg-paper text-ink/70 hover:border-ink hover:bg-sun-tint hover:text-ink"
              }`}
            >
              All branches
            </Link>
            {nav.branches.map((item) => {
              const active = branch === item.slug;
              return (
                <Link
                  key={item.id}
                  href={branchHref(item.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-full border-2 px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${
                    active
                      ? "border-ink bg-sun text-ink"
                      : "border-ink/15 bg-paper text-ink/70 hover:border-ink hover:bg-sun-tint hover:text-ink"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <p className="text-[0.75rem] text-ink/65">
            {activeBranch
              ? `Events at ${activeBranch.name} and school-wide events.`
              : "All events, including school-wide dates."}
          </p>
        </div>
      </section>

      <section className="page-container pb-16 md:pb-24">
        <EventsCalendar events={events} initialMonth={initialMonth} />
      </section>

      <section className="border-t border-ink/10 bg-sun-tint/35 section">
        <div className="page-container grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="sticker bg-paper text-ink">Practical notes</p>
            <h2 className="display-lg mt-3 text-ink">Before you come.</h2>
            <p className="mt-4 text-[0.94rem] leading-relaxed text-ink/65">
              Events happen outside unless the weather is dangerous. Bring a hat,
              a water bottle and shoes that can cope with the garden.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {[
              {
                title: "Reply when asked",
                body: "If an event has limited places, the detail page explains how to reply. Open mornings usually do not need a booking.",
                tone: "bg-paper",
              },
              {
                title: "Parking",
                body: "Park on the street and please keep neighbours' gates clear. The branches are on quiet residential roads.",
                tone: "bg-sky-tint",
              },
              {
                title: "Children welcome",
                body: "Family events are designed for children. For parent evenings, we usually offer a simple supper and a quiet room.",
                tone: "bg-meadow-tint",
              },
              {
                title: "Weather",
                body: "We only cancel for lightning, high wind or unsafe ground. A little rain is part of the plan.",
                tone: "bg-poppy-tint",
              },
            ].map((item) => (
              <div key={item.title} className={`paper-card ${item.tone} p-4`}>
                <h3 className="font-display text-[1.2rem] font-extrabold text-ink">{item.title}</h3>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-ink/65">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
