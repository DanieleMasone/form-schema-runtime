import type { FieldValue, FormValues, VisibilityCondition, VisibilityRule } from "../schema/types";

function hasValue(value: FieldValue): boolean {
  return value !== undefined && value !== null && value !== "";
}

function evaluateSingleCondition(condition: VisibilityCondition, values: FormValues): boolean {
  const actualValue = values[condition.field];

  if (condition.equals !== undefined && actualValue !== condition.equals) {
    return false;
  }

  if (condition.notEquals !== undefined && actualValue === condition.notEquals) {
    return false;
  }

  if (condition.includes !== undefined) {
    if (Array.isArray(actualValue)) {
      return actualValue.includes(condition.includes);
    }

    if (typeof actualValue === "string") {
      return actualValue.includes(String(condition.includes));
    }

    return false;
  }

  if (condition.exists !== undefined) {
    return condition.exists ? hasValue(actualValue) : !hasValue(actualValue);
  }

  return true;
}

export function evaluateCondition(rule: VisibilityRule | undefined, values: FormValues): boolean {
  if (!rule) {
    return true;
  }

  if (Array.isArray(rule)) {
    return rule.every((condition) => evaluateSingleCondition(condition, values));
  }

  return evaluateSingleCondition(rule, values);
}
