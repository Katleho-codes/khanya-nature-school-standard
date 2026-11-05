import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { adminEmail, adminPassword, signIn } from "./helpers";

const pages = [
  { path: "/", name: "home" },
  { path: "/programmes", name: "programmes" },
  { path: "/programmes/little-explorers", name: "programme detail" },
  { path: "/branches/randburg", name: "branch detail" },
  { path: "/news/term-4-in-the-garden", name: "news detail" },
  { path: "/events/fourways-open-morning", name: "event detail" },
  { path: "/gallery/garden", name: "gallery album" },
  { path: "/admissions", name: "admissions" },
  { path: "/contact", name: "contact" },
  { path: "/privacy", name: "privacy" },
];

for (const target of pages) {
  test(`${target.name} has no WCAG A or AA violations`, async ({ page }) => {
    await page.goto(target.path);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-ZA");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        help: violation.help,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}

test("the login screen has no WCAG A or AA violations", async ({ page }) => {
  await page.goto("/admin/login");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
});

test("the admin dashboard has no WCAG A or AA violations", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword);
  await page.getByRole("button", { name: /Sign in to the CMS/ }).click();
  await expect(
    page.getByRole("heading", { name: "Dashboard", level: 1 }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
});
