import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, parse } from "../../lib/http.js";
import { idSchema, programmeSchema } from "../../lib/schemas.js";

export const programmesRouter = Router();

const idParam = z.object({ id: idSchema });
const moveSchema = z.object({ direction: z.enum(["up", "down"]) });

const include = {
  image: true,
  programmeBranches: {
    include: { branch: { select: { id: true, slug: true, name: true } } },
  },
};

function shape<
  T extends { programmeBranches: Array<{ branch: { id: string } }> },
>(programme: T) {
  const { programmeBranches, ...rest } = programme;
  return {
    ...rest,
    branches: programmeBranches.map((item) => item.branch),
    branchIds: programmeBranches.map((item) => item.branch.id),
  };
}

programmesRouter.get("/", async (_req, res) => {
  const programmes = await prisma.programme.findMany({
    orderBy: { sortOrder: "asc" },
    include,
  });
  res.json({
    programmes: programmes.map((programme) => {
      const { programmeBranches, ...rest } = programme;
      return {
        ...rest,
        branches: programmeBranches.map((item) => item.branch),
        branchIds: programmeBranches.map((item) => item.branch.id),
      };
    }),
  });
});

programmesRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const programme = await prisma.programme.findUnique({ where: { id }, include });
  if (!programme) notFound("That programme could not be found.");
  res.json({ programme: shape(programme) });
});

programmesRouter.post("/", async (req, res) => {
  const data = parse(programmeSchema, req.body);
  const { branchIds, ...fields } = data;
  const programme = await prisma.programme.create({
    data: {
      ...fields,
      programmeBranches: {
        create: branchIds.map((branchId) => ({ branchId })),
      },
    },
    include,
  });
  res.status(201).json({ programme: shape(programme) });
});

programmesRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(programmeSchema, req.body);
  const { branchIds, ...fields } = data;
  const exists = await prisma.programme.findUnique({ where: { id } });
  if (!exists) notFound("That programme could not be found.");

  const programme = await prisma.$transaction(async (tx) => {
    await tx.programmeBranch.deleteMany({ where: { programmeId: id } });
    return tx.programme.update({
      where: { id },
      data: {
        ...fields,
        programmeBranches: {
          create: branchIds.map((branchId) => ({ branchId })),
        },
      },
      include,
    });
  });

  res.json({ programme: shape(programme) });
});

programmesRouter.post("/:id/move", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { direction } = parse(moveSchema, req.body);
  const current = await prisma.programme.findUnique({ where: { id } });
  if (!current) notFound("That programme could not be found.");

  const neighbour = await prisma.programme.findFirst({
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
    prisma.programme.update({
      where: { id: current.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    prisma.programme.update({
      where: { id: neighbour.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  res.json({ moved: true });
});

programmesRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  await prisma.programme.delete({ where: { id } });
  res.status(204).send();
});
