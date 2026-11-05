import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Khanya Nature School | Nature-based preschool in Randburg and Fourways",
    template: "%s | Khanya Nature School",
  },
  description:
    "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors. Small groups, unhurried time and real materials.",
  applicationName: "Khanya Nature School",
  authors: [{ name: "Khanya Nature School" }],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: "Khanya Nature School",
    title: "Khanya Nature School",
    description:
      "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khanya Nature School",
    description:
      "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors.",
    images: ["/images/og-default.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-ZA"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
