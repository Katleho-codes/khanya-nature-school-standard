import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { breadcrumbSchema, pageMetadata } from "@/lib/metadata";
import { renderMarkdown } from "@/lib/markdown";
import { siteUrl } from "@/lib/site";
import { PageIntro } from "@/components/PageIntro";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { PostCard } from "@/components/PublicCards";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRightIcon } from "@/components/icons";

const categoryLabels = {
  NEWS: "News",
  ANNOUNCEMENT: "Announcement",
  NOTICE: "Notice",
} as const;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPost(slug);
  if (!result) {
    return pageMetadata({
      title: "Story not found",
      description: "That story could not be found.",
      path: `/news/${slug}`,
    });
  }
  const { post } = result;
  return pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    path: `/news/${post.slug}`,
    image: post.cover?.url ?? null,
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post.updatedAt,
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPost(slug);
  if (!result) notFound();
  const { post } = result;
  const body = await renderMarkdown(post.bodyMd ?? "");
  const latest = await getPosts({ limit: 4 });
  const related = latest.posts.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: {
            "@type": "Person",
            name: post.author.name,
          },
          publisher: {
            "@type": "Organization",
            name: "Khanya Nature School",
            url: siteUrl(),
          },
          image: post.cover?.url
            ? `${siteUrl()}${post.cover.url}`
            : `${siteUrl()}/images/og-default.jpg`,
          mainEntityOfPage: `${siteUrl()}/news/${post.slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: post.title, path: `/news/${post.slug}` },
        ])}
      />

      <PageIntro
        eyebrow={`${categoryLabels[post.category]} · ${formatDate(post.publishedAt ?? post.createdAt)}`}
        title={post.title}
        lead={post.excerpt}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: post.title },
        ]}
      />

      <section className="page-container pb-14 md:pb-20">
        <Photo
          src={post.cover?.url ?? null}
          alt={post.cover?.alt ?? post.title}
          ratio="16 / 8"
          priority
          sizes="(min-width: 1024px) 90vw, 100vw"
        />
      </section>

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-5">
              <div>
                <p className="label-caps text-sage-deep">Filed under</p>
                <p className="mt-1.5 text-[0.86rem] text-forest">{categoryLabels[post.category]}</p>
                <p className="mt-1 text-[0.8rem] text-bark-soft">
                  {post.branch ? (
                    <Link href={`/news?branch=${post.branch.slug}`} className="mark-link text-bark-soft">
                      {post.branch.name}
                    </Link>
                  ) : (
                    "All branches"
                  )}
                </p>
              </div>
              <div>
                <p className="label-caps text-sage-deep">Written by</p>
                <p className="mt-1.5 text-[0.86rem] text-forest">{post.author.name}</p>
              </div>
              <div>
                <p className="label-caps text-sage-deep">Published</p>
                <p className="mt-1.5 text-[0.86rem] text-forest">
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </p>
              </div>
              <Link
                href="/news"
                className="mark-link inline-flex items-center gap-1.5 text-[0.8rem] text-forest"
              >
                All news <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          <article className="lg:col-span-8 lg:col-start-5">
            <div
              className="prose-editorial"
              dangerouslySetInnerHTML={{ __html: body }}
            />
            <div className="mt-12 border-t border-line pt-6">
              <p className="text-[0.82rem] leading-relaxed text-bark-soft">
                Questions about this story?{" "}
                <Link href="/contact" className="mark-link text-forest">
                  Contact the office
                </Link>{" "}
                or speak to your branch teacher at collection.
              </p>
            </div>
          </article>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-line bg-paper section">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label-caps text-sage-deep">Keep reading</p>
                <h2 className="display-md mt-2 text-forest">More from the school</h2>
              </div>
              <ButtonLink href="/news" variant="text" size="sm">
                All news <ArrowRightIcon className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
