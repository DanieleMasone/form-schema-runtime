# Validation Guide

Validation in `form-schema-runtime` is synchronous, deterministic, and independent from DOM rendering. The runtime validates current visible fields, stores errors in state, and renders field-level errors plus a form-level error summary.

## Validation Lifecycle

Validation runs when:

- the user submits the rendered form
- application code calls `form.validate()`
- a value changes while the form already has errors

When validation fails:

- invalid controls receive `aria-invalid="true"`
- field-level error text is rendered
- the error text is referenced by `aria-describedby`
- a form-level error summary is rendered
- error summary links focus invalid controls
- `onValidationError` runs when validation was triggered by submit or `validate()`

Hidden conditional fields are skipped, so stale errors from hidden fields do not block submission.

## Built-In Validation

### required

```ts
{
  type: "text",
  name: "fullName",
  label: "Full name",
  required: true
}
```

Required validation checks for meaningful values. Empty strings, `null`, and `undefined` are invalid. Required checkboxes must be checked.

### minLength

```ts
{
  type: "password",
  name: "password",
  label: "Password",
  minLength: 12
}
```

`minLength` checks string length when a value is present.

### maxLength

```ts
{
  type: "textarea",
  name: "message",
  label: "Message",
  maxLength: 500
}
```

`maxLength` checks string length when a value is present.

### min

```ts
{
  type: "number",
  name: "amount",
  label: "Amount",
  min: 1
}
```

`min` checks numeric values.

### max

```ts
{
  type: "number",
  name: "amount",
  label: "Amount",
  max: 250000
}
```

`max` checks numeric values.

### pattern

```ts
{
  type: "text",
  name: "employeeId",
  label: "Employee ID",
  pattern: "^[A-Z]{2}-[0-9]{5}$",
  validationMessages: {
    pattern: "Employee ID must look like IT-12345."
  }
}
```

`pattern` is a JavaScript regular expression source string. It is used only for validation; schemas do not execute JavaScript.

### email

```ts
{
  type: "email",
  name: "email",
  label: "Email",
  required: true
}
```

Email validation runs automatically for `email` fields.

## Custom Synchronous Validators

Schemas reference validators by name:

```ts
const schema: FormSchema = {
  id: "customer-form",
  fields: [
    {
      type: "text",
      name: "taxCode",
      label: "Tax code",
      validators: ["taxCode"]
    }
  ]
};
```

Application code registers validator functions:

```ts
const form = createForm({
  container,
  schema,
  validators: {
    taxCode(value) {
      if (!value) {
        return null;
      }

      return String(value).length === 16 ? null : "Tax code must contain 16 characters.";
    }
  }
});
```

A custom validator returns `null` when valid and a string message when invalid.

## Simple Custom Validator

```ts
const validators: CustomValidatorMap = {
  noAdmin(value) {
    return String(value).toLowerCase() === "admin" ? "This value is reserved." : null;
  }
};
```

## Validator Using Other Values

```ts
const validators: CustomValidatorMap = {
  amountRequiresPurchaseOrder(value, context) {
    const amount = Number(context.values.amount ?? 0);
    const purchaseOrder = String(value ?? "");

    if (amount > 10000 && purchaseOrder.length < 6) {
      return "A purchase order is required for amounts above 10000.";
    }

    return null;
  }
};
```

Validator context includes:

- `fieldName`
- `values`
- `schema`

## Field-Level Errors

Errors are stored as:

```ts
type FieldErrors = Record<string, string[]>;
```

Example:

```ts
{
  email: ["Email must be a valid email address."]
}
```

The first error for a field is rendered next to that field and in the form-level summary.

## Form-Level Error Summary

When validation fails, the runtime renders a summary with links to invalid fields. Clicking a summary link focuses the matching control.

This behavior helps keyboard and screen reader users find errors without searching through the full form.

## Conditional Fields

Conditional fields are validated only when visible:

```ts
{
  type: "textarea",
  name: "adminJustification",
  label: "Administrator access justification",
  required: true,
  visibleWhen: {
    field: "accessLevel",
    equals: "admin"
  }
}
```

If `accessLevel` is not `admin`, `adminJustification` does not block submission.

## onValidationError

```ts
const form = createForm({
  container,
  schema,
  onValidationError(errors, state) {
    console.warn(errors);
    console.log(state.visibleFields);
  }
});
```

`onValidationError` is useful for analytics, status text, logging, or synchronizing validation state with surrounding UI.

## validate API

```ts
const isValid = form.validate();

if (isValid) {
  submitValues(form.getValues());
}
```

`validate()` updates rendered errors and returns a boolean.

## What Is Out of Scope

Async validation is intentionally out of scope in v1. It requires loading state, cancellation, race handling, and backend policy decisions.

Schemas do not execute JavaScript. Custom validators are application code registered through `createForm`; schema data only references validator names.

