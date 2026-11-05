import { Router } from "express";
import { prisma } from "../../db.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    newEnquiries,
    upcomingEvents,
    draftPosts,
    recentEnquiries,
    recentEmails,
    publishedPosts,
    albumCount,
    documentCount,
  ] = await Promise.all([
    prisma.enquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.event.count({
      where: { isPublished: true, startsAt: { gte: now } },
    }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { branch: { select: { name: true } } },
    }),
    prisma.emailOutbox.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, to: true, subject: true, createdAt: true },
    }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.album.count(),
    prisma.document.count(),
  ]);

  res.json({
    stats: {
      newEnquiries,
      upcomingEvents,
      draftPosts,
      publishedPosts,
      albumCount,
      documentCount,
    },
    recentEnquiries,
    recentEmails,
  });
});
