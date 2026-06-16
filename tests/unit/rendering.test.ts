import { describe, expect, it, vi } from "vitest";
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

  it("renders all built-in controls and sections", () => {
    const container = document.createElement("div");
    const form = createForm({
      container,
      schema: {
        id: "all-fields",
        fields: [
          {
            type: "section",
            title: "Credentials",
            fields: [
              { type: "text", name: "text", label: "Text" },
              { type: "email", name: "email", label: "Email" },
              { type: "number", name: "number", label: "Number" },
              { type: "password", name: "password", label: "Password" },
              { type: "textarea", name: "textarea", label: "Textarea" },
              {
                type: "select",
                name: "select",
                label: "Select",
                options: [{ label: "One", value: "one" }]
              },
              { type: "checkbox", name: "checkbox", label: "Checkbox" },
              {
                type: "radio",
                name: "radio",
                label: "Radio",
                options: [{ label: "Yes", value: "yes" }]
              }
            ]
          }
        ]
      }
    });

    expect(container.querySelector("fieldset .fsr-section-title")?.textContent).toBe("Credentials");
    expect(container.querySelectorAll(".fsr-field")).toHaveLength(8);
    expect(container.querySelector('input[type="password"]')).not.toBeNull();
    expect(container.querySelector("textarea")).not.toBeNull();
    expect(container.querySelector("[role='radiogroup']")).not.toBeNull();
    form.destroy();
  });

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

  it("applies a custom class prefix and renders schema text safely", () => {
    const container = document.createElement("div");
    const form = createForm({
      container,
      classPrefix: "acme",
      schema: {
        id: "safe-text",
        fields: [
          {
            type: "text",
            name: "name",
            label: "<img src=x onerror=alert(1)>",
            helpText: "<script>alert(1)</script>"
          }
        ]
      }
    });

    expect(container.querySelector(".acme-form")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector(".acme-label")?.textContent).toBe("<img src=x onerror=alert(1)>");
    expect(container.querySelector(".acme-help")?.textContent).toBe("<script>alert(1)</script>");
    form.destroy();
  });

  it("throws for unknown field types without a custom renderer", () => {
    const container = document.createElement("div");

    expect(() =>
      createForm({
        container,
        schema: {
          id: "unknown",
          fields: [{ type: "currency", name: "amount", label: "Amount" }]
        }
      })
    ).toThrow('No renderer registered for field type "currency"');
  });

  it("cleans event listeners on destroy", () => {
    const container = document.createElement("div");
    const onChange = vi.fn();
    const form = createForm({ container, schema, onChange });
    const input = container.querySelector<HTMLInputElement>("#fsr-access-form-email");

    expect(input).not.toBeNull();
    form.destroy();
    input!.value = "after-destroy@example.com";
    input!.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onChange).not.toHaveBeenCalled();
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
