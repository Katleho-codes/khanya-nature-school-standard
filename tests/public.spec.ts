import { expect, test } from "@playwright/test";
import {
  collectPageErrors,
  expectNoHorizontalOverflow,
  footerCredit,
} from "./helpers";

const publicRoutes = [
  { path: "/", heading: /A small school with a very big garden/i },
  { path: "/about", heading: /The garden came first/i },
  { path: "/programmes", heading: /Four programmes, one muddy garden/i },
  { path: "/programmes/little-explorers", heading: /Little Explorers/i },
  { path: "/branches", heading: /Two gardens. Pick the one that fits your morning/i },
  { path: "/branches/randburg", heading: /Randburg/i },
  { path: "/news", heading: /Notes from the garden/i },
  { path: "/news/term-4-in-the-garden", heading: /Term 4 in the garden/i },
  { path: "/events", heading: /The garden has a calendar/i },
  { path: "/events/fourways-open-morning", heading: /Fourways open morning/i },
  { path: "/gallery", heading: /Mud, cake and the same old tree/i },
  { path: "/gallery/garden", heading: /The garden through the year/i },
  { path: "/admissions", heading: /First a look. Then a visit/i },
  { path: "/contact", heading: /A person will answer/i },
  { path: "/privacy", heading: /Your information, handled carefully/i },
  { path: "/enquiry/thank-you", heading: /Thank you/i },
] as const;

test.describe("public pages", () => {
  for (const route of publicRoutes) {
    test(`${route.path} renders with one heading and no browser errors`, async ({
      page,
    }) => {
      const errors = collectPageErrors(page);
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(/Khanya Nature School/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toContainText(route.heading);
      await expect(page.getByRole("contentinfo")).toContainText(footerCredit);
      await expectNoHorizontalOverflow(page);
      expect(errors).toEqual([]);
    });
  }
});

test("the skip link is the first stop for keyboard users", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText("Skip to content");
  await focused.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("primary navigation reaches every public section", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  for (const label of [
    "Programmes",
    "Branches",
    "About",
    "News",
    "Events",
    "Gallery",
    "Admissions",
  ]) {
    await expect(header.getByRole("link", { name: label }).first()).toBeVisible();
  }
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Contact the school" }),
  ).toBeVisible();
  await expect(
    header.getByRole("link", { name: "WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\/27825550100/);
});

test("detail pages include canonical metadata and structured data", async ({
  page,
}) => {
  await page.goto("/news/term-4-in-the-garden");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/news\/term-4-in-the-garden$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Khanya Nature School/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const parsed = schemas.map((value) => JSON.parse(value) as { "@type": string });
  expect(parsed.map((item) => item["@type"])).toEqual(
    expect.arrayContaining(["Article", "BreadcrumbList"]),
  );
});

test("home page carries the Preschool structured data", async ({ page }) => {
  await page.goto("/");
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const parsed = schemas.map((value) => JSON.parse(value) as { "@type": string });
  expect(parsed.map((item) => item["@type"])).toContain("Preschool");
});

test("event pages offer a working calendar download", async ({ page }) => {
  await page.goto("/events/fourways-open-morning");
  const link = page.getByRole("link", {
    name: /Download the calendar file/i,
  });
  await expect(link).toHaveAttribute(
    "href",
    "/api/public/events/fourways-open-morning/ics",
  );
  const response = await page.request.get(
    "/api/public/events/fourways-open-morning/ics",
  );
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("BEGIN:VCALENDAR");
  expect(body).toContain("Fourways open morning");
});

test("sitemap and robots expose the public site and hide the admin", async ({
  page,
}) => {
  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("/branches/randburg");
  expect(sitemapBody).toContain("/programmes/little-explorers");
  expect(sitemapBody).not.toContain("/admin");

  const robots = await page.request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toMatch(/Disallow: \/admin/);
  expect(robotsBody).toMatch(/Disallow: \/api/);
  expect(robotsBody).toContain("Sitemap:");
});

test("an unknown path gets the branded not found page", async ({ page }) => {
  const response = await page.goto("/this-path-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: /This path has grown over/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to the home page/i })).toBeVisible();
});
