"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { AdminApiError, adminFetch } from "@/lib/auth-server";
import {
  AdminButton,
  AdminError,
  AdminPageHeader,
  Field,
  adminInput,
  adminTextarea,
} from "@/components/admin/admin-ui";
import { MediaSelect } from "@/components/admin/MediaSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import { apiErrorMessage, useAdminData } from "@/components/admin/useAdmin";
import { useToast } from "@/components/admin/toast";
import { ArrowRightIcon } from "@/components/icons";

interface SettingsForm {
  schoolName: string;
  tagline: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  ogImageId: string;
  whatsappDefaultMessage: string;
}

const emptyForm: SettingsForm = {
  schoolName: "",
  tagline: "",
  defaultSeoTitle: "",
  defaultSeoDescription: "",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  ogImageId: "",
  whatsappDefaultMessage: "",
};

function settingsToForm(settings: SiteSettings): SettingsForm {
  return {
    schoolName: settings.schoolName,
    tagline: settings.tagline,
    defaultSeoTitle: settings.defaultSeoTitle,
    defaultSeoDescription: settings.defaultSeoDescription,
    socialFacebook: settings.socialFacebook ?? "",
    socialInstagram: settings.socialInstagram ?? "",
    socialYoutube: settings.socialYoutube ?? "",
    ogImageId: settings.ogImageId ?? "",
    whatsappDefaultMessage: settings.whatsappDefaultMessage,
  };
}

export default function AdminSettingsPage() {
  const { data, loading, error, reload } = useAdminData<{
    settings: SiteSettings | null;
  }>("/settings");
  const { toast } = useToast();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (data?.settings && !hydrated.current) {
      setForm(settingsToForm(data.settings));
      hydrated.current = true;
    }
  }, [data]);

  function set<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await adminFetch("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          socialFacebook: form.socialFacebook || null,
          socialInstagram: form.socialInstagram || null,
          socialYoutube: form.socialYoutube || null,
          ogImageId: form.ogImageId || null,
        }),
      });
      toast("Site settings were saved. Public pages will show them on the next load.");
      hydrated.current = false;
      await reload();
    } catch (caught) {
      if (caught instanceof AdminApiError && caught.fields) {
        setErrors(caught.fields);
      }
      toast(apiErrorMessage(caught), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Site settings"
        description="The school name, tagline and social links flow through the header, footer, metadata and WhatsApp buttons. Admin access only."
      />

      {error ? <AdminError message={error} onRetry={reload} /> : null}

      {loading && !data ? (
        <div className="h-96 animate-pulse paper-card-plain border-2 border-ink/10 bg-paper" />
      ) : (
        <form onSubmit={save} className="space-y-6">
          <section className="paper-card-plain border-2 border-ink/10 bg-paper p-5">
            <h2 className="font-display text-[1.25rem] text-ink">Identity</h2>
            <p className="mt-1 text-[0.78rem] text-ink/75">
              Used in the header, footer, email templates and structured data.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="School name"
                htmlFor="settings-name"
                required
                error={errors.schoolName}
                hint="Use the full public name."
              >
                <input
                  id="settings-name"
                  value={form.schoolName}
                  onChange={(event) => set("schoolName", event.target.value)}
                  className={adminInput}
                  required
                />
              </Field>
              <Field
                label="Tagline"
                htmlFor="settings-tagline"
                required
                error={errors.tagline}
                hint="One calm sentence about what makes the school different."
              >
                <input
                  id="settings-tagline"
                  value={form.tagline}
                  onChange={(event) => set("tagline", event.target.value)}
                  className={adminInput}
                  required
                />
              </Field>
            </div>
          </section>

          <SeoFields
            title={form.defaultSeoTitle}
            description={form.defaultSeoDescription}
            onTitleChange={(value) => set("defaultSeoTitle", value)}
            onDescriptionChange={(value) => set("defaultSeoDescription", value)}
            fallbackTitle={form.schoolName}
            fallbackDescription={form.tagline}
            path="/"
            errors={{
              seoTitle: errors.defaultSeoTitle,
              seoDescription: errors.defaultSeoDescription,
            }}
          />
          <p className="-mt-4 text-[0.72rem] text-ink/75">
            These are the site wide defaults. Individual pages can override them
            in their own SEO fields.
          </p>

          <section className="paper-card-plain border-2 border-ink/10 bg-paper p-5">
            <h2 className="font-display text-[1.25rem] text-ink">Social links</h2>
            <p className="mt-1 text-[0.78rem] text-ink/75">
              Leave a field blank to hide that icon in the footer.
            </p>
            <div className="mt-4 grid gap-4">
              <Field label="Facebook URL" htmlFor="settings-facebook" error={errors.socialFacebook}>
                <input
                  id="settings-facebook"
                  type="url"
                  value={form.socialFacebook}
                  onChange={(event) => set("socialFacebook", event.target.value)}
                  className={adminInput}
                  placeholder="https://www.facebook.com/..."
                />
              </Field>
              <Field label="Instagram URL" htmlFor="settings-instagram" error={errors.socialInstagram}>
                <input
                  id="settings-instagram"
                  type="url"
                  value={form.socialInstagram}
                  onChange={(event) => set("socialInstagram", event.target.value)}
                  className={adminInput}
                  placeholder="https://www.instagram.com/..."
                />
              </Field>
              <Field label="YouTube URL" htmlFor="settings-youtube" error={errors.socialYoutube}>
                <input
                  id="settings-youtube"
                  type="url"
                  value={form.socialYoutube}
                  onChange={(event) => set("socialYoutube", event.target.value)}
                  className={adminInput}
                  placeholder="https://www.youtube.com/..."
                />
              </Field>
            </div>
          </section>

          <section className="paper-card-plain border-2 border-ink/10 bg-paper p-5">
            <h2 className="font-display text-[1.25rem] text-ink">
              Sharing and WhatsApp
            </h2>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <MediaSelect
                id="settings-og"
                label="Default sharing image"
                value={form.ogImageId}
                onChange={(value) => set("ogImageId", value)}
                hint="Landscape, 1200 × 630 pixels. Used when a page has no cover image."
              />
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="settings-whatsapp" className="text-[0.74rem] font-medium text-ink">
                    Default WhatsApp message
                  </label>
                  <span className="text-[0.68rem] tabular-nums text-ink/75">
                    {form.whatsappDefaultMessage.length} / 400
                  </span>
                </div>
                <textarea
                  id="settings-whatsapp"
                  rows={5}
                  maxLength={400}
                  value={form.whatsappDefaultMessage}
                  onChange={(event) => set("whatsappDefaultMessage", event.target.value)}
                  className={adminTextarea}
                  required
                />
                {errors.whatsappDefaultMessage ? (
                  <p className="mt-1 text-[0.72rem] text-poppy-deep">
                    {errors.whatsappDefaultMessage}
                  </p>
                ) : (
                  <p className="mt-1 text-[0.7rem] text-ink/75">
                    Used when no more specific context is available. Keep it warm
                    and short.
                  </p>
                )}
              </div>
            </div>
          </section>

          {Object.keys(errors).length > 0 ? (
            <p className="text-[0.76rem] text-poppy-deep">
              Some fields need attention. Check the messages above.
            </p>
          ) : null}

          <div className="sticky bottom-0 flex justify-end gap-2 border-t-2 border-ink/10 bg-paper py-3">
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving" : "Save settings"}
              {!saving ? <ArrowRightIcon className="h-3.5 w-3.5" /> : null}
            </AdminButton>
          </div>
        </form>
      )}
    </div>
  );
}
