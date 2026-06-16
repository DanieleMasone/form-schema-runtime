import { describe, expect, it } from "vitest";
import type { FormSchema } from "../../src";
import { normalizeSchema } from "../../src/schema/normalizeSchema";
import { validateField } from "../../src/validation/validateField";
import { validateForm } from "../../src/validation/validateForm";

describe("validation", () => {
  const schema: FormSchema = {
    id: "validation",
    fields: [
      {
        type: "email",
        name: "email",
        label: "Email",
        required: true
      },
      {
        type: "number",
        name: "quantity",
        label: "Quantity",
        min: 1,
        max: 5
      },
      {
        type: "text",
        name: "taxCode",
        label: "Tax code",
        validators: ["taxCode"],
        minLength: 4,
        pattern: "^[A-Z0-9]+$"
      },
      {
        type: "text",
        name: "shortCode",
        label: "Short code",
        maxLength: 3
      }
    ]
  };

  it("runs built-in validators", () => {
    const normalized = normalizeSchema(schema);
    const emailField = normalized.fieldMap.get("email");
    const quantityField = normalized.fieldMap.get("quantity");
    const shortCodeField = normalized.fieldMap.get("shortCode");

    expect(emailField).toBeDefined();
    expect(quantityField).toBeDefined();
    expect(shortCodeField).toBeDefined();
    expect(validateField(emailField!, "", {}, normalized)).toEqual(["Email is required."]);
    expect(validateField(emailField!, "not-an-email", {}, normalized)).toEqual([
      "Email must be a valid email address."
    ]);
    expect(validateField(quantityField!, 0, { quantity: 0 }, normalized)).toEqual([
      "Quantity must be at least 1."
    ]);
    expect(validateField(quantityField!, 6, { quantity: 6 }, normalized)).toEqual([
      "Quantity must be no more than 5."
    ]);
    expect(validateField(shortCodeField!, "ABCD", { shortCode: "ABCD" }, normalized)).toEqual([
      "Short code must be no more than 3 characters."
    ]);
  });

  it("runs custom synchronous validators with context", () => {
    const normalized = normalizeSchema(schema);
    const result = validateForm(
      normalized,
      {
        email: "user@example.com",
        quantity: 3,
        taxCode: "ABCD"
      },
      {
        taxCode(value, context) {
          expect(context.fieldName).toBe("taxCode");
          return String(value).length === 16 ? null : "Tax code must contain 16 characters.";
        }
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors.taxCode).toEqual(["Tax code must contain 16 characters."]);
  });

  it("validates only visible fields when supplied", () => {
    const normalized = normalizeSchema(schema);
    const result = validateForm(normalized, { email: "", quantity: 1, taxCode: "" }, {}, ["quantity"]);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns multiple errors for one field when multiple rules fail", () => {
    const normalized = normalizeSchema(schema);
    const result = validateForm(
      normalized,
      { email: "user@example.com", quantity: 3, taxCode: "a" },
      {
        taxCode() {
          return "Custom validator failed.";
        }
      }
    );

    expect(result.errors.taxCode).toEqual([
      "Tax code must be at least 4 characters.",
      "Tax code has an invalid format.",
      "Custom validator failed."
    ]);
  });
});
