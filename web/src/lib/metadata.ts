import type { Metadata } from "next";
import { getNav, siteUrl } from "./site";

interface PageMetadataOptions {
  title?: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

function absoluteTitle(title: string): string {
  return title.includes("Khanya Nature School")
    ? title
    : `${title} | Khanya Nature School`;
}

export async function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Promise<Metadata> {
  const { settings } = await getNav();
  const resolvedTitle =
    title ??
    settings?.defaultSeoTitle ??
    "Khanya Nature School | Nature-based preschool in Randburg and Fourways";
  const resolvedDescription =
    description ??
    settings?.defaultSeoDescription ??
    "A nature-based preschool in Randburg and Fourways where children spend most of the day outdoors.";
  const imageUrl =
    image ??
    settings?.ogImage?.url ??
    "/images/og-default.jpg";

  return {
    title: { absolute: absoluteTitle(resolvedTitle) },
    description: resolvedDescription,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "en_ZA",
      url: `${siteUrl()}${path}`,
      siteName: settings?.schoolName ?? "Khanya Nature School",
      title: absoluteTitle(resolvedTitle),
      description: resolvedDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${settings?.schoolName ?? "Khanya Nature School"} garden`,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle(resolvedTitle),
      description: resolvedDescription,
      images: [imageUrl],
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
    })),
  };
}
