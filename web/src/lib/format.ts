const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SA_TIME_ZONE = "Africa/Johannesburg";

function parts(date: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-ZA", {
    timeZone: SA_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const output: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") output[part.type] = part.value;
  }
  return output;
}

export function formatRand(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "On request";
  const rands = Math.round(cents / 100);
  return `R${String(rands).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
}

export function formatFee(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "On request";
  return `${formatRand(cents)} per month`;
}

export function formatDate(
  value: string | Date,
  options: { withYear?: boolean; short?: boolean } = {},
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const p = parts(date);
  const day = Number(p.day);
  const month = MONTHS[Number(p.month) - 1] ?? "";
  if (options.short) return `${day} ${month.slice(0, 3)}`;
  return `${day} ${month}${options.withYear === false ? "" : ` ${p.year}`}`;
}

export function formatDateLong(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const p = parts(date);
  return `${WEEKDAYS[new Date(`${p.year}-${p.month}-${p.day}T12:00:00Z`).getUTCDay()]}, ${Number(p.day)} ${MONTHS[Number(p.month) - 1]} ${p.year}`;
}

export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const p = parts(date);
  return `${p.hour}:${p.minute}`;
}

export function formatMonth(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const p = parts(date);
  return `${MONTHS[Number(p.month) - 1]} ${p.year}`;
}

export function monthKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const p = parts(date);
  return `${p.year}-${(p.month ?? "01").padStart(2, "0")}`;
}

export function monthKeyFromParts(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthKey(value: string): { year: number; month: number } {
  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return { year: new Date().getUTCFullYear(), month: new Date().getUTCMonth() + 1 };
  }
  return { year, month };
}

export function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startP = parts(start);
  const endP = parts(end);
  if (startP.year === endP.year && startP.month === endP.month && startP.day === endP.day) {
    return `${formatDate(start)}`;
  }
  if (startP.year === endP.year) {
    const startMonth = MONTHS[Number(startP.month) - 1] ?? "";
    const endMonth = MONTHS[Number(endP.month) - 1] ?? "";
    if (startP.month === endP.month) {
      return `${Number(startP.day)} to ${Number(endP.day)} ${startMonth} ${startP.year}`;
    }
    return `${Number(startP.day)} ${startMonth} to ${Number(endP.day)} ${endMonth} ${startP.year}`;
  }
  return `${formatDate(start)} to ${formatDate(end)}`;
}

export function formatEventWhen(event: {
  startsAt: string;
  endsAt: string;
  allDay: boolean;
}): string {
  if (event.allDay) {
    return formatDateRange(event.startsAt, event.endsAt);
  }
  return `${formatDate(event.startsAt)} · ${formatTime(event.startsAt)} to ${formatTime(event.endsAt)}`;
}

export const WEEKDAY_LABELS: Array<{ key: string; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function summariseHours(hours: {
  [key: string]: { open: string; close: string } | null;
}): string {
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const open = weekdays
    .map((day) => hours[day])
    .filter((value): value is { open: string; close: string } => Boolean(value));
  if (open.length === 0) return "Closed";
  const first = open[0];
  const allSame = open.every(
    (value) => value.open === first?.open && value.close === first?.close,
  );
  if (allSame) return `Monday to Friday ${first?.open} to ${first?.close}`;
  return "See branch hours";
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function phoneHref(phone: string): string {
  return `tel:+27${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}

export function dateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function monthInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const p = parts(new Date(value));
  return `${p.year}-${(p.month ?? "01").padStart(2, "0")}`;
}

export function csvSafe(value: string): string {
  return value.replaceAll('"', '""');
}
