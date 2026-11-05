import type { Metadata } from "next";
import Link from "next/link";
import { getAlbums } from "@/lib/api";
import { getNav } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/PageIntro";
import { AlbumCard } from "@/components/PublicCards";
import { ButtonLink } from "@/components/Button";

interface PageProps {
  searchParams: Promise<{ branch?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Gallery: days in the garden",
    description:
      "Photographs from the Khanya Nature School gardens: mud kitchens, seasonal changes, open days and the ordinary work of playing outside.",
    path: "/gallery",
  });
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const branch = params.branch ?? "";
  const [{ albums }, nav] = await Promise.all([getAlbums(), getNav()]);
  const activeBranch = nav.branches.find((item) => item.slug === branch);
  const filtered = branch
    ? albums.filter((album) => album.branch?.slug === branch)
    : albums;

  return (
    <>
      <PageIntro
        eyebrow="Gallery"
        title={
          <>
            The ordinary days, <span className="italic text-sage-deep">kept.</span>
          </>
        }
        lead="Not a highlights reel. Mud, weather, small hands, the same corner of the garden across a year, and the days when families fill the chairs."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
        aside={
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[0.8rem] leading-relaxed text-bark-soft">
              We only publish photographs with family permission. Faces are shown
              only where consent is current.
            </p>
          </div>
        }
      />

      <section className="page-container pb-8">
        <div className="flex flex-wrap items-center gap-2 border-y border-line py-4">
          <span className="label-caps mr-2 text-sage-deep">Branch</span>
          <Link
            href="/gallery"
            aria-current={!branch ? "page" : undefined}
            className={`rounded-sm border px-3 py-1.5 text-[0.76rem] transition-colors ${
              !branch
                ? "border-forest bg-forest text-oat"
                : "border-line-strong text-bark-soft hover:border-forest hover:text-forest"
            }`}
          >
            All
          </Link>
          {nav.branches.map((item) => {
            const active = branch === item.slug;
            return (
              <Link
                key={item.id}
                href={`/gallery?branch=${item.slug}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-sm border px-3 py-1.5 text-[0.76rem] transition-colors ${
                  active
                    ? "border-forest bg-forest text-oat"
                    : "border-line-strong text-bark-soft hover:border-forest hover:text-forest"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          {activeBranch ? (
            <span className="ml-auto text-[0.74rem] text-bark-soft">
              Showing {activeBranch.name} albums
            </span>
          ) : null}
        </div>
      </section>

      <section className="page-container pb-16 md:pb-24">
        {filtered.length === 0 ? (
          <div className="border-t border-line py-12">
            <h2 className="font-display text-[1.8rem] text-forest">
              No albums for that branch yet.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-bark-soft">
              The next set of photographs is probably still being sorted. Try all
              branches in the meantime.
            </p>
            <ButtonLink href="/gallery" variant="outline" className="mt-5" size="sm">
              All albums
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-12 sm:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-3">
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line bg-paper">
        <div className="page-container py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="label-caps text-sage-deep">A note on photographs</p>
              <h2 className="display-md mt-2 text-forest">
                These are real days, not a photo shoot.
              </h2>
              <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-bark-soft">
                We photograph the work, the weather and the small moments that
                make up a week. If you are a current family and would like an
                image of your child removed, contact the office and we will do it
                without discussion.
              </p>
            </div>
            <ButtonLink href="/contact" variant="outline">
              Contact the office
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
