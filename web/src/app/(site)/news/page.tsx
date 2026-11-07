import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/api";
import { getNav } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { formatDate } from "@/lib/format";
import { PageIntro } from "@/components/PageIntro";
import { PostCard } from "@/components/PublicCards";
import { ButtonLink } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { ArrowRightIcon } from "@/components/icons";

const categories = [
  { value: "", label: "All news" },
  { value: "NEWS", label: "News" },
  { value: "ANNOUNCEMENT", label: "Announcements" },
  { value: "NOTICE", label: "Notices" },
] as const;

type Category = (typeof categories)[number]["value"];

interface PageProps {
  searchParams: Promise<{ branch?: string; category?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "News and notices",
    description:
      "News, announcements and practical notices from the two Khanya Nature School gardens in Randburg and Fourways.",
    path: "/news",
  });
}

function filterHref(branch: string | undefined, category: string | undefined): string {
  const query = new URLSearchParams();
  if (branch) query.set("branch", branch);
  if (category) query.set("category", category);
  const suffix = query.toString();
  return suffix ? `/news?${suffix}` : "/news";
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = categories.some((item) => item.value === params.category)
    ? (params.category as Category)
    : "";
  const branch = params.branch ?? "";
  const [{ posts }, nav] = await Promise.all([
    getPosts({
      branch: branch || undefined,
      category: category || undefined,
      limit: 100,
    }),
    getNav(),
  ]);

  const activeBranch = nav.branches.find((item) => item.slug === branch);
  const pinned = posts.filter((post) => post.isPinned).slice(0, 1);
  const rest = posts.filter((post) => !pinned.some((item) => item.id === post.id));

  return (
    <>
      <PageIntro
        eyebrow="News"
        title={
          <>
            Notes from the <span className="text-poppy-deep">garden.</span>
          </>
        }
        lead="What is growing, what is changing and the notices that keep the school day running. Written by the teachers and the office."
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
      />

      <section className="page-container pb-12">
        <div className="flex flex-col gap-5 rounded-[24px] bg-sun-tint/60 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-hand text-[1.05rem] text-ink/65">Type</span>
            {categories.map((item) => {
              const active = category === item.value;
              return (
                <Link
                  key={item.label}
                  href={filterHref(branch || undefined, item.value || undefined)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-full border-2 px-3.5 py-1.5 text-[0.78rem] font-bold transition-colors ${
                    active
                      ? "border-ink bg-sun text-ink"
                      : "border-ink/15 bg-paper text-ink/70 hover:border-ink hover:bg-sun-tint hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-hand text-[1.05rem] text-ink/65">Branch</span>
            <Link
              href={filterHref(undefined, category || undefined)}
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
                  href={filterHref(item.slug, category || undefined)}
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
          </div>
        </div>
        <p className="mt-3 text-[0.75rem] text-ink/65">
          {activeBranch ? `Showing stories for ${activeBranch.name}.` : "Showing all branches."}
        </p>
      </section>

      <section className="page-container pb-16 md:pb-24">
        {posts.length === 0 ? (
          <div className="paper-card bg-sun-tint p-6 md:p-8">
            <h2 className="font-display text-[1.8rem] font-extrabold text-ink">
              Nothing filed under that combination yet.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
              Try another type or branch. The office also sends important notices
              by email to enrolled families.
            </p>
            <ButtonLink href="/news" variant="outline" className="mt-5" size="sm">
              Clear filters
            </ButtonLink>
          </div>
        ) : (
          <>
            {pinned.map((post) => (
              <article key={post.id} className="mb-10 paper-card bg-paper p-4 sm:p-6">
                <div className="grid gap-7 lg:grid-cols-12 lg:items-center lg:gap-10">
                  <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tag bg-sun text-ink">
                        <span className="h-1.5 w-1.5 rounded-full bg-poppy-deep" aria-hidden />
                        Pinned
                      </span>
                      <span className="tag bg-sky-tint text-ink">{post.branch?.name ?? "All branches"}</span>
                      <span className="text-[0.78rem] font-semibold text-ink/55">
                        {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      </span>
                    </div>
                    <h2 className="display-lg mt-3 text-ink">
                      <Link href={`/news/${post.slug}`} className="transition-colors hover:text-poppy-deep">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="lead mt-4 max-w-2xl">{post.excerpt}</p>
                    <Link
                      href={`/news/${post.slug}`}
                      className="squiggle-link mt-5 inline-flex min-h-9 items-center gap-1.5 text-[0.85rem] font-bold text-ink"
                    >
                      Read the story <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="lg:col-span-4 lg:col-start-9">
                    <Photo
                      src={post.cover?.url ?? null}
                      alt={post.cover?.alt ?? post.title}
                      ratio="3 / 2"
                      shape="paper"
                      tone="sun"
                      sizes="(min-width: 1024px) 30vw, 100vw"
                    />
                  </div>
                </div>
              </article>
            ))}
            <div className="space-y-4">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} layout="row" />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="border-t border-ink/10 bg-meadow-tint/35">
        <div className="page-container py-12 md:py-16">
          <div className="grid gap-8 paper-card bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="hand text-poppy-deep">Never miss a notice</p>
              <h2 className="display-md mt-1 text-ink">
                The useful things also arrive by email.
              </h2>
              <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-ink/65">
                Enrolled families receive term dates, fee reminders and urgent
                notices directly. For the public, this page is the record.
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
