import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getNav, defaultWhatsappNumber } from "@/lib/site";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { branches, programmes, settings } = await getNav();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-sun px-5 py-3 font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <WhatsAppFloat
        branches={branches}
        programmes={programmes}
        defaultNumber={defaultWhatsappNumber()}
        defaultMessage={
          settings?.whatsappDefaultMessage ??
          "Hello Khanya Nature School, I would like to know more about your programmes."
        }
      />
    </>
  );
}
