import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, parse } from "../../lib/http.js";

export const outboxRouter = Router();

const idParam = z.object({ id: z.string().min(1) });

outboxRouter.get("/", async (_req, res) => {
  const emails = await prisma.emailOutbox.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      to: true,
      subject: true,
      template: true,
      relatedType: true,
      relatedId: true,
      createdAt: true,
    },
  });
  res.json({ emails });
});

outboxRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const email = await prisma.emailOutbox.findUnique({ where: { id } });
  if (!email) notFound("That email could not be found.");
  res.json({ email });
});
