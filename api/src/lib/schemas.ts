import { z } from "zod";

export const idSchema = z.string().min(1).max(40);

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Use at least two characters.")
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lower case letters, numbers and single hyphens only.",
  );

export const seoTitleSchema = z.string().trim().max(70).optional().nullable();
export const seoDescriptionSchema = z
  .string()
  .trim()
  .max(160)
  .optional()
  .nullable();

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value));

export const weekdaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 07:00.");

export const hoursSchema = z.record(
  weekdaySchema,
  z
    .object({
      open: timeSchema,
      close: timeSchema,
    })
    .nullable(),
);

export const rhythmItemSchema = z.object({
  time: z.string().trim().min(1).max(20),
  label: z.string().trim().min(1).max(160),
});

export const rhythmSchema = z.array(rhythmItemSchema).max(24);

const nullableId = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" || value === undefined ? null : value));

const requiredId = z.string().trim().min(1, "Choose an option.");

export const branchSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(4).max(200),
  addressLine1: z.string().trim().min(3).max(160),
  suburb: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().regex(/^\d{4}$/, "Use a four digit postal code."),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  phone: z.string().trim().min(7).max(30),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "Use digits only, with the country code.")
    .transform((value) => value.replace("+", "")),
  email: z.email("Use a valid email address."),
  hours: hoursSchema,
  description: z.string().trim().min(20).max(8000),
  heroImageId: nullableId,
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export const programmeSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(120),
  ageFromMonths: z.number().int().min(0).max(120),
  ageToMonths: z.number().int().min(1).max(144),
  ageLabel: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20).max(12000),
  dailyRhythm: rhythmSchema,
  hoursLabel: z.string().trim().min(3).max(120),
  monthlyFeeCents: z.number().int().min(0).max(10000000).optional().nullable(),
  feeNote: optionalText(300),
  imageId: nullableId,
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  branchIds: z.array(z.string().min(1)).default([]),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export const postSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(3).max(160),
  excerpt: z.string().trim().min(10).max(320),
  bodyMd: z.string().trim().min(20).max(60000),
  coverId: nullableId,
  category: z.enum(["NEWS", "ANNOUNCEMENT", "NOTICE"]),
  branchId: nullableId,
  isPinned: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.coerce.date().optional().nullable(),
  seoTitle: seoTitleSchema,
  seoDescription: seoDescriptionSchema,
});

export const eventSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(3).max(160),
    descriptionMd: z.string().trim().min(10).max(20000),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    allDay: z.boolean().default(false),
    locationText: z.string().trim().min(3).max(200),
    branchId: nullableId,
    coverId: nullableId,
    isPublished: z.boolean().default(false),
    seoTitle: seoTitleSchema,
    seoDescription: seoDescriptionSchema,
  })
  .refine((value) => value.endsAt >= value.startsAt, {
    message: "The end must be after the start.",
    path: ["endsAt"],
  });

export const albumSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(2000),
  coverId: nullableId,
  branchId: nullableId,
  takenOn: z.coerce.date().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const albumPhotoSchema = z.object({
  mediaId: requiredId,
  caption: z.string().trim().min(3).max(240),
  alt: z.string().trim().min(5).max(240),
});

export const albumPhotoUpdateSchema = z.object({
  caption: z.string().trim().min(3).max(240),
  alt: z.string().trim().min(5).max(240),
});

export const albumReorderSchema = z.object({
  photoIds: z.array(z.string().min(1)).min(1),
});

export const documentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(600),
  category: z.enum(["ADMISSION_FORM", "FEE_SCHEDULE", "POLICY", "OTHER"]),
  mediaId: requiredId,
  branchId: nullableId,
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(false),
});

export const enquiryCreateSchema = z.object({
  parentName: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.email("Use a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Use a phone number we can reach you on.")
    .max(30),
  branchId: requiredId,
  programmeId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  childName: z.string().trim().min(2, "Tell us your child's name.").max(120),
  childDateOfBirth: z.coerce.date({
    message: "Choose your child's date of birth.",
  }),
  preferredStart: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "Choose a month.")
    .optional()
    .nullable(),
  message: z.string().trim().min(10, "A sentence or two is enough.").max(2000),
  consentPopia: z.literal(true, {
    message: "Please agree to us storing your details so we can reply.",
  }),
  website: z.string().max(0, "Leave this field empty.").optional().default(""),
  startedAt: z.coerce.number().int().positive(),
});

export const enquiryStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "VISIT_ARRANGED",
    "ENROLLED",
    "NOT_PROCEEDING",
  ]),
});

export const enquiryNoteSchema = z.object({
  body: z.string().trim().min(2, "Write a note.").max(2000),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email("Use a valid email address."),
  password: z.string().min(8, "Use at least eight characters.").max(128),
  role: z.enum(["admin", "editor"]),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email("Use a valid email address."),
  role: z.enum(["admin", "editor"]),
});

export const passwordResetSchema = z.object({
  password: z.string().min(8, "Use at least eight characters.").max(128),
});

export const settingsSchema = z.object({
  schoolName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(200),
  defaultSeoTitle: z.string().trim().min(2).max(70),
  defaultSeoDescription: z.string().trim().min(10).max(160),
  socialFacebook: optionalText(200),
  socialInstagram: optionalText(200),
  socialYoutube: optionalText(200),
  ogImageId: nullableId,
  whatsappDefaultMessage: z.string().trim().min(10).max(400),
});

export const listQuerySchema = z.object({
  branch: z.string().trim().optional(),
  category: z.enum(["NEWS", "ANNOUNCEMENT", "NOTICE"]).optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  upcoming: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().trim().max(120).optional(),
  status: z
    .enum(["NEW", "CONTACTED", "VISIT_ARRANGED", "ENROLLED", "NOT_PROCEEDING"])
    .optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
