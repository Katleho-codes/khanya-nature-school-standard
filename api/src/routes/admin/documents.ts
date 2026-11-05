import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, parse } from "../../lib/http.js";
import { documentSchema, idSchema } from "../../lib/schemas.js";

export const documentsRouter = Router();

const idParam = z.object({ id: idSchema });
const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  category: z
    .enum(["ADMISSION_FORM", "FEE_SCHEDULE", "POLICY", "OTHER"])
    .optional(),
});

const include = {
  media: true,
  branch: { select: { id: true, slug: true, name: true } },
};

documentsRouter.get("/", async (req, res) => {
  const query = parse(listQuery, req.query);
  const documents = await prisma.document.findMany({
    where: {
      ...(query.category ? { category: query.category } : {}),
      ...(query.q
        ? { title: { contains: query.q, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include,
  });
  res.json({ documents });
});

documentsRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const document = await prisma.document.findUnique({ where: { id }, include });
  if (!document) notFound("That document could not be found.");
  res.json({ document });
});

documentsRouter.post("/", async (req, res) => {
  const data = parse(documentSchema, req.body);
  const document = await prisma.document.create({ data, include });
  res.status(201).json({ document });
});

documentsRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(documentSchema, req.body);
  const exists = await prisma.document.findUnique({ where: { id } });
  if (!exists) notFound("That document could not be found.");
  const document = await prisma.document.update({
    where: { id },
    data,
    include,
  });
  res.json({ document });
});

documentsRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  await prisma.document.delete({ where: { id } });
  res.status(204).send();
});
