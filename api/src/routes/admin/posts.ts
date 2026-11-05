import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, parse } from "../../lib/http.js";
import { idSchema, postSchema } from "../../lib/schemas.js";

export const postsRouter = Router();

const idParam = z.object({ id: idSchema });
const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: z.enum(["NEWS", "ANNOUNCEMENT", "NOTICE"]).optional(),
  branch: z.string().trim().optional(),
});

const include = {
  cover: true,
  branch: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, name: true } },
};

postsRouter.get("/", async (req, res) => {
  const query = parse(listQuery, req.query);
  const posts = await prisma.post.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.branch
        ? { branch: { slug: query.branch } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { excerpt: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include,
  });
  res.json({ posts });
});

postsRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const post = await prisma.post.findUnique({ where: { id }, include });
  if (!post) notFound("That post could not be found.");
  res.json({ post });
});

postsRouter.post("/", async (req, res) => {
  if (!req.user) notFound("Please sign in again.");
  const data = parse(postSchema, req.body);
  const post = await prisma.post.create({
    data: {
      ...data,
      authorId: req.user.id,
      publishedAt:
        data.publishedAt ??
        (data.status === "PUBLISHED" ? new Date() : null),
    },
    include,
  });
  res.status(201).json({ post });
});

postsRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(postSchema, req.body);
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) notFound("That post could not be found.");
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        data.publishedAt ??
        existing.publishedAt ??
        (data.status === "PUBLISHED" ? new Date() : null),
    },
    include,
  });
  res.json({ post });
});

postsRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});
