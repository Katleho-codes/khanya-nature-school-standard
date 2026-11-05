import type { MetadataRoute } from "next";
import {
  getAlbums,
  getBranches,
  getEvents,
  getPosts,
  getProgrammes,
} from "@/lib/api";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/programmes", changeFrequency: "monthly", priority: 0.9 },
  { path: "/branches", changeFrequency: "monthly", priority: 0.9 },
  { path: "/news", changeFrequency: "weekly", priority: 0.8 },
  { path: "/events", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.7 },
  { path: "/admissions", changeFrequency: "monthly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [branches, programmes, posts, events, albums] = await Promise.allSettled([
    getBranches(),
    getProgrammes(),
    getPosts({ limit: 100 }),
    getEvents({ limit: 100 }),
    getAlbums(),
  ]);

  if (branches.status === "fulfilled") {
    for (const branch of branches.value.branches) {
      entries.push({
        url: `${base}/branches/${branch.slug}`,
        lastModified: new Date(branch.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  if (programmes.status === "fulfilled") {
    for (const programme of programmes.value.programmes) {
      entries.push({
        url: `${base}/programmes/${programme.slug}`,
        lastModified: new Date(programme.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  if (posts.status === "fulfilled") {
    for (const post of posts.value.posts) {
      entries.push({
        url: `${base}/news/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  if (events.status === "fulfilled") {
    for (const event of events.value.events) {
      entries.push({
        url: `${base}/events/${event.slug}`,
        lastModified: new Date(event.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  if (albums.status === "fulfilled") {
    for (const album of albums.value.albums) {
      entries.push({
        url: `${base}/gallery/${album.slug}`,
        lastModified: new Date(album.updatedAt),
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
