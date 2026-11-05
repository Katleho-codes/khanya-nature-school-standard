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
          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-4">
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
          sizes="(min-width: 1024px) 90vw, 100vw"
        />
      </section>

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-12 border-t border-line pt-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div
              className="prose-editorial"
              dangerouslySetInnerHTML={{ __html: body }}
            />

            <div className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              <div>
                <h2 className="font-display text-[1.45rem] text-forest">Opening hours</h2>
                <div className="mt-3">
                  <HoursTable hours={branch.hours} />
                </div>
                <p className="mt-3 text-[0.76rem] leading-relaxed text-bark-soft">
                  {summariseHours(branch.hours)}. We close on public holidays.
                </p>
              </div>
              <div>
                <h2 className="font-display text-[1.45rem] text-forest">Find us</h2>
                <address className="mt-3 not-italic">
                  <p className="flex items-start gap-2 text-[0.88rem] leading-relaxed text-bark-soft">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
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
                  className="mark-link mt-3 inline-flex items-center gap-1.5 text-[0.82rem] text-forest"
                >
                  Get directions <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
                <p className="mt-4 text-[0.78rem] leading-relaxed text-bark-soft">
                  Parking is on the street. Please do not block the neighbours&apos;
                  gates at drop-off.
                </p>
              </div>
            </div>

            {branch.programmes.length > 0 ? (
              <div className="mt-12 border-t border-line pt-8">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="display-md text-forest">Programmes here</h2>
                  <ButtonLink href="/programmes" variant="text" size="sm">
                    All programmes <ArrowRightIcon className="h-3.5 w-3.5" />
                  </ButtonLink>
                </div>
                <ul className="mt-6 divide-y divide-line">
                  {branch.programmes.map((programme) => (
                    <li key={programme.id}>
                      <Link
                        href={`/programmes/${programme.slug}`}
                        className="group grid gap-2 py-4 sm:grid-cols-[1fr_9rem_8rem_1.5rem] sm:items-baseline sm:gap-4"
                      >
                        <span>
                          <span className="block font-display text-[1.3rem] leading-tight text-forest group-hover:text-sage-deep">
                            {programme.name}
                          </span>
                          <span className="mt-0.5 block text-[0.78rem] text-bark-soft">
                            {programme.summary}
                          </span>
                        </span>
                        <span className="text-[0.78rem] text-bark-soft sm:text-right">
                          {programme.ageLabel}
                        </span>
                        <span className="text-[0.78rem] text-forest sm:text-right">
                          {formatFee(programme.monthlyFeeCents)}
                        </span>
                        <ArrowRightIcon className="hidden h-4 w-4 text-forest sm:block" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-32 space-y-6">
              <div className="border border-line bg-paper p-5">
                <p className="label-caps text-sage-deep">Talk to this branch</p>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-[0.68rem] uppercase tracking-[0.13em] text-sage-deep">
                      Phone
                    </dt>
                    <dd>
                      <a
                        href={phoneHref(branch.phone)}
                        className="mt-0.5 inline-flex items-center gap-2 text-[0.9rem] text-forest"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        {branch.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.68rem] uppercase tracking-[0.13em] text-sage-deep">
                      Email
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${branch.email}`}
                        className="mt-0.5 inline-flex items-start gap-2 break-all text-[0.82rem] text-forest"
                      >
                        <MailIcon className="mt-0.5 h-4 w-4 shrink-0" />
                        {branch.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.68rem] uppercase tracking-[0.13em] text-sage-deep">
                      Visit
                    </dt>
                    <dd className="mt-0.5 text-[0.82rem] leading-relaxed text-bark-soft">
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

              <div className="border-t border-line pt-5">
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
        <section className="border-y border-line bg-paper section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label-caps text-sage-deep">At this branch</p>
                <h2 className="display-md mt-2 text-forest">Coming up</h2>
              </div>
              <ButtonLink href="/events" variant="text" size="sm">
                Full calendar <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <ul className="mt-7 divide-y divide-line">
              {branch.events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group grid gap-4 py-5 sm:grid-cols-[7rem_1fr_auto] sm:items-center"
                  >
                    <div className="flex items-baseline gap-2 sm:block">
                      <p className="font-display text-[1.7rem] leading-none text-forest">
                        {formatDate(event.startsAt).split(" ")[0]}
                      </p>
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-sage-deep">
                        {formatDate(event.startsAt).split(" ").slice(1).join(" ")}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-[1.25rem] text-forest group-hover:text-sage-deep">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-[0.8rem] text-bark-soft">
                        {formatEventWhen(event)} · {event.locationText}
                      </p>
                    </div>
                    <ArrowRightIcon className="hidden h-4 w-4 text-forest sm:block" />
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
                <p className="label-caps text-sage-deep">From this garden</p>
                <h2 className="display-md mt-2 text-forest">News</h2>
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
        <section className="border-t border-line bg-paper section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label-caps text-sage-deep">The picture book</p>
                <h2 className="display-md mt-2 text-forest">Albums</h2>
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

      <section className="section-forest bg-forest text-oat">
        <div className="page-container grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="label-caps text-oat/60">The gate is open</p>
            <h2 className="display-md mt-2 text-oat">
              Come and walk the {branch.suburb} garden.
            </h2>
            <p className="mt-3 max-w-xl text-[0.94rem] leading-relaxed text-oat/70">
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
              className="inline-flex items-center gap-2 rounded-sm border border-oat/35 px-5 py-3 text-[0.9rem] text-oat transition-colors hover:border-oat"
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
