import type { Metadata, Viewport } from "next";
import { Baloo_2, Gaegu, Mulish } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { PaperFilters } from "@/components/brand";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-baloo",
  weight: ["700", "800"],
});

const mulish = Mulish({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mulish",
  weight: ["400", "500", "600", "700", "800"],
});

const gaegu = Gaegu({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gaegu",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Khanya Nature School | A small school in the garden",
    template: "%s | Khanya Nature School",
  },
  description:
    "A small preschool in Randburg and Fourways where children play outside, get muddy and take their time. Real gardens, real tools and teachers who know every child.",
  applicationName: "Khanya Nature School",
  authors: [{ name: "Khanya Nature School" }],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "Khanya Nature School",
    title: "Khanya Nature School",
    description:
      "A small preschool in Randburg and Fourways where children play outside, get muddy and take their time.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khanya Nature School",
    description:
      "A small preschool in Randburg and Fourways where children play outside, get muddy and take their time.",
    images: ["/images/og-default.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffc62e",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-ZA"
      data-scroll-behavior="smooth"
      className={`${baloo.variable} ${mulish.variable} ${gaegu.variable}`}
    >
      <body>
        <PaperFilters />
        {children}
      </body>
    </html>
  );
}
