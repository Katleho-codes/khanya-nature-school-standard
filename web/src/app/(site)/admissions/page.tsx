import type { Metadata } from "next";
import Link from "next/link";
import { getBranches, getDocuments, getProgrammes } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { formatFee, formatRand, summariseHours, phoneHref } from "@/lib/format";
import { PageIntro } from "@/components/PageIntro";
import { ButtonLink } from "@/components/Button";
import { EnquiryForm } from "@/components/EnquiryForm";
import { DocumentRow } from "@/components/PublicCards";
import { SectionHeading, WhatsAppButton, EditorialQuote } from "@/components/Editorial";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRightIcon, CheckIcon, DownloadIcon, PhoneIcon } from "@/components/icons";

interface PageProps {
  searchParams: Promise<{ branch?: string; programme?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Admissions and fees",
    description:
      "How to apply to Khanya Nature School, what the 2027 fees are, which documents you need and how to arrange a visit to the Randburg or Fourways garden.",
    path: "/admissions",
  });
}

const faqs = [
  {
    question: "When should we apply?",
    answer:
      "Most families enquire nine to twelve months before they hope to start. For the best choice of days, apply in the first half of the year before your child turns the age for the group. We also hold a small waiting list for mid-year places.",
  },
  {
    question: "Can my child start mid-year?",
    answer:
      "Sometimes. It depends on the group and on whether the child is ready. Mid-year starts work best for toddlers and for families moving to the area. We will talk honestly about the fit.",
  },
  {
    question: "Do you take children in nappies?",
    answer:
      "Yes. Little Explorers is set up for children who are still learning to use the toilet. Teachers work with each family on a plan and we do not hurry the process.",
  },
  {
    question: "Is the holiday programme included in term fees?",
    answer:
      "No. The holiday programme is booked and paid separately, by the day or by the week. It is open to Khanya families and their friends, subject to places.",
  },
  {
    question: "What does the monthly fee include?",
    answer:
      "Materials, garden supplies, cooking ingredients on set days and the ordinary running of the day. It does not include the once-off registration fee, extra holiday days or optional aftercare beyond 17:00.",
  },
];

export default async function AdmissionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ branches }, { programmes }, { documents }] = await Promise.all([
    getBranches(),
    getProgrammes(),
    getDocuments(),
  ]);

  const requestedBranch = branches.find((branch) => branch.slug === params.branch);
  const allBranchProgrammes = branches.flatMap((branch) =>
    branch.programmes.map((programme) => ({ branch, programme })),
  );
  const requestedProgramme = allBranchProgrammes.find(
    (item) => item.programme.slug === params.programme,
  );
  const initialBranch = requestedBranch ?? requestedProgramme?.branch ?? null;
  const initialProgramme =
    requestedBranch && params.programme
      ? requestedBranch.programmes.find((programme) => programme.slug === params.programme)
      : requestedProgramme?.programme;

  const feeRows = programmes.filter((programme) => programme.monthlyFeeCents !== null);
  const cheapest = feeRows
    .map((programme) => programme.monthlyFeeCents ?? 0)
    .sort((left, right) => left - right)[0];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />

      <PageIntro
        eyebrow="Admissions"
        title={
          <>
            A clear path from <span className="italic text-sage-deep">first look</span>{" "}
            to first day.
          </>
        }
        lead="No entrance tests, no performance. We want to know your child, your family and what you need from a school. Then we will tell you honestly whether we can provide it."
        crumbs={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
        aside={
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[0.82rem] leading-relaxed text-bark-soft">
              Enquiries for 2027 are open. Places are offered in order of
              application after a visit.
              {cheapest ? ` Term-time fees start at ${formatRand(cheapest)} per month.` : ""}
            </p>
            <ButtonLink href="#enquiry" className="mt-4 w-full">
              Start an enquiry <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
        }
      />

      <section id="process" className="page-container pb-16 md:pb-24">
        <div className="border-t border-line pt-8">
          <p className="label-caps text-sage-deep">How it works</p>
          <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Enquire",
                body: "Send the form below or phone the branch. We will reply within one working day with available visit times.",
              },
              {
                title: "Visit",
                body: "Spend a weekday morning in the garden. Meet the teacher, see the ordinary day and ask everything.",
              },
              {
                title: "Apply",
                body: "If it feels right, we send the admission form, fee schedule and available start dates.",
              },
              {
                title: "Confirm",
                body: "Return the form and pay the registration fee. We confirm the place in writing and plan the first days.",
              },
            ].map((step, index) => (
              <div key={step.title} className="border-t border-line pt-4">
                <p className="text-[0.72rem] tracking-[0.16em] text-ochre-deep">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-display text-[1.35rem] text-forest">{step.title}</h2>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-bark-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" className="border-y border-line bg-paper section">
        <div className="page-container grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="label-caps text-sage-deep">The visit</p>
            <h2 className="display-lg mt-3 text-forest">Come on an ordinary morning.</h2>
            <p className="lead mt-4">
              No staged tour. You will see the arrival, the morning circle, the
              long outdoor session and whatever the weather is doing.
            </p>
            <EditorialQuote attribution="What families tell us afterwards">
              We stopped looking at the brochure and started watching the
              children. That was the decision.
            </EditorialQuote>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="grid gap-6">
              <div className="border-t border-line pt-4">
                <h3 className="font-display text-[1.3rem] text-forest">What to expect</h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
                  Allow about an hour. Wear shoes that can handle a garden. Bring
                  your child if you can; watching them in the space tells you
                  more than any conversation.
                </p>
              </div>
              <div className="border-t border-line pt-4">
                <h3 className="font-display text-[1.3rem] text-forest">When</h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
                  Weekday mornings during term, usually 09:00 to 10:00. We avoid
                  the first week of term and rest time.
                </p>
              </div>
              <div className="border-t border-line pt-4">
                <h3 className="font-display text-[1.3rem] text-forest">Who you will meet</h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
                  The branch principal, the teacher who would work with your
                  child and, if you are lucky, whichever chicken is currently
                  broody.
                </p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {branches.map((branch) => (
                <a
                  key={branch.id}
                  href={phoneHref(branch.phone)}
                  className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-4 py-2.5 text-[0.8rem] text-forest transition-colors hover:bg-forest-tint"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {branch.name}: {branch.phone}
                </a>
              ))}
            </div>
            <p className="mt-3 text-[0.78rem] text-bark-soft">
              {branches[0]
                ? `Open ${summariseHours(branches[0].hours)}.`
                : "Weekday visits by arrangement."}
            </p>
          </div>
        </div>
      </section>

      <section id="fees" className="section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Fees for 2027"
            title="Plain numbers, no surprises."
            lead="Fees are monthly and paid in advance. The registration fee is once off and payable when a place is accepted."
            action={
              <ButtonLink href="#documents" variant="text">
                Download the fee schedule <DownloadIcon className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="mt-9 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-[0.86rem]">
              <thead>
                <tr className="border-y border-line text-[0.66rem] uppercase tracking-[0.14em] text-sage-deep">
                  <th scope="col" className="py-3 pr-4 font-medium">Programme</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Age</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Hours</th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">Monthly</th>
                  <th scope="col" className="py-3 font-medium">Includes</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((programme) => (
                  <tr key={programme.id} className="border-b border-line align-top">
                    <th scope="row" className="py-4 pr-4 font-normal">
                      <Link href={`/programmes/${programme.slug}`} className="mark-link font-display text-[1.05rem] text-forest">
                        {programme.name}
                      </Link>
                    </th>
                    <td className="py-4 pr-4 text-bark-soft">{programme.ageLabel}</td>
                    <td className="py-4 pr-4 text-bark-soft">{programme.hoursLabel}</td>
                    <td className="py-4 pr-4 text-right tabular-nums text-forest">
                      {formatFee(programme.monthlyFeeCents)}
                    </td>
                    <td className="py-4 text-[0.8rem] leading-relaxed text-bark-soft">
                      {programme.feeNote ?? "Materials and the ordinary school day."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-4 border-t border-line pt-5 text-[0.78rem] leading-relaxed text-bark-soft sm:grid-cols-3">
            <p>
              <span className="font-medium text-forest">Registration fee:</span>{" "}
              R2 500 once off, on acceptance of a place.
            </p>
            <p>
              <span className="font-medium text-forest">Notice period:</span> one
              full calendar month, in writing.
            </p>
            <p>
              <span className="font-medium text-forest">Sibling discount:</span>{" "}
              10% off the younger child&apos;s monthly fee.
            </p>
          </div>
        </div>
      </section>

      <section id="documents" className="border-y border-line bg-paper section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Documents"
            title="Everything you need, in one place."
            lead="These are the current 2027 documents. If anything is unclear, phone the office before you fill it in."
          />
          <div className="mt-8">
            {documents.map((document) => (
              <DocumentRow key={document.id} document={document} />
            ))}
          </div>
        </div>
      </section>

      <section id="enquiry" className="section scroll-mt-24">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="label-caps text-sage-deep">Start here</p>
              <h2 className="display-lg mt-3 text-forest">Send an enquiry.</h2>
              <p className="lead mt-4">
                Tell us a little about your child. We will reply within one
                working day, usually sooner.
              </p>
              <div className="mt-7 space-y-4 text-[0.84rem] leading-relaxed text-bark-soft">
                <p className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" />
                  No obligation and no automatic mailing list.
                </p>
                <p className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" />
                  We only use your details to reply to this enquiry.
                </p>
                <p className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" />
                  You can ask us to delete your details at any time.
                </p>
              </div>
              <div className="mt-7">
                <WhatsAppButton
                  number={initialBranch?.whatsapp ?? branches[0]?.whatsapp ?? "27825550100"}
                  message={
                    initialBranch
                      ? `Hello ${initialBranch.name}, I would like to ask about a place at Khanya Nature School.`
                      : "Hello Khanya Nature School, I would like to ask about a place for my child."
                  }
                  label="Rather use WhatsApp?"
                />
              </div>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="border border-line bg-paper p-5 md:p-8">
                <EnquiryForm
                  branches={branches}
                  initialBranchId={initialBranch?.id ?? ""}
                  initialProgrammeId={initialProgramme?.id ?? ""}
                />
              </div>
              <p className="mt-3 text-[0.74rem] leading-relaxed text-bark-soft">
                By sending this form you agree to the{" "}
                <Link href="/privacy" className="mark-link text-forest">
                  privacy notice
                </Link>
                . This form is for general enquiries, not for reporting an
                emergency. Phone the branch if you need an urgent reply.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-sage-tint/40 section">
        <div className="page-container">
          <SectionHeading
            eyebrow="Questions"
            title="The things families ask."
            lead="If your question is not here, ask it in the enquiry form. We would rather answer it now than have you wonder."
          />
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[1.16rem] text-forest marker:hidden">
                  {item.question}
                  <span className="shrink-0 text-sage-deep transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-[0.88rem] leading-relaxed text-bark-soft">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
