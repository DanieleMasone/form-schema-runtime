import { expect, test } from "@playwright/test";

test("demo loads and switches schemas", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Form Schema Runtime" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Customer onboarding" })).toBeVisible();
  await expect(page.getByRole("link", { name: "API docs" })).toHaveAttribute("href", /api\/$/);
  await expect(page.getByRole("link", { name: "Coverage" })).toHaveAttribute("href", /coverage\/$/);
  await expect(page.getByRole("heading", { name: "Active schema" })).toBeVisible();

  await page.getByLabel("Example schema").selectOption("enterprise-access-request");

  await expect(page.getByRole("heading", { name: "Enterprise access request" })).toBeVisible();
  await expect(page.getByText('"id": "enterprise-access-request"')).toBeVisible();

  await page.getByLabel("Example schema").selectOption("payment-details");

  await expect(page.getByRole("heading", { name: "Payment details" })).toBeVisible();
  await expect(page.getByText('"type": "money"')).toBeVisible();

  await page.getByLabel("Example schema").selectOption("customer-onboarding");

  await expect(page.getByRole("heading", { name: "Customer onboarding" })).toBeVisible();
  await expect(page.getByText('"id": "customer-onboarding"')).toBeVisible();
});

test("payment form validates custom money and invoice fields", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Example schema").selectOption("payment-details");

  await expect(page.getByLabel("Mock payment token")).toHaveAttribute("type", "password");

  await page.getByLabel("Amount").fill("0");
  await page.getByRole("button", { name: "Save payment details" }).click();

  await expect(page.locator("#fsr-payment-details-amount-error")).toHaveText("Amount must be at least 1.");
  await expect(page.getByLabel("Purchase order *")).toHaveAttribute("aria-invalid", "true");
});

test("state panel updates after field changes", async ({ page }) => {
  await page.goto("/");
  const statePanel = page.locator(".demo-code-block").filter({
    has: page.getByRole("heading", { name: "Form state" })
  });

  await page.getByLabel("First name *").fill("Ada");
  await page.keyboard.press("Tab");

  await expect(page.getByText('"firstName": "Ada"')).toBeVisible();
  await expect(statePanel).toContainText('"dirtyFields": [');
  await expect(statePanel).toContainText('"touchedFields": [');
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

test("enterprise access request exercises readonly, disabled, and conditional fields", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Example schema").selectOption("enterprise-access-request");

  await expect(page.getByLabel("Source system")).toHaveAttribute("readonly", "");
  await expect(page.getByLabel("Access window")).toBeDisabled();
  await expect(page.getByLabel("Administrator access justification *")).toBeHidden();

  await page.getByRole("radio", { name: "Administrator" }).check();

  await expect(page.getByLabel("Administrator access justification *")).toBeVisible();

  await page.getByRole("button", { name: "Submit request" }).click();

  await expect(page.getByRole("alert").first()).toContainText("There is a problem with this form");
  await expect(page.getByLabel("Administrator access justification *")).toHaveAttribute("aria-invalid", "true");
});

test("reset and dark mode update the demo", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Create customer" }).click();
  await expect(page.getByText("There is a problem with this form")).toBeVisible();

  await page.getByLabel("First name *").fill("Ada");
  await expect(page.getByText("Unsaved changes")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();

  await expect(page.getByLabel("First name *")).toHaveValue("");
  await expect(page.getByText("There is a problem with this form")).toBeHidden();
  await expect(page.locator(".demo-code-block").filter({ hasText: "Validation errors" })).toContainText("{}");

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
  await expect(page.getByRole("link", { name: "Coverage" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Custom validators" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Custom renderers" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Example schema")).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Dark mode")).toBeFocused();
});

test("desktop viewport keeps demo panels readable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Rendered form" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Active schema" })).toBeVisible();
  await expect(page.getByRole("link", { name: "API docs" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Coverage" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("mobile viewport keeps controls usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Form Schema Runtime" })).toBeVisible();
  await expect(page.getByLabel("Example schema")).toBeVisible();
  await expect(page.getByLabel("Dark mode")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rendered form" })).toBeVisible();

  await page.getByLabel("First name *").fill("Ada");
  await expect(page.getByText('"firstName": "Ada"')).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(hasHorizontalOverflow).toBe(false);
});
