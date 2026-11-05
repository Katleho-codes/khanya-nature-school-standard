import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { AppError, notFound, parse } from "../../lib/http.js";
import {
  albumPhotoSchema,
  albumPhotoUpdateSchema,
  albumReorderSchema,
  albumSchema,
  idSchema,
} from "../../lib/schemas.js";

export const albumsRouter = Router();

const idParam = z.object({ id: idSchema });
const photoParam = z.object({
  albumId: idSchema,
  photoId: idSchema,
});
const coverSchema = z.object({ mediaId: z.string().min(1) });

const include = {
  cover: true,
  branch: { select: { id: true, slug: true, name: true } },
  _count: { select: { photos: true } },
};

const detailInclude = {
  ...include,
  photos: {
    orderBy: { sortOrder: "asc" as const },
    include: { media: true },
  },
};

albumsRouter.get("/", async (_req, res) => {
  const albums = await prisma.album.findMany({
    orderBy: [{ takenOn: "desc" }, { createdAt: "desc" }],
    include,
  });
  res.json({ albums });
});

albumsRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const album = await prisma.album.findUnique({
    where: { id },
    include: detailInclude,
  });
  if (!album) notFound("That album could not be found.");
  res.json({ album });
});

albumsRouter.post("/", async (req, res) => {
  const data = parse(albumSchema, req.body);
  const album = await prisma.album.create({ data, include });
  res.status(201).json({ album });
});

albumsRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(albumSchema, req.body);
  const exists = await prisma.album.findUnique({ where: { id } });
  if (!exists) notFound("That album could not be found.");
  const album = await prisma.album.update({ where: { id }, data, include });
  res.json({ album });
});

albumsRouter.patch("/:id/cover", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { mediaId } = parse(coverSchema, req.body);
  const photo = await prisma.albumPhoto.findFirst({
    where: { albumId: id, mediaId },
  });
  if (!photo) {
    throw new AppError(
      400,
      "NOT_IN_ALBUM",
      "Choose a photo that belongs to this album.",
    );
  }
  const album = await prisma.album.update({
    where: { id },
    data: { coverId: mediaId },
    include,
  });
  res.json({ album });
});

albumsRouter.post("/:id/photos", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const data = parse(albumPhotoSchema, req.body);
  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) notFound("That album could not be found.");
  const last = await prisma.albumPhoto.findFirst({
    where: { albumId: id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const photo = await prisma.albumPhoto.create({
    data: {
      ...data,
      albumId: id,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    include: { media: true },
  });
  if (!album.coverId) {
    await prisma.album.update({
      where: { id },
      data: { coverId: photo.mediaId },
    });
  }
  res.status(201).json({ photo });
});

albumsRouter.patch("/:albumId/photos/:photoId", async (req, res) => {
  const { albumId, photoId } = parse(photoParam, req.params);
  const data = parse(albumPhotoUpdateSchema, req.body);
  const photo = await prisma.albumPhoto.findFirst({
    where: { id: photoId, albumId },
  });
  if (!photo) notFound("That photo could not be found in this album.");
  const updated = await prisma.albumPhoto.update({
    where: { id: photoId },
    data,
    include: { media: true },
  });
  res.json({ photo: updated });
});

albumsRouter.delete("/:albumId/photos/:photoId", async (req, res) => {
  const { albumId, photoId } = parse(photoParam, req.params);
  const photo = await prisma.albumPhoto.findFirst({
    where: { id: photoId, albumId },
    include: { album: true },
  });
  if (!photo) notFound("That photo could not be found in this album.");
  await prisma.albumPhoto.delete({ where: { id: photoId } });
  if (photo.album.coverId === photo.mediaId) {
    const next = await prisma.albumPhoto.findFirst({
      where: { albumId },
      orderBy: { sortOrder: "asc" },
    });
    await prisma.album.update({
      where: { id: albumId },
      data: { coverId: next?.mediaId ?? null },
    });
  }
  res.status(204).send();
});

albumsRouter.post("/:id/photos/reorder", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { photoIds } = parse(albumReorderSchema, req.body);
  const existing = await prisma.albumPhoto.findMany({
    where: { albumId: id },
    select: { id: true },
  });
  if (existing.length !== photoIds.length) {
    throw new AppError(
      400,
      "INVALID_ORDER",
      "The photo order did not match the album. Reload and try again.",
    );
  }
  await prisma.$transaction(
    photoIds.map((photoId, index) =>
      prisma.albumPhoto.update({
        where: { id: photoId },
        data: { sortOrder: index },
      }),
    ),
  );
  res.json({ reordered: true });
});

albumsRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  await prisma.album.delete({ where: { id } });
  res.status(204).send();
});
