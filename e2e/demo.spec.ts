import { expect, test } from "@playwright/test";

test("demo loads and switches schemas", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Form Schema Runtime" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Customer onboarding" })).toBeVisible();
  await expect(page.getByRole("link", { name: "API docs" })).toHaveAttribute("href", /api\/$/);

  await page.getByLabel("Example schema").selectOption("enterprise-access-request");

  await expect(page.getByRole("heading", { name: "Enterprise access request" })).toBeVisible();
  await expect(page.getByText('"id": "enterprise-access-request"')).toBeVisible();
});

test("payment form validates custom money and invoice fields", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Example schema").selectOption("payment-details");

  await page.getByLabel("Amount").fill("0");
  await page.getByRole("button", { name: "Save payment details" }).click();

  await expect(page.locator("#fsr-payment-details-amount-error")).toHaveText("Amount must be at least 1.");
  await expect(page.getByLabel("Purchase order *")).toHaveAttribute("aria-invalid", "true");
});

test("state panel updates after field changes", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("First name *").fill("Ada");

  await expect(page.getByText('"firstName": "Ada"')).toBeVisible();
  await expect(page.getByText('"dirtyFields": [')).toBeVisible();
});

test("required validation, error summary focus, and conditional fields work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create customer" }).click();

  await expect(page.getByRole("alert").first()).toContainText("There is a problem with this form");
  await expect(page.getByLabel("First name *")).toHaveAttribute("aria-invalid", "true");

  await page.getByRole("link", { name: /First name:/ }).click();
  await expect(page.getByLabel("First name *")).toBeFocused();

  await page.getByLabel("Account type *").selectOption("enterprise");
  await expect(page.getByLabel("Company name *")).toBeVisible();
});

test("reset and dark mode update the demo", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("First name *").fill("Ada");
  await expect(page.getByText("Unsaved changes")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByLabel("First name *")).toHaveValue("");

  await page.getByLabel("Dark mode").check();
  await expect(page.locator("body")).toHaveClass(/demo-dark/);
});

test("basic keyboard navigation reaches native controls", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "GitHub" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "API docs" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Custom validators" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Custom renderers" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Example schema")).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Dark mode")).toBeFocused();
});
