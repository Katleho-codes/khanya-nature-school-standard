import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, parse } from "../../lib/http.js";
import {
  enquiryNoteSchema,
  enquiryStatusSchema,
  idSchema,
} from "../../lib/schemas.js";
import { Prisma } from "../../generated/prisma/client.js";

export const enquiriesRouter = Router();

const idParam = z.object({ id: idSchema });
const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  branch: z.string().trim().optional(),
  status: z
    .enum(["NEW", "CONTACTED", "VISIT_ARRANGED", "ENROLLED", "NOT_PROCEEDING"])
    .optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function buildWhere(rawQuery: unknown): Promise<Prisma.EnquiryWhereInput> {
  const query = parse(listQuery, rawQuery);
  const where: Prisma.EnquiryWhereInput = {};

  if (query.status) where.status = query.status;
  if (query.branch) {
    const branch = await prisma.branch.findUnique({
      where: { slug: query.branch },
      select: { id: true },
    });
    where.branchId = branch?.id ?? "__none__";
  }
  if (query.from) {
    where.createdAt = {
      ...(where.createdAt as Prisma.DateTimeFilter | undefined),
      gte: new Date(`${query.from}T00:00:00+02:00`),
    };
  }
  if (query.to) {
    where.createdAt = {
      ...(where.createdAt as Prisma.DateTimeFilter | undefined),
      lte: new Date(`${query.to}T23:59:59+02:00`),
    };
  }
  if (query.q) {
    where.OR = [
      { reference: { contains: query.q, mode: "insensitive" } },
      { parentName: { contains: query.q, mode: "insensitive" } },
      { childName: { contains: query.q, mode: "insensitive" } },
      { email: { contains: query.q, mode: "insensitive" } },
      { phone: { contains: query.q } },
    ];
  }
  return where;
}

enquiriesRouter.get("/", async (req, res) => {
  const where = await buildWhere(req.query);
  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      branch: { select: { id: true, slug: true, name: true } },
      programme: { select: { id: true, slug: true, name: true } },
      _count: { select: { notes: true } },
    },
  });
  res.json({ enquiries });
});

enquiriesRouter.get("/export.csv", async (req, res) => {
  const where = await buildWhere(req.query);
  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      branch: { select: { name: true } },
      programme: { select: { name: true } },
    },
  });

  const header = [
    "Reference",
    "Created",
    "Status",
    "Source",
    "Parent",
    "Email",
    "Phone",
    "Child",
    "Date of birth",
    "Branch",
    "Programme",
    "Preferred start",
    "Message",
    "POPIA consent",
  ];

  const rows = enquiries.map((enquiry) => [
    enquiry.reference,
    enquiry.createdAt.toISOString(),
    enquiry.status,
    enquiry.source,
    enquiry.parentName,
    enquiry.email,
    enquiry.phone,
    enquiry.childName,
    enquiry.childDateOfBirth?.toISOString() ?? "",
    enquiry.branch.name,
    enquiry.programme?.name ?? "",
    enquiry.preferredStart?.toISOString() ?? "",
    enquiry.message,
    enquiry.consentPopia ? "Yes" : "No",
  ]);

  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escape(String(cell))).join(","))
    .join("\r\n");

  res
    .status(200)
    .setHeader("Content-Type", "text/csv; charset=utf-8")
    .setHeader(
      "Content-Disposition",
      `attachment; filename="khanya-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    )
    .send(`\uFEFF${csv}`);
});

enquiriesRouter.get("/:id", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      branch: true,
      programme: { select: { id: true, slug: true, name: true } },
      notes: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
  if (!enquiry) notFound("That enquiry could not be found.");
  res.json({ enquiry });
});

enquiriesRouter.patch("/:id/status", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { status } = parse(enquiryStatusSchema, req.body);
  const enquiry = await prisma.enquiry.update({
    where: { id },
    data: { status },
    include: { branch: { select: { name: true } } },
  });
  res.json({ enquiry });
});

enquiriesRouter.post("/:id/notes", async (req, res) => {
  if (!req.user) notFound("Please sign in again.");
  const { id } = parse(idParam, req.params);
  const { body } = parse(enquiryNoteSchema, req.body);
  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) notFound("That enquiry could not be found.");
  const note = await prisma.enquiryNote.create({
    data: { enquiryId: id, authorId: req.user.id, body },
    include: { author: { select: { id: true, name: true } } },
  });
  res.status(201).json({ note });
});
