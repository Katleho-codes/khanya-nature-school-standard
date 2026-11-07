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
import { branchTone, toneStyle } from "@/lib/tones";

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
            A person will <span className="text-poppy-deep">answer.</span>
          </>
        }
        lead="The office is small. During the school day you may reach a teacher rather than a receptionist, so please leave a message if we cannot pick up."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        aside={
          <div className="mt-6 paper-card rotate-[0.6deg] bg-sky-tint p-4">
            <p className="hand text-poppy-deep">For a place at school</p>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/75">
              The{" "}
              <a href="/admissions#enquiry" className="squiggle-link font-bold text-ink">
                enquiry form
              </a>{" "}
              is the fastest route. For everything else, use the details below.
            </p>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="sticker bg-paper text-ink">The office</p>
            <h2 className="display-lg mt-3 text-ink">General enquiries.</h2>
            <p className="mt-4 text-[0.94rem] leading-relaxed text-ink/75">
              Use the office email for documents, accounts, press or anything
              that does not belong to a single branch. We aim to reply within one
              working day.
            </p>
            <div className="mt-6 space-y-3 paper-card bg-paper p-4">
              <a
                href="mailto:hello@khanyanatureschool.example"
                className="flex min-h-11 items-start gap-3 text-[0.92rem] font-semibold text-ink"
              >
                <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-poppy-deep" />
                <span>
                  hello@khanyanatureschool.example
                  <span className="mt-0.5 block text-[0.74rem] font-normal text-ink/75">
                    General and new family enquiries
                  </span>
                </span>
              </a>
              {branches[0] ? (
                <a
                  href={phoneHref(branches[0].phone)}
                  className="flex min-h-11 items-start gap-3 text-[0.92rem] font-semibold text-ink"
                >
                  <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-poppy-deep" />
                  <span>
                    {branches[0].phone}
                    <span className="mt-0.5 block text-[0.74rem] font-normal text-ink/75">
                      General office line, {branches[0].name}
                    </span>
                  </span>
                </a>
              ) : null}
              <div className="flex items-start gap-3 text-[0.92rem] font-semibold text-ink">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-poppy-deep" />
                <span>
                  Two branches, Randburg and Fourways
                  <span className="mt-0.5 block text-[0.74rem] font-normal text-ink/75">
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
            <div className="paper-card bg-sun p-5 md:p-7">
              <p className="hand text-ink">Visiting</p>
              <h2 className="display-md mt-1 text-ink">Weekday mornings, by arrangement.</h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-ink/75">
                We do not run formal open days every week. Instead, families visit
                on an ordinary weekday morning when the garden is in use. A visit
                takes about an hour.
              </p>
              <div className="mt-5 grid gap-3 text-[0.82rem] leading-relaxed text-ink/75">
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-poppy-deep" aria-hidden />
                  Wear shoes that can cope with a garden.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-poppy-deep" aria-hidden />
                  Bring your child if you can.
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-poppy-deep" aria-hidden />
                  Park on the street, clear of neighbours&apos; gates.
                </p>
              </div>
              <ButtonLink href="/admissions#enquiry" className="mt-5" size="sm" variant="secondary">
                Arrange a visit <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sky-tint/40 section">
        <div className="page-container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="sticker bg-paper text-ink">Direct lines</p>
              <h2 className="display-md mt-2 text-ink">Find your branch.</h2>
            </div>
            <p className="text-[0.78rem] text-ink/75">
              Use the branch details for collections, absences and day-to-day
              questions.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {branches.map((branch) => {
              const tone = toneStyle(branchTone(branch.slug));
              return (
              <article key={branch.id} className={`paper-card ${tone?.tint ?? "bg-paper"} p-5`}>
                <p className="hand text-poppy-deep">{branch.suburb}</p>
                <h3 className="mt-1 font-display text-[1.65rem] font-extrabold text-ink">
                  {branch.name}
                </h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/75">
                  {branch.tagline}
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <a
                      href={phoneHref(branch.phone)}
                      className="flex min-h-10 items-center gap-2 text-[0.88rem] font-bold text-ink"
                    >
                      <PhoneIcon className="h-4 w-4 text-poppy-deep" />
                      {branch.phone}
                    </a>
                    <a
                      href={`mailto:${branch.email}`}
                      className="mt-2 inline-flex min-h-10 items-start gap-2 break-all text-[0.8rem] font-semibold text-ink"
                    >
                      <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-poppy-deep" />
                      {branch.email}
                    </a>
                    <a
                      href={whatsappLink(branch.whatsapp, branchWhatsappMessage(branch.name))}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex min-h-10 items-center gap-2 text-[0.84rem] font-semibold text-ink"
                    >
                      <WhatsAppIcon className="h-4 w-4 text-poppy-deep" />
                      WhatsApp
                    </a>
                    <p className="mt-4 flex items-start gap-2 text-[0.8rem] leading-relaxed text-ink/75">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-poppy-deep" />
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
                    <p className="hand text-poppy-deep">Hours</p>
                    <div className="mt-2">
                      <HoursTable hours={branch.hours} />
                    </div>
                    <p className="mt-2 text-[0.72rem] text-ink/75">
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
            )})}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-8 paper-card rotate-[-0.3deg] bg-poppy-deep p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="hand text-white">Not sure who to ask?</p>
              <h2 className="display-md mt-1 text-white">
                Send one message. We will route it.
              </h2>
              <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-white">
                Use the admissions form for a place, or the office email for
                anything else. We would rather redirect you than have you phone
                three numbers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/admissions#enquiry" variant="light">
                Admissions enquiry <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <a
                href="mailto:hello@khanyanatureschool.example"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white/40 px-5 py-3 text-[0.9rem] font-extrabold text-white transition-colors hover:bg-white hover:text-ink"
              >
                Email the office
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
