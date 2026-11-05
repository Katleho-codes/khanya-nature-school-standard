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
        className="sr-only z-50 rounded-sm bg-forest px-4 py-2 text-oat focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
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
