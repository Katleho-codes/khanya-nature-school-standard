import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgramme, getProgrammes } from "@/lib/api";
import { formatFee, formatRand } from "@/lib/format";
import { breadcrumbSchema, pageMetadata } from "@/lib/metadata";
import { renderMarkdown } from "@/lib/markdown";
import { PageIntro } from "@/components/PageIntro";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { Fact } from "@/components/Editorial";
import { ArrowRightIcon, ClockIcon, MapPinIcon, CheckIcon } from "@/components/icons";
import { programmeTone, toneStyle } from "@/lib/tones";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProgramme(slug);
  if (!result) {
    return pageMetadata({
      title: "Programme not found",
      description: "That programme could not be found.",
      path: `/programmes/${slug}`,
    });
  }
  const { programme } = result;
  return pageMetadata({
    title: programme.seoTitle ?? `${programme.name} for ${programme.ageLabel}`,
    description:
      programme.seoDescription ??
      `${programme.summary} At Khanya Nature School in Randburg and Fourways.`,
    path: `/programmes/${programme.slug}`,
    image: programme.image?.url ?? null,
  });
}

export default async function ProgrammeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getProgramme(slug);
  if (!result) notFound();
  const { programme } = result;
  const allProgrammes = await getProgrammes();
  const others = allProgrammes.programmes
    .filter((item) => item.id !== programme.id)
    .slice(0, 2);

  const body = await renderMarkdown(programme.description);
  const programmeBranches = programme.branches ?? [];
  const tone = toneStyle(programmeTone(programme.slug));
  const enquiryHref = `/admissions?programme=${programme.slug}${
    programmeBranches[0] ? `&branch=${programmeBranches[0].slug}` : ""
  }#enquiry`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Programmes", path: "/programmes" },
          { name: programme.name, path: `/programmes/${programme.slug}` },
        ])}
      />

      <PageIntro
        eyebrow={`${programme.ageLabel} · ${programme.hoursLabel}`}
        title={programme.name}
        lead={programme.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Programmes", href: "/programmes" },
          { label: programme.name },
        ]}
        aside={
          <div className={`mt-6 paper-card ${tone.tint} p-4`}>
            <p className="flex items-baseline justify-between gap-4 text-[0.84rem]">
              <span className="font-bold text-ink/60">Monthly fee</span>
              <span className="font-display text-[1.35rem] font-extrabold text-ink">
                {formatFee(programme.monthlyFeeCents)}
              </span>
            </p>
            {programme.monthlyFeeCents === null && programme.feeNote ? (
              <p className="mt-1 text-[0.78rem] leading-relaxed text-ink/65">
                {programme.feeNote}
              </p>
            ) : null}
            <ButtonLink href={enquiryHref} className="mt-4 w-full">
              Enquire about this programme
            </ButtonLink>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className={`grid gap-10 rounded-[34px_26px_38px_22px] ${tone.tint} p-4 sm:p-6 lg:grid-cols-12 lg:gap-12 lg:p-8`}>
          <div className="lg:col-span-7">
            <Photo
              src={programme.image?.url ?? null}
              alt={programme.image?.alt ?? `${programme.name} at Khanya Nature School`}
              ratio="3 / 2"
              priority
              shape="paper"
              tone={programmeTone(programme.slug)}
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
            <div
              className="prose-playful mt-8 rounded-[24px] bg-paper p-5 sm:p-7"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-32 space-y-8">
              <dl className="grid gap-5">
                <Fact label="Age group">{programme.ageLabel}</Fact>
                <Fact label="The day">{programme.hoursLabel}</Fact>
                <Fact label="Fee">
                  {formatFee(programme.monthlyFeeCents)}
                  {programme.feeNote ? (
                    <span className="mt-1 block text-[0.8rem] text-ink/65">
                      {programme.feeNote}
                    </span>
                  ) : null}
                </Fact>
                <Fact label="Where">
                  {programmeBranches.length > 0 ? (
                    <span className="flex flex-wrap gap-x-3 gap-y-1">
                      {programmeBranches.map((branch) => (
                        <Link
                          key={branch.id}
                          href={`/branches/${branch.slug}`}
                          className="squiggle-link font-bold inline-flex items-center gap-1 text-ink"
                        >
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {branch.name}
                        </Link>
                      ))}
                    </span>
                  ) : (
                    "Speak to us about availability"
                  )}
                </Fact>
              </dl>

              <div className="paper-card bg-sun-tint p-5">
                <p className="hand text-poppy-deep">A place to start</p>
                <p className="mt-1 font-display text-[1.3rem] font-extrabold leading-tight text-ink">
                  See the garden before you decide.
                </p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/65">
                  A weekday visit takes about an hour. Bring your child and your
                  questions.
                </p>
                <ButtonLink href={enquiryHref} className="mt-4 w-full" size="sm">
                  Arrange a visit <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {programme.dailyRhythm.length > 0 ? (
        <section className="bg-sky-tint/45 section">
          <div className="page-container grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="sticker bg-paper text-ink">The daily rhythm</p>
              <h2 className="display-lg mt-3 text-ink">
                Predictable, not rigid.
              </h2>
              <p className="mt-4 text-[0.94rem] leading-relaxed text-ink/65">
                Times are a guide. A good game, a visitor or a sudden interest in
                a beetle can move the morning along. Teachers protect the long
                outdoor block.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-[0.78rem] text-ink/65">
                <ClockIcon className="h-4 w-4" />
                {programme.hoursLabel}
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ol className="space-y-3">
                {programme.dailyRhythm.map((item) => (
                  <li
                    key={`${item.time}-${item.label}`}
                    className="grid grid-cols-[4.2rem_1fr] gap-4 paper-card-plain bg-paper px-4 py-3"
                  >
                    <span className="text-[0.82rem] font-extrabold tabular-nums text-poppy-deep">
                      {item.time}
                    </span>
                    <span className="text-[0.9rem] leading-relaxed text-ink/75">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink/65">What to expect</p>
              <h2 className="display-lg mt-3 text-ink">
                The practical things.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {[
                "A change of clothes and shoes that can get wet or muddy.",
                "A hat, sunblock and a water bottle, every day.",
                "A morning snack and lunch, unless it is a cooked lunch day.",
                "Nappies and wipes for children who need them.",
                "A named bag that your child can carry themselves.",
                "Space to separate slowly in the first weeks.",
              ].map((item) => (
                <p key={item} className="paper-card-plain flex items-start gap-2 bg-sun-tint/55 p-3 text-[0.86rem] leading-relaxed text-ink/70">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-meadow-deep" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          {programme.monthlyFeeCents !== null ? (
            <p className="mt-8 text-[0.78rem] text-ink/65">
              Fees shown are monthly for 2027. A once-off registration fee
              applies on acceptance and is listed in the{" "}
              <Link href="/admissions#documents" className="squiggle-link font-bold text-ink">
                fee schedule
              </Link>
              . {formatRand(programme.monthlyFeeCents)} per month.
            </p>
          ) : null}
        </div>
      </section>

      {others.length > 0 ? (
        <section className="border-t border-ink/10 bg-meadow-tint/40">
          <div className="page-container py-12 md:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">Keep looking</p>
                <h2 className="display-md mt-2 text-ink">Other programmes</h2>
              </div>
              <ButtonLink href="/programmes" variant="text" size="sm">
                All programmes <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/programmes/${other.slug}`}
                  className="group paper-card grid gap-5 bg-paper p-4 sm:grid-cols-[10rem_1fr]"
                >
                  <Photo
                    src={other.image?.url ?? null}
                    alt={other.image?.alt ?? other.name}
                    ratio="3 / 2"
                    sizes="10rem"
                    shape="paper"
                    tone={programmeTone(other.slug)}
                  />
                  <div>
                    <p className="hand text-ink/55">
                      {other.ageLabel}
                    </p>
                    <h3 className="mt-1 font-display text-[1.4rem] leading-tight text-ink group-hover:text-poppy-deep">
                      {other.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[0.84rem] leading-relaxed text-ink/65">
                      {other.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
