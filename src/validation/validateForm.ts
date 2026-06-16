import type {
  CustomValidatorMap,
  FieldErrors,
  FormValues,
  NormalizedFormSchema
} from "../schema/types";
import { validateField } from "./validateField";

export interface FormValidationResult {
  valid: boolean;
  errors: FieldErrors;
}

export function validateForm(
  schema: NormalizedFormSchema,
  values: FormValues,
  validators: CustomValidatorMap = {},
  visibleFields: string[] = schema.fieldOrder
): FormValidationResult {
  const visibleFieldSet = new Set(visibleFields);
  const errors: FieldErrors = {};

  schema.fieldOrder.forEach((fieldName) => {
    if (!visibleFieldSet.has(fieldName)) {
      return;
    }

    const field = schema.fieldMap.get(fieldName);

    if (!field) {
      return;
    }

    const fieldErrors = validateField(field, values[fieldName], values, schema, validators);

    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
