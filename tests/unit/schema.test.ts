import { describe, expect, it } from "vitest";
import type { FormSchema } from "../../src";
import { getInitialValues, normalizeSchema } from "../../src/schema/normalizeSchema";

describe("normalizeSchema", () => {
  it("normalizes nested sections and initial values", () => {
    const schema: FormSchema = {
      id: "account",
      fields: [
        {
          type: "section",
          title: "Identity",
          fields: [
            {
              type: "text",
              name: "firstName",
              label: "First name",
              defaultValue: "Ada"
            },
            {
              type: "checkbox",
              name: "confirmed",
              label: "Confirmed"
            }
          ]
        }
      ]
    };

    const normalized = normalizeSchema(schema);

    expect(normalized.fieldOrder).toEqual(["firstName", "confirmed"]);
    expect(normalized.fieldMap.get("firstName")?.id).toBe("firstname");
    expect(getInitialValues(normalized)).toEqual({
      firstName: "Ada",
      confirmed: false
    });
  });

  it("rejects duplicate field names", () => {
    const schema: FormSchema = {
      id: "duplicate",
      fields: [
        { type: "text", name: "email", label: "Email" },
        { type: "email", name: "email", label: "Email again" }
      ]
    };

    expect(() => normalizeSchema(schema)).toThrow('Duplicate field name "email"');
  });

  it("rejects select and radio fields without usable options", () => {
    const withoutOptions: FormSchema = {
      id: "missing-options",
      fields: [{ type: "select", name: "department", label: "Department" }]
    };
    const duplicateOptions: FormSchema = {
      id: "duplicate-options",
      fields: [
        {
          type: "radio",
          name: "access",
          label: "Access",
          options: [
            { label: "Read", value: "read" },
            { label: "Read again", value: "read" }
          ]
        }
      ]
    };

    expect(() => normalizeSchema(withoutOptions)).toThrow("requires at least one option");
    expect(() => normalizeSchema(duplicateOptions)).toThrow('duplicate option value "read"');
  });
});
