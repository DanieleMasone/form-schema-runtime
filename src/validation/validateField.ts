import type {
  CustomValidatorMap,
  FieldValue,
  FormValues,
  NormalizedField,
  NormalizedFormSchema
} from "../schema/types";
import { runBuiltInValidators } from "./validators";

export function validateField(
  field: NormalizedField,
  value: FieldValue,
  values: FormValues,
  schema: NormalizedFormSchema,
  validators: CustomValidatorMap = {}
): string[] {
  const builtInErrors = runBuiltInValidators(field, value);
  // Custom validators are synchronous and named explicitly to keep schema data non-executable.
  const customErrors =
    field.validators?.flatMap((validatorName) => {
      const validator = validators[validatorName];

      if (!validator) {
        return [`Validator "${validatorName}" is not registered.`];
      }

      const result = validator(value, {
        fieldName: field.name,
        values,
        schema
      });

      return result ? [result] : [];
    }) ?? [];

  return [...builtInErrors, ...customErrors];
}
