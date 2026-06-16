/** Primitive value stored for a rendered form field. */
export type FieldValue = string | number | boolean | null | undefined;

/** Current form values keyed by schema field name. */
export type FormValues = Record<string, FieldValue>;

/** Field types supported by the default renderer set. */
export type BuiltInFieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio";

export type FieldType = BuiltInFieldType | (string & {});

/** Option used by `select` and `radio` fields. */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

/** A single declarative visibility condition. */
export interface VisibilityCondition {
  /** Field name whose current value should be inspected. */
  field: string;
  /** The dependent field is visible when the referenced value strictly equals this value. */
  equals?: FieldValue;
  /** The dependent field is visible when the referenced value does not strictly equal this value. */
  notEquals?: FieldValue;
  /** The dependent field is visible when the referenced string or array includes this value. */
  includes?: FieldValue;
  /** The dependent field is visible when the referenced value exists, or does not exist when false. */
  exists?: boolean;
}

/** One visibility condition or a simple AND array of conditions. */
export type VisibilityRule = VisibilityCondition | VisibilityCondition[];

export type ValidationMessageKey =
  | "required"
  | "minLength"
  | "maxLength"
  | "min"
  | "max"
  | "pattern"
  | "email"
  | "number";

export type ValidationMessages = Partial<Record<ValidationMessageKey, string>>;

export interface BaseSchemaNode {
  id?: string;
  visibleWhen?: VisibilityRule;
}

/** Section/group node used to organize fields without creating a value. */
export interface SectionSchema extends BaseSchemaNode {
  type: "section";
  title: string;
  description?: string;
  fields: SchemaNode[];
}

/**
 * Declarative field definition consumed by the runtime.
 *
 * Unknown `type` values are allowed only when a matching custom renderer is
 * registered through `CreateFormOptions.renderers`.
 */
export interface FieldSchema extends BaseSchemaNode {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: FieldOption[];
  defaultValue?: FieldValue;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  validators?: string[];
  validationMessages?: ValidationMessages;
}

export type SchemaNode = SectionSchema | FieldSchema;

/** Declarative schema passed to `createForm`. */
export interface FormSchema {
  id: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  resetLabel?: string;
  fields: SchemaNode[];
}

export interface NormalizedField extends FieldSchema {
  id: string;
  path: string[];
}

export interface NormalizedSection extends SectionSchema {
  id: string;
  path: string[];
  fields: NormalizedSchemaNode[];
}

export type NormalizedSchemaNode = NormalizedSection | NormalizedField;

export interface NormalizedFormSchema extends Omit<FormSchema, "fields"> {
  fields: NormalizedSchemaNode[];
  fieldMap: Map<string, NormalizedField>;
  fieldOrder: string[];
}

/** Context passed to synchronous custom validators. */
export interface CustomValidatorContext {
  fieldName: string;
  values: FormValues;
  schema: FormSchema;
}

/**
 * Synchronous validator registered by name and referenced from field schemas.
 *
 * Return a human-readable error message when invalid, or `null` when valid.
 */
export type CustomValidator = (
  value: FieldValue,
  context: CustomValidatorContext
) => string | null;

export type CustomValidatorMap = Record<string, CustomValidator>;

export interface FieldError {
  fieldName: string;
  message: string;
}

export type FieldErrors = Record<string, string[]>;

/** Immutable snapshot passed to form event hooks. */
export interface FormStateSnapshot {
  values: FormValues;
  touchedFields: string[];
  dirtyFields: string[];
  errors: FieldErrors;
  isValid: boolean;
  visibleFields: string[];
}
