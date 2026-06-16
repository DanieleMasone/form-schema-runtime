import type { FieldErrors, FormStateSnapshot, FormValues, NormalizedFormSchema } from "../schema/types";
import { getInitialValues } from "../schema/normalizeSchema";

function cloneValues(values: FormValues): FormValues {
  return { ...values };
}

function cloneErrors(errors: FieldErrors): FieldErrors {
  return Object.fromEntries(Object.entries(errors).map(([fieldName, messages]) => [fieldName, [...messages]]));
}

function areEqualValues(left: unknown, right: unknown): boolean {
  return left === right;
}

export interface FormState {
  getValues(): FormValues;
  getInitialValues(): FormValues;
  getSnapshot(visibleFields?: string[]): FormStateSnapshot;
  setValue(fieldName: string, value: FormValues[string]): void;
  setValues(values: FormValues): void;
  markTouched(fieldName: string): void;
  setErrors(errors: FieldErrors): void;
  reset(): void;
}

export function createFormState(schema: NormalizedFormSchema, initialValues: FormValues = {}): FormState {
  const initial = getInitialValues(schema, initialValues);
  let values = cloneValues(initial);
  const touchedFields = new Set<string>();
  const dirtyFields = new Set<string>();
  let errors: FieldErrors = {};

  function recomputeDirty(fieldName: string): void {
    if (areEqualValues(values[fieldName], initial[fieldName])) {
      dirtyFields.delete(fieldName);
    } else {
      dirtyFields.add(fieldName);
    }
  }

  return {
    getValues() {
      return cloneValues(values);
    },

    getInitialValues() {
      return cloneValues(initial);
    },

    getSnapshot(visibleFields: string[] = schema.fieldOrder) {
      return {
        values: cloneValues(values),
        touchedFields: [...touchedFields],
        dirtyFields: [...dirtyFields],
        errors: cloneErrors(errors),
        isValid: Object.keys(errors).length === 0,
        visibleFields: [...visibleFields]
      };
    },

    setValue(fieldName, value) {
      if (!schema.fieldMap.has(fieldName)) {
        return;
      }

      values = {
        ...values,
        [fieldName]: value
      };
      recomputeDirty(fieldName);
    },

    setValues(nextValues) {
      schema.fieldOrder.forEach((fieldName) => {
        if (Object.prototype.hasOwnProperty.call(nextValues, fieldName)) {
          values[fieldName] = nextValues[fieldName];
          recomputeDirty(fieldName);
        }
      });
    },

    markTouched(fieldName) {
      if (schema.fieldMap.has(fieldName)) {
        touchedFields.add(fieldName);
      }
    },

    setErrors(nextErrors) {
      errors = cloneErrors(nextErrors);
    },

    reset() {
      values = cloneValues(initial);
      touchedFields.clear();
      dirtyFields.clear();
      errors = {};
    }
  };
}
