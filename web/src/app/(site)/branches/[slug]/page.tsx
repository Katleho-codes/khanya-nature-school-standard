import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranch } from "@/lib/api";
import { pageMetadata, breadcrumbSchema } from "@/lib/metadata";
import { renderMarkdown } from "@/lib/markdown";
import { siteUrl } from "@/lib/site";
import {
  formatDate,
  formatEventWhen,
  formatFee,
  phoneHref,
  summariseHours,
} from "@/lib/format";
import { branchWhatsappMessage } from "@/lib/whatsapp";
import { PageIntro } from "@/components/PageIntro";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { Fact, HoursTable, WhatsAppButton } from "@/components/Editorial";
import { AlbumCard, PostCard } from "@/components/PublicCards";
import {
  ArrowRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { branchTone, toneStyle } from "@/lib/tones";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBranch(slug);
  if (!result) {
    return pageMetadata({
      title: "Branch not found",
      description: "That branch could not be found.",
      path: `/branches/${slug}`,
    });
  }
  const { branch } = result;
  return pageMetadata({
    title: branch.seoTitle ?? `${branch.name} nature preschool`,
    description:
      branch.seoDescription ??
      `${branch.tagline} Find ${branch.name} at ${branch.addressLine1}, ${branch.suburb}.`,
    path: `/branches/${branch.slug}`,
    image: branch.heroImage?.url ?? null,
  });
}

export default async function BranchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getBranch(slug);
  if (!result) notFound();
  const { branch } = result;
  const body = await renderMarkdown(branch.description);
  const mapQuery =
    branch.lat !== null && branch.lng !== null
      ? `${branch.lat},${branch.lng}`
      : encodeURIComponent(
          `${branch.addressLine1}, ${branch.suburb}, ${branch.city}, ${branch.postalCode}`,
        );
  const tone = toneStyle(branchTone(branch.slug));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Preschool",
          name: `Khanya Nature School, ${branch.name}`,
          url: `${siteUrl()}/branches/${branch.slug}`,
          telephone: branch.phone,
          email: branch.email,
          description: branch.seoDescription ?? branch.tagline,
          address: {
            "@type": "PostalAddress",
            streetAddress: branch.addressLine1,
            addressLocality: branch.suburb,
            addressRegion: branch.province,
            postalCode: branch.postalCode,
            addressCountry: "ZA",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "07:00",
              closes: "17:00",
            },
          ],
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Branches", path: "/branches" },
          { name: branch.name, path: `/branches/${branch.slug}` },
        ])}
      />

      <PageIntro
        eyebrow={`${branch.suburb}, ${branch.city}`}
        title={branch.name}
        lead={branch.tagline}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Branches", href: "/branches" },
          { label: branch.name },
        ]}
        aside={
          <div className="mt-6 flex flex-wrap gap-3 paper-card-plain bg-paper p-3">
            <ButtonLink href={`/admissions?branch=${branch.slug}#enquiry`} size="sm">
              Enquire at this branch
            </ButtonLink>
            <WhatsAppButton
              number={branch.whatsapp}
              message={branchWhatsappMessage(branch.name)}
              label="WhatsApp"
              className="px-4 py-2.5 text-[0.82rem]"
            />
          </div>
        }
      />

      <section className="page-container pb-14 md:pb-20">
        <Photo
          src={branch.heroImage?.url ?? null}
          alt={branch.heroImage?.alt ?? `The garden at ${branch.name}`}
          ratio="16 / 7"
          priority
          shape="paper"
          tone={branchTone(branch.slug)}
          sizes="(min-width: 1024px) 90vw, 100vw"
        />
      </section>

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div
              className={`prose-playful rounded-[28px_22px_30px_18px] ${tone.tint} p-5 sm:p-7`}
              dangerouslySetInnerHTML={{ __html: body }}
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="paper-card bg-paper p-4">
                <h2 className="font-display text-[1.35rem] font-extrabold text-ink">Opening hours</h2>
                <div className="mt-3">
                  <HoursTable hours={branch.hours} />
                </div>
                <p className="mt-3 text-[0.76rem] leading-relaxed text-ink/60">
                  {summariseHours(branch.hours)}. We close on public holidays.
                </p>
              </div>
              <div className="paper-card bg-paper p-4">
                <h2 className="font-display text-[1.35rem] font-extrabold text-ink">Find us</h2>
                <address className="mt-3 not-italic">
                  <p className="flex items-start gap-2 text-[0.88rem] leading-relaxed text-ink/65">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-poppy-deep" />
                    <span>
                      {branch.addressLine1}
                      <br />
                      {branch.suburb}, {branch.city}
                      <br />
                      {branch.province}, {branch.postalCode}
                    </span>
                  </p>
                </address>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="squiggle-link mt-3 inline-flex min-h-8 items-center gap-1.5 text-[0.82rem] font-bold text-ink"
                >
                  Get directions <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
                <p className="mt-3 text-[0.78rem] leading-relaxed text-ink/60">
                  Parking is on the street. Please do not block the neighbours&apos;
                  gates at drop-off.
                </p>
              </div>
            </div>

            {branch.programmes.length > 0 ? (
              <div className="mt-10">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="display-md text-ink">Programmes here</h2>
                  <ButtonLink href="/programmes" variant="text" size="sm">
                    All programmes <ArrowRightIcon className="h-3.5 w-3.5" />
                  </ButtonLink>
                </div>
                <ul className="mt-6 space-y-3">
                  {branch.programmes.map((programme) => (
                    <li key={programme.id}>
                      <Link
                        href={`/programmes/${programme.slug}`}
                        className="group grid gap-2 paper-card-plain bg-paper p-4 transition-transform hover:-rotate-[0.4deg] sm:grid-cols-[1fr_9rem_8rem_1.5rem] sm:items-baseline sm:gap-4"
                      >
                        <span>
                          <span className="block font-display text-[1.3rem] leading-tight text-ink group-hover:text-poppy-deep">
                            {programme.name}
                          </span>
                          <span className="mt-0.5 block text-[0.78rem] text-ink/60">
                            {programme.summary}
                          </span>
                        </span>
                        <span className="text-[0.78rem] text-ink/60 sm:text-right">
                          {programme.ageLabel}
                        </span>
                        <span className="text-[0.78rem] font-bold text-ink sm:text-right">
                          {formatFee(programme.monthlyFeeCents)}
                        </span>
                        <ArrowRightIcon className="hidden h-4 w-4 text-ink sm:block" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-32 space-y-6">
              <div className={`paper-card ${tone.tint} p-5`}>
                <p className="hand text-poppy-deep">Talk to this branch</p>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-[0.72rem] font-extrabold text-ink/55">
                      Phone
                    </dt>
                    <dd>
                      <a
                        href={phoneHref(branch.phone)}
                        className="mt-0.5 inline-flex min-h-8 items-center gap-2 text-[0.9rem] font-semibold text-ink"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        {branch.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] font-extrabold text-ink/55">
                      Email
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${branch.email}`}
                        className="mt-0.5 inline-flex items-start gap-2 break-all text-[0.82rem] text-ink"
                      >
                        <MailIcon className="mt-0.5 h-4 w-4 shrink-0" />
                        {branch.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.72rem] font-extrabold text-ink/55">
                      Visit
                    </dt>
                    <dd className="mt-0.5 text-[0.82rem] leading-relaxed text-ink/65">
                      Weekday mornings by arrangement. About one hour.
                    </dd>
                  </div>
                </dl>
                <ButtonLink
                  href={`/admissions?branch=${branch.slug}#enquiry`}
                  className="mt-5 w-full"
                  size="sm"
                >
                  Start an enquiry
                </ButtonLink>
              </div>

              <div className="border-t border-ink/10 pt-5">
                <dl className="grid gap-4">
                  <Fact label="Ages here">
                    {branch.programmes.length > 0
                      ? branch.programmes
                          .map((programme) => programme.ageLabel)
                          .join(", ")
                      : "Speak to the branch"}
                  </Fact>
                  <Fact label="Fees">
                    {branch.programmes[0]
                      ? `From ${formatFee(branch.programmes[0].monthlyFeeCents)}`
                      : "Available on request"}
                  </Fact>
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {branch.events.length > 0 ? (
        <section className="border-y border-ink/10 bg-sun-tint/40 section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">At this branch</p>
                <h2 className="display-md mt-2 text-ink">Coming up</h2>
              </div>
              <ButtonLink href="/events" variant="text" size="sm">
                Full calendar <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <ul className="mt-7 space-y-3">
              {branch.events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group grid gap-4 paper-card-plain bg-paper p-4 transition-transform hover:-rotate-[0.4deg] sm:grid-cols-[7rem_1fr_auto] sm:items-center"
                  >
                    <div className="flex items-baseline gap-2 sm:block">
                      <p className="font-display text-[1.7rem] font-extrabold leading-none text-poppy-deep">
                        {formatDate(event.startsAt).split(" ")[0]}
                      </p>
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink/55">
                        {formatDate(event.startsAt).split(" ").slice(1).join(" ")}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-[1.25rem] font-extrabold text-ink group-hover:text-poppy-deep">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-[0.8rem] text-ink/60">
                        {formatEventWhen(event)} · {event.locationText}
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

      {branch.posts.length > 0 ? (
        <section className="section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">From this garden</p>
                <h2 className="display-md mt-2 text-ink">News</h2>
              </div>
              <ButtonLink
                href={`/news?branch=${branch.slug}`}
                variant="text"
                size="sm"
              >
                More news <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {branch.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {branch.albums.length > 0 ? (
        <section className="border-t border-ink/10 bg-meadow-tint/35 section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">The picture book</p>
                <h2 className="display-md mt-2 text-ink">Albums</h2>
              </div>
              <ButtonLink href="/gallery" variant="text" size="sm">
                All albums <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {branch.albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-poppy-deep text-white">
        <div className="page-container grid gap-8 py-14 md:grid-cols-[1fr_auto] md:items-center md:py-16">
          <div>
            <p className="tag bg-sun text-ink">The gate is open</p>
            <h2 className="display-md mt-3 text-white">
              Come and walk the {branch.suburb} garden.
            </h2>
            <p className="mt-3 max-w-xl text-[0.94rem] leading-relaxed text-white/80">
              Weekday mornings, by arrangement. Bring your child, wear shoes that
              can get dusty and stay as long as you need.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={`/admissions?branch=${branch.slug}#enquiry`}
              variant="light"
            >
              Arrange a visit
            </ButtonLink>
            <a
              href={phoneHref(branch.phone)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/30 px-5 py-3 text-[0.9rem] font-bold text-white transition-colors hover:bg-white hover:text-ink"
            >
              <PhoneIcon className="h-4 w-4" />
              {branch.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
