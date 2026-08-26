import { expect, type Page, test } from "@playwright/test";

const supportedViewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
] as const;

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

async function expectLocalOverflowContained(page: Page, selector: string): Promise<void> {
  const measurements = await page.locator(selector).evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return {
        left: bounds.left,
        right: bounds.right,
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        overflowX: styles.overflowX
      };
    })
  );

  expect(measurements.length).toBeGreaterThan(0);
  measurements.forEach((measurement) => {
    expect(measurement.left).toBeGreaterThanOrEqual(-1);
    expect(measurement.right).toBeLessThanOrEqual(measurement.viewportWidth + 1);

    if (measurement.scrollWidth > measurement.clientWidth + 1) {
      expect(["auto", "scroll"]).toContain(measurement.overflowX);
    }
  });
}

async function expectPrimaryTargets(page: Page, selector: string): Promise<void> {
  const sizes = await page.locator(selector).evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    })
  );

  expect(sizes.length).toBeGreaterThan(0);
  sizes.forEach(({ width, height }) => {
    expect(width).toBeGreaterThanOrEqual(24);
    expect(height).toBeGreaterThanOrEqual(24);
  });
}

async function exerciseFrameworkExample(page: Page, route: string, frameworkName: string): Promise<void> {
  await page.goto(route);

  await expect(page.getByRole("heading", { name: `Form Schema Runtime in ${frameworkName}` })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enterprise access request" })).toBeVisible();
  await expect(page.locator(".department-picker")).toBeVisible();
  await expect(page.getByLabel("Privileged access justification *")).toBeHidden();

  const navigation = page.getByRole("navigation", { name: "Project and framework examples" });
  await expect(navigation.getByRole("link", { name: frameworkName, exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );

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

test("demo presents installation, product navigation, and schema switching", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Form Schema Runtime | Interactive Demo");
  await expect(page.getByRole("heading", { name: "Form Schema Runtime", exact: true })).toBeVisible();
  await expect(page.getByText("npm install form-schema-runtime", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "npm v1.0.1" })).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/form-schema-runtime"
  );

  const projectNavigation = page.getByRole("navigation", { name: "Project" });
  await expect(projectNavigation.getByRole("link", { name: "Demo", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(projectNavigation.getByRole("link", { name: "Docs", exact: true })).toHaveAttribute("href", "docs/");
  await expect(projectNavigation.getByRole("link", { name: "API", exact: true })).toHaveAttribute("href", "api/");
  await expect(projectNavigation.getByRole("link", { name: "Examples", exact: true })).toHaveAttribute(
    "href",
    "#framework-examples"
  );

  await expect(page.getByRole("heading", { name: "Customer onboarding" })).toBeVisible();
  await expect(page.getByText("Active schema", { exact: true })).toBeVisible();

  await page.getByLabel("Example schema").selectOption("enterprise-access-request");
  await expect(page.getByRole("heading", { name: "Enterprise access request" })).toBeVisible();
  await expect(page.getByText('"id": "enterprise-access-request"')).toBeVisible();

  await page.getByLabel("Example schema").selectOption("payment-details");
  await expect(page.getByRole("heading", { name: "Payment details" })).toBeVisible();
  await expect(page.getByText('"type": "money"')).toBeVisible();
});

test("primary and supporting navigation reaches every public product area", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/");

  await page.getByRole("navigation", { name: "Project" }).getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page).toHaveURL(/docs\/$/);
  await expect(page.getByRole("heading", { name: "Documentation", level: 1 })).toBeVisible();

  await page.goto("/");
  const examples = page.getByRole("navigation", { name: "Framework examples" });
  await expect(examples.getByRole("link", { name: "React" })).toHaveAttribute("href", "examples/react/");
  await expect(examples.getByRole("link", { name: "Vue" })).toHaveAttribute("href", "examples/vue/");
  await expect(examples.getByRole("link", { name: "Angular" })).toHaveAttribute("href", "examples/angular/");

  const projectResources = page.getByRole("navigation", { name: "Repository" });
  await expect(projectResources.getByRole("link", { name: "API reference" })).toHaveAttribute("href", "api/");
  await expect(projectResources.getByRole("link", { name: "Coverage report" })).toHaveAttribute("href", "coverage/");
  expect(consoleErrors).toEqual([]);
});

test("documentation routes expose useful navigation and mobile reading controls", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  const docs = [
    ["docs/usage-guide/", "Usage Guide", "Usage Guide"],
    ["docs/schema-reference/", "Schema Reference", "Schema Reference"],
    ["docs/validation-guide/", "Validation Guide", "Validation Guide"],
    ["docs/customization-guide/", "Customization Guide", "Customization Guide"],
    ["docs/accessibility-guide/", "Accessibility Guide", "Accessibility Guide"],
    ["docs/integration-guide/", "Integration Guide", "Integration Guide"],
    ["docs/real-world-examples/", "Real-World Examples", "Real-World Examples"],
    ["docs/feature-matrix/", "Feature Verification Matrix", "Feature Matrix"],
    ["docs/market-positioning/", "Market Positioning", "Market Positioning"],
    ["docs/release-process/", "Release Process", "Release Process"]
  ] as const;

  await page.goto("docs/");
  await expect(page.getByRole("heading", { name: "Documentation", level: 1 })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Guides and references/);

  for (const [route, heading, navigationLabel] of docs) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route}$`));
    await expect(
      page.getByRole("navigation", { name: "Documentation" }).getByRole("link", { name: navigationLabel, exact: true })
    ).toHaveAttribute("aria-current", "page");
    await expectNoHorizontalOverflow(page);
  }

  await page.goto("docs/adr/0001-framework-agnostic-typescript-core/");
  await expect(page.getByRole("heading", { name: /ADR 0001/, level: 1 })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("docs/usage-guide/");
  const docsMenu = page.locator("details.docs-navigation");
  const toc = page.locator("details.docs-toc");
  await expect(docsMenu).not.toHaveAttribute("open", "");
  await expect(toc).not.toHaveAttribute("open", "");
  await docsMenu.getByText("Documentation pages", { exact: true }).click();
  await expect(docsMenu).toHaveAttribute("open", "");
  await expect(docsMenu.getByRole("link", { name: "Usage Guide" })).toHaveAttribute("aria-current", "page");
  await toc.getByText("On this page", { exact: true }).click();
  await expect(toc.getByRole("link", { name: "Installation", exact: true })).toBeVisible();
  await expectLocalOverflowContained(page, ".docs-code");

  await page.goto("docs/feature-matrix/");
  await expectLocalOverflowContained(page, ".docs-table-wrap");
  expect(consoleErrors).toEqual([]);
});

test("generated API docs and coverage work at every supported viewport", async ({ page }) => {
  test.setTimeout(90_000);
  const consoleErrors = collectConsoleErrors(page);
  const routes = [
    { route: "api/", heading: /form-schema-runtime - v1\.0\.1/ },
    { route: "coverage/", heading: "All files" }
  ] as const;

  for (const viewport of supportedViewports) {
    await page.setViewportSize(viewport);

    for (const { route, heading } of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      if (route === "coverage/" && viewport.width <= 900) {
        await expectLocalOverflowContained(page, "table.coverage-summary");
      }
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("framework examples exercise lifecycle integration and runtime extension points", async ({ page }) => {
  test.setTimeout(90_000);
  const consoleErrors = collectConsoleErrors(page);

  await exerciseFrameworkExample(page, "examples/react/", "React");
  await exerciseFrameworkExample(page, "examples/vue/", "Vue");
  await exerciseFrameworkExample(page, "examples/angular/", "Angular");

  expect(consoleErrors).toEqual([]);
});

test("root, docs, and all framework examples remain responsive across required viewports", async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors = collectConsoleErrors(page);
  const examples = [
    ["examples/react/", "React"],
    ["examples/vue/", "Vue"],
    ["examples/angular/", "Angular"]
  ] as const;

  for (const viewport of supportedViewports) {
    await page.setViewportSize(viewport);

    await page.goto("/");
    await expect(page.getByLabel("Example schema")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Values" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectPrimaryTargets(page, ".demo-project-nav a, .demo-toolbar select, .demo-switch, .demo-inspector-tab");

    await page.goto("docs/usage-guide/");
    await expectNoHorizontalOverflow(page);
    await expectLocalOverflowContained(page, ".docs-code");

    await page.goto("docs/feature-matrix/");
    await expectNoHorizontalOverflow(page);
    await expectLocalOverflowContained(page, ".docs-table-wrap");

    for (const [route, frameworkName] of examples) {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: `Form Schema Runtime in ${frameworkName}` })).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit request" })).toBeVisible();
      await expect(page.locator(".department-picker")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectPrimaryTargets(page, ".example-nav a, .fsr-actions button, .department-option");
    }
  }

  expect(consoleErrors).toEqual([]);
});

test("payment form validates custom money and invoice fields", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Example schema").selectOption("payment-details");

  await expect(page.getByLabel("Mock payment token")).toHaveAttribute("type", "password");
  await page.getByLabel("Amount").fill("0");
  await page.getByRole("button", { name: "Save payment details" }).click();

  await expect(page.locator("#fsr-payment-details-amount-error")).toHaveText("Amount must be at least 1.");
  await expect(page.getByLabel("Purchase order *")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("tab", { name: "Errors" })).toHaveAttribute("aria-selected", "true");
});

test("live inspector updates and supports keyboard tab selection", async ({ page }) => {
  await page.goto("/");
  const inspector = page.getByRole("tabpanel");

  await page.getByLabel("First name *").fill("Ada");
  await expect(inspector).toContainText('"firstName": "Ada"');

  const valuesTab = page.getByRole("tab", { name: "Values" });
  await valuesTab.focus();
  await valuesTab.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "State" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "State" })).toHaveAttribute("aria-selected", "true");
  await expect(inspector).toContainText('"dirtyFields": [');
});

test("required validation, error summary focus, and conditional fields work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create customer" }).click();

  await expect(page.getByRole("alert").first()).toContainText("There is a problem with this form");
  await expect(page.getByLabel("First name *")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("tab", { name: "Errors" })).toHaveAttribute("aria-selected", "true");

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
  await page.getByRole("tab", { name: "Errors" }).click();
  await expect(page.getByRole("tabpanel")).toHaveText("{}");

  await page.getByLabel("Dark mode").check();
  await expect(page.locator("body")).toHaveClass(/demo-dark/);
});

test("keyboard navigation exposes skip, controls, and inspector focus", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to interactive demo" });
  await expect(skipLink).toBeFocused();
  const outlineStyle = await skipLink.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(page.getByLabel("Example schema")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Dark mode")).toBeFocused();
});

test("mobile demo keeps the form first and collapses schema diagnostics", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const formPanel = page.getByRole("heading", { name: "Live form" });
  const inspector = page.getByRole("heading", { name: "Live inspector" });
  const schemaDetails = page.locator("details.demo-schema-inspector");
  const formTop = await formPanel.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  const inspectorTop = await inspector.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);

  expect(formTop).toBeLessThan(inspectorTop);
  await expect(schemaDetails).not.toHaveAttribute("open", "");
  await page.getByLabel("First name *").fill("Ada");
  await expect(page.getByRole("tabpanel")).toContainText('"firstName": "Ada"');
  await expectNoHorizontalOverflow(page);
});
