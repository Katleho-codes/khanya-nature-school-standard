import type { Metadata } from "next";
import Link from "next/link";
import { getBranches } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/PageIntro";
import { BranchCard } from "@/components/PublicCards";
import { ButtonLink } from "@/components/Button";
import { SectionHeading } from "@/components/Editorial";
import { ArrowRightIcon, ClockIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { phoneHref, summariseHours } from "@/lib/format";
import { branchTone, toneStyle } from "@/lib/tones";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Our branches in Randburg and Fourways",
    description:
      "Visit the two Khanya Nature School gardens in Ferndale, Randburg and Fourways, Johannesburg. Addresses, opening hours, contact details and directions.",
    path: "/branches",
  });
}

export default async function BranchesPage() {
  const { branches } = await getBranches();

  return (
    <>
      <PageIntro
        eyebrow="Branches"
        title={
          <>
            Two gardens. Pick the one that fits your{" "}
            <span className="text-poppy-deep">morning.</span>
          </>
        }
        lead="Randburg has the big trees, the chickens and the corner-shop walk. Fourways has the wetland, the fire circle and the Grade R room. Both are small. Both are outside first."
        crumbs={[{ label: "Home", href: "/" }, { label: "Branches" }]}
        aside={
          <div className="mt-6 paper-card rotate-[0.8deg] bg-sky-tint p-4 text-[0.84rem] leading-relaxed text-ink/70">
            <p>
              We welcome visits on weekday mornings during term time. A visit
              takes about an hour and children are welcome.
            </p>
            <ButtonLink href="/admissions#visit" variant="text" className="mt-2 text-[0.82rem]">
              Arrange a visit <ArrowRightIcon className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-14 md:grid-cols-2 md:gap-10">
          {branches.map((branch) => {
            const tone = toneStyle(branchTone(branch.slug));
            return (
            <div key={branch.id}>
              <BranchCard branch={branch} />
              <dl className={`mt-6 grid gap-3 paper-card-plain ${tone.tint} p-4 text-[0.84rem]`}>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="font-bold text-ink/55">Address</dt>
                  <dd className="text-ink/70">
                    {branch.addressLine1}, {branch.suburb}, {branch.city},{" "}
                    {branch.postalCode}
                  </dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="font-bold text-ink/55">Phone</dt>
                  <dd>
                    <a href={phoneHref(branch.phone)} className="squiggle-link font-bold text-ink">
                      {branch.phone}
                    </a>
                  </dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="font-bold text-ink/55">Email</dt>
                  <dd>
                    <a href={`mailto:${branch.email}`} className="squiggle-link font-bold break-all text-ink">
                      {branch.email}
                    </a>
                  </dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="font-bold text-ink/55">Programmes</dt>
                  <dd className="text-ink/70">
                    {branch.programmes.map((programme) => programme.name).join(", ") ||
                      "Speak to the branch"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href={`/branches/${branch.slug}`} size="sm" variant="outline">
                  Branch details
                </ButtonLink>
                <ButtonLink
                  href={`/admissions?branch=${branch.slug}#enquiry`}
                  size="sm"
                  variant="text"
                >
                  Enquire at {branch.name.split(" ")[0]}{" "}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            </div>
          )})}
        </div>
      </section>

      <section className="bg-meadow-tint/45 section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Visiting"
            title="What a morning visit looks like."
            lead="There is no open day performance. You will see the ordinary day: arrival, circle, the long outdoor session, snack and the small negotiations that make up a preschool morning."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Arrive at 09:00",
                body: "Park on the street, sign in at the gate and meet the branch principal. We will walk the garden first.",
                icon: ClockIcon,
                tone: "bg-sun-tint",
              },
              {
                title: "Watch and ask",
                body: "Spend time in the outdoor space. Ask about ratios, food, toileting, separation and anything else that matters.",
                icon: MapPinIcon,
                tone: "bg-sky-tint",
              },
              {
                title: "Leave with a clear next step",
                body: "If you would like to apply, we send the admission form, fee schedule and available start dates.",
                icon: PhoneIcon,
                tone: "bg-poppy-tint",
              },
            ].map((item) => (
              <div key={item.title} className={`paper-card ${item.tone} p-4`}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper">
                  <item.icon className="h-5 w-5 text-ink/70" />
                </span>
                <h3 className="mt-3 font-display text-[1.25rem] font-extrabold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-ink/65">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 paper-card-plain bg-paper p-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.82rem] text-ink/65">
              {branches.map((branch) => (
                <span key={branch.id} className="inline-flex items-center gap-2">
                  <span className="sticker bg-sun-tint text-ink">{branch.name}</span>
                  {summariseHours(branch.hours)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-8 paper-card rotate-[0.4deg] bg-sun p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="hand text-poppy-deep">Not sure which branch?</p>
              <h2 className="display-md mt-1 text-ink">
                Tell us where you live and we will be honest.
              </h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/70">
                The drive matters. Send an enquiry and we will help you choose
                the branch that will work on an ordinary Tuesday.
              </p>
            </div>
            <ButtonLink href="/admissions#enquiry">
              Start an enquiry <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
          <p className="mt-6 text-[0.8rem] text-ink/65">
            Midstream is opening soon.{" "}
            <Link href="/contact" className="squiggle-link font-bold text-ink">
              Ask to join the Midstream list
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
