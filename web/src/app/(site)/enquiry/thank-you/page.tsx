import type { Metadata } from "next";
import Link from "next/link";
import { getBranches } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { ButtonLink } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { WhatsAppButton } from "@/components/Editorial";
import { CheckIcon, ArrowRightIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { phoneHref } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ reference?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await pageMetadata({
    title: "Thank you for your enquiry",
    description:
      "Your enquiry has reached Khanya Nature School. Here is what happens next.",
    path: "/enquiry/thank-you",
  });
  return { ...metadata, robots: { index: false, follow: false } };
}

export default async function ThankYouPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = params.reference?.trim() ?? "";
  const { branches } = await getBranches();
  const branch = branches[0] ?? null;

  return (
    <section className="page-container py-12 md:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="sticker bg-sun text-ink">
            <CheckIcon className="h-4 w-4" />
            Enquiry received
          </p>
          <h1 className="display-xl mt-4 max-w-[14ch] text-ink">
            Thank you. We have it.
          </h1>
          <p className="lead mt-6 max-w-xl">
            Your enquiry has reached the school office. We will reply within one
            working day, usually sooner. If you sent it on a Friday afternoon,
            expect a reply on Monday.
          </p>

          {reference ? (
            <div className="mt-8 paper-card rotate-[-0.5deg] bg-sun-tint p-5">
              <p className="hand text-poppy-deep">Your reference</p>
              <p className="mt-1 font-display text-[1.8rem] font-extrabold tracking-wide text-ink">
                {reference}
              </p>
              <p className="mt-1 text-[0.78rem] text-ink/75">
                Keep this if you need to phone the office about your enquiry.
              </p>
            </div>
          ) : null}

          <div className="mt-9">
            <p className="sticker bg-paper text-ink">What happens next</p>
            <ol className="mt-5 space-y-3">
              {[
                {
                  title: "We read your enquiry",
                  body: "A person at the school reads it, not an automated system. We check availability for the branch and age group you mentioned.",
                  tone: "bg-sky-tint",
                },
                {
                  title: "We reply",
                  body: "You will receive an email or a phone call with answers and a few suggested visit times.",
                  tone: "bg-meadow-tint",
                },
                {
                  title: "We arrange a visit",
                  body: "If you would like to come, we book a weekday morning. The visit takes about an hour and children are welcome.",
                  tone: "bg-poppy-tint",
                },
              ].map((step, index) => (
                <li key={step.title} className={`grid grid-cols-[2rem_1fr] gap-4 paper-card-plain ${step.tone} p-4`}>
                  <span className="pt-0.5 font-display text-[0.92rem] font-extrabold text-poppy-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-display text-[1.18rem] font-extrabold text-ink">{step.title}</h2>
                    <p className="mt-1 text-[0.86rem] leading-relaxed text-ink/75">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/programmes" variant="outline">
              Browse programmes <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/" variant="text">
              Back to the home page
            </ButtonLink>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <Photo
            src={null}
            alt="The Khanya Nature School garden"
            ratio="4 / 5"
            shape="wobbly"
            tone="sky"
            placeholder="The garden is waiting for your visit."
            sizes="(min-width: 1024px) 30vw, 100vw"
          />
          <div className="mt-6 paper-card bg-paper p-4">
            <p className="hand text-poppy-deep">Need us sooner?</p>
            {branch ? (
              <div className="mt-3 space-y-2 text-[0.86rem]">
                <a
                  href={phoneHref(branch.phone)}
                  className="flex min-h-10 items-center gap-2 font-semibold text-ink"
                >
                  <PhoneIcon className="h-4 w-4 text-poppy-deep" />
                  {branch.phone}
                </a>
                <a
                  href="mailto:hello@khanyanatureschool.example"
                  className="flex min-h-10 items-center gap-2 break-all font-semibold text-ink"
                >
                  <MailIcon className="h-4 w-4 shrink-0 text-poppy-deep" />
                  hello@khanyanatureschool.example
                </a>
              </div>
            ) : null}
            <WhatsAppButton
              number={branch?.whatsapp ?? "27825550100"}
              message={
                reference
                  ? `Hello Khanya Nature School, I sent an enquiry with reference ${reference}.`
                  : "Hello Khanya Nature School, I have just sent an enquiry through the website."
              }
              label="WhatsApp the school"
              className="mt-4 w-full"
            />
          </div>
          <p className="mt-5 text-[0.76rem] leading-relaxed text-ink/75">
            Your details are only used to reply to this enquiry. You can read the{" "}
            <Link href="/privacy" className="squiggle-link font-bold text-ink">
              privacy notice
            </Link>
            .
          </p>
        </aside>
      </div>
    </section>
  );
}
