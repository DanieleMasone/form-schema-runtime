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

| Property | Required | Description |
| --- | --- | --- |
| `id` | yes | Stable schema identifier used for generated DOM IDs. |
| `fields` | yes | Top-level fields and sections. |
| `title` | no | Form heading. |
| `description` | no | Safe text rendered below the title. |
| `submitLabel` | no | Submit button label. Defaults to `Submit`. |
| `resetLabel` | no | Reset button label. Defaults to `Reset`. |

## Sections and Groups

Sections group fields visually and semantically. They render as native `fieldset` elements with a `legend`.

| Property | Required | Description |
| --- | --- | --- |
| `type` | yes | Must be `section`. |
| `title` | yes | Visible `legend` text. |
| `fields` | yes | Child fields or nested sections. |
| `description` | no | Safe explanatory text below the legend. |
| `id` | no | Stable identifier used when deriving section paths. |
| `visibleWhen` | no | Visibility rule applied to the section and all its children. |

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

## Field Properties

Every built-in and custom value-producing field uses `FieldSchema`.

| Property | Required | Description |
| --- | --- | --- |
| `type` | yes | Built-in field type or a custom type with a registered renderer. |
| `name` | yes | Unique value key within the form. |
| `label` | yes | Visible label for the control. |
| `id` | no | Stable identifier used when deriving normalized field metadata. Defaults from `name`. |
| `visibleWhen` | no | One visibility condition or a simple AND array. |
| `placeholder` | no | Native placeholder for text-like controls; never a label replacement. |
| `helpText` | no | Descriptive text wired through `aria-describedby`. |
| `required` | no | Enables required validation and native required state. |
| `disabled` | no | Applies the native disabled state. |
| `readonly` | no | Applies to text-like native controls. |
| `options` | for `select` and `radio` | Non-empty list of unique `{ label, value }` options. |
| `defaultValue` | no | Initial field value when no form-level initial value is provided. |
| `minLength`, `maxLength` | no | String length limits. |
| `min`, `max` | no | Numeric range limits. |
| `pattern` | no | JavaScript regular expression source used for validation. |
| `validators` | no | Names of registered synchronous custom validators. |
| `validationMessages` | no | Per-rule overrides for built-in validation messages. |

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

Built-in `select` and `radio` controls read values through the native DOM and therefore store the selected value as a string after user interaction. Prefer string option values when value type stability matters.

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

`validationMessages` supports these keys:

- `required`
- `minLength`
- `maxLength`
- `min`
- `max`
- `pattern`
- `email`
- `number`

These keys override built-in messages only. Custom validators return their own message strings.

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
