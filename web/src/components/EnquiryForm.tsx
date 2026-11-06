"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { ApiError, submitEnquiry } from "@/lib/api";
import type { Branch } from "@/lib/types";
import { ArrowRightIcon, CheckIcon } from "./icons";

const enquirySchema = z.object({
  parentName: z.string().trim().min(2, "Tell us your name."),
  email: z.email("Use a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Use a phone number we can reach you on.")
    .max(30, "That phone number is too long."),
  childName: z.string().trim().min(2, "Tell us your child's name."),
  childDateOfBirth: z
    .string()
    .min(1, "Choose your child's date of birth.")
    .refine((value) => {
      const date = new Date(`${value}T12:00:00+02:00`);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    }, "The date of birth cannot be in the future."),
  branchId: z.string().min(1, "Choose a branch."),
  programmeId: z.string(),
  preferredStart: z.string(),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two is enough.")
    .max(2000, "Please keep this under 2 000 characters."),
  consentPopia: z
    .boolean()
    .refine((value) => value, "Please agree to us storing your details so we can reply."),
});

type EnquiryValues = z.infer<typeof enquirySchema>;

type FieldErrors = Partial<Record<keyof EnquiryValues | "form", string>>;

const initialValues: EnquiryValues = {
  parentName: "",
  email: "",
  phone: "",
  childName: "",
  childDateOfBirth: "",
  branchId: "",
  programmeId: "",
  preferredStart: "",
  message: "",
  consentPopia: false,
};

const inputClass =
  "mt-1.5 w-full rounded-[14px] border-2 border-ink/15 bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none focus:ring-4 focus:ring-sun/35";

const labelClass = "block text-[0.8rem] font-extrabold text-sky-deep";

function fieldErrorId(name: keyof EnquiryValues): string {
  return `enquiry-${name}-error`;
}

export function EnquiryForm({
  branches,
  initialBranchId = "",
  initialProgrammeId = "",
}: {
  branches: Branch[];
  initialBranchId?: string;
  initialProgrammeId?: string;
}) {
  const router = useRouter();
  const startedAt = useRef<number | null>(null);
  const [values, setValues] = useState<EnquiryValues>({
    ...initialValues,
    branchId: initialBranchId,
    programmeId: initialProgrammeId,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === values.branchId) ?? null,
    [branches, values.branchId],
  );

  const programmes = selectedBranch?.programmes ?? [];
  const programmeAvailable = programmes.some(
    (programme) => programme.id === values.programmeId,
  );

  function update<K extends keyof EnquiryValues>(
    key: K,
    value: EnquiryValues[K],
  ) {
    setValues((current) => {
      if (key === "branchId") {
        const nextBranch = branches.find((branch) => branch.id === value);
        const keepProgramme = nextBranch?.programmes.some(
          (programme) => programme.id === current.programmeId,
        );
        return {
          ...current,
          branchId: value as string,
          programmeId: keepProgramme ? current.programmeId : "",
        };
      }
      return { ...current, [key]: value };
    });
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
    setServerMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage(null);

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !(field in nextErrors)) {
          nextErrors[field as keyof EnquiryValues] = issue.message;
        }
      }
      setErrors(nextErrors);
      const firstField = parsed.error.issues[0]?.path[0];
      if (typeof firstField === "string") {
        document.getElementById(`enquiry-${firstField}`)?.focus();
      }
      return;
    }

    setSubmitting(true);
    const form = event.currentTarget;
    const honeypot = new FormData(form).get("website");
    try {
      const response = await submitEnquiry({
        ...parsed.data,
        programmeId: parsed.data.programmeId || null,
        preferredStart: parsed.data.preferredStart || null,
        website: typeof honeypot === "string" ? honeypot : "",
        startedAt: startedAt.current ?? Date.now(),
      });
      router.push(`/enquiry/thank-you?reference=${encodeURIComponent(response.reference)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerMessage(error.message);
        if (error.fields) {
          setErrors(
            Object.fromEntries(
              Object.entries(error.fields).map(([key, message]) => [
                key,
                message,
              ]),
            ) as FieldErrors,
          );
        }
        if (error.code === "FORM_TIMING") {
          startedAt.current = Date.now() - 5000;
        }
      } else {
        setServerMessage(
          "The enquiry could not be sent. Please try again, or phone the school.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (branches.length === 0) {
    return (
      <div className="border-t-2 border-ink/10 py-8">
        <p className="text-sm leading-relaxed text-ink/65">
          Online enquiries are temporarily unavailable. Please phone or email the
          school and we will help you directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="enquiry-parentName" className={labelClass}>
            Your name
          </label>
          <input
            id="enquiry-parentName"
            name="parentName"
            type="text"
            autoComplete="name"
            value={values.parentName}
            onChange={(event) => update("parentName", event.target.value)}
            aria-invalid={Boolean(errors.parentName)}
            aria-describedby={errors.parentName ? fieldErrorId("parentName") : undefined}
            className={inputClass}
            placeholder="Nomsa Mokoena"
          />
          {errors.parentName ? (
            <p id={fieldErrorId("parentName")} className="mt-1.5 text-[0.78rem] field-error text-poppy-deep">
              {errors.parentName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enquiry-childName" className={labelClass}>
            Your child&apos;s name
          </label>
          <input
            id="enquiry-childName"
            name="childName"
            type="text"
            value={values.childName}
            onChange={(event) => update("childName", event.target.value)}
            aria-invalid={Boolean(errors.childName)}
            aria-describedby={errors.childName ? fieldErrorId("childName") : undefined}
            className={inputClass}
            placeholder="Lesedi"
          />
          {errors.childName ? (
            <p id={fieldErrorId("childName")} className="mt-1.5 text-[0.78rem] field-error text-poppy-deep">
              {errors.childName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enquiry-email" className={labelClass}>
            Email address
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? fieldErrorId("email") : undefined}
            className={inputClass}
            placeholder="you@example.co.za"
          />
          {errors.email ? (
            <p id={fieldErrorId("email")} className="mt-1.5 text-[0.78rem] field-error text-poppy-deep">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enquiry-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? fieldErrorId("phone") : undefined}
            className={inputClass}
            placeholder="082 555 0100"
          />
          {errors.phone ? (
            <p id={fieldErrorId("phone")} className="mt-1.5 text-[0.78rem] field-error text-poppy-deep">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enquiry-childDateOfBirth" className={labelClass}>
            Child&apos;s date of birth
          </label>
          <input
            id="enquiry-childDateOfBirth"
            name="childDateOfBirth"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={values.childDateOfBirth}
            onChange={(event) => update("childDateOfBirth", event.target.value)}
            aria-invalid={Boolean(errors.childDateOfBirth)}
            aria-describedby={
              errors.childDateOfBirth ? fieldErrorId("childDateOfBirth") : undefined
            }
            className={inputClass}
          />
          {errors.childDateOfBirth ? (
            <p
              id={fieldErrorId("childDateOfBirth")}
              className="mt-1.5 text-[0.78rem] field-error text-poppy-deep"
            >
              {errors.childDateOfBirth}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enquiry-branchId" className={labelClass}>
            Preferred branch
          </label>
          <select
            id="enquiry-branchId"
            name="branchId"
            value={values.branchId}
            onChange={(event) => update("branchId", event.target.value)}
            aria-invalid={Boolean(errors.branchId)}
            aria-describedby={errors.branchId ? fieldErrorId("branchId") : undefined}
            className={inputClass}
          >
            <option value="">Choose a branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          {errors.branchId ? (
            <p id={fieldErrorId("branchId")} className="mt-1.5 text-[0.78rem] field-error text-poppy-deep">
              {errors.branchId}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="enquiry-programmeId" className={labelClass}>
            Programme <span className="font-normal text-ink/65">(optional)</span>
          </label>
          <select
            id="enquiry-programmeId"
            name="programmeId"
            value={programmeAvailable ? values.programmeId : ""}
            onChange={(event) => update("programmeId", event.target.value)}
            disabled={!selectedBranch}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-sky-tint/60`}
          >
            <option value="">
              {selectedBranch ? "Not sure yet" : "Choose a branch first"}
            </option>
            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}, {programme.ageLabel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enquiry-preferredStart" className={labelClass}>
            Preferred start{" "}
            <span className="font-normal text-ink/65">(optional)</span>
          </label>
          <input
            id="enquiry-preferredStart"
            name="preferredStart"
            type="month"
            value={values.preferredStart}
            onChange={(event) => update("preferredStart", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enquiry-message" className={labelClass}>
            What would you like us to know?
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            rows={5}
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? fieldErrorId("message") : "enquiry-message-hint"}
            className={inputClass}
            placeholder="Your child's age, what matters to you, and anything we should know before we reply."
          />
          <div className="mt-1.5 flex items-start justify-between gap-4">
            {errors.message ? (
              <p id={fieldErrorId("message")} className="text-[0.78rem] field-error text-poppy-deep">
                {errors.message}
              </p>
            ) : (
              <p id="enquiry-message-hint" className="text-[0.75rem] text-ink/65">
                A sentence or two is enough.
              </p>
            )}
            <span className="shrink-0 text-[0.72rem] tabular-nums text-ink/65">
              {values.message.length} / 2 000
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="enquiry-website">Leave this field empty</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 border-t-2 border-ink/10 pt-5">
        <div className="flex items-start gap-3">
          <input
            id="enquiry-consentPopia"
            name="consentPopia"
            type="checkbox"
            checked={values.consentPopia}
            onChange={(event) => update("consentPopia", event.target.checked)}
            aria-invalid={Boolean(errors.consentPopia)}
            aria-describedby={
              errors.consentPopia ? fieldErrorId("consentPopia") : "enquiry-consent-hint"
            }
            className="mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-ink/30 accent-sun"
          />
          <label htmlFor="enquiry-consentPopia" className="text-[0.9rem] leading-relaxed text-ink/70">
            I agree that Khanya Nature School may keep these details to reply to
            my enquiry, as explained in the{" "}
            <Link href="/privacy" className="squiggle-link text-ink">
              privacy notice
            </Link>
            .
          </label>
        </div>
        <p id="enquiry-consent-hint" className="mt-1 pl-9 text-[0.76rem] text-ink/60">
          We do not share your details with anyone else.
        </p>
        {errors.consentPopia ? (
          <p id={fieldErrorId("consentPopia")} className="mt-1.5 pl-9 text-[0.8rem] field-error text-poppy-deep">
            {errors.consentPopia}
          </p>
        ) : null}
      </div>

      {serverMessage ? (
        <div
          role="alert"
          className="mt-5 border-l-2 border-poppy-deep bg-poppy-tint px-4 py-3 text-[0.84rem] text-poppy-deep"
        >
          {serverMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full border-b-4 border-sun-deep bg-sun px-6 py-3 text-[0.95rem] font-extrabold text-ink transition-colors hover:bg-sun-deep hover:border-ink/25 active:translate-y-[3px] active:border-b-0 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
                aria-hidden
              />
              Sending your enquiry
            </>
          ) : (
            <>
              Send enquiry
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="inline-flex items-center gap-1.5 text-[0.78rem] text-ink/65">
          <CheckIcon className="h-4 w-4 text-meadow-deep" />
          We usually reply within one working day.
        </p>
      </div>
    </form>
  );
}
