import { prisma } from "../db.js";
import { logger } from "./logger.js";

type MailTemplate =
    | "enquiry-confirmation"
    | "enquiry-branch-notification"
    | "user-welcome";

interface MailInput {
    to: string;
    subject: string;
    template: MailTemplate;
    relatedType?: string;
    relatedId?: string;
    heading: string;
    intro: string;
    rows?: Array<{ label: string; value: string }>;
    bodyLines?: string[];
    cta?: { label: string; href: string };
    signOff?: string;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderHtml(input: MailInput): string {
    const rows = (input.rows ?? [])
        .map(
            (row) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(46,42,36,0.14);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#5b6f62;width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(46,42,36,0.14);font-size:15px;color:#2E2A24;vertical-align:top;">${escapeHtml(row.value)}</td>
        </tr>`,
        )
        .join("");

    const paragraphs = (input.bodyLines ?? [])
        .map(
            (line) =>
                `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#2E2A24;">${escapeHtml(line)}</p>`,
        )
        .join("");

    const cta = input.cta
        ? `<a href="${escapeHtml(input.cta.href)}" style="display:inline-block;margin:8px 0 22px;padding:13px 22px;background:#23392F;color:#F6F1E7;text-decoration:none;border-radius:4px;font-size:14px;letter-spacing:0.02em;">${escapeHtml(input.cta.label)}</a>`
        : "";

    return `<!doctype html>
<html lang="en-ZA">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F6F1E7;">
    <div style="background:#F6F1E7;padding:36px 16px;font-family:'DM Sans',Arial,Helvetica,sans-serif;color:#2E2A24;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#FFFDF8;border:1px solid rgba(46,42,36,0.12);border-radius:6px;overflow:hidden;">
        <tr>
          <td style="padding:26px 32px 18px;border-bottom:1px solid rgba(46,42,36,0.12);">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#23392F;letter-spacing:0.01em;">Khanya Nature School</div>
            <div style="margin-top:5px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5b6f62;">Room to grow in the light</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 12px;">
            <div style="height:3px;width:46px;background:#D9A441;margin-bottom:22px;"></div>
            <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:27px;line-height:1.25;color:#23392F;">${escapeHtml(input.heading)}</h1>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#2E2A24;">${escapeHtml(input.intro)}</p>
            ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;">${rows}</table>` : ""}
            ${paragraphs}
            ${cta}
            <p style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#2E2A24;">${escapeHtml(input.signOff ?? "Warm regards,\nThe Khanya team")}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 30px;border-top:1px solid rgba(46,42,36,0.12);">
            <p style="margin:0;font-size:12px;line-height:1.7;color:#5b6f62;">
              Khanya Nature School, 8 Jacaranda Walk, Ferndale, Randburg, 2194<br />
              012 555 0142 &middot; hello@khanyanatureschool.example
            </p>
            <p style="margin:14px 0 0;font-size:11px;line-height:1.6;color:#7b8a80;">
              This message was sent by the demo website for Khanya Nature School. The school is fictional.
            </p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

function renderText(input: MailInput): string {
    const rows = (input.rows ?? [])
        .map((row) => `${row.label}: ${row.value}`)
        .join("\n");
    const paragraphs = (input.bodyLines ?? []).join("\n\n");
    const cta = input.cta ? `${input.cta.label}: ${input.cta.href}` : "";
    return [
        "KHANYA NATURE SCHOOL",
        "",
        input.heading,
        "",
        input.intro,
        rows ? `\n${rows}` : "",
        paragraphs ? `\n${paragraphs}` : "",
        cta ? `\n${cta}` : "",
        "",
        input.signOff ?? "Warm regards,\nThe Khanya team",
        "",
        "Khanya Nature School, 8 Jacaranda Walk, Ferndale, Randburg, 2194",
        "012 555 0142, hello@khanyanatureschool.example",
        "Demo website. Khanya Nature School is a fictional school.",
    ]
        .filter((part) => part !== "")
        .join("\n");
}

export async function sendMail(input: MailInput): Promise<void> {
    const html = renderHtml(input);
    const text = renderText(input);

    try {
        const record = await prisma.emailOutbox.create({
            data: {
                to: input.to,
                subject: input.subject,
                html,
                text,
                template: input.template,
                relatedType: input.relatedType ?? null,
                relatedId: input.relatedId ?? null,
            },
        });
        logger.info(
            { outboxId: record.id, to: input.to, subject: input.subject },
            "email written to outbox",
        );
    } catch (error) {
        logger.error(
            { err: error, to: input.to },
            "failed to write email to outbox",
        );
    }
}

interface EnquiryMailData {
    reference: string;
    parentName: string;
    email: string;
    phone: string;
    childName: string;
    childDateOfBirth: string;
    branchName: string;
    branchEmail: string;
    branchWhatsapp: string;
    programmeName: string | null;
    preferredStart: string | null;
    message: string;
}

export async function sendEnquiryEmails(data: EnquiryMailData): Promise<void> {
    await sendMail({
        to: data.email,
        subject: `We have your enquiry, ${data.reference}`,
        template: "enquiry-confirmation",
        relatedType: "Enquiry",
        relatedId: data.reference,
        heading: `Thank you, ${data.parentName.split(" ")[0]}`,
        intro: "Your enquiry has reached the Khanya team. We will reply within one working day, usually sooner. Here is what you sent us so you have it on hand.",
        rows: [
            { label: "Reference", value: data.reference },
            { label: "Child", value: data.childName },
            { label: "Branch", value: data.branchName },
            ...(data.programmeName
                ? [{ label: "Programme", value: data.programmeName }]
                : []),
            {
                label: "Preferred start",
                value: data.preferredStart ?? "Not specified",
            },
        ],
        bodyLines: [
            "A teacher from the branch will call or email you to arrange a visit. Visits happen on weekday mornings, when the children are outdoors and the day is at its most honest.",
            "If you need to add anything, reply to this email or send us a WhatsApp message and quote your reference.",
        ],
        cta: {
            label: "Message us on WhatsApp",
            href: `https://wa.me/${data.branchWhatsapp}?text=${encodeURIComponent(`Hello ${data.branchName}, I have an enquiry (${data.reference}) about ${data.childName}.`)}`,
        },
    });

    await sendMail({
        to: data.branchEmail,
        subject: `New website enquiry: ${data.childName} (${data.reference})`,
        template: "enquiry-branch-notification",
        relatedType: "Enquiry",
        relatedId: data.reference,
        heading: "A new family has been in touch",
        intro: `A new enquiry came in through the website for ${data.branchName}. Please make contact within one working day.`,
        rows: [
            { label: "Reference", value: data.reference },
            { label: "Parent", value: data.parentName },
            { label: "Phone", value: data.phone },
            { label: "Email", value: data.email },
            { label: "Child", value: data.childName },
            { label: "Date of birth", value: data.childDateOfBirth },
            {
                label: "Programme",
                value: data.programmeName ?? "Not specified",
            },
            {
                label: "Preferred start",
                value: data.preferredStart ?? "Not specified",
            },
        ],
        bodyLines: [data.message],
        signOff: "Khanya website",
    });
}

export async function sendUserWelcomeEmail(input: {
    to: string;
    name: string;
    role: string;
}): Promise<void> {
    await sendMail({
        to: input.to,
        subject: "Your Khanya Nature School content account",
        template: "user-welcome",
        relatedType: "User",
        heading: `Welcome to the Khanya team, ${input.name.split(" ")[0]}`,
        intro: "A content account has been created for you on the Khanya Nature School website. You can sign in with your email address and the temporary password shared with you by the administrator.",
        rows: [
            { label: "Email", value: input.to },
            { label: "Role", value: input.role },
        ],
        bodyLines: [
            "Please change your password after your first sign in. The admin area works on a tablet, so you can update the site from the staffroom.",
        ],
        cta: {
            label: "Open the admin",
            href: `${process.env.WEB_ORIGIN ?? "http://localhost:3007"}/admin/login`,
        },
        signOff: "Naledi Botha\nFounder and principal",
    });
}
