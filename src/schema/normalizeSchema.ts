import type {
  FieldSchema,
  FormSchema,
  FormValues,
  NormalizedField,
  NormalizedFormSchema,
  NormalizedSchemaNode,
  NormalizedSection,
  SchemaNode,
  SectionSchema
} from "./types";

function isSection(node: SchemaNode): node is SectionSchema {
  return node.type === "section";
}

function normalizeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultValueForField(field: FieldSchema) {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  if (field.type === "checkbox") {
    return false;
  }

  if (field.type === "number") {
    return null;
  }

  return "";
}

function validateOptionField(field: FieldSchema, schemaId: string): void {
  if (field.type !== "select" && field.type !== "radio") {
    return;
  }

  if (!field.options || field.options.length === 0) {
    throw new Error(`Field "${field.name}" in schema "${schemaId}" requires at least one option.`);
  }

  const optionValues = new Set<string>();

  field.options.forEach((option) => {
    const optionValue = String(option.value);

    if (optionValues.has(optionValue)) {
      throw new Error(`Field "${field.name}" in schema "${schemaId}" has duplicate option value "${optionValue}".`);
    }

    optionValues.add(optionValue);
  });
}

export function normalizeSchema(schema: FormSchema): NormalizedFormSchema {
  const fieldMap = new Map<string, NormalizedField>();
  const fieldOrder: string[] = [];

  const normalizeNode = (node: SchemaNode, path: string[]): NormalizedSchemaNode => {
    if (isSection(node)) {
      const sectionId = node.id ? normalizeId(node.id) : normalizeId([...path, node.title].join("-"));

      const normalizedSection: NormalizedSection = {
        ...node,
        id: sectionId,
        path,
        fields: node.fields.map((child, index) =>
          normalizeNode(child, [...path, sectionId || `section-${index}`])
        )
      };

      return normalizedSection;
    }

    if (fieldMap.has(node.name)) {
      throw new Error(`Duplicate field name "${node.name}" in schema "${schema.id}".`);
    }

    validateOptionField(node, schema.id);

    const fieldId = node.id ? normalizeId(node.id) : normalizeId(node.name);
    const normalizedField: NormalizedField = {
      ...node,
      id: fieldId,
      path
    };

    fieldMap.set(node.name, normalizedField);
    fieldOrder.push(node.name);
    return normalizedField;
  };

  return {
    ...schema,
    fields: schema.fields.map((node, index) => normalizeNode(node, [schema.id, String(index)])),
    fieldMap,
    fieldOrder
  };
}

export function getInitialValues(schema: NormalizedFormSchema, values: FormValues = {}): FormValues {
  const initialValues: FormValues = {};

  schema.fieldOrder.forEach((fieldName) => {
    const field = schema.fieldMap.get(fieldName);

    if (!field) {
      return;
    }

    initialValues[fieldName] =
      values[fieldName] !== undefined ? values[fieldName] : defaultValueForField(field);
  });

  return initialValues;
}

export function flattenFields(schema: NormalizedFormSchema): NormalizedField[] {
  return schema.fieldOrder
    .map((fieldName) => schema.fieldMap.get(fieldName))
    .filter((field): field is NormalizedField => Boolean(field));
}
