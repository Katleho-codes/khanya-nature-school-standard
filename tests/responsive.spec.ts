import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  signIn,
} from "./helpers";

const routes = [
  "/",
  "/programmes",
  "/branches",
  "/news",
  "/events",
  "/gallery",
  "/admissions",
  "/contact",
];

test.describe("at 375 pixels wide", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const route of routes) {
    test(`${route} fits the screen`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("the public menu opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog");
    await expect(menu.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Programmes" })).toBeVisible();
    await menu.getByRole("link", { name: "Programmes" }).click();
    await expect(page).toHaveURL(/\/programmes$/);
    await expect(
      page.getByRole("heading", { name: /Four years of growing outward/i }),
    ).toBeVisible();
  });

  test("the admin menu works on a phone", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Open admin menu" }).click();
    const nav = page.getByRole("navigation", { name: "Admin sections" });
    await expect(nav.getByRole("link", { name: "Enquiries" })).toBeVisible();
    await nav.getByRole("link", { name: "Enquiries" }).click();
    await expect(
      page.getByRole("heading", { name: "Enquiries", level: 1 }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("at 1440 pixels wide", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("desktop navigation is visible and the mobile trigger is hidden", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "Programmes" }).first()).toBeVisible();
    await expect(header.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });
});
