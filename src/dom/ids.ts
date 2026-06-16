function sanitizeIdPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createFieldDomId(schemaId: string, fieldName: string, classPrefix: string): string {
  return `${sanitizeIdPart(classPrefix)}-${sanitizeIdPart(schemaId)}-${sanitizeIdPart(fieldName)}`;
}

export function createHelpDomId(fieldId: string): string {
  return `${fieldId}-help`;
}

export function createErrorDomId(fieldId: string): string {
  return `${fieldId}-error`;
}

export function createErrorSummaryId(schemaId: string, classPrefix: string): string {
  return `${sanitizeIdPart(classPrefix)}-${sanitizeIdPart(schemaId)}-error-summary`;
}
