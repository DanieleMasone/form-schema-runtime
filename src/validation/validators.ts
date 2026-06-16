import type { FieldValue, NormalizedField, ValidationMessageKey } from "../schema/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(value: FieldValue): boolean {
  return value === undefined || value === null || value === "";
}

function message(field: NormalizedField, key: ValidationMessageKey, fallback: string): string {
  return field.validationMessages?.[key] ?? fallback;
}

export function validateRequired(field: NormalizedField, value: FieldValue): string | null {
  if (!field.required) {
    return null;
  }

  if (field.type === "checkbox") {
    return value === true ? null : message(field, "required", `${field.label} is required.`);
  }

  return isEmpty(value) ? message(field, "required", `${field.label} is required.`) : null;
}

export function validateStringLength(field: NormalizedField, value: FieldValue): string | null {
  if (isEmpty(value)) {
    return null;
  }

  const valueAsString = String(value);

  if (field.minLength !== undefined && valueAsString.length < field.minLength) {
    return message(
      field,
      "minLength",
      `${field.label} must be at least ${field.minLength} characters.`
    );
  }

  if (field.maxLength !== undefined && valueAsString.length > field.maxLength) {
    return message(
      field,
      "maxLength",
      `${field.label} must be no more than ${field.maxLength} characters.`
    );
  }

  return null;
}

export function validateNumberRange(field: NormalizedField, value: FieldValue): string | null {
  if (isEmpty(value) || field.type !== "number") {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return message(field, "number", `${field.label} must be a number.`);
  }

  if (field.min !== undefined && numberValue < field.min) {
    return message(field, "min", `${field.label} must be at least ${field.min}.`);
  }

  if (field.max !== undefined && numberValue > field.max) {
    return message(field, "max", `${field.label} must be no more than ${field.max}.`);
  }

  return null;
}

export function validatePattern(field: NormalizedField, value: FieldValue): string | null {
  if (isEmpty(value) || !field.pattern) {
    return null;
  }

  return new RegExp(field.pattern).test(String(value))
    ? null
    : message(field, "pattern", `${field.label} has an invalid format.`);
}

export function validateEmail(field: NormalizedField, value: FieldValue): string | null {
  if (isEmpty(value) || field.type !== "email") {
    return null;
  }

  return emailPattern.test(String(value))
    ? null
    : message(field, "email", `${field.label} must be a valid email address.`);
}

export function runBuiltInValidators(field: NormalizedField, value: FieldValue): string[] {
  const results = [
    validateRequired(field, value),
    validateStringLength(field, value),
    validateNumberRange(field, value),
    validatePattern(field, value),
    validateEmail(field, value)
  ];

  return results.filter((result): result is string => Boolean(result));
}
