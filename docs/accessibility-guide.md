# Accessibility Guide

`form-schema-runtime` is built around native HTML controls and practical accessibility behavior. The runtime handles common wiring, but schema authors and custom renderer authors still have responsibilities.

## Label and Input Association

Every built-in field renders a visible label associated with its native control.

```ts
{
  type: "text",
  name: "fullName",
  label: "Full name"
}
```

Labels come from schema text and are rendered safely. Do not rely on placeholders as labels.

## Generated IDs

The runtime generates stable IDs from:

- `classPrefix`
- schema `id`
- field `name`

Custom renderers receive these IDs through `FieldRenderContext`:

```ts
input.id = context.inputId;
label.htmlFor = context.inputId;
```

Use the provided IDs instead of inventing unrelated IDs.

## aria-invalid

Invalid built-in controls receive:

```html
aria-invalid="true"
```

Custom renderers should do the same:

```ts
input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");
```

## aria-describedby

Help text and error text are referenced only when present.

```ts
if (context.describedBy) {
  input.setAttribute("aria-describedby", context.describedBy);
}
```

Do not reference missing elements. The runtime's `describedBy` value already handles this.

## Help Text

```ts
{
  type: "email",
  name: "email",
  label: "Email",
  helpText: "Use a work or account recovery email address."
}
```

Help text renders near the control and is referenced by `aria-describedby`.

## Error Text

When validation fails, field-level error text renders near the field and is referenced by `aria-describedby`.

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

Keep validation messages clear and specific.

## Error Summary

When the form is invalid, the runtime renders a form-level error summary with links to invalid fields. The summary receives focus after submit or manual validation fails.

This helps keyboard and screen reader users understand all current problems without scanning the entire form.

## Focusing Invalid Fields

Error summary links focus the invalid control:

```txt
First name: First name is required.
```

Clicking or activating the link moves focus to the field.

## Required Fields

Required fields are communicated through:

- visible label text using `*`
- native `required` attributes where appropriate
- validation messages

```ts
{
  type: "text",
  name: "firstName",
  label: "First name",
  required: true
}
```

Do not rely on color alone to communicate required state.

## Keyboard Support

Built-in renderers use native controls:

- `input`
- `textarea`
- `select`
- checkbox input
- radio input
- button

Native controls preserve expected keyboard behavior. Prefer native controls over custom widgets.

## Placeholder Is Not a Label

This is good:

```ts
{
  type: "text",
  name: "firstName",
  label: "First name",
  placeholder: "Ada"
}
```

This is not supported because the label is missing:

```ts
{
  type: "text",
  name: "firstName",
  placeholder: "First name"
}
```

Every field needs a visible `label`.

## Custom Renderer Responsibilities

Custom renderers must preserve the accessibility contract:

```ts
const renderer: FieldRenderer = (context) => {
  const label = document.createElement("label");
  label.htmlFor = context.inputId;
  label.textContent = context.field.label;

  const input = document.createElement("input");
  input.id = context.inputId;
  input.name = context.field.name;
  input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");

  if (context.describedBy) {
    input.setAttribute("aria-describedby", context.describedBy);
  }

  return document.createElement("div");
};
```

Checklist for custom renderers:

- Use `context.inputId`.
- Associate labels with controls.
- Render help text with `context.helpId` when present.
- Render error text with `context.errorId` when present.
- Apply `aria-invalid`.
- Apply `aria-describedby` only when non-empty.
- Use native controls where possible.
- Use `context.events.listen()` for cleanup.
- Use `textContent` for schema-provided text.

## Practical Checks

Before shipping a form:

- Tab through all controls.
- Submit an empty required form and confirm the summary appears.
- Activate a summary link and confirm focus moves to the field.
- Confirm help and error text are announced by assistive technology.
- Confirm conditional fields appear and disappear without trapping focus.
- Confirm custom renderers work without a mouse.

