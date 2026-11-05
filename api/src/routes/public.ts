import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  AppError,
  notFound,
  parse,
} from "../lib/http.js";
import { sendEnquiryEmails } from "../lib/mailer.js";
import {
  enquiryCreateSchema,
  idSchema,
  listQuerySchema,
  slugSchema,
} from "../lib/schemas.js";
import { Prisma } from "../generated/prisma/client.js";

export const publicRouter = Router();

const slugParam = z.object({ slug: slugSchema });
const idParam = z.object({ id: idSchema });

const branchCardInclude = {
  heroImage: true,
  programmeBranches: {
    where: { programme: { isPublished: true } },
    orderBy: { programme: { sortOrder: "asc" } },
    select: {
      programme: {
        select: {
          id: true,
          slug: true,
          name: true,
          ageLabel: true,
          summary: true,
          monthlyFeeCents: true,
        },
      },
    },
  },
} satisfies Prisma.BranchInclude;

const postListInclude = {
  cover: true,
  branch: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, name: true } },
} satisfies Prisma.PostInclude;

const eventInclude = {
  cover: true,
  branch: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.EventInclude;

function shapeBranch<T extends { programmeBranches: Array<{ programme: unknown }> }>(
  branch: T,
) {
  const { programmeBranches, ...rest } = branch;
  return {
    ...rest,
    programmes: programmeBranches.map((item) => item.programme),
  };
}

publicRouter.get("/settings", async (_req, res) => {
  const settings = await prisma.siteSettings.findFirst({
    include: { ogImage: true },
  });
  res.json({ settings });
});

publicRouter.get("/nav", async (_req, res) => {
  const [settings, branches, programmes] = await Promise.all([
    prisma.siteSettings.findFirst({ include: { ogImage: true } }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: branchCardInclude,
    }),
    prisma.programme.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true },
    }),
  ]);
  res.json({
    settings,
    branches: branches.map(shapeBranch),
    programmes,
  });
});

publicRouter.get("/branches", async (_req, res) => {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: branchCardInclude,
  });
  res.json({ branches: branches.map(shapeBranch) });
});

publicRouter.get("/branches/:slug", async (req, res) => {
  const { slug } = parse(slugParam, req.params);
  const branch = await prisma.branch.findFirst({
    where: { slug, isActive: true },
    include: {
      ...branchCardInclude,
      posts: {
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        take: 3,
        include: postListInclude,
      },
      events: {
        where: { isPublished: true, startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
        include: eventInclude,
      },
      albums: {
        where: { isPublished: true },
        orderBy: { takenOn: "desc" },
        take: 3,
        include: { cover: true },
      },
    },
  });
  if (!branch) notFound("That branch could not be found.");
  res.json({ branch: shapeBranch(branch) });
});

publicRouter.get("/programmes", async (_req, res) => {
  const programmes = await prisma.programme.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: {
      image: true,
      programmeBranches: {
        where: { branch: { isActive: true } },
        include: { branch: { select: { id: true, slug: true, name: true } } },
      },
    },
  });
  res.json({
    programmes: programmes.map(({ programmeBranches, ...programme }) => ({
      ...programme,
      branches: programmeBranches.map((item) => item.branch),
    })),
  });
});

publicRouter.get("/programmes/:slug", async (req, res) => {
  const { slug } = parse(slugParam, req.params);
  const programme = await prisma.programme.findFirst({
    where: { slug, isPublished: true },
    include: {
      image: true,
      programmeBranches: {
        where: { branch: { isActive: true } },
        include: { branch: { select: { id: true, slug: true, name: true } } },
      },
    },
  });
  if (!programme) notFound("That programme could not be found.");
  const { programmeBranches, ...rest } = programme;
  res.json({
    programme: {
      ...rest,
      branches: programmeBranches.map((item) => item.branch),
    },
  });
});

publicRouter.get("/posts", async (req, res) => {
  const query = parse(listQuerySchema, req.query);
  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };
  if (query.category) where.category = query.category;
  if (query.branch) {
    const branch = await prisma.branch.findUnique({
      where: { slug: query.branch },
      select: { id: true },
    });
    if (!branch) {
      res.json({ posts: [] });
      return;
    }
    where.OR = [{ branchId: branch.id }, { branchId: null }];
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: query.limit ?? 24,
    include: postListInclude,
  });
  res.json({ posts });
});

publicRouter.get("/posts/:slug", async (req, res) => {
  const { slug } = parse(slugParam, req.params);
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: postListInclude,
  });
  if (!post) notFound("That story could not be found.");
  res.json({ post });
});

publicRouter.get("/events", async (req, res) => {
  const query = parse(listQuerySchema, req.query);
  const where: Prisma.EventWhereInput = { isPublished: true };

  if (query.branch) {
    const branch = await prisma.branch.findUnique({
      where: { slug: query.branch },
      select: { id: true },
    });
    if (!branch) {
      res.json({ events: [] });
      return;
    }
    where.OR = [{ branchId: branch.id }, { branchId: null }];
  }

  if (query.upcoming === "true") {
    where.startsAt = { gte: new Date() };
  }

  if (query.month) {
    const start = new Date(`${query.month}-01T00:00:00+02:00`);
    const monthIndex = start.getUTCMonth();
    const next = new Date(start);
    next.setUTCMonth(monthIndex + 1);
    where.startsAt = {
      ...(where.startsAt as Prisma.DateTimeFilter | undefined),
      gte: start,
      lt: next,
    };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
    take: query.limit ?? 100,
    include: eventInclude,
  });
  res.json({ events });
});

publicRouter.get("/events/:slug", async (req, res) => {
  const { slug } = parse(slugParam, req.params);
  const event = await prisma.event.findFirst({
    where: { slug, isPublished: true },
    include: eventInclude,
  });
  if (!event) notFound("That event could not be found.");
  res.json({ event });
});

function icsEscape(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function icsTimestamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function icsDateOnly(date: Date): string {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return formatted.replaceAll("-", "");
}

function withOneDay(date: Date): Date {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

publicRouter.get("/events/:slug/ics", async (req, res) => {
  const { slug } = parse(slugParam, req.params);
  const event = await prisma.event.findFirst({
    where: { slug, isPublished: true },
    include: { branch: true },
  });
  if (!event) notFound("That event could not be found.");

  const description = event.descriptionMd.replace(/[#*_>`]/g, "").trim();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Khanya Nature School//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@khanyanatureschool.example`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${icsDateOnly(event.startsAt)}`
      : `DTSTART:${icsTimestamp(event.startsAt)}`,
    event.allDay
      ? `DTEND;VALUE=DATE:${icsDateOnly(withOneDay(event.endsAt))}`
      : `DTEND:${icsTimestamp(event.endsAt)}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(event.locationText)}`,
    `URL:${process.env.WEB_ORIGIN ?? "http://localhost:3002"}/events/${event.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  res
    .status(200)
    .setHeader("Content-Type", "text/calendar; charset=utf-8")
    .setHeader("Content-Disposition", `attachment; filename="${event.slug}.ics"`)
    .send(lines.join("\r\n"));
});

publicRouter.get("/albums", async (_req, res) => {
  const albums = await prisma.album.findMany({
    where: { isPublished: true },
    orderBy: [{ takenOn: "desc" }, { createdAt: "desc" }],
    include: {
      cover: true,
      branch: { select: { id: true, slug: true, name: true } },
      _count: { select: { photos: true } },
    },
  });
  res.json({ albums });
});

publicRouter.get("/albums/:slug", async (req, res) => {
  const { slug } = parse(slugParam, req.params);
  const album = await prisma.album.findFirst({
    where: { slug, isPublished: true },
    include: {
      cover: true,
      branch: { select: { id: true, slug: true, name: true } },
      photos: {
        orderBy: { sortOrder: "asc" },
        include: { media: true },
      },
    },
  });
  if (!album) notFound("That album could not be found.");
  res.json({ album });
});

publicRouter.get("/documents", async (req, res) => {
  const query = parse(listQuerySchema, req.query);
  const where: Prisma.DocumentWhereInput = { isPublished: true };
  if (query.branch) {
    const branch = await prisma.branch.findUnique({
      where: { slug: query.branch },
      select: { id: true },
    });
    where.OR = branch
      ? [{ branchId: branch.id }, { branchId: null }]
      : [{ branchId: null }];
  }
  const documents = await prisma.document.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      media: true,
      branch: { select: { id: true, slug: true, name: true } },
    },
  });
  res.json({ documents });
});

publicRouter.get("/documents/:id/download", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const document = await prisma.document.findFirst({
    where: { id, isPublished: true },
    include: { media: true },
  });
  if (!document) notFound("That document could not be found.");
  await prisma.document.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });
  res.redirect(302, document.media.url);
});

publicRouter.get("/home", async (_req, res) => {
  const now = new Date();
  const [settings, branches, programmes, posts, events, photos, albums] =
    await Promise.all([
      prisma.siteSettings.findFirst({ include: { ogImage: true } }),
      prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: branchCardInclude,
      }),
      prisma.programme.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          ageLabel: true,
          summary: true,
          monthlyFeeCents: true,
          feeNote: true,
        },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: now } },
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        take: 3,
        include: postListInclude,
      }),
      prisma.event.findMany({
        where: { isPublished: true, startsAt: { gte: now } },
        orderBy: { startsAt: "asc" },
        take: 3,
        include: eventInclude,
      }),
      prisma.albumPhoto.findMany({
        where: { album: { isPublished: true } },
        orderBy: [{ album: { takenOn: "desc" } }, { sortOrder: "asc" }],
        take: 5,
        include: {
          media: true,
          album: { select: { title: true, slug: true } },
        },
      }),
      prisma.album.findMany({
        where: { isPublished: true },
        orderBy: [{ takenOn: "desc" }],
        take: 3,
        include: { cover: true, _count: { select: { photos: true } } },
      }),
    ]);

  res.json({
    settings,
    branches: branches.map(shapeBranch),
    programmes,
    posts,
    events,
    photos,
    albums,
  });
});

const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message:
          "Too many enquiries from this connection. Please wait a few minutes or call the school.",
      },
    });
  },
});

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ENQ-${year}-`;
  const last = await prisma.enquiry.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastNumber = last ? Number.parseInt(last.reference.slice(-4), 10) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;
}

publicRouter.post("/enquiries", enquiryLimiter, async (req, res) => {
  const data = parse(enquiryCreateSchema, req.body);
  const now = Date.now();

  if (data.website.length > 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Please check the form and try again.",
    );
  }

  const fillTime = now - data.startedAt;
  if (fillTime < 2500 || fillTime > 2 * 60 * 60 * 1000) {
    throw new AppError(
      400,
      "FORM_TIMING",
      "Please take a moment to complete the form, then send it again.",
    );
  }

  if (data.childDateOfBirth > new Date()) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Please check the highlighted fields.",
      { childDateOfBirth: "The date of birth cannot be in the future." },
    );
  }

  const branch = await prisma.branch.findFirst({
    where: { id: data.branchId, isActive: true },
  });
  if (!branch) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Please check the highlighted fields.",
      { branchId: "Choose a branch that is open." },
    );
  }

  let programmeName: string | null = null;
  if (data.programmeId) {
    const programme = await prisma.programme.findFirst({
      where: {
        id: data.programmeId,
        isPublished: true,
        programmeBranches: { some: { branchId: branch.id } },
      },
      select: { name: true },
    });
    if (!programme) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Please check the highlighted fields.",
        { programmeId: "That programme is not offered at this branch." },
      );
    }
    programmeName = programme.name;
  }

  const preferredStart = data.preferredStart
    ? new Date(`${data.preferredStart}-01T00:00:00+02:00`)
    : null;

  let reference = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    reference = await nextReference();
    try {
      await prisma.enquiry.create({
        data: {
          reference,
          parentName: data.parentName,
          email: data.email,
          phone: data.phone,
          childName: data.childName,
          childDateOfBirth: data.childDateOfBirth,
          branchId: branch.id,
          programmeId: data.programmeId,
          preferredStart,
          message: data.message,
          source: "WEBSITE",
          consentPopia: true,
          consentAt: new Date(),
        },
      });
      break;
    } catch (error) {
      const conflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!conflict || attempt === 2) throw error;
    }
  }

  await sendEnquiryEmails({
    reference,
    parentName: data.parentName,
    email: data.email,
    phone: data.phone,
    childName: data.childName,
    childDateOfBirth: new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "long",
      timeZone: "Africa/Johannesburg",
    }).format(data.childDateOfBirth),
    branchName: branch.name,
    branchEmail: branch.email,
    branchWhatsapp: branch.whatsapp,
    programmeName,
    preferredStart: preferredStart
      ? new Intl.DateTimeFormat("en-ZA", {
          month: "long",
          year: "numeric",
          timeZone: "Africa/Johannesburg",
        }).format(preferredStart)
      : null,
    message: data.message,
  });

  res.status(201).json({ reference });
});
