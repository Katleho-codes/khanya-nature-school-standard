import { expect, type Page } from "@playwright/test";

export const adminEmail = "admin@khanyanatureschool.example";
export const adminPassword = "KhanyaAdmin2027!";
export const editorEmail = "editor@khanyanatureschool.example";
export const editorPassword = "KhanyaEditor2027!";

export const footerCredit =
  "Demo website by LSQD Studios. Khanya Nature School is a fictional school.";

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

export async function signIn(
  page: Page,
  email = adminEmail,
  password = adminPassword,
): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /Sign in to the CMS/ }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Dashboard", level: 1 }),
  ).toBeVisible();
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const width = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    return width - window.innerWidth;
  });
  expect(overflow, "the page should not scroll sideways").toBeLessThanOrEqual(1);
}

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      if (
        !text.includes("favicon.ico") &&
        !text.includes("Failed to load resource: the server responded with a status of 404")
      ) {
        errors.push(text);
      }
    }
  });
  return errors;
}
