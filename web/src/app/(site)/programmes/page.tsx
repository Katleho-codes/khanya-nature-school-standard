import type { Metadata } from "next";
import Link from "next/link";
import { getProgrammes } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { formatRand } from "@/lib/format";
import { PageIntro } from "@/components/PageIntro";
import { ProgrammeRow } from "@/components/PublicCards";
import { ButtonLink } from "@/components/Button";
import { SectionHeading, Fact } from "@/components/Editorial";
import { ArrowRightIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Programmes for 18 months to Grade R",
    description:
      "Explore the four term-time programmes at Khanya Nature School, from Little Explorers for toddlers to Grade R Pathfinders in Fourways.",
    path: "/programmes",
  });
}

export default async function ProgrammesPage() {
  const { programmes } = await getProgrammes();
  const ages = programmes.map((programme) => programme.ageLabel);
  const feeFrom = programmes
    .map((programme) => programme.monthlyFeeCents)
    .filter((fee): fee is number => fee !== null)
    .sort((left, right) => left - right)[0];

  return (
    <>
      <PageIntro
        eyebrow="Programmes"
        title={
          <>
            Four years of growing <span className="text-poppy-deep">outward.</span>
          </>
        }
        lead="Each programme keeps the outdoor day at its centre. What changes is the size of the project, the length of the walk and how much the children can do for themselves."
        crumbs={[{ label: "Home", href: "/" }, { label: "Programmes" }]}
        aside={
          <div className="mt-6 paper-card rotate-[-1deg] bg-sun-tint p-4">
            <p className="hand text-poppy-deep">The money part</p>
            <p className="mt-1 text-[0.86rem] font-semibold leading-relaxed text-ink/75">
              {feeFrom
                ? `Term-time fees start at ${formatRand(feeFrom)} per month.`
                : "Fees are available on request."}{" "}
              The 2027 fee schedule is on the admissions page.
            </p>
            <ButtonLink href="/admissions" variant="text" className="mt-2 text-[0.82rem]">
              Fees and admissions <ArrowRightIcon className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="space-y-3">
          {programmes.map((programme, index) => (
            <ProgrammeRow key={programme.id} programme={programme} index={index} />
          ))}
        </div>

        {programmes.length === 0 ? (
          <p className="paper-card bg-sun-tint p-6 text-sm text-ink/70">
            Programme information is being updated. Please contact the school for
            current age groups and fees.
          </p>
        ) : null}
      </section>

      <section className="bg-sun-tint/45 section">
        <div className="page-container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="How we choose"
              title="A mixed-age garden, with room to be small."
              lead="Children spend time across the garden and see the older children at work. But each programme has its own group, its own teachers and its own pace."
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <dl className="grid gap-6 sm:grid-cols-2">
              <Fact label="Ratios">
                Two teachers for every ten toddlers. Two or three teachers with
                older groups, depending on the day.
              </Fact>
              <Fact label="Hours">
                Full day 07:00 to 17:00. Half day 07:30 to 12:30. Holiday
                programme days run 07:30 to 16:30.
              </Fact>
              <Fact label="Fees">
                Monthly, paid in advance. Includes materials, garden supplies and
                a cooked lunch on set days.
              </Fact>
              <Fact label="Ages">
                {ages.length > 0
                  ? `${ages[0]} through to ${ages[ages.length - 1]}.`
                  : "18 months through to Grade R."}{" "}
                We will help you choose the right group.
              </Fact>
            </dl>

            <div className="mt-8 paper-card rotate-[0.7deg] bg-sky-tint p-5">
              <p className="font-display text-[1.28rem] font-extrabold leading-snug text-ink">
                The holiday programme is for Khanya families and their friends.
                Booking opens four weeks before each holiday.
              </p>
              <Link
                href="/contact"
                className="squiggle-link mt-3 inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-ink"
              >
                Ask about holiday dates <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-10 paper-card rotate-[-0.4deg] bg-sun p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="hand text-poppy-deep">Next step</p>
              <h2 className="display-md mt-1 max-w-xl text-ink">
                See the room your child would spend the year in.
              </h2>
              <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-ink/70">
                Visit on a weekday morning, meet a teacher and watch the day
                without a performance put on for you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/admissions#enquiry">
                Start an enquiry <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/branches" variant="outline">
                Our branches
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
