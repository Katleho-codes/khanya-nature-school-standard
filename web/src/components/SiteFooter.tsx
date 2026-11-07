import Link from "next/link";
import { getNav } from "@/lib/site";
import { summariseHours, phoneHref } from "@/lib/format";
import { HillDivider, Logo, ScribbleField, Sun } from "./brand";
import { FooterLink } from "./DesktopNav";
import { branchTone, toneStyle } from "@/lib/tones";
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  YouTubeIcon,
} from "./icons";

export async function SiteFooter() {
  const { settings, branches } = await getNav();
  const year = new Date().getFullYear();

  return (
    <>
      <div aria-hidden className="-mb-px bg-paper">
        <HillDivider className="h-14 w-full text-meadow sm:h-20" />
      </div>
      <footer className="relative overflow-hidden bg-ink text-paper">
        <ScribbleField className="pointer-events-none absolute -right-28 top-10 h-96 w-96 text-sun opacity-[0.12]" />
        <div className="page-container relative py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Link href="/" aria-label="Khanya Nature School home">
                <Logo inverse />
              </Link>
              <p className="mt-5 max-w-xs font-display text-[1.45rem] font-extrabold leading-snug text-paper">
                {settings?.tagline ?? "Room to grow in the light."}
              </p>
              <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-paper/65">
                A small preschool in Randburg and Fourways. Most of the day happens
                outside, in real weather, with time to finish what you started.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {settings?.socialFacebook ? (
                  <a
                    href={settings.socialFacebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Khanya Nature School on Facebook"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-paper/20 text-paper/75 transition-colors hover:border-sun hover:bg-sun hover:text-ink"
                  >
                    <FacebookIcon />
                  </a>
                ) : null}
                {settings?.socialInstagram ? (
                  <a
                    href={settings.socialInstagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Khanya Nature School on Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-paper/20 text-paper/75 transition-colors hover:border-sun hover:bg-sun hover:text-ink"
                  >
                    <InstagramIcon />
                  </a>
                ) : null}
                {settings?.socialYoutube ? (
                  <a
                    href={settings.socialYoutube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Khanya Nature School on YouTube"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-paper/20 text-paper/75 transition-colors hover:border-sun hover:bg-sun hover:text-ink"
                  >
                    <YouTubeIcon />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4">
              <h2 className="inline-flex items-center gap-2 font-display text-xl font-extrabold text-sun">
                <Sun className="h-5 w-5" />
                Our branches
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {branches.map((branch) => {
                  const style = toneStyle(branchTone(branch.slug));
                  return (
                    <li
                      key={branch.id}
                      className={`paper-card-plain ${style.tint} p-4 text-ink`}
                    >
                      <Link
                        href={`/branches/${branch.slug}`}
                        className="font-display text-[1.2rem] font-extrabold transition-colors hover:text-poppy-deep"
                      >
                        {branch.name}
                      </Link>
                      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink/75">
                        {branch.addressLine1}, {branch.suburb}
                      </p>
                      <p className="mt-1 text-[0.82rem] font-semibold text-ink/75">
                        {summariseHours(branch.hours)}
                      </p>
                      <a
                        href={phoneHref(branch.phone)}
                        className="mt-1.5 inline-flex min-h-8 items-center gap-1.5 text-[0.82rem] font-bold text-ink/75 transition-colors hover:text-poppy-deep"
                      >
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {branch.phone}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-display text-xl font-extrabold text-sun">Explore</h2>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li><FooterLink href="/programmes">Programmes</FooterLink></li>
                <li><FooterLink href="/admissions">Admissions</FooterLink></li>
                <li><FooterLink href="/news">News</FooterLink></li>
                <li><FooterLink href="/events">Events</FooterLink></li>
                <li><FooterLink href="/gallery">Gallery</FooterLink></li>
                <li><FooterLink href="/about">Our story</FooterLink></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-display text-xl font-extrabold text-sun">Contact</h2>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <a
                    href="mailto:hello@khanyanatureschool.example"
                    className="inline-flex min-w-0 items-start gap-2 break-all font-semibold text-paper/75 transition-colors hover:text-sun"
                  >
                    <MailIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    hello@khanyanatureschool.example
                  </a>
                </li>
                <li><FooterLink href="/contact">Contact the school</FooterLink></li>
                <li><FooterLink href="/privacy">Privacy and POPIA</FooterLink></li>
                <li>
                  <Link
                    href="/admin/login"
                    className="font-semibold text-paper/55 transition-colors hover:text-sun"
                  >
                    Staff sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t-2 border-paper/15 pt-6 text-[0.78rem] text-paper/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {`© ${year} Khanya Nature School. Fees shown are for 2027.`}
            </p>
            <p>
              Demo website by LSQD Studios. Khanya Nature School is a fictional school.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
