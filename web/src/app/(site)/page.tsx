import Link from "next/link";
import type { Metadata } from "next";
import { getHome } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { formatDate, formatEventWhen, summariseHours, phoneHref } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { BranchCard, PostCard, ProgrammeRow } from "@/components/PublicCards";
import { SectionHeading, EditorialQuote, WhatsAppButton } from "@/components/Editorial";
import {
  Cloud,
  Chicken,
  HillDivider,
  MudPot,
  ScribbleField,
  ScribbleUnderline,
  Sun,
  Sunflower,
  Worm,
} from "@/components/brand";
import { branchTone, toneStyle } from "@/lib/tones";
import {
  ArrowRightIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
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
      "A small preschool in Randburg and Fourways where children play outside, get muddy and take their time.",
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
        <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-[34rem] w-[34rem] rounded-full bg-sun-tint/70 blur-3xl" />
        <Cloud className="pointer-events-none absolute left-[6%] top-16 h-20 w-32 text-paper md:h-28 md:w-44" />
        <Sun className="animate-sun pointer-events-none absolute right-6 top-8 h-24 w-24 text-sun md:right-[36%] md:h-36 md:w-36" />
        <ScribbleField className="pointer-events-none absolute -left-20 bottom-16 h-80 w-80 text-sky opacity-20" />

        <div className="page-container relative grid gap-12 pb-20 pt-12 md:pt-16 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28">
          <div className="lg:col-span-7">
            <p className="sticker bg-sun text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-poppy-deep" aria-hidden />
              Randburg and Fourways
            </p>
            <h1 className="display-xl mt-6 max-w-[11ch] text-ink">
              A small school with a{" "}
              <span className="relative inline-block">
                very big garden
                <ScribbleUnderline className="absolute -bottom-3 left-0 h-4 w-full text-poppy" />
              </span>
              .
            </h1>
            <p className="lead mt-8 max-w-xl">
              Children spend most of the day outside here. They dig, build, cook,
              collect worms and get properly dirty. A teacher is always close by,
              but never in a hurry.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/admissions#enquiry" size="md">
                Start an enquiry
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/programmes" variant="outline" size="md">
                See the programmes
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="paper-card rotate-[-1deg] bg-sun-tint p-4">
                <dt className="hand text-ink/75">Ages</dt>
                <dd className="mt-1 font-display text-[1.18rem] font-extrabold leading-tight text-ink">
                  18 months to Grade R
                </dd>
              </div>
              <div className="paper-card rotate-[1deg] bg-sky-tint p-4">
                <dt className="hand text-ink/75">Gardens</dt>
                <dd className="mt-1 font-display text-[1.18rem] font-extrabold leading-tight text-ink">
                  Two open branches
                </dd>
              </div>
              <div className="paper-card rotate-[-1deg] bg-meadow-tint p-4">
                <dt className="hand text-ink/75">The day</dt>
                <dd className="mt-1 font-display text-[1.18rem] font-extrabold leading-tight text-ink">
                  Mostly outside
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative lg:col-span-4 lg:col-start-9">
            <Sunflower className="absolute -bottom-12 -left-10 z-10 h-32 w-24 rotate-[-8deg] md:h-40 md:w-28" />
            <Worm className="absolute -right-8 top-8 z-10 h-16 w-24 rotate-6 text-poppy" />
            <Photo
              src={heroPhoto?.url ?? null}
              alt={heroPhoto?.alt ?? "Children in the Khanya Nature School garden"}
              ratio="4 / 5"
              priority
              shape="wobbly"
              tone="sun"
              sizes="(min-width: 1024px) 30vw, 100vw"
            />
            <div className="paper-card absolute -bottom-8 -left-4 z-20 max-w-[16rem] rotate-[-2deg] bg-paper p-4 sm:-left-8">
              <p className="hand text-poppy-deep">Open mornings</p>
              <p className="mt-1 text-[0.88rem] font-semibold leading-relaxed text-ink/75">
                Come and walk the garden on a weekday morning. Bring the children.
              </p>
              <Link
                href="/admissions#visit"
                className="squiggle-link mt-2 inline-flex items-center gap-1 text-[0.84rem] font-bold text-ink"
              >
                Arrange a visit <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
        <div aria-hidden className="relative -mb-px">
          <HillDivider className="h-14 w-full text-meadow sm:h-20" />
        </div>
      </section>

      <section className="bg-meadow-tint/50 pb-20 pt-4 md:pb-24">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <p className="sticker bg-paper text-ink">What we believe</p>
              <h2 className="display-lg mt-3 text-ink">
                Children are capable. Give them something worth doing.
              </h2>
            </div>
            <p className="lead lg:col-span-5 lg:col-start-8">
              We are not a worksheet school. We are a garden school. The work is
              real, the weather is real, and the children are trusted to get on
              with it.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Outside every day",
                body: "Rain, cold or heat, the day starts and ends in the garden. We keep spare boots, hats and jackets. We go out anyway.",
                tone: "bg-sun-tint",
                icon: <Sun className="h-9 w-9 text-sun-deep" />,
              },
              {
                title: "Small groups",
                body: "Never more than ten toddlers or sixteen older children, with two or three teachers. Everyone gets a turn, and a hand if they need one.",
                tone: "bg-sky-tint",
                icon: <Chicken className="h-10 w-10 text-sky-deep" />,
              },
              {
                title: "Proper jobs",
                body: "Tools, cooking, compost and growing food. The children can see what they made at the end of the day. That matters.",
                tone: "bg-poppy-tint",
                icon: <MudPot className="h-10 w-10 text-poppy-deep" />,
              },
            ].map((item, index) => (
              <article
                key={item.title}
                className={`paper-card ${item.tone} p-5 ${index === 1 ? "rotate-[0.8deg]" : "rotate-[-0.6deg]"}`}
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-paper shadow-[0_3px_0_rgb(34_40_74_/_0.12)]">
                  {item.icon}
                </div>
                <h3 className="font-display text-[1.35rem] font-extrabold leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.94rem] leading-relaxed text-ink/75">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <SectionHeading
            eyebrow="A day with us"
            title={
              <>
                The day has a shape. It is not a{" "}
                <span className="text-sky-deep">timetable</span>.
              </>
            }
            lead="There is always a morning circle and always lunch. The rest of the day has room to breathe. If the children are deep in a game, we let it run."
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
                shape="paper"
                tone="sky"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="mt-6">
                <EditorialQuote attribution="A note from our teachers">
                  The best classroom has mud on the floor, a spider worth watching
                  and an adult who is not in a hurry.
                </EditorialQuote>
              </div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <ol className="space-y-4">
                {[
                  {
                    time: "Morning",
                    title: "Arrive and settle",
                    body: "A teacher meets each child at the gate. Children find their friends, water a bed, or simply stand and watch until they are ready.",
                    tone: "bg-sun",
                  },
                  {
                    time: "Long middle",
                    title: "Go outside",
                    body: "The longest part of the day is outdoors. Dens, water, mud, tools, walking, cooking and the slow work of playing with other people.",
                    tone: "bg-meadow",
                  },
                  {
                    time: "Afternoon",
                    title: "Eat, rest, return",
                    body: "Lunch together, a quiet rest for those who need it, then back outside until collection. Nothing is rushed to make room for the next thing.",
                    tone: "bg-sky",
                  },
                ].map((item, index) => (
                  <li key={item.title} className="paper-card flex gap-4 bg-paper p-4">
                    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.tone} font-display text-lg font-extrabold text-ink shadow-[0_2px_0_rgb(34_40_74_/_0.12)]`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="hand text-ink/75">{item.time}</p>
                      <h3 className="mt-0.5 font-display text-[1.25rem] font-extrabold text-ink">{item.title}</h3>
                      <p className="mt-1 text-[0.92rem] leading-relaxed text-ink/75">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-sky-tint/60 py-16 md:py-20">
        <ScribbleField className="pointer-events-none absolute -right-16 top-0 h-72 w-72 text-sky opacity-25" />
        <div className="page-container relative">
          <SectionHeading
            eyebrow="Programmes"
            title="The right room for the right age."
            lead="Four term-time programmes and a holiday programme. Every one keeps the outdoor day at its centre, with a little more room to stretch as children grow."
            action={
              <ButtonLink href="/programmes" variant="outline" size="sm">
                All programmes
              </ButtonLink>
            }
          />
          <div className="mt-10 space-y-3">
            {home.programmes.map((programme, index) => (
              <ProgrammeRow key={programme.id} programme={programme} index={index} />
            ))}
          </div>
          <p className="hand mt-5 text-right text-ink/75">
            Fees for 2027. Monthly, unless the programme says otherwise.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Two gardens"
            title="Two gardens. Two sets of boots."
            lead="Each branch has its own ground, its own creatures and its own way of using the day. Both are small. Both spend most of the day outside."
            action={
              <ButtonLink href="/branches" variant="text">
                Compare branches <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-10">
            {home.branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>
      </section>

      {home.photos.length > 0 ? (
        <section className="relative overflow-hidden bg-meadow-tint/55 py-14 md:py-20">
          <div className="page-container relative">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">From the garden</p>
                <h2 className="display-md mt-3 text-ink">A week in pictures</h2>
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
                  className={`group ${index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}`}
                  aria-label={`View ${photo.album.title}: ${photo.alt}`}
                >
                  <Photo
                    src={photo.media.url}
                    alt={photo.media.alt ?? photo.alt}
                    ratio={index % 3 === 0 ? "3 / 4" : "1 / 1"}
                    shape="paper"
                    tone={index % 3 === 0 ? "sun" : index % 3 === 1 ? "sky" : "meadow"}
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
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="sticker bg-sun-tint text-ink">From the school</p>
                <h2 className="display-md mt-3 text-ink">News and notices</h2>
              </div>
              <ButtonLink href="/news" variant="text" size="sm">
                All news <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-7 space-y-5">
              {home.posts.slice(0, 2).map((post, index) => (
                <PostCard key={post.id} post={post} priority={index === 0} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="sticker bg-poppy-tint text-ink">What is coming</p>
                <h2 className="display-md mt-3 text-ink">Events</h2>
              </div>
              <ButtonLink href="/events" variant="text" size="sm">
                Calendar <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            {home.events.length > 0 ? (
              <ul className="mt-7 space-y-4">
                {home.events.map((event) => {
                  const tone = toneStyle(branchTone(event.branch?.slug ?? event.branch?.name));
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.slug}`}
                        className={`group paper-card grid grid-cols-[4rem_1fr] gap-4 ${tone.tint} p-4 transition-transform hover:-rotate-[0.5deg]`}
                      >
                        <div className="flex flex-col items-center justify-center rounded-[18px_14px_20px_12px] bg-paper p-2 text-center">
                          <CalendarIcon className={`h-4 w-4 ${tone.deepText}`} />
                          <p className="mt-1 font-display text-[1.7rem] font-extrabold leading-none text-ink">
                            {new Date(event.startsAt).getDate()}
                          </p>
                          <p className="mt-0.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] text-ink/75">
                            {formatDate(event.startsAt).split(" ").slice(1).join(" ")}
                          </p>
                        </div>
                        <div>
                          <span className={`tag ${tone.pill}`}>{event.branch?.name ?? "All branches"}</span>
                          <h3 className="mt-1.5 font-display text-[1.15rem] font-extrabold leading-tight text-ink group-hover:text-poppy-deep">
                            {event.title}
                          </h3>
                          <p className="mt-1 text-[0.78rem] font-semibold text-ink/75">
                            {formatEventWhen(event)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="paper-card mt-7 bg-paper p-5 text-[0.94rem] text-ink/75">
                No events are listed just now. Check back soon, or join us for an
                ordinary morning in the garden.
              </p>
            )}

            {nextEvent ? (
              <div className="paper-card mt-5 rotate-[0.6deg] bg-sun p-5">
                <p className="hand text-ink/75">Next at the garden</p>
                <p className="mt-1 font-display text-[1.25rem] font-extrabold leading-tight text-ink">
                  {nextEvent.title}
                </p>
                <p className="mt-1.5 text-[0.84rem] font-semibold text-ink/75">
                  {formatEventWhen(nextEvent)}
                </p>
                <ButtonLink href={`/events/${nextEvent.slug}`} variant="light" className="mt-4 text-[0.84rem]">
                  Details <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-poppy-deep text-white">
        <Worm className="pointer-events-none absolute -right-6 top-8 h-20 w-28 rotate-12 text-sun" />
        <div className="page-container relative grid gap-12 py-16 lg:grid-cols-12 lg:gap-16 md:py-20">
          <div className="lg:col-span-7">
            <p className="tag bg-sun text-ink">Admissions</p>
            <h2 className="display-lg mt-4 text-white">
              Come and see whether it fits.
            </h2>
            <p className="mt-5 max-w-xl text-[1.08rem] leading-relaxed text-white">
              The first step is a visit. Walk the garden, meet a teacher, ask the
              awkward questions. If it feels right, we will help you with the rest.
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
                onInk
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <ol className="space-y-3">
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
                <li key={step.title} className="paper-card-plain bg-paper p-4 text-ink">
                  <div className="flex gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun font-display font-extrabold text-ink">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.2rem] font-extrabold leading-tight text-ink">{step.title}</h3>
                      <p className="mt-1 text-[0.9rem] leading-relaxed text-ink/75">{step.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="page-container relative border-t-2 border-white/15 pb-12 pt-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.branches.map((branch) => {
              const tone = toneStyle(branchTone(branch.slug));
              return (
                <div key={branch.id} className={`paper-card-plain ${tone.tint} p-4 text-ink`}>
                  <h3 className="font-display text-[1.1rem] font-extrabold">{branch.name}</h3>
                  <p className="mt-1 flex items-start gap-1.5 text-[0.82rem] text-ink/75">
                    <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {branch.addressLine1}, {branch.suburb}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[0.82rem] text-ink/75">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {summariseHours(branch.hours)}
                  </p>
                  <a href={phoneHref(branch.phone)} className="mt-1 inline-flex min-h-8 items-center text-[0.82rem] font-bold text-ink/75 hover:text-poppy-deep">
                    {branch.phone}
                  </a>
                </div>
              );
            })}
            <div className="paper-card-plain bg-paper p-4 text-ink">
              <h3 className="font-display text-[1.1rem] font-extrabold">Follow the seasons</h3>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/75">
                Photos, garden news and the odd chicken update.
              </p>
              <div className="mt-3 flex items-center gap-2">
                {settings?.socialFacebook ? (
                  <a href={settings.socialFacebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sun-tint text-ink hover:bg-sun">
                    <FacebookIcon />
                  </a>
                ) : null}
                {settings?.socialInstagram ? (
                  <a href={settings.socialInstagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-meadow-tint text-ink hover:bg-meadow">
                    <InstagramIcon />
                  </a>
                ) : null}
                {settings?.socialYoutube ? (
                  <a href={settings.socialYoutube} target="_blank" rel="noreferrer" aria-label="YouTube" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-tint text-ink hover:bg-sky">
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
