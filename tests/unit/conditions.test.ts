import { describe, expect, it } from "vitest";
import { evaluateCondition } from "../../src/conditions/evaluateCondition";

describe("evaluateCondition", () => {
  it("supports equals, notEquals, includes, exists, and simple AND conditions", () => {
    const values = {
      accountType: "enterprise",
      country: "IT",
      notes: "priority customer",
      empty: ""
    };

    expect(evaluateCondition({ field: "accountType", equals: "enterprise" }, values)).toBe(true);
    expect(evaluateCondition({ field: "accountType", notEquals: "consumer" }, values)).toBe(true);
    expect(evaluateCondition({ field: "notes", includes: "priority" }, values)).toBe(true);
    expect(evaluateCondition({ field: "empty", exists: false }, values)).toBe(true);
    expect(
      evaluateCondition(
        [
          { field: "accountType", equals: "enterprise" },
          { field: "country", equals: "IT" }
        ],
        values
      )
    ).toBe(true);
  });
});
