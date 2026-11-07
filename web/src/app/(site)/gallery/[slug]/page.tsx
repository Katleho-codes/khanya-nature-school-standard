import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbum, getAlbums } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { breadcrumbSchema, pageMetadata } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";
import { PageIntro } from "@/components/PageIntro";
import { GalleryGrid, type GalleryPhoto } from "@/components/GalleryGrid";
import { AlbumCard } from "@/components/PublicCards";
import { ButtonLink } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { imageExists } from "@/components/Photo";
import { ArrowRightIcon } from "@/components/icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getAlbum(slug);
  if (!result) {
    return pageMetadata({
      title: "Album not found",
      description: "That photo album could not be found.",
      path: `/gallery/${slug}`,
    });
  }
  const { album } = result;
  return pageMetadata({
    title: album.title,
    description: album.description,
    path: `/gallery/${album.slug}`,
    image: album.cover?.url ?? null,
  });
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getAlbum(slug);
  if (!result) notFound();
  const { album } = result;
  const allAlbums = await getAlbums();
  const others = allAlbums.albums.filter((item) => item.id !== album.id).slice(0, 3);

  const photos: GalleryPhoto[] = (album.photos ?? []).map((photo) => ({
    src: photo.media.url,
    alt: photo.alt || photo.media.alt || album.title,
    caption: photo.caption,
    hasImage: imageExists(photo.media.url),
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: album.title,
          description: album.description,
          url: `${siteUrl()}/gallery/${album.slug}`,
          image: photos
            .slice(0, 10)
            .map((photo) => (photo.src ? `${siteUrl()}${photo.src}` : `${siteUrl()}/images/og-default.jpg`)),
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
          { name: album.title, path: `/gallery/${album.slug}` },
        ])}
      />

      <PageIntro
        eyebrow={`${album.branch?.name ?? "Both branches"} · ${
          album.takenOn ? formatDate(album.takenOn) : "From the archive"
        }`}
        title={album.title}
        lead={album.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery", href: "/gallery" },
          { label: album.title },
        ]}
        aside={
          <div className="mt-6 paper-card rotate-[-0.8deg] bg-sun-tint p-4">
            <p className="hand text-poppy-deep">The picture book</p>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/75">
              {photos.length} {photos.length === 1 ? "photograph" : "photographs"}.
              Select any image to open it larger.
            </p>
            <Link
              href="/gallery"
              className="squiggle-link mt-2 inline-flex min-h-8 items-center gap-1.5 text-[0.82rem] font-bold text-ink"
            >
              All albums <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <GalleryGrid photos={photos} albumTitle={album.title} />
      </section>

      {others.length > 0 ? (
        <section className="border-t border-ink/10 bg-meadow-tint/35 section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="sticker bg-paper text-ink">More to see</p>
                <h2 className="display-md mt-2 text-ink">Other albums</h2>
              </div>
              <ButtonLink href="/gallery" variant="text" size="sm">
                All albums <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              {others.map((item) => (
                <AlbumCard key={item.id} album={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
