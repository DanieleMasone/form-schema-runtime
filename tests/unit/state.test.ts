import { describe, expect, it } from "vitest";
import type { FormSchema } from "../../src";
import { normalizeSchema } from "../../src/schema/normalizeSchema";
import { createFormState } from "../../src/state/formState";

describe("formState", () => {
  const schema: FormSchema = {
    id: "state",
    fields: [
      { type: "text", name: "name", label: "Name" },
      { type: "checkbox", name: "accepted", label: "Accepted" }
    ]
  };

  it("tracks touched and dirty fields", () => {
    const state = createFormState(normalizeSchema(schema), { name: "Ada" });

    state.setValue("name", "Grace");
    state.markTouched("name");

    expect(state.getSnapshot().dirtyFields).toEqual(["name"]);
    expect(state.getSnapshot().touchedFields).toEqual(["name"]);
  });

  it("resets values, touched fields, dirty fields, and errors", () => {
    const state = createFormState(normalizeSchema(schema), { name: "Ada" });

    state.setValue("name", "Grace");
    state.markTouched("name");
    state.setErrors({ name: ["Name is required."] });
    state.reset();

    expect(state.getSnapshot()).toMatchObject({
      values: { name: "Ada", accepted: false },
      touchedFields: [],
      dirtyFields: [],
      errors: {},
      isValid: true
    });
  });

  it("setValues updates known fields and ignores unknown fields", () => {
    const state = createFormState(normalizeSchema(schema), { name: "Ada" });

    state.setValues({ name: "Grace", missing: "ignored", accepted: true });

    expect(state.getValues()).toEqual({ name: "Grace", accepted: true });
    expect(state.getSnapshot().dirtyFields).toEqual(["name", "accepted"]);
  });
});
