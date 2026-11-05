import type {
  DocumentCategory,
  EnquiryStatus,
  PostCategory,
} from "./types";

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function centsFromRand(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const amount = Number(trimmed.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

export function randValue(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return String(Math.round(cents / 100));
}

const SA_TIME_ZONE = "Africa/Johannesburg";

function saParts(value: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-ZA", {
    timeZone: SA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const output: Record<string, string> = {};
  for (const part of formatter.formatToParts(value)) {
    if (part.type !== "literal") output[part.type] = part.value;
  }
  return output;
}

export function dateTimeInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = saParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function dateInputFromIso(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function saDateTimeToIso(value: string): string | null {
  if (!value) return null;
  const normalised = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${normalised}+02:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function saDateToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+02:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_ARRANGED: "Visit arranged",
  ENROLLED: "Enrolled",
  NOT_PROCEEDING: "Not proceeding",
};

export const enquiryStatusTones: Record<
  EnquiryStatus,
  "green" | "ochre" | "neutral" | "clay"
> = {
  NEW: "ochre",
  CONTACTED: "green",
  VISIT_ARRANGED: "green",
  ENROLLED: "green",
  NOT_PROCEEDING: "neutral",
};

export const postCategoryLabels: Record<PostCategory, string> = {
  NEWS: "News",
  ANNOUNCEMENT: "Announcement",
  NOTICE: "Notice",
};

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  ADMISSION_FORM: "Admission form",
  FEE_SCHEDULE: "Fee schedule",
  POLICY: "Policy",
  OTHER: "Other",
};

export const enquiryStatusOptions: Array<{ value: EnquiryStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "VISIT_ARRANGED", label: "Visit arranged" },
  { value: "ENROLLED", label: "Enrolled" },
  { value: "NOT_PROCEEDING", label: "Not proceeding" },
];

export function buildQuery(
  values: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value && value.trim() !== "") params.set(key, value.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
