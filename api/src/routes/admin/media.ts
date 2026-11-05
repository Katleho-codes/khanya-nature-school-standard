import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { Router } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { imageSize } from "image-size";
import { z } from "zod";
import { prisma } from "../../db.js";
import { AppError, notFound, parse } from "../../lib/http.js";
import { uploadPath } from "../../lib/uploads.js";

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

const MAX_BYTES = 8 * 1024 * 1024;
const allowedMime = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
]);

const idParam = z.object({ id: z.string().min(1) });
const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  type: z.enum(["image", "document"]).optional(),
});

mediaRouter.get("/", async (req, res) => {
  const query = parse(listQuery, req.query);
  const media = await prisma.media.findMany({
    where: {
      ...(query.type === "image"
        ? { mimeType: { startsWith: "image/" } }
        : {}),
      ...(query.type === "document"
        ? { mimeType: { not: { startsWith: "image/" } } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { originalName: { contains: query.q, mode: "insensitive" } },
              { alt: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  res.json({ media });
});

mediaRouter.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new AppError(400, "NO_FILE", "Choose a file to upload.");
  }
  if (file.size > MAX_BYTES) {
    throw new AppError(400, "FILE_TOO_LARGE", "Files must be 8 MB or smaller.");
  }

  const detected = await fileTypeFromBuffer(file.buffer);
  const extension = detected ? allowedMime.get(detected.mime) : undefined;
  if (!detected || !extension) {
    throw new AppError(
      400,
      "FILE_TYPE",
      "Only JPG, PNG, WebP and PDF files can be uploaded.",
    );
  }

  const altInput = z
    .string()
    .trim()
    .max(240)
    .optional()
    .parse(req.body?.alt ?? "");
  const isImage = detected.mime.startsWith("image/");
  if (isImage && (!altInput || altInput.length < 5)) {
    throw new AppError(
      400,
      "ALT_REQUIRED",
      "Add a short description of the image for screen reader users.",
      { alt: "Describe what is in the image." },
    );
  }

  let width: number | null = null;
  let height: number | null = null;
  if (isImage) {
    const dimensions = imageSize(file.buffer);
    width = dimensions.width ?? null;
    height = dimensions.height ?? null;
  }

  const filename = `${randomUUID()}.${extension}`;
  await fs.writeFile(uploadPath(filename), file.buffer);

  const media = await prisma.media.create({
    data: {
      url: `/uploads/${filename}`,
      originalName: file.originalname,
      mimeType: detected.mime,
      sizeBytes: file.size,
      width,
      height,
      alt: altInput && altInput.length > 0 ? altInput : null,
      uploadedById: req.user?.id ?? null,
    },
  });

  res.status(201).json({ media });
});

const altSchema = z.object({
  alt: z
    .string()
    .trim()
    .max(240)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

mediaRouter.patch("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { alt } = parse(altSchema, req.body);
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) notFound("That file could not be found.");
  if (media.mimeType.startsWith("image/") && (!alt || alt.length < 5)) {
    throw new AppError(
      400,
      "ALT_REQUIRED",
      "Add a short description of the image for screen reader users.",
      { alt: "Describe what is in the image." },
    );
  }
  const updated = await prisma.media.update({
    where: { id },
    data: { alt },
  });
  res.json({ media: updated });
});

mediaRouter.delete("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) notFound("That file could not be found.");
  const [posts, events, albums, branches, programmes, documents, photos, settings] =
    await Promise.all([
      prisma.post.count({ where: { coverId: id } }),
      prisma.event.count({ where: { coverId: id } }),
      prisma.album.count({ where: { coverId: id } }),
      prisma.branch.count({ where: { heroImageId: id } }),
      prisma.programme.count({ where: { imageId: id } }),
      prisma.document.count({ where: { mediaId: id } }),
      prisma.albumPhoto.count({ where: { mediaId: id } }),
      prisma.siteSettings.count({ where: { ogImageId: id } }),
    ]);

  if (
    posts + events + albums + branches + programmes + documents + photos + settings >
    0
  ) {
    throw new AppError(
      409,
      "MEDIA_IN_USE",
      "This file is still used on the site. Remove it from the content that uses it first.",
    );
  }

  await prisma.media.delete({ where: { id } });
  if (media.url.startsWith("/uploads/")) {
    const filename = media.url.replace("/uploads/", "");
    await fs.unlink(uploadPath(filename)).catch(() => undefined);
  }
  res.status(204).send();
});
