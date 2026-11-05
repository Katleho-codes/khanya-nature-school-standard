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
            Two gardens, each with its{" "}
            <span className="italic text-sage-deep">own weather.</span>
          </>
        }
        lead="Randburg has the big trees, the chickens and the corner-shop walk. Fourways has the wetland, the fire circle and the Grade R room. Both are small and both are outdoors first."
        crumbs={[{ label: "Home", href: "/" }, { label: "Branches" }]}
        aside={
          <div className="mt-6 border-t border-line pt-4 text-[0.84rem] leading-relaxed text-bark-soft">
            <p>
              We welcome visits on weekday mornings during term time. A visit
              takes about an hour and children are welcome.
            </p>
            <ButtonLink href="/admissions#visit" variant="text" className="mt-3 text-[0.82rem]">
              Arrange a visit <ArrowRightIcon className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-14 md:grid-cols-2 md:gap-10">
          {branches.map((branch) => (
            <div key={branch.id}>
              <BranchCard branch={branch} />
              <dl className="mt-6 grid gap-3 border-t border-line pt-4 text-[0.82rem]">
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="text-sage-deep">Address</dt>
                  <dd className="text-bark-soft">
                    {branch.addressLine1}, {branch.suburb}, {branch.city},{" "}
                    {branch.postalCode}
                  </dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="text-sage-deep">Phone</dt>
                  <dd>
                    <a href={phoneHref(branch.phone)} className="mark-link text-forest">
                      {branch.phone}
                    </a>
                  </dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="text-sage-deep">Email</dt>
                  <dd>
                    <a href={`mailto:${branch.email}`} className="mark-link break-all text-forest">
                      {branch.email}
                    </a>
                  </dd>
                </div>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="text-sage-deep">Programmes</dt>
                  <dd className="text-bark-soft">
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
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Visiting"
            title="What a morning visit looks like."
            lead="There is no open day performance. You will see the ordinary day: arrival, circle, the long outdoor session, snack and the small negotiations that make up a preschool morning."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Arrive at 09:00",
                body: "Park on the street, sign in at the gate and meet the branch principal. We will walk the garden first.",
                icon: ClockIcon,
              },
              {
                title: "Watch and ask",
                body: "Spend time in the outdoor space. Ask about ratios, food, toileting, separation and anything else that matters.",
                icon: MapPinIcon,
              },
              {
                title: "Leave with a clear next step",
                body: "If you would like to apply, we send the admission form, fee schedule and available start dates.",
                icon: PhoneIcon,
              },
            ].map((item) => (
              <div key={item.title} className="border-t border-line pt-4">
                <item.icon className="h-5 w-5 text-sage-deep" />
                <h3 className="mt-3 font-display text-[1.25rem] text-forest">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-bark-soft">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-line pt-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.82rem] text-bark-soft">
              {branches.map((branch) => (
                <span key={branch.id} className="inline-flex items-center gap-2">
                  <span className="label-caps text-sage-deep">{branch.name}</span>
                  {summariseHours(branch.hours)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-8 border border-line bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="label-caps text-sage-deep">Not sure which branch?</p>
              <h2 className="display-md mt-2 text-forest">
                Tell us where you live and we will be honest.
              </h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-bark-soft">
                The drive matters. Send an enquiry and we will help you choose
                the branch that will work on an ordinary Tuesday.
              </p>
            </div>
            <ButtonLink href="/admissions#enquiry">
              Start an enquiry <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
          <p className="mt-6 text-[0.8rem] text-bark-soft">
            Midstream is opening soon.{" "}
            <Link href="/contact" className="mark-link text-forest">
              Ask to join the Midstream list
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
