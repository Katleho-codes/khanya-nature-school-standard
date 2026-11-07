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
            Mud, cake and the <span className="text-poppy-deep">same old tree.</span>
          </>
        }
        lead="We photograph the ordinary days, not a highlights reel. Wet socks, small hands, the same corner of the garden across a year, and the mornings when families fill the chairs."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
        aside={
          <div className="mt-6 paper-card rotate-[1deg] bg-meadow-tint p-4">
            <p className="hand text-poppy-deep">A small promise</p>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/70">
              We only publish photographs with family permission. Faces are shown
              only where consent is current.
            </p>
          </div>
        }
      />

      <section className="page-container pb-8">
        <div className="flex flex-wrap items-center gap-2 rounded-[24px] bg-sky-tint/60 px-4 py-4">
          <span className="mr-2 font-hand text-[1.05rem] text-ink/65">Branch</span>
          <Link
            href="/gallery"
            aria-current={!branch ? "page" : undefined}
            className={`inline-flex min-h-9 items-center rounded-full border-2 px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${
              !branch
                ? "border-ink bg-sun text-ink"
                : "border-ink/15 bg-paper text-ink/70 hover:border-ink hover:bg-sun-tint hover:text-ink"
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
                className={`inline-flex min-h-9 items-center rounded-full border-2 px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${
                  active
                    ? "border-ink bg-sun text-ink"
                    : "border-ink/15 bg-paper text-ink/70 hover:border-ink hover:bg-sun-tint hover:text-ink"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          {activeBranch ? (
            <span className="ml-auto text-[0.74rem] text-ink/65">
              Showing {activeBranch.name} albums
            </span>
          ) : null}
        </div>
      </section>

      <section className="page-container pb-16 md:pb-24">
        {filtered.length === 0 ? (
          <div className="paper-card bg-meadow-tint p-6 md:p-8">
            <h2 className="font-display text-[1.8rem] font-extrabold text-ink">
              No albums for that branch yet.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
              The next set of photographs is probably still being sorted. Try all
              branches in the meantime.
            </p>
            <ButtonLink href="/gallery" variant="outline" className="mt-5" size="sm">
              All albums
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-ink/10 bg-sun-tint/35">
        <div className="page-container py-12 md:py-16">
          <div className="grid gap-8 paper-card bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="hand text-poppy-deep">A note on photographs</p>
              <h2 className="display-md mt-1 text-ink">
                These are real days, not a photo shoot.
              </h2>
              <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-ink/65">
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
