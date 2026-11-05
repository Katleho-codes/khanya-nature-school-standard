import type { Metadata } from "next";
import { getBranches } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { phoneHref, summariseHours } from "@/lib/format";
import { PageIntro } from "@/components/PageIntro";
import { ButtonLink } from "@/components/Button";
import { HoursTable, WhatsAppButton } from "@/components/Editorial";
import {
  ArrowRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { branchWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Contact the school",
    description:
      "Phone, email or WhatsApp the Khanya Nature School branches in Randburg and Fourways. Addresses, opening hours, directions and visit information.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const { branches } = await getBranches();

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title={
          <>
            A person will <span className="italic text-sage-deep">answer.</span>
          </>
        }
        lead="The office is small. During the school day you may reach a teacher rather than a receptionist, so please leave a message if we cannot pick up."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        aside={
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[0.82rem] leading-relaxed text-bark-soft">
              For a place at the school, the{" "}
              <a href="/admissions#enquiry" className="mark-link text-forest">
                enquiry form
              </a>{" "}
              is the fastest route. For everything else, use the details below.
            </p>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="label-caps text-sage-deep">The office</p>
            <h2 className="display-lg mt-3 text-forest">General enquiries.</h2>
            <p className="mt-4 text-[0.94rem] leading-relaxed text-bark-soft">
              Use the office email for documents, accounts, press or anything
              that does not belong to a single branch. We aim to reply within one
              working day.
            </p>
            <div className="mt-6 space-y-4 border-t border-line pt-5">
              <a
                href="mailto:hello@khanyanatureschool.example"
                className="flex items-start gap-3 text-[0.92rem] text-forest"
              >
                <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" />
                <span>
                  hello@khanyanatureschool.example
                  <span className="mt-0.5 block text-[0.74rem] text-bark-soft">
                    General and new family enquiries
                  </span>
                </span>
              </a>
              {branches[0] ? (
                <a
                  href={phoneHref(branches[0].phone)}
                  className="flex items-start gap-3 text-[0.92rem] text-forest"
                >
                  <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" />
                  <span>
                    {branches[0].phone}
                    <span className="mt-0.5 block text-[0.74rem] text-bark-soft">
                      General office line, {branches[0].name}
                    </span>
                  </span>
                </a>
              ) : null}
              <div className="flex items-start gap-3 text-[0.92rem] text-forest">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" />
                <span>
                  Two branches, Randburg and Fourways
                  <span className="mt-0.5 block text-[0.74rem] text-bark-soft">
                    Postal address available on request
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-6">
              <WhatsAppButton
                number={branches[0]?.whatsapp ?? "27825550100"}
                message="Hello Khanya Nature School, I have a general question about the school."
                label="WhatsApp the office"
              />
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border border-line bg-paper p-5 md:p-7">
              <p className="label-caps text-sage-deep">Visiting</p>
              <h2 className="display-md mt-2 text-forest">Weekday mornings, by arrangement.</h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-bark-soft">
                We do not run formal open days every week. Instead, families visit
                on an ordinary weekday morning when the garden is in use. A visit
                takes about an hour.
              </p>
              <div className="mt-5 grid gap-3 text-[0.82rem] leading-relaxed text-bark-soft">
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ochre" aria-hidden />
                  Wear shoes that can cope with a garden.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ochre" aria-hidden />
                  Bring your child if you can.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ochre" aria-hidden />
                  Park on the street, clear of neighbours&apos; gates.
                </p>
              </div>
              <ButtonLink href="/admissions#enquiry" className="mt-5" size="sm">
                Arrange a visit <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper section">
        <div className="page-container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-caps text-sage-deep">Direct lines</p>
              <h2 className="display-md mt-2 text-forest">Find your branch.</h2>
            </div>
            <p className="text-[0.78rem] text-bark-soft">
              Use the branch details for collections, absences and day-to-day
              questions.
            </p>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8">
            {branches.map((branch) => (
              <article key={branch.id} className="border-t border-line pt-6">
                <p className="label-caps text-sage-deep">{branch.suburb}</p>
                <h3 className="mt-2 font-display text-[1.65rem] text-forest">
                  {branch.name}
                </h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
                  {branch.tagline}
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <a
                      href={phoneHref(branch.phone)}
                      className="flex items-center gap-2 text-[0.88rem] text-forest"
                    >
                      <PhoneIcon className="h-4 w-4 text-sage-deep" />
                      {branch.phone}
                    </a>
                    <a
                      href={`mailto:${branch.email}`}
                      className="mt-2 inline-flex items-start gap-2 break-all text-[0.8rem] text-forest"
                    >
                      <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
                      {branch.email}
                    </a>
                    <a
                      href={whatsappLink(branch.whatsapp, branchWhatsappMessage(branch.name))}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center gap-2 text-[0.84rem] text-forest"
                    >
                      <WhatsAppIcon className="h-4 w-4 text-sage-deep" />
                      WhatsApp
                    </a>
                    <p className="mt-4 flex items-start gap-2 text-[0.8rem] leading-relaxed text-bark-soft">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
                      <span>
                        {branch.addressLine1}
                        <br />
                        {branch.suburb}, {branch.city}
                        <br />
                        {branch.province}, {branch.postalCode}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.13em] text-sage-deep">
                      Hours
                    </p>
                    <div className="mt-2">
                      <HoursTable hours={branch.hours} />
                    </div>
                    <p className="mt-2 text-[0.72rem] text-bark-soft">
                      {summariseHours(branch.hours)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href={`/branches/${branch.slug}`} size="sm" variant="outline">
                    Branch page
                  </ButtonLink>
                  <ButtonLink
                    href={`https://www.google.com/maps/search/?api=1&query=${
                      branch.lat !== null && branch.lng !== null
                        ? `${branch.lat},${branch.lng}`
                        : encodeURIComponent(`${branch.addressLine1}, ${branch.suburb}`)
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    size="sm"
                    variant="text"
                  >
                    Directions <ArrowRightIcon className="h-3.5 w-3.5" />
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-8 border border-line bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="label-caps text-sage-deep">Not sure who to ask?</p>
              <h2 className="display-md mt-2 text-forest">
                Send one message. We will route it.
              </h2>
              <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-bark-soft">
                Use the admissions form for a place, or the office email for
                anything else. We would rather redirect you than have you phone
                three numbers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/admissions#enquiry">
                Admissions enquiry <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="mailto:hello@khanyanatureschool.example"
                variant="outline"
              >
                Email the office
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
