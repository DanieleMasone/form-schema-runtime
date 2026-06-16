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

/** Built-in field type or a custom renderer type registered by the host application. */
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

/** Built-in validation rule names that can receive custom per-field messages. */
export type ValidationMessageKey =
  | "required"
  | "minLength"
  | "maxLength"
  | "min"
  | "max"
  | "pattern"
  | "email"
  | "number";

/** Optional per-field overrides for built-in validation messages. */
export type ValidationMessages = Partial<Record<ValidationMessageKey, string>>;

/** Shared schema properties supported by both fields and sections. */
export interface BaseSchemaNode {
  /** Optional stable identifier used when deriving DOM IDs and schema paths. */
  id?: string;
  /** Declarative condition that controls whether this node is currently visible. */
  visibleWhen?: VisibilityRule;
}

/** Section/group node used to organize fields without creating a value. */
export interface SectionSchema extends BaseSchemaNode {
  /** Discriminator used by the runtime to render a non-value grouping node. */
  type: "section";
  /** Visible section heading rendered as a fieldset legend. */
  title: string;
  /** Optional explanatory text rendered safely below the section title. */
  description?: string;
  /** Child fields or nested sections contained by this section. */
  fields: SchemaNode[];
}

/**
 * Declarative field definition consumed by the runtime.
 *
 * Unknown `type` values are allowed only when a matching custom renderer is
 * registered through `CreateFormOptions.renderers`.
 */
export interface FieldSchema extends BaseSchemaNode {
  /** Built-in field type or custom renderer type. */
  type: FieldType;
  /** Stable value key used in state, validation errors, and submission values. */
  name: string;
  /** Visible label associated with the native control. */
  label: string;
  /** Optional native placeholder text. Never used as a label replacement. */
  placeholder?: string;
  /** Optional descriptive text referenced through `aria-describedby`. */
  helpText?: string;
  /** Whether the field must contain a value before submission. */
  required?: boolean;
  /** Whether the native control is disabled. */
  disabled?: boolean;
  /** Whether text-like native controls are readonly. */
  readonly?: boolean;
  /** Options for select and radio fields. */
  options?: FieldOption[];
  /** Default value used unless `CreateFormOptions.initialValues` overrides it. */
  defaultValue?: FieldValue;
  /** Minimum string length for text-like values. */
  minLength?: number;
  /** Maximum string length for text-like values. */
  maxLength?: number;
  /** Minimum numeric value for number-like fields. */
  min?: number;
  /** Maximum numeric value for number-like fields. */
  max?: number;
  /** JavaScript regular expression source used for deterministic pattern validation. */
  pattern?: string;
  /** Names of synchronous custom validators registered by the host application. */
  validators?: string[];
  /** Optional field-specific messages for built-in validators. */
  validationMessages?: ValidationMessages;
}

/** A schema node is either a value-producing field or a section/group. */
export type SchemaNode = SectionSchema | FieldSchema;

/** Declarative schema passed to `createForm`. */
export interface FormSchema {
  /** Stable schema identifier used for generated DOM IDs. */
  id: string;
  /** Optional form heading rendered above the fields. */
  title?: string;
  /** Optional safe text rendered under the form title. */
  description?: string;
  /** Submit button label. Defaults to `Submit`. */
  submitLabel?: string;
  /** Reset button label. Defaults to `Reset`. */
  resetLabel?: string;
  /** Top-level fields and sections rendered by the runtime. */
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
  /** Name of the field currently being validated. */
  fieldName: string;
  /** Snapshot of all current form values. */
  values: FormValues;
  /** Original public schema for the owning form. */
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

/** Custom synchronous validators keyed by the names referenced in field schemas. */
export type CustomValidatorMap = Record<string, CustomValidator>;

/** Single validation error associated with a field. */
export interface FieldError {
  /** Name of the field that failed validation. */
  fieldName: string;
  /** Human-readable validation message. */
  message: string;
}

/** Validation errors keyed by field name. */
export type FieldErrors = Record<string, string[]>;

/** Immutable snapshot passed to form event hooks. */
export interface FormStateSnapshot {
  /** Current form values keyed by field name. */
  values: FormValues;
  /** Field names blurred by the user. */
  touchedFields: string[];
  /** Field names whose current value differs from the initial value. */
  dirtyFields: string[];
  /** Current validation errors keyed by field name. */
  errors: FieldErrors;
  /** Whether the current visible form state has no validation errors. */
  isValid: boolean;
  /** Field names currently visible after evaluating conditions. */
  visibleFields: string[];
}
