# Schema Reference

Schemas are plain JSON-compatible objects that describe fields, sections, labels, validation, and simple conditional visibility. Schema strings are treated as untrusted text and are rendered with DOM APIs, not as HTML.

## FormSchema

```ts
const schema: FormSchema = {
  id: "profile-form",
  title: "Profile form",
  description: "Update account profile data.",
  submitLabel: "Save profile",
  resetLabel: "Clear",
  fields: []
};
```

- `id`: stable schema identifier used for generated DOM IDs.
- `title`: optional form heading.
- `description`: optional safe text below the title.
- `submitLabel`: optional submit button label. Defaults to `Submit`.
- `resetLabel`: optional reset button label. Defaults to `Reset`.
- `fields`: top-level fields and sections.

## Sections and Groups

Sections group fields visually and semantically. They render as native `fieldset` elements with a `legend`.

```ts
{
  type: "section",
  title: "Contact details",
  description: "How the team can reach this customer.",
  fields: [
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true
    }
  ]
}
```

Sections do not produce values. Their child fields do.

## Field Names

Each field needs a unique `name` within the form schema:

```ts
{
  type: "text",
  name: "firstName",
  label: "First name"
}
```

The name is used in values, dirty/touched state, validation errors, and submit payloads.

## Labels, Placeholders, and Help Text

```ts
{
  type: "text",
  name: "companyName",
  label: "Company name",
  placeholder: "Example Corp",
  helpText: "Use the registered legal name."
}
```

Labels are associated with native controls. Placeholders are optional hints and must not replace labels. Help text is referenced by `aria-describedby`.

## Disabled and Readonly

```ts
{
  type: "text",
  name: "sourceSystem",
  label: "Source system",
  readonly: true,
  defaultValue: "Identity Governance"
}
```

```ts
{
  type: "text",
  name: "accessWindow",
  label: "Access window",
  disabled: true,
  defaultValue: "Business hours only"
}
```

`readonly` applies to text-like native controls. `disabled` renders the native disabled attribute.

## Required Fields

```ts
{
  type: "email",
  name: "email",
  label: "Email",
  required: true
}
```

Required fields render visible required text and native `required` attributes where appropriate.

## Initial Values

Field-level defaults:

```ts
{
  type: "select",
  name: "accountType",
  label: "Account type",
  defaultValue: "business",
  options: [
    { label: "Consumer", value: "consumer" },
    { label: "Business", value: "business" }
  ]
}
```

Form-level initial values:

```ts
createForm({
  container,
  schema,
  initialValues: {
    accountType: "business"
  }
});
```

`initialValues` override field defaults.

## Options

`select` and `radio` fields require options:

```ts
options: [
  { label: "Low", value: "low" },
  { label: "High", value: "high" }
]
```

Option values must be unique within a field.

## Field-Level Validation Rules

Supported built-in rules:

- `required`
- `minLength`
- `maxLength`
- `min`
- `max`
- `pattern`
- email validation for `email` fields

```ts
{
  type: "text",
  name: "employeeId",
  label: "Employee ID",
  required: true,
  pattern: "^[A-Z]{2}-[0-9]{5}$",
  validationMessages: {
    pattern: "Employee ID must look like IT-12345."
  }
}
```

Custom validators are referenced by name:

```ts
{
  type: "text",
  name: "taxCode",
  label: "Tax code",
  validators: ["taxCode"]
}
```

Validators are registered from application code through `createForm({ validators })`.

## Conditional Visibility

Use `visibleWhen` for small, declarative conditions:

```ts
{
  type: "text",
  name: "companyName",
  label: "Company name",
  required: true,
  visibleWhen: {
    field: "accountType",
    equals: "enterprise"
  }
}
```

Supported operators:

- `equals`
- `notEquals`
- `includes`
- `exists`
- simple AND arrays

```ts
visibleWhen: [
  { field: "accountType", equals: "enterprise" },
  { field: "country", exists: true }
]
```

Hidden fields are not validated.

## Field Types

### text

Use `text` for short free-text input.

```ts
{
  type: "text",
  name: "fullName",
  label: "Full name"
}
```

Validation example:

```ts
{
  type: "text",
  name: "fullName",
  label: "Full name",
  required: true,
  minLength: 2,
  maxLength: 80
}
```

### email

Use `email` for email addresses. Email fields receive built-in email validation.

```ts
{
  type: "email",
  name: "email",
  label: "Email",
  required: true
}
```

### number

Use `number` for numeric input.

```ts
{
  type: "number",
  name: "amount",
  label: "Amount",
  min: 1,
  max: 250000
}
```

Empty number fields are stored as `null`.

### password

Use `password` for password-like native controls.

```ts
{
  type: "password",
  name: "temporaryPassword",
  label: "Temporary password",
  minLength: 12
}
```

Do not put real secrets into demo schemas, logs, or examples. Password values are still normal form values in browser memory.

### textarea

Use `textarea` for longer text.

```ts
{
  type: "textarea",
  name: "notes",
  label: "Notes",
  maxLength: 500
}
```

### select

Use `select` when one option should be chosen from a compact list.

```ts
{
  type: "select",
  name: "department",
  label: "Department",
  required: true,
  options: [
    { label: "Finance", value: "finance" },
    { label: "Operations", value: "operations" }
  ]
}
```

### checkbox

Use `checkbox` for boolean values.

```ts
{
  type: "checkbox",
  name: "approvalConfirmed",
  label: "Manager approval is attached",
  required: true
}
```

Unchecked checkboxes store `false`.

### radio

Use `radio` for a small list of mutually exclusive visible choices.

```ts
{
  type: "radio",
  name: "accessLevel",
  label: "Access level",
  required: true,
  options: [
    { label: "Read only", value: "read" },
    { label: "Standard contributor", value: "write" },
    { label: "Administrator", value: "admin" }
  ]
}
```

Radio groups render with `role="radiogroup"` and a labelled group.

