import { expect, type Page, test } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(hasHorizontalOverflow).toBe(false);
}

async function exerciseFrameworkExample(page: Page, route: string, frameworkName: string): Promise<void> {
  await page.goto(route);

  await expect(page.getByRole("heading", { name: `Form Schema Runtime in ${frameworkName}` })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enterprise access request" })).toBeVisible();
  await expect(page.locator(".department-picker")).toBeVisible();
  await expect(page.getByLabel("Privileged access justification *")).toBeHidden();

  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page.getByLabel("Requester name *")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Requester name *").fill("Ada Lovelace");
  await page.getByLabel("Work email *").fill("ada@personal.test");
  await page.getByLabel("Access type *").selectOption("privileged");
  await expect(page.getByLabel("Privileged access justification *")).toBeVisible();

  await page.getByLabel("Access type *").selectOption("standard");
  await expect(page.getByLabel("Privileged access justification *")).toBeHidden();

  await page.getByLabel("Access type *").selectOption("privileged");
  await page.getByRole("radio", { name: "Operator" }).check();
  await page.getByRole("radio", { name: "Finance" }).check();
  await page.getByLabel("I understand privileged access requires administrator approval").check();
  await page
    .getByLabel("Privileged access justification *")
    .fill("Temporary production incident review for ticket INC-1042.");
  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page.locator(".fsr-error", { hasText: "Use your @example.com work email." })).toBeVisible();

  await page.getByLabel("Work email *").fill("ada@example.com");
  await page.getByRole("button", { name: "Submit request" }).click();

  await expect(page.getByText('"requesterName": "Ada Lovelace"')).toBeVisible();
  await expect(page.getByText('"department": "finance"')).toBeVisible();
  await expect(page.getByText('"visibleFields": [')).toBeVisible();
}

test("demo loads and switches schemas", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Form Schema Runtime" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Customer onboarding" })).toBeVisible();
  await expect(page.getByRole("link", { name: "API docs" })).toHaveAttribute("href", /api\/$/);
  await expect(page.getByRole("link", { name: "Coverage", exact: true })).toHaveAttribute("href", /coverage\/$/);
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

test("documentation links are visible and published in the Pages artifact", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Documentation" })).toBeVisible();
  const documentationLinks = page.getByLabel("Documentation links");

  const docs = [
    ["Documentation Index", /docs\/$/],
    ["Usage Guide", /docs\/usage-guide\/$/],
    ["Schema Reference", /docs\/schema-reference\/$/],
    ["Validation Guide", /docs\/validation-guide\/$/],
    ["Customization Guide", /docs\/customization-guide\/$/],
    ["Accessibility Guide", /docs\/accessibility-guide\/$/],
    ["Integration Guide", /docs\/integration-guide\/$/],
    ["Real-World Examples", /docs\/real-world-examples\/$/],
    ["Feature Matrix", /docs\/feature-matrix\/$/],
    ["Market Positioning", /docs\/market-positioning\/$/],
    ["Release Process", /docs\/release-process\/$/],
    ["API Documentation", /api\/$/],
    ["Coverage Report", /coverage\/$/],
    ["GitHub Repository", /^https:\/\/github\.com\/DanieleMasone\/form-schema-runtime$/]
  ] as const;

  for (const [name, href] of docs) {
    await expect(documentationLinks.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(documentationLinks.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }

  await expect(page.getByRole("heading", { name: "Framework examples" })).toBeVisible();
  const frameworkExampleLinks = page.getByLabel("Framework example links");

  const frameworkExamples = [
    ["React example", /examples\/react\/$/],
    ["Vue example", /examples\/vue\/$/],
    ["Angular example", /examples\/angular\/$/],
    ["Integration Guide", /docs\/integration-guide\/$/]
  ] as const;

  for (const [name, href] of frameworkExamples) {
    await expect(frameworkExampleLinks.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(frameworkExampleLinks.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }

  await page.goto("docs/");
  await expect(page.getByRole("heading", { name: "Documentation", level: 1 })).toBeVisible();
  await expect(page.getByLabel("Documentation", { exact: true }).getByRole("link", { name: "Usage Guide" })).toHaveAttribute(
    "href",
    /docs\/usage-guide\/$/
  );

  const htmlDocs = [
    ["docs/usage-guide/", "Usage Guide"],
    ["docs/schema-reference/", "Schema Reference"],
    ["docs/validation-guide/", "Validation Guide"],
    ["docs/customization-guide/", "Customization Guide"],
    ["docs/accessibility-guide/", "Accessibility Guide"],
    ["docs/integration-guide/", "Integration Guide"],
    ["docs/real-world-examples/", "Real-World Examples"],
    ["docs/feature-matrix/", "Feature Verification Matrix"],
    ["docs/market-positioning/", "Market Positioning"],
    ["docs/release-process/", "Release Process"]
  ] as const;

  for (const [route, heading] of htmlDocs) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.getByLabel("Documentation").getByRole("link", { name: "Usage Guide" })).toBeVisible();
  }

  await page.goto("docs/usage-guide/");
  await expect(page.locator("pre code").first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("docs/integration-guide/");
  await expect(page.getByRole("heading", { name: "Integration Guide", level: 1 })).toBeVisible();
  await expect(page.getByLabel("Project links").getByRole("link", { name: "Demo" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  expect(consoleErrors).toEqual([]);
});

test("generated API docs and coverage report load without horizontal overflow", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  const routes = [
    {
      route: "api/",
      heading: /form-schema-runtime - v\d+\.\d+\.\d+/
    },
    {
      route: "coverage/",
      heading: "All files"
    }
  ] as const;
  const viewports = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 }
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const { route, heading } of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("framework examples load from Pages routes and exercise integration features", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await exerciseFrameworkExample(page, "examples/react/", "React");
  await exerciseFrameworkExample(page, "examples/vue/", "Vue");
  await exerciseFrameworkExample(page, "examples/angular/", "Angular");

  expect(consoleErrors).toEqual([]);
});

test("framework examples are usable on desktop and mobile without horizontal overflow", async ({ page }) => {
  const examples = [
    ["examples/react/", "React"],
    ["examples/vue/", "Vue"],
    ["examples/angular/", "Angular"]
  ] as const;
  const viewports = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 }
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const [route, frameworkName] of examples) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: `Form Schema Runtime in ${frameworkName}` })).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit request" })).toBeVisible();
      await expect(page.locator(".department-picker")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  }
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
  await expect(page.getByRole("link", { name: "GitHub", exact: true })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "API docs" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Coverage", exact: true })).toBeFocused();

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
  await expect(page.getByRole("link", { name: "Coverage", exact: true })).toBeVisible();

  await expectNoHorizontalOverflow(page);
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

  await expectNoHorizontalOverflow(page);
});
