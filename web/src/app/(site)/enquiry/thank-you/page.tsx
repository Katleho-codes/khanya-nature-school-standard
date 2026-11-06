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
      <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="label-caps flex items-center gap-2 text-sage-deep">
            <CheckIcon className="h-4 w-4" />
            Enquiry received
          </p>
          <h1 className="display-xl mt-4 max-w-[14ch] text-forest">
            Thank you. We have it.
          </h1>
          <p className="lead mt-6 max-w-xl">
            Your enquiry has reached the school office. We will reply within one
            working day, usually sooner. If you sent it on a Friday afternoon,
            expect a reply on Monday.
          </p>

          {reference ? (
            <div className="mt-8 border border-line bg-paper p-5">
              <p className="label-caps text-sage-deep">Your reference</p>
              <p className="mt-1.5 font-display text-[1.8rem] tracking-wide text-forest">
                {reference}
              </p>
              <p className="mt-1 text-[0.78rem] text-bark-soft">
                Keep this if you need to phone the office about your enquiry.
              </p>
            </div>
          ) : null}

          <div className="mt-9 border-t border-line pt-6">
            <h2 className="font-display text-[1.55rem] text-forest">What happens next</h2>
            <ol className="mt-5 space-y-5">
              {[
                {
                  title: "We read your enquiry",
                  body: "A person at the school reads it, not an automated system. We check availability for the branch and age group you mentioned.",
                },
                {
                  title: "We reply",
                  body: "You will receive an email or a phone call with answers and a few suggested visit times.",
                },
                {
                  title: "We arrange a visit",
                  body: "If you would like to come, we book a weekday morning. The visit takes about an hour and children are welcome.",
                },
              ].map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4">
                  <span className="pt-0.5 text-[0.72rem] tracking-[0.15em] text-ochre-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.18rem] text-forest">{step.title}</h3>
                    <p className="mt-1 text-[0.86rem] leading-relaxed text-bark-soft">{step.body}</p>
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
          <div className="mt-6 border-t border-line pt-5">
            <p className="label-caps text-sage-deep">Need us sooner?</p>
            {branch ? (
              <div className="mt-3 space-y-2 text-[0.86rem]">
                <a
                  href={phoneHref(branch.phone)}
                  className="flex items-center gap-2 text-forest"
                >
                  <PhoneIcon className="h-4 w-4 text-sage-deep" />
                  {branch.phone}
                </a>
                <a
                  href="mailto:hello@khanyanatureschool.example"
                  className="flex items-center gap-2 break-all text-forest"
                >
                  <MailIcon className="h-4 w-4 shrink-0 text-sage-deep" />
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
          <p className="mt-5 text-[0.76rem] leading-relaxed text-bark-soft">
            Your details are only used to reply to this enquiry. You can read the{" "}
            <Link href="/privacy" className="mark-link text-forest">
              privacy notice
            </Link>
            .
          </p>
        </aside>
      </div>
    </section>
  );
}
