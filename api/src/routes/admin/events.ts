import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, parse } from "../../lib/http.js";
import { eventSchema, idSchema } from "../../lib/schemas.js";

export const eventsRouter = Router();

const idParam = z.object({ id: idSchema });
const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  branch: z.string().trim().optional(),
  published: z.enum(["true", "false"]).optional(),
});

const include = {
  cover: true,
  branch: { select: { id: true, slug: true, name: true } },
};

eventsRouter.get("/", async (req, res) => {
  const query = parse(listQuery, req.query);
  const events = await prisma.event.findMany({
    where: {
      ...(query.published ? { isPublished: query.published === "true" } : {}),
      ...(query.branch ? { branch: { slug: query.branch } } : {}),
      ...(query.q
        ? { title: { contains: query.q, mode: "insensitive" } }
        : {}),
    },
    orderBy: { startsAt: "desc" },
    include,
  });
  res.json({ events });
});

eventsRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const event = await prisma.event.findUnique({ where: { id }, include });
  if (!event) notFound("That event could not be found.");
  res.json({ event });
});

eventsRouter.post("/", async (req, res) => {
  const data = parse(eventSchema, req.body);
  const event = await prisma.event.create({ data, include });
  res.status(201).json({ event });
});

eventsRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(eventSchema, req.body);
  const exists = await prisma.event.findUnique({ where: { id } });
  if (!exists) notFound("That event could not be found.");
  const event = await prisma.event.update({ where: { id }, data, include });
  res.json({ event });
});

eventsRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});
