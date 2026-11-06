import Link from "next/link";
import type { Metadata } from "next";
import { getHome } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { formatDate, formatEventWhen, summariseHours, phoneHref } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { ProgrammeRow, BranchCard, PostCard } from "@/components/PublicCards";
import { SectionHeading, EditorialQuote, WhatsAppButton } from "@/components/Editorial";
import {
  ArrowRightIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  MapPinIcon,
  ClockIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: "/",
  });
}

export default async function HomePage() {
  const home = await getHome();
  const settings = home.settings;
  const featuredBranch = home.branches[0] ?? null;
  const heroPhoto = featuredBranch?.heroImage ?? home.photos[0]?.media ?? null;
  const nextEvent = home.events[0] ?? null;

  const organisation = {
    "@context": "https://schema.org",
    "@type": "Preschool",
    name: settings?.schoolName ?? "Khanya Nature School",
    url: siteUrl(),
    description:
      settings?.defaultSeoDescription ??
      "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors.",
    telephone: featuredBranch?.phone,
    email: featuredBranch?.email ?? "hello@khanyanatureschool.example",
    address: home.branches.map((branch) => ({
      "@type": "PostalAddress",
      streetAddress: branch.addressLine1,
      addressLocality: branch.suburb,
      addressRegion: branch.province,
      postalCode: branch.postalCode,
      addressCountry: "ZA",
    })),
    sameAs: [
      settings?.socialFacebook,
      settings?.socialInstagram,
      settings?.socialYoutube,
    ].filter(Boolean),
    openingHours: "Mo-Fr 07:00-17:00",
    areaServed: ["Randburg", "Fourways", "Johannesburg"],
  };

  return (
    <>
      <JsonLd data={organisation} />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-20 h-[30rem] w-[22rem] text-sage-deep opacity-[0.07] md:right-10 md:top-10"
        >
          <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" strokeWidth="0.8" className="h-full w-full">
            <path d="M60 154C60 108 59 58 60 8" />
            <path d="M60 132C45 124 34 112 31 98c14 1 25 9 29 22" />
            <path d="M60 132c15-8 26-20 29-34-14 1-25 9-29 22" />
            <path d="M60 106C43 98 31 84 30 68c15 1 26 11 30 25" />
            <path d="M60 106c17-8 29-22 30-38-15 1-26 11-30 25" />
          </svg>
        </div>

        <div className="page-container relative grid gap-10 pb-14 pt-10 md:pb-20 md:pt-16 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="label-caps flex flex-wrap items-center gap-x-3 gap-y-1 text-sage-deep">
              <span>Nature-based preschool</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-ochre" />
              <span>Randburg and Fourways</span>
            </p>
            <h1 className="display-xl mt-5 max-w-[12ch] text-forest">
              Let childhood{" "}
              <span className="italic text-sage-deep">take its time.</span>
            </h1>
            <p className="lead mt-7 max-w-xl">
              A small, outdoor-first preschool where children spend most of the
              day in the garden. Real weather, real tools, unhurried play and
              teachers who know every child by name.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/admissions#enquiry" size="md">
                Start an enquiry
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/programmes" variant="outline" size="md">
                Explore programmes
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-5">
              <div>
                <dt className="label-caps text-sage-deep">Ages</dt>
                <dd className="mt-1 font-display text-[1.35rem] leading-tight text-forest">
                  18 months to Grade R
                </dd>
              </div>
              <div>
                <dt className="label-caps text-sage-deep">Gardens</dt>
                <dd className="mt-1 font-display text-[1.35rem] leading-tight text-forest">
                  Two open branches
                </dd>
              </div>
              <div>
                <dt className="label-caps text-sage-deep">The day</dt>
                <dd className="mt-1 font-display text-[1.35rem] leading-tight text-forest">
                  Mostly outside
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div className="relative">
              <Photo
                src={heroPhoto?.url ?? null}
                alt={heroPhoto?.alt ?? "Children in the Khanya Nature School garden"}
                ratio="4 / 5"
                priority
                shape="wobbly"
                tone="sun"
                sizes="(min-width: 1024px) 30vw, 100vw"
              />
              <div className="absolute -bottom-5 -left-3 max-w-[15rem] border border-line bg-paper p-4 shadow-[0_1px_0_0_var(--color-line)] sm:-left-5">
                <p className="label-caps text-sage-deep">Open mornings</p>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-bark">
                  Walk the garden with us on a weekday morning. Children welcome.
                </p>
                <Link
                  href="/admissions#visit"
                  className="mark-link mt-2 inline-flex items-center gap-1 text-[0.78rem] text-forest"
                >
                  Arrange a visit <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="page-container grid gap-8 py-10 md:grid-cols-3 md:gap-12 md:py-12">
          <div className="md:col-span-1">
            <p className="label-caps text-sage-deep">Our starting point</p>
            <p className="mt-3 font-display text-[1.65rem] leading-[1.2] text-forest">
              Children are capable. The garden gives them something worth doing.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 md:col-span-2">
            {[
              {
                title: "Outside every day",
                body: "Rain, cold or heat, the day begins and ends in the garden. We dress for it and keep going.",
              },
              {
                title: "Small groups",
                body: "Never more than ten toddlers or sixteen older children, with two or three teachers.",
              },
              {
                title: "Real work",
                body: "Tools, cooking, compost and growing food. The outcomes are visible and worth finishing.",
              },
            ].map((item) => (
              <div key={item.title} className="border-t border-line pt-4">
                <h2 className="font-display text-[1.2rem] text-forest">{item.title}</h2>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-bark-soft">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <SectionHeading
            eyebrow="The shape of a day"
            title={
              <>
                A school day that <span className="italic text-sage-deep">breathes.</span>
              </>
            }
            lead="There is a rhythm, not a timetable. Arrival and free play, a morning circle, a long stretch outside, food, rest and more time to finish what was started."
            action={
              <ButtonLink href="/about" variant="text">
                How we work <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            }
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
            <div className="lg:col-span-6">
              <Photo
                src={home.photos[1]?.media.url ?? heroPhoto?.url ?? null}
                alt={
                  home.photos[1]?.media.alt ??
                  "Natural materials and outdoor play at Khanya Nature School"
                }
                ratio="3 / 2"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="mt-8">
                <EditorialQuote attribution="A note from our teachers">
                  The best classroom has mud on the floor, a spider worth
                  watching and an adult who is not in a hurry.
                </EditorialQuote>
              </div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <ol className="space-y-7">
                {[
                  {
                    time: "Morning",
                    title: "Arrive and settle",
                    body: "A teacher greets each child at the gate. Children find their friends, water a bed, or simply stand and watch until they are ready.",
                  },
                  {
                    time: "Long middle",
                    title: "Go outside",
                    body: "The longest part of the day is outdoors. Dens, water, clay, tools, walking, cooking and the slow work of playing with other people.",
                  },
                  {
                    time: "Afternoon",
                    title: "Eat, rest, return",
                    body: "Lunch together, a quiet rest for those who need it, then back outside until collection. Nothing is rushed to make room for the next thing.",
                  },
                ].map((item, index) => (
                  <li key={item.title} className="grid grid-cols-[2.4rem_1fr] gap-4">
                    <span className="pt-1 text-[0.72rem] tracking-[0.15em] text-sage-deep">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="border-t border-line pt-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-sage-deep">
                        {item.time}
                      </p>
                      <h3 className="mt-1 font-display text-[1.4rem] text-forest">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Programmes"
            title="The right room for the right age."
            lead="Four term-time programmes and a holiday programme. Each one keeps the outdoor day at its centre, with more room to stretch as children grow."
            action={
              <ButtonLink href="/programmes" variant="outline" size="sm">
                All programmes
              </ButtonLink>
            }
          />
          <div className="mt-10">
            <div className="hidden grid-cols-[3rem_1fr_8rem_9rem_2rem] gap-6 border-b border-line pb-3 text-[0.65rem] uppercase tracking-[0.16em] text-sage-deep sm:grid">
              <span>No.</span>
              <span>Programme</span>
              <span className="text-right">Age</span>
              <span className="text-right">Monthly fee</span>
              <span />
            </div>
            {home.programmes.map((programme, index) => (
              <ProgrammeRow key={programme.id} programme={programme} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Two gardens"
            title="Come and stand in the shade."
            lead="Each branch has its own ground, its own creatures and its own way of using the day. Both are small, and both are outdoors first."
            action={
              <ButtonLink href="/branches" variant="text">
                Compare branches <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-10">
            {home.branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>
      </section>

      {home.photos.length > 0 ? (
        <section className="border-y border-line bg-sage-tint/40 py-10 md:py-14">
          <div className="page-container">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label-caps text-sage-deep">From the garden</p>
                <h2 className="display-md mt-2 text-forest">A week in pictures</h2>
              </div>
              <ButtonLink href="/gallery" variant="text">
                Open the gallery <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
              {home.photos.map((photo, index) => (
                <Link
                  key={photo.id}
                  href={`/gallery/${photo.album.slug}`}
                  className="group"
                  aria-label={`View ${photo.album.title}: ${photo.alt}`}
                >
                  <Photo
                    src={photo.media.url}
                    alt={photo.media.alt ?? photo.alt}
                    ratio={index % 3 === 0 ? "3 / 4" : "1 / 1"}
                    sizes="(min-width: 768px) 20vw, 50vw"
                    imageClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="page-container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="label-caps text-sage-deep">From the school</p>
                <h2 className="display-md mt-2 text-forest">News and notices</h2>
              </div>
              <ButtonLink href="/news" variant="text" size="sm">
                All news <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-6 space-y-7">
              {home.posts.slice(0, 2).map((post, index) => (
                <PostCard key={post.id} post={post} priority={index === 0} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border-t border-line pt-4 lg:border-t-0 lg:pt-0">
              <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="label-caps text-sage-deep">What is coming</p>
                  <h2 className="display-md mt-2 text-forest">Events</h2>
                </div>
                <ButtonLink href="/events" variant="text" size="sm">
                  Calendar <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
              {home.events.length > 0 ? (
                <ul className="divide-y divide-line">
                  {home.events.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="group grid grid-cols-[3.6rem_1fr] gap-4 py-5"
                      >
                        <div>
                          <p className="font-display text-[1.85rem] leading-none text-forest">
                            {new Date(event.startsAt).getDate()}
                          </p>
                          <p className="mt-1 text-[0.64rem] uppercase tracking-[0.15em] text-sage-deep">
                            {formatDate(event.startsAt).split(" ").slice(1).join(" ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.66rem] uppercase tracking-[0.13em] text-sage-deep">
                            {event.branch?.name ?? "All branches"}
                          </p>
                          <h3 className="mt-1 font-display text-[1.16rem] leading-tight text-forest group-hover:text-sage-deep">
                            {event.title}
                          </h3>
                          <p className="mt-1 text-[0.75rem] text-bark-soft">
                            {formatEventWhen(event)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-sm text-bark-soft">
                  No events are listed just now. Check back soon.
                </p>
              )}
            </div>

            {nextEvent ? (
              <div className="mt-7 border border-line bg-paper p-5">
                <p className="label-caps text-sage-deep">Next at the garden</p>
                <p className="mt-2 font-display text-[1.25rem] leading-tight text-forest">
                  {nextEvent.title}
                </p>
                <p className="mt-1.5 text-[0.8rem] text-bark-soft">
                  {formatEventWhen(nextEvent)}
                </p>
                <ButtonLink href={`/events/${nextEvent.slug}`} variant="text" className="mt-3 text-[0.82rem]">
                  Details <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-forest bg-forest text-oat">
        <div className="page-container grid gap-12 py-4 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="label-caps text-oat/60">Admissions</p>
            <h2 className="display-lg mt-3 text-oat">
              Come and see whether it fits.
            </h2>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-oat/75">
              The first step is a visit. Walk the garden, meet a teacher, ask the
              awkward questions. If it feels right, we will help you with the
              rest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/admissions#enquiry" variant="light" size="md">
                Start an enquiry
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <WhatsAppButton
                number={featuredBranch?.whatsapp ?? "27825550100"}
                message="Hello Khanya Nature School, I would like to arrange a visit to the school."
                label="WhatsApp the school"
                className="border-oat/35 text-oat hover:border-oat hover:bg-oat hover:text-forest"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <ol className="space-y-5">
              {[
                {
                  title: "Enquire online",
                  body: "Tell us your child's age, the branch you are considering and what you would like to know.",
                },
                {
                  title: "Visit the garden",
                  body: "A weekday morning, about an hour. Children are welcome and encouraged to explore.",
                },
                {
                  title: "Apply with confidence",
                  body: "We send the form and fee schedule after the visit. Places are offered in order of application.",
                },
              ].map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-line-inverse pt-4">
                  <span className="text-[0.72rem] text-ochre">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[1.25rem] text-oat">{step.title}</h3>
                    <p className="mt-1 text-[0.84rem] leading-relaxed text-oat/65">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="page-container mt-12 border-t border-line-inverse py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.branches.map((branch) => (
              <div key={branch.id}>
                <h3 className="font-display text-[1.1rem] text-oat">{branch.name}</h3>
                <p className="mt-1 flex items-start gap-1.5 text-[0.78rem] text-oat/65">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {branch.addressLine1}, {branch.suburb}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[0.78rem] text-oat/65">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {summariseHours(branch.hours)}
                </p>
                <a href={phoneHref(branch.phone)} className="mt-1 inline-block text-[0.78rem] text-oat/80 hover:text-ochre">
                  {branch.phone}
                </a>
              </div>
            ))}
            <div>
              <h3 className="font-display text-[1.1rem] text-oat">Follow the seasons</h3>
              <div className="mt-2 flex items-center gap-2">
                {settings?.socialFacebook ? (
                  <a href={settings.socialFacebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="border border-line-inverse p-2 text-oat/70 hover:border-ochre hover:text-ochre">
                    <FacebookIcon />
                  </a>
                ) : null}
                {settings?.socialInstagram ? (
                  <a href={settings.socialInstagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="border border-line-inverse p-2 text-oat/70 hover:border-ochre hover:text-ochre">
                    <InstagramIcon />
                  </a>
                ) : null}
                {settings?.socialYoutube ? (
                  <a href={settings.socialYoutube} target="_blank" rel="noreferrer" aria-label="YouTube" className="border border-line-inverse p-2 text-oat/70 hover:border-ochre hover:text-ochre">
                    <YouTubeIcon />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
