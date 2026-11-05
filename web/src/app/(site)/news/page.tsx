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
            Notes from the <span className="italic text-sage-deep">garden.</span>
          </>
        }
        lead="What is growing, what is changing and the practical notices that keep the school day running. Written by the teachers and the office."
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
      />

      <section className="page-container pb-12">
        <div className="flex flex-col gap-5 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-caps mr-2 text-sage-deep">Type</span>
            {categories.map((item) => {
              const active = category === item.value;
              return (
                <Link
                  key={item.label}
                  href={filterHref(branch || undefined, item.value || undefined)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-sm border px-3 py-1.5 text-[0.76rem] transition-colors ${
                    active
                      ? "border-forest bg-forest text-oat"
                      : "border-line-strong text-bark-soft hover:border-forest hover:text-forest"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-caps mr-2 text-sage-deep">Branch</span>
            <Link
              href={filterHref(undefined, category || undefined)}
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
                  href={filterHref(item.slug, category || undefined)}
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
          </div>
        </div>
        <p className="mt-3 text-[0.75rem] text-bark-soft">
          {activeBranch ? `Showing stories for ${activeBranch.name}.` : "Showing all branches."}
        </p>
      </section>

      <section className="page-container pb-16 md:pb-24">
        {posts.length === 0 ? (
          <div className="border-t border-line py-12">
            <h2 className="font-display text-[1.8rem] text-forest">
              Nothing filed under that combination yet.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-bark-soft">
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
              <article key={post.id} className="mb-12 border-b border-line pb-12">
                <div className="grid gap-7 lg:grid-cols-12 lg:items-center lg:gap-12">
                  <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-sage-deep">
                      <span className="inline-flex items-center gap-1.5 text-forest">
                        <span className="h-1.5 w-1.5 rounded-full bg-ochre" aria-hidden />
                        Pinned
                      </span>
                      <span aria-hidden>·</span>
                      <span>{post.branch?.name ?? "All branches"}</span>
                      <span aria-hidden>·</span>
                      <span>{post.publishedAt ? formatDate(post.publishedAt) : ""}</span>
                    </div>
                    <h2 className="display-lg mt-3 text-forest">
                      <Link href={`/news/${post.slug}`} className="transition-colors hover:text-sage-deep">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="lead mt-4 max-w-2xl">{post.excerpt}</p>
                    <Link
                      href={`/news/${post.slug}`}
                      className="mark-link mt-5 inline-flex items-center gap-1.5 text-[0.85rem] text-forest"
                    >
                      Read the story <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="lg:col-span-4 lg:col-start-9">
                    <Photo
                      src={post.cover?.url ?? null}
                      alt={post.cover?.alt ?? post.title}
                      ratio="3 / 2"
                      sizes="(min-width: 1024px) 30vw, 100vw"
                    />
                  </div>
                </div>
              </article>
            ))}
            <div>
              {rest.map((post) => (
                <PostCard key={post.id} post={post} layout="row" />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="border-t border-line bg-paper">
        <div className="page-container py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="label-caps text-sage-deep">Never miss a notice</p>
              <h2 className="display-md mt-2 text-forest">
                The useful things also arrive by email.
              </h2>
              <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-bark-soft">
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
