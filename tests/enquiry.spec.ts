import { expect, test } from "@playwright/test";
import { uniqueSuffix } from "./helpers";

test("the admissions form validates and sends an enquiry", async ({ page }) => {
  const suffix = uniqueSuffix();
  await page.goto("/admissions#enquiry");

  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByText("Tell us your name.")).toBeVisible();
  await expect(page.getByText("Tell us your child's name.")).toBeVisible();
  await expect(page).toHaveURL(/\/admissions/);

  await page.getByLabel("Your name").fill(`Smoke Parent ${suffix}`);
  await page.getByLabel("Your child's name").fill("Smoke Child");
  await page.getByLabel("Email address").fill(`smoke.${suffix}@example.com`);
  await page.getByLabel("Phone number").fill("082 555 0199");
  await page.getByLabel("Child's date of birth").fill("2022-05-10");
  await page
    .getByLabel("Preferred branch")
    .selectOption({ label: "Randburg (Ferndale)" });
  await page
    .getByLabel(/Programme/)
    .selectOption({ label: "Little Explorers, 18 months to 3 years" });
  await page.getByLabel(/Preferred start/).fill("2027-01");
  await page
    .getByLabel("What would you like us to know?")
    .fill(
      "This is an automated smoke test enquiry. It checks the full public form, the timing guard and the thank you page.",
    );
  await page.getByLabel(/I agree that Khanya Nature School/).check();

  // The API rejects forms completed in under three seconds. A parent reading the
  // form will always take longer than this; the test pauses to match.
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page).toHaveURL(/\/enquiry\/thank-you\?reference=ENQ-/);
  await expect(
    page.getByRole("heading", { name: /Thank you. We have it./ }),
  ).toBeVisible();
  await expect(page.getByText(/ENQ-\d{4}-\d{4}/)).toBeVisible();
});
