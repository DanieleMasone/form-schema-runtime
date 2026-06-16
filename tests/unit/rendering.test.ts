import { describe, expect, it } from "vitest";
import { createForm } from "../../src";
import type { FormSchema } from "../../src";

describe("createForm rendering", () => {
  const schema: FormSchema = {
    id: "access-form",
    title: "Access form",
    fields: [
      {
        type: "email",
        name: "email",
        label: "Email",
        required: true,
        helpText: "Use a work email address."
      },
      {
        type: "select",
        name: "accountType",
        label: "Account type",
        options: [
          { label: "Consumer", value: "consumer" },
          { label: "Enterprise", value: "enterprise" }
        ]
      },
      {
        type: "text",
        name: "companyName",
        label: "Company name",
        required: true,
        visibleWhen: {
          field: "accountType",
          equals: "enterprise"
        }
      }
    ]
  };

  it("associates labels, help text, error text, and aria state", () => {
    const container = document.createElement("div");
    const form = createForm({ container, schema });
    const emailInput = container.querySelector<HTMLInputElement>("#fsr-access-form-email");
    const emailLabel = container.querySelector<HTMLLabelElement>('label[for="fsr-access-form-email"]');

    expect(emailInput).not.toBeNull();
    expect(emailLabel?.textContent).toContain("Email");
    expect(emailInput?.getAttribute("aria-describedby")).toBe("fsr-access-form-email-help");
    expect(container.querySelector("#fsr-access-form-email-help")).not.toBeNull();

    expect(form.validate()).toBe(false);

    const invalidEmailInput = container.querySelector<HTMLInputElement>("#fsr-access-form-email");
    expect(invalidEmailInput?.getAttribute("aria-invalid")).toBe("true");
    expect(invalidEmailInput?.getAttribute("aria-describedby")).toContain("fsr-access-form-email-error");
    expect(container.querySelector("#fsr-access-form-email-error")?.textContent).toBe("Email is required.");

    form.destroy();
    expect(container.childElementCount).toBe(0);
  });

  it("updates conditional field visibility", () => {
    const container = document.createElement("div");
    const form = createForm({ container, schema });
    const select = container.querySelector<HTMLSelectElement>("#fsr-access-form-accounttype");

    expect(container.querySelector("#fsr-access-form-companyname")).toBeNull();
    expect(select).not.toBeNull();

    select!.value = "enterprise";
    select!.dispatchEvent(new Event("change", { bubbles: true }));

    expect(container.querySelector("#fsr-access-form-companyname")).not.toBeNull();
    form.destroy();
  });

  it("links the error summary to invalid fields and focuses the control", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const form = createForm({ container, schema });

    form.validate();
    const link = container.querySelector<HTMLAnchorElement>(".fsr-error-summary a");

    expect(link?.textContent).toContain("Email");
    link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(document.activeElement?.id).toBe("fsr-access-form-email");

    form.destroy();
    container.remove();
  });
});
