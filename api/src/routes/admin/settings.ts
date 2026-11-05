import { Router } from "express";
import { prisma } from "../../db.js";
import { parse } from "../../lib/http.js";
import { settingsSchema } from "../../lib/schemas.js";

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res) => {
  const settings = await prisma.siteSettings.findFirst({
    include: { ogImage: true },
  });
  res.json({ settings });
});

settingsRouter.patch("/", async (req, res) => {
  const data = parse(settingsSchema, req.body);
  const existing = await prisma.siteSettings.findFirst();
  const settings = existing
    ? await prisma.siteSettings.update({
        where: { id: existing.id },
        data,
        include: { ogImage: true },
      })
    : await prisma.siteSettings.create({
        data: { id: "site", ...data },
        include: { ogImage: true },
      });
  res.json({ settings });
});
