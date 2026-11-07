import Link from "next/link";
import { ButtonLink } from "./Button";
import { DesktopNav } from "./DesktopNav";
import { Logo, Sun } from "./brand";
import { MobileMenu } from "./MobileMenu";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { getNav, defaultWhatsappNumber } from "@/lib/site";
import { phoneHref } from "@/lib/format";
import { branchTone, toneStyle } from "@/lib/tones";
import { whatsappLink } from "@/lib/whatsapp";

export async function SiteHeader() {
  const { branches, settings } = await getNav();
  const defaultNumber = defaultWhatsappNumber();
  const waMessage =
    settings?.whatsappDefaultMessage ??
    "Hello Khanya Nature School, I would like to know more about your programmes.";

  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink/10 bg-paper/95 backdrop-blur-sm">
      <div className="hidden bg-sun-tint md:block">
        <div className="page-container flex h-10 items-center justify-between gap-6 text-[0.8rem] font-semibold text-ink">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-hand text-[1.05rem]">
              <Sun className="h-4 w-4 text-sun-deep" />
              Two gardens. One small school.
            </span>
            <span aria-hidden className="h-4 w-px bg-ink/15" />
            {branches.map((branch) => {
              const style = toneStyle(branchTone(branch.slug));
              return (
                <Link
                  key={branch.id}
                  href={`/branches/${branch.slug}`}
                  className={`tag ${style.pill} transition-transform hover:-rotate-2`}
                >
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden />
                  {branch.name}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-ink/75">Visits by arrangement</span>
            {branches[0] ? (
              <a
                href={phoneHref(branches[0].phone)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-poppy-deep"
              >
                <PhoneIcon className="h-3.5 w-3.5" />
                {branches[0].phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="page-container flex h-[4.9rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Khanya Nature School home" className="shrink-0">
          <Logo />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2.5">
          <a
            href={whatsappLink(defaultNumber, waMessage)}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center gap-1.5 rounded-full px-3 text-[0.86rem] font-bold text-ink transition-colors hover:bg-meadow-tint md:inline-flex"
          >
            <WhatsAppIcon className="h-[1.05rem] w-[1.05rem]" />
            WhatsApp
          </a>
          <ButtonLink href="/admissions#enquiry" size="sm" className="hidden sm:inline-flex">
            Enquire
          </ButtonLink>
          <MobileMenu branches={branches} />
        </div>
      </div>
    </header>
  );
}
