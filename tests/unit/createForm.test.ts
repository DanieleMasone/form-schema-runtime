import { describe, expect, it, vi } from "vitest";
import { createForm } from "../../src";
import type { FieldRenderer, FormSchema } from "../../src";

function input(container: HTMLElement, id: string): HTMLInputElement {
  const element = container.querySelector<HTMLInputElement>(id);
  expect(element).not.toBeNull();
  return element!;
}

function select(container: HTMLElement, id: string): HTMLSelectElement {
  const element = container.querySelector<HTMLSelectElement>(id);
  expect(element).not.toBeNull();
  return element!;
}

describe("createForm public API", () => {
  const schema: FormSchema = {
    id: "public-api",
    title: "Public API",
    fields: [
      {
        type: "text",
        name: "name",
        label: "Name",
        required: true,
        defaultValue: "Ada",
        minLength: 2
      },
      {
        type: "email",
        name: "email",
        label: "Email",
        required: true
      },
      {
        type: "checkbox",
        name: "accepted",
        label: "Accepted",
        required: true
      },
      {
        type: "select",
        name: "accountType",
        label: "Account type",
        defaultValue: "personal",
        options: [
          { label: "Personal", value: "personal" },
          { label: "Enterprise", value: "enterprise" }
        ]
      },
      {
        type: "text",
        name: "company",
        label: "Company",
        required: true,
        visibleWhen: { field: "accountType", equals: "enterprise" }
      }
    ]
  };

  it("initializes values from defaults and caller overrides", () => {
    const container = document.createElement("div");
    const form = createForm({
      container,
      schema,
      initialValues: {
        name: "Grace",
        unknown: "ignored"
      }
    });

    expect(form.getValues()).toEqual({
      name: "Grace",
      email: "",
      accepted: false,
      accountType: "personal",
      company: ""
    });

    const values = form.getValues();
    values.name = "mutated outside";

    expect(form.getValues().name).toBe("Grace");
    form.destroy();
  });

  it("submits valid values and passes current state to callbacks", () => {
    const container = document.createElement("div");
    const onSubmit = vi.fn();
    const form = createForm({ container, schema, onSubmit });

    input(container, "#fsr-public-api-name").value = "Grace";
    input(container, "#fsr-public-api-name").dispatchEvent(new Event("input", { bubbles: true }));
    input(container, "#fsr-public-api-email").value = "grace@example.com";
    input(container, "#fsr-public-api-email").dispatchEvent(new Event("input", { bubbles: true }));
    input(container, "#fsr-public-api-accepted").checked = true;
    input(container, "#fsr-public-api-accepted").dispatchEvent(new Event("input", { bubbles: true }));

    container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Grace",
        email: "grace@example.com",
        accepted: true
      }),
      expect.objectContaining({
        isValid: true,
        dirtyFields: expect.arrayContaining(["name", "email", "accepted"])
      })
    );
    form.destroy();
  });

  it("notifies validation errors and focuses the error summary on invalid submit", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const onValidationError = vi.fn();
    const form = createForm({ container, schema, onValidationError });

    container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(onValidationError).toHaveBeenCalledWith(
      expect.objectContaining({
        email: ["Email is required."],
        accepted: ["Accepted is required."]
      }),
      expect.objectContaining({ isValid: false })
    );
    expect(document.activeElement).toBe(container.querySelector(".fsr-error-summary"));

    form.destroy();
    container.remove();
  });

  it("setValues updates known fields, re-renders conditions, and fires onChange", () => {
    const container = document.createElement("div");
    const onChange = vi.fn();
    const form = createForm({ container, schema, onChange });

    form.setValues({
      email: "ops@example.com",
      accountType: "enterprise",
      company: "Example Ltd",
      missing: "ignored"
    });

    expect(form.getValues()).toMatchObject({
      email: "ops@example.com",
      accountType: "enterprise",
      company: "Example Ltd"
    });
    expect(container.querySelector("#fsr-public-api-company")).not.toBeNull();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ company: "Example Ltd" }),
      expect.objectContaining({
        dirtyFields: expect.arrayContaining(["email", "accountType", "company"]),
        visibleFields: expect.arrayContaining(["company"])
      })
    );
    form.destroy();
  });

  it("reset restores initial state and calls onReset", () => {
    const container = document.createElement("div");
    const onReset = vi.fn();
    const form = createForm({
      container,
      schema,
      initialValues: { name: "Initial", accepted: true },
      onReset
    });

    form.setValues({ name: "Changed", accepted: false });
    expect(form.validate()).toBe(false);

    container.querySelector("form")?.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));

    expect(form.getValues()).toMatchObject({ name: "Initial", accepted: true });
    expect(container.querySelector(".fsr-error-summary")).toBeNull();
    expect(onReset).toHaveBeenCalledWith(
      expect.objectContaining({
        dirtyFields: [],
        touchedFields: [],
        errors: {},
        isValid: true
      })
    );
    form.destroy();
  });

  it("does not validate hidden conditional fields until they reappear", () => {
    const container = document.createElement("div");
    const form = createForm({ container, schema });

    form.setValues({
      name: "Ada",
      email: "ada@example.com",
      accepted: true,
      accountType: "personal"
    });

    expect(form.validate()).toBe(true);
    expect(container.querySelector("#fsr-public-api-company")).toBeNull();

    select(container, "#fsr-public-api-accounttype").value = "enterprise";
    select(container, "#fsr-public-api-accounttype").dispatchEvent(new Event("change", { bubbles: true }));

    expect(form.validate()).toBe(false);
    expect(container.querySelector("#fsr-public-api-company-error")?.textContent).toBe("Company is required.");
    form.destroy();
  });

  it("integrates custom renderers with state, validation, and listener cleanup", () => {
    const container = document.createElement("div");
    const onChange = vi.fn();
    const meterRenderer: FieldRenderer = (context) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${context.classPrefix}-control`;
      button.id = context.inputId;
      button.textContent = `Meter ${String(context.value ?? 0)}`;
      button.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");
      if (context.describedBy) {
        button.setAttribute("aria-describedby", context.describedBy);
      }
      context.events.listen(button, "click", () => context.setValue(10));
      return button;
    };

    const form = createForm({
      container,
      schema: {
        id: "custom-renderer",
        fields: [{ type: "meter", name: "score", label: "Score", validators: ["positive"] }]
      },
      renderers: { meter: meterRenderer },
      validators: {
        positive(value) {
          return Number(value) > 0 ? null : "Score must be positive.";
        }
      },
      onChange
    });

    expect(form.validate()).toBe(false);
    const button = container.querySelector<HTMLButtonElement>("#fsr-custom-renderer-score");
    expect(button?.getAttribute("aria-invalid")).toBe("true");

    button?.click();

    expect(form.getValues().score).toBe(10);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ score: 10 }),
      expect.objectContaining({ isValid: true })
    );

    form.destroy();
    button?.click();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("throws after destroy when public methods are reused", () => {
    const container = document.createElement("div");
    const form = createForm({ container, schema });

    form.destroy();
    form.destroy();

    expect(() => form.getValues()).toThrow("Cannot use a form instance after destroy()");
    expect(() => form.setValues({ name: "Ada" })).toThrow("Cannot use a form instance after destroy()");
    expect(() => form.validate()).toThrow("Cannot use a form instance after destroy()");
    expect(() => form.reset()).toThrow("Cannot use a form instance after destroy()");
  });

  it("renders suspicious option text and validation messages as text", () => {
    const container = document.createElement("div");
    const form = createForm({
      container,
      schema: {
        id: "safe-options",
        fields: [
          {
            type: "select",
            name: "choice",
            label: "Choice",
            required: true,
            options: [{ label: "<img src=x onerror=alert(1)>", value: "x" }],
            validationMessages: {
              required: "<script>alert(1)</script>"
            }
          }
        ]
      }
    });

    form.validate();

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("option")?.textContent).toBe("Select an option");
    expect(container.querySelectorAll("option")[1]?.textContent).toBe("<img src=x onerror=alert(1)>");
    expect(container.querySelector(".fsr-error")?.textContent).toBe("<script>alert(1)</script>");
    form.destroy();
  });
});
