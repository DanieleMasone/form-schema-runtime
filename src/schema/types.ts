export type FieldValue = string | number | boolean | null | undefined;
export type FormValues = Record<string, FieldValue>;

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

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface VisibilityCondition {
  field: string;
  equals?: FieldValue;
  notEquals?: FieldValue;
  includes?: FieldValue;
  exists?: boolean;
}

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

export interface SectionSchema extends BaseSchemaNode {
  type: "section";
  title: string;
  description?: string;
  fields: SchemaNode[];
}

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

export interface CustomValidatorContext {
  fieldName: string;
  values: FormValues;
  schema: NormalizedFormSchema;
}

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

export interface FormStateSnapshot {
  values: FormValues;
  touchedFields: string[];
  dirtyFields: string[];
  errors: FieldErrors;
  isValid: boolean;
  visibleFields: string[];
}
