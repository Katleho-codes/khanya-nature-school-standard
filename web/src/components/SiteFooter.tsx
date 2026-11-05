import Link from "next/link";
import { getNav } from "@/lib/site";
import { summariseHours, phoneHref } from "@/lib/format";
import { Logo } from "./brand";
import { FooterLink } from "./DesktopNav";
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
    <footer className="section-forest bg-forest text-oat">
      <div className="page-container py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Khanya Nature School home">
              <Logo inverse />
            </Link>
            <p className="mt-5 max-w-xs font-display text-[1.35rem] leading-snug text-oat/85">
              {settings?.tagline ?? "Room to grow in the light."}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-oat/65">
              A nature-based preschool in Randburg and Fourways. Most of the day
              is spent outside, in real weather, with time to finish what you
              started.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {settings?.socialFacebook ? (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Khanya Nature School on Facebook"
                  className="rounded-sm border border-line-inverse p-2 text-oat/75 transition-colors hover:border-ochre hover:text-oat"
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
                  className="rounded-sm border border-line-inverse p-2 text-oat/75 transition-colors hover:border-ochre hover:text-oat"
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
                  className="rounded-sm border border-line-inverse p-2 text-oat/75 transition-colors hover:border-ochre hover:text-oat"
                >
                  <YouTubeIcon />
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="label-caps text-oat/70">Our branches</h2>
            <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {branches.map((branch) => (
                <li key={branch.id}>
                  <Link
                    href={`/branches/${branch.slug}`}
                    className="font-display text-[1.2rem] text-oat transition-colors hover:text-ochre"
                  >
                    {branch.name}
                  </Link>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-oat/60">
                    {branch.addressLine1}, {branch.suburb}
                  </p>
                  <p className="mt-1 text-[0.8rem] text-oat/60">
                    {summariseHours(branch.hours)}
                  </p>
                  <a
                    href={phoneHref(branch.phone)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[0.8rem] text-oat/75 transition-colors hover:text-ochre"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {branch.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="label-caps text-oat/70">Explore</h2>
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
            <h2 className="label-caps text-oat/70">Contact</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:hello@khanyanatureschool.example"
                  className="inline-flex min-w-0 items-start gap-2 break-all text-oat/75 transition-colors hover:text-ochre"
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
                  className="text-oat/70 transition-colors hover:text-oat/80"
                >
                  Staff sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line-inverse pt-6 text-[0.72rem] text-oat/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {`© ${year} Khanya Nature School. Fees shown are for 2027.`}
          </p>
          <p>
            Demo website by LSQD Studios. Khanya Nature School is a fictional school.
          </p>
        </div>
      </div>
    </footer>
  );
}
