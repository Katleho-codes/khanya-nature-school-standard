import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/PageIntro";
import { ButtonLink } from "@/components/Button";
import { ArrowRightIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Privacy and POPIA",
    description:
      "How Khanya Nature School collects, uses, stores and protects personal information under the Protection of Personal Information Act.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Privacy"
        title="Your information, handled carefully."
        lead="This notice explains what we collect when you use this website or enquire about a place, why we need it and what you can ask us to do with it."
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        aside={
          <div className="mt-6 paper-card rotate-[0.8deg] bg-sun-tint p-4 text-[0.8rem] leading-relaxed text-ink/70">
            <p className="hand text-poppy-deep">Last updated</p>
            <p className="mt-1 font-bold text-ink">4 November 2026</p>
            <p className="mt-2">
              This is a demonstration website. Khanya Nature School is a fictional
              school and no real learner information is processed here.
            </p>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <nav aria-label="On this page" className="sticky top-32 paper-card-plain bg-sky-tint/55 p-4">
              <p className="hand text-poppy-deep">On this page</p>
              <ul className="mt-3 space-y-1 text-[0.82rem]">
                {[
                  ["who", "Who we are"],
                  ["collect", "What we collect"],
                  ["why", "Why we use it"],
                  ["share", "Who we share it with"],
                  ["keep", "How long we keep it"],
                  ["rights", "Your rights"],
                  ["cookies", "Cookies"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="inline-flex min-h-8 items-center font-semibold text-ink/75 transition-colors hover:text-poppy-deep">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            <div className="prose-playful rounded-[28px_22px_30px_18px] bg-paper p-5 sm:p-7">
              <h2 id="who">Who we are</h2>
              <p>
                Khanya Nature School is an independent nature-based preschool with
                branches in Randburg and Fourways, Gauteng. For the purposes of
                the Protection of Personal Information Act, 4 of 2013 (POPIA), the
                school is the responsible party for personal information
                processed through this website.
              </p>
              <p>
                Questions about privacy can be sent to{" "}
                <a href="mailto:hello@khanyanatureschool.example">
                  hello@khanyanatureschool.example
                </a>{" "}
                with &quot;Privacy&quot; in the subject line. Our information
                officer is the school principal.
              </p>

              <h2 id="collect">What we collect</h2>
              <p>
                When you send an enquiry, we collect the parent or guardian name,
                email address, phone number, child name, child date of birth,
                preferred branch, optional programme and preferred start month,
                and the message you write. We record that you agreed to this
                notice and the time you sent the form.
              </p>
              <p>
                We do not ask for identity numbers, financial details or medical
                information through the website. If your child later enrols, the
                admission form collects the information the school needs to care
                for your child safely.
              </p>
              <p>
                Our server may record technical information such as the time of a
                request for security and rate limiting. We do not use advertising
                trackers or third-party analytics on this site.
              </p>

              <h2 id="why">Why we use it</h2>
              <ul>
                <li>To reply to your enquiry and arrange a visit.</li>
                <li>To answer questions about programmes, fees and availability.</li>
                <li>To keep a record of the admissions conversation.</li>
                <li>To protect the website against spam and abuse.</li>
                <li>To meet our legal and accounting obligations if you enrol.</li>
              </ul>
              <p>
                We rely on your consent when you send an enquiry. You may withdraw
                that consent at any time, although we may need to keep a record
                that you asked us to stop.
              </p>

              <h2 id="share">Who we share it with</h2>
              <p>
                We do not sell personal information. Access is limited to staff
                who need it to reply to you or run the school. Our website and
                email service providers process information on our instructions
                and under confidentiality obligations.
              </p>
              <p>
                We may disclose information if the law requires it, or to protect
                a child or someone else from serious harm. We will tell you unless
                we are legally prevented from doing so.
              </p>

              <h2 id="keep">How long we keep it</h2>
              <p>
                Enquiries that do not lead to an application are kept for 24
                months, then deleted. If you ask us to delete your enquiry sooner,
                we will do so unless we need it for a legal reason. Admission and
                learner records are kept for the periods required by applicable
                law and the school&apos;s records policy.
              </p>
              <p>
                Email outbox records in this demonstration are stored in the
                school&apos;s database for operational purposes and are visible
                only to authorised staff.
              </p>

              <h2 id="rights">Your rights</h2>
              <p>Under POPIA you may ask us to:</p>
              <ul>
                <li>confirm what personal information we hold about you;</li>
                <li>correct information that is inaccurate or out of date;</li>
                <li>delete information we no longer have a lawful reason to keep;</li>
                <li>withdraw consent for future processing;</li>
                <li>object to processing based on a legitimate interest.</li>
              </ul>
              <p>
                Send the request to{" "}
                <a href="mailto:hello@khanyanatureschool.example">
                  hello@khanyanatureschool.example
                </a>
                . We may need to verify your identity before acting. If you are not
                satisfied with our response, you may complain to the Information
                Regulator at{" "}
                <a href="https://inforegulator.org.za" target="_blank" rel="noreferrer">
                  inforegulator.org.za
                </a>
                .
              </p>

              <h2 id="cookies">Cookies</h2>
              <p>
                The public website does not set advertising or analytics cookies.
                If a staff member signs in to the administration area, a necessary
                session cookie is set. It is HTTP-only, same-site and restricted to
                this site. Signing out clears the session.
              </p>

              <h2>Security</h2>
              <p>
                We use access controls, encrypted connections in production and
                routine software updates. No system is perfectly secure, but we
                take reasonable steps to protect the information you share with us.
                If a breach affects you, we will notify you and the Information
                Regulator as required by law.
              </p>
            </div>

            <div className="mt-8 paper-card-plain bg-meadow-tint/60 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.84rem] leading-relaxed text-ink/70">
                  Ready to ask about a place? The admissions page explains the
                  process and fees.
                </p>
                <ButtonLink href="/admissions" size="sm">
                  Admissions <ArrowRightIcon className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
              <p className="mt-4 text-[0.78rem] text-ink/60">
                Prefer to talk it through?{" "}
                <Link href="/contact" className="squiggle-link font-bold text-ink">
                  Contact the office
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
