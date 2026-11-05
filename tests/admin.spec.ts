import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  adminEmail,
  editorEmail,
  editorPassword,
  signIn,
  uniqueSuffix,
} from "./helpers";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
  "base64",
);

async function waitForAdminResponse(
  page: Page,
  path: string,
  method: string,
): Promise<void> {
  await page.waitForResponse(
    (response) =>
      response.url().includes(`/api/admin${path}`) &&
      response.request().method() === method,
  );
}

async function submitDialogForm(
  page: Page,
  dialog: Locator,
  buttonName: string,
  path: string,
  method: string,
): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const responsePromise = page
      .waitForResponse(
        (response) =>
          response.url().includes(`/api/admin${path}`) &&
          response.request().method() === method,
        { timeout: 15_000 },
      )
      .catch(() => null);
    await dialog.getByRole("button", { name: buttonName }).click();
    const response = await responsePromise;
    if (response?.ok()) return;
    await page.waitForTimeout(500);
    if (!(await dialog.isVisible())) return;
  }
}

test("signed out visitors are sent to the login screen", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", { name: /Welcome back/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Contact the office/i }),
  ).toBeVisible();
  await expect(page.getByText(/Public sign up is disabled/i)).toBeVisible();
});

test("a wrong password gets a clear error and keeps the form usable", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: /Sign in to the CMS/ }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByLabel("Email address")).toBeEditable();
});

test("the admin dashboard, settings, users and outbox load with seeded data", async ({
  page,
}) => {
  await signIn(page);
  await expect(page.getByText("New enquiries")).toBeVisible();
  await expect(page.getByText("Recent enquiries")).toBeVisible();

  await page.goto("/admin/settings");
  await expect(
    page.getByRole("heading", { name: "Site settings", level: 1 }),
  ).toBeVisible();
  await expect(page.getByLabel("School name")).toHaveValue(/Khanya/);

  await page.goto("/admin/users");
  await expect(
    page.getByRole("heading", { name: "Users", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("main").getByText(adminEmail).first()).toBeVisible();

  await page.goto("/admin/outbox");
  await expect(
    page.getByRole("heading", { name: "Outbox", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("Subject", { exact: true }),
  ).toBeVisible();
});

test("news can be created, edited, published and deleted through the admin", async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const title = `Smoke test story ${suffix}`;
  const updatedTitle = `${title} updated`;
  const slug = `smoke-test-story-${suffix}`;

  await signIn(page);
  await page.goto("/admin/news");
  await expect(
    page.getByRole("heading", { name: "News and notices", level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Write a post" }).first().click();
  const createDialog = page.getByRole("dialog");
  await expect(
    createDialog.getByRole("heading", { name: "Write a post" }),
  ).toBeVisible();
  await createDialog.locator("#news-title").fill(title);
  await createDialog.locator("#news-slug").fill(slug);
  await createDialog
    .locator("#news-excerpt")
    .fill("A temporary story created by the automated smoke test.");
  await createDialog
    .locator("#news-body")
    .fill(
      "This story checks that an editor can write, publish, update and remove a news item without leaving the admin.",
    );
  await createDialog.locator("#news-form-status").selectOption("PUBLISHED");

  await submitDialogForm(page, createDialog, "Save post", "/posts", "POST");
  await expect(createDialog).toBeHidden();
  await expect(page.getByText(title, { exact: true })).toBeVisible();

  await page.goto(`/news/${slug}`);
  await expect(
    page.getByRole("heading", { name: title, level: 1 }),
  ).toBeVisible();

  await page.goto("/admin/news");
  await page.getByLabel("Search").fill(title);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin/posts") &&
        response.request().method() === "GET",
    ),
    page.getByRole("button", { name: "Filter" }).click(),
  ]);
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();

  const editDialog = page.getByRole("dialog");
  await expect(
    editDialog.getByRole("heading", { name: "Edit post" }),
  ).toBeVisible();
  await editDialog.locator("#news-title").fill(updatedTitle);
  await submitDialogForm(
    page,
    editDialog,
    "Save changes",
    "/posts/",
    "PATCH",
  );
  await expect(editDialog).toBeHidden();
  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();

  await page.goto(`/news/${slug}`);
  await expect(
    page.getByRole("heading", { name: updatedTitle, level: 1 }),
  ).toBeVisible();

  await page.goto("/admin/news");
  await page.getByLabel("Search").fill(updatedTitle);
  await page.getByRole("button", { name: "Filter" }).click();
  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).click();
  const confirm = page.getByRole("dialog");
  await expect(
    confirm.getByRole("heading", { name: `Delete ${updatedTitle}?` }),
  ).toBeVisible();
  await submitDialogForm(
    page,
    confirm,
    "Delete post",
    "/posts/",
    "DELETE",
  );
  await expect(page.getByText(updatedTitle, { exact: true })).toHaveCount(0);

  const response = await page.goto(`/news/${slug}`);
  expect(response?.status()).toBe(404);
});

test("branch activation propagates to the public header, footer and sitemap", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/admin/branches");
  await expect(
    page.getByRole("heading", { name: "Branches", level: 1 }),
  ).toBeVisible();

  const hide = page.getByRole("button", {
    name: "Hide Randburg (Ferndale) on the website",
  });
  try {
    await Promise.all([
      waitForAdminResponse(page, "/branches/", "PATCH"),
      hide.click(),
    ]);
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: "Randburg (Ferndale)" }),
    ).toHaveCount(0);
    const sitemap = await page.request.get("/sitemap.xml");
    expect(await sitemap.text()).not.toContain("/branches/randburg");
  } finally {
    await page.goto("/admin/branches");
    const show = page.getByRole("button", {
      name: "Show Randburg (Ferndale) on the website",
    });
    try {
      await expect(show).toBeVisible({ timeout: 10_000 });
      await Promise.all([
        waitForAdminResponse(page, "/branches/", "PATCH"),
        show.click(),
      ]);
    } catch {
      // The branch may not have been hidden if the test failed before the save
      // completed. Leave the seeded state untouched in that case.
    }
  }

  await page.goto("/");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Randburg (Ferndale)" }),
  ).toBeVisible();
});

test("enquiries can be searched, opened, updated and annotated", async ({
  page,
}) => {
  const note = `Smoke test note ${uniqueSuffix()}`;
  await signIn(page);
  await page.goto("/admin/enquiries");
  await expect(
    page.getByRole("heading", { name: "Enquiries", level: 1 }),
  ).toBeVisible();

  await page.getByLabel("Search").fill("Thandiwe Mokoena");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin/enquiries") &&
        response.request().method() === "GET",
    ),
    page.getByRole("button", { name: "Filter" }).click(),
  ]);
  await expect(page.getByText("Thandiwe Mokoena").first()).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("button", { name: "Open", exact: true })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Enquiry ENQ-/)).toBeVisible();
  await expect(dialog.getByText(/Message from the family/i)).toBeVisible();
  await Promise.all([
    waitForAdminResponse(page, "/enquiries/", "PATCH"),
    dialog.getByLabel("Enquiry status").selectOption("CONTACTED"),
  ]);
  await expect(dialog.getByText("Contacted").first()).toBeVisible();

  await dialog.getByLabel("Add a note").fill(note);
  await Promise.all([
    waitForAdminResponse(page, "/enquiries/", "POST"),
    dialog.getByRole("button", { name: "Add note" }).click(),
  ]);
  await expect(dialog.getByText(note)).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();

  const exportLink = page.getByRole("link", { name: "Export CSV" });
  const href = await exportLink.getAttribute("href");
  expect(href).toBeTruthy();
  const csv = await page.request.get(href ?? "");
  expect(csv.status()).toBe(200);
  expect(await csv.text()).toContain("Thandiwe Mokoena");
});

test("media can be uploaded, described and deleted", async ({ page }) => {
  const suffix = uniqueSuffix();
  const filename = `smoke-image-${suffix}.png`;
  const description = `Smoke test image ${suffix}`;

  await signIn(page);
  await page.goto("/admin/media");
  await expect(
    page.getByRole("heading", { name: "Media", level: 1 }),
  ).toBeVisible();

  await page.getByLabel("File").setInputFiles({
    name: filename,
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByLabel("Image description").fill(description);
  await Promise.all([
    waitForAdminResponse(page, "/media", "POST"),
    page.getByRole("button", { name: "Upload file" }).click(),
  ]);
  await expect(page.getByText(filename, { exact: true })).toBeVisible();

  const card = page.getByRole("article").filter({ hasText: filename });
  await card.getByRole("button", { name: "Edit description" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Description").fill(`${description} updated`);
  await submitDialogForm(
    page,
    dialog,
    "Save description",
    "/media/",
    "PATCH",
  );
  await expect(dialog).toBeHidden();
  await expect(page.getByText(`${description} updated`)).toBeVisible();

  await card.getByRole("button", { name: "Delete" }).click();
  const confirm = page.getByRole("dialog");
  await submitDialogForm(
    page,
    confirm,
    "Delete file",
    "/media/",
    "DELETE",
  );
  await expect(page.getByText(filename, { exact: true })).toHaveCount(0);
});

test("editors see content tools but cannot read the users API", async ({
  page,
}) => {
  await signIn(page, editorEmail, editorPassword);
  const nav = page.getByRole("navigation", { name: "Admin sections" });
  await expect(nav.getByRole("link", { name: "News" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Users" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Site settings" })).toHaveCount(0);
  const response = await page.request.get("/api/admin/users");
  expect(response.status()).toBe(403);
});
