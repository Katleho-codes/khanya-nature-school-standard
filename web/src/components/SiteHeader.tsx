import Link from "next/link";
import { ButtonLink } from "./Button";
import { DesktopNav } from "./DesktopNav";
import { Logo } from "./brand";
import { MobileMenu } from "./MobileMenu";
import { PhoneIcon, WhatsAppIcon } from "./icons";
import { getNav, defaultWhatsappNumber } from "@/lib/site";
import { phoneHref } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export async function SiteHeader() {
  const { branches, settings } = await getNav();
  const defaultNumber = defaultWhatsappNumber();
  const waMessage =
    settings?.whatsappDefaultMessage ??
    "Hello Khanya Nature School, I would like to know more about your programmes.";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-oat">
      <div className="hidden border-b border-line md:block">
        <div className="page-container flex h-9 items-center justify-between gap-6 text-[0.72rem] text-bark-soft">
          <div className="flex items-center gap-5">
            <span className="label-caps text-sage-deep">Branches</span>
            {branches.map((branch) => (
              <Link
                key={branch.id}
                href={`/branches/${branch.slug}`}
                className="transition-colors hover:text-forest"
              >
                {branch.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span>Weekday visits by arrangement</span>
            {branches[0] ? (
              <a
                href={phoneHref(branches[0].phone)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-forest"
              >
                <PhoneIcon className="h-3.5 w-3.5" />
                {branches[0].phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="page-container flex h-[4.6rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Khanya Nature School home" className="shrink-0">
          <Logo />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2.5">
          <a
            href={whatsappLink(defaultNumber, waMessage)}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 border-b-2 border-transparent py-1 text-[0.82rem] text-forest transition-colors hover:border-ochre md:inline-flex"
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
