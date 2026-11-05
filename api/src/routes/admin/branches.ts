import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { AppError, notFound, parse } from "../../lib/http.js";
import { branchSchema, idSchema } from "../../lib/schemas.js";

export const branchesRouter = Router();

const idParam = z.object({ id: idSchema });
const moveSchema = z.object({ direction: z.enum(["up", "down"]) });

branchesRouter.get("/", async (_req, res) => {
  const branches = await prisma.branch.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      heroImage: true,
      _count: { select: { enquiries: true, programmeBranches: true } },
    },
  });
  res.json({ branches });
});

branchesRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: { heroImage: true },
  });
  if (!branch) notFound("That branch could not be found.");
  res.json({ branch });
});

branchesRouter.post("/", async (req, res) => {
  const data = parse(branchSchema, req.body);
  const branch = await prisma.branch.create({
    data,
    include: { heroImage: true },
  });
  res.status(201).json({ branch });
});

branchesRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(branchSchema, req.body);
  const exists = await prisma.branch.findUnique({ where: { id } });
  if (!exists) notFound("That branch could not be found.");
  const branch = await prisma.branch.update({
    where: { id },
    data,
    include: { heroImage: true },
  });
  res.json({ branch });
});

branchesRouter.patch("/:id/active", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { isActive } = parse(
    z.object({ isActive: z.boolean() }),
    req.body,
  );
  const branch = await prisma.branch.update({
    where: { id },
    data: { isActive },
    include: { heroImage: true },
  });
  res.json({ branch });
});

branchesRouter.post("/:id/move", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { direction } = parse(moveSchema, req.body);
  const current = await prisma.branch.findUnique({ where: { id } });
  if (!current) notFound("That branch could not be found.");

  const neighbour = await prisma.branch.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: current.sortOrder } }
        : { sortOrder: { gt: current.sortOrder } },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbour) {
    res.json({ moved: false });
    return;
  }

  await prisma.$transaction([
    prisma.branch.update({
      where: { id: current.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    prisma.branch.update({
      where: { id: neighbour.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  res.json({ moved: true });
});

branchesRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: { _count: { select: { enquiries: true } } },
  });
  if (!branch) notFound("That branch could not be found.");
  if (branch._count.enquiries > 0) {
    throw new AppError(
      409,
      "BRANCH_IN_USE",
      "This branch has enquiries linked to it. Deactivate it instead so the history stays intact.",
    );
  }
  await prisma.branch.delete({ where: { id } });
  res.status(204).send();
});
