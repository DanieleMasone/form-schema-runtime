# Customization Guide

`form-schema-runtime` supports customization through CSS variables, stable class names, `classPrefix`, synchronous validators, and a simple custom field renderer registry. It does not provide a plugin lifecycle or framework adapter layer.

## Importing Runtime CSS

```ts
import "form-schema-runtime/styles.css";
```

Import the default stylesheet once in the host application. It defines the base layout, accessible field states, and CSS custom properties.

## CSS Variables

Override variables in your application stylesheet:

```css
:root {
  --fsr-color-bg: #ffffff;
  --fsr-color-panel: #f8fafc;
  --fsr-color-text: #172033;
  --fsr-color-muted: #5e6b7d;
  --fsr-color-border: #cad5e1;
  --fsr-color-border-strong: #8798aa;
  --fsr-color-primary: #166a6f;
  --fsr-color-primary-contrast: #ffffff;
  --fsr-color-danger: #b42318;
  --fsr-color-danger-bg: #fff2ee;
  --fsr-radius: 6px;
}
```

Use CSS variables for theming before replacing structural classes.

## Dark Mode Strategy

Scope alternate variables under a class or media query:

```css
.app-dark {
  --fsr-color-bg: #1b2533;
  --fsr-color-panel: #15202d;
  --fsr-color-text: #edf3f8;
  --fsr-color-muted: #a9b5c2;
  --fsr-color-border: #3a495c;
  --fsr-color-primary: #69c7bd;
  --fsr-color-primary-contrast: #0d2024;
  --fsr-color-danger: #ff9b8e;
  --fsr-color-danger-bg: #321b19;
}
```

The demo uses this pattern for its dark mode toggle.

## Stable Class Names

Default classes use the `fsr` prefix, for example:

- `fsr-form`
- `fsr-field`
- `fsr-label`
- `fsr-control`
- `fsr-help`
- `fsr-error`
- `fsr-error-summary`
- `fsr-section`
- `fsr-actions`
- `fsr-button`

Prefer CSS variables for broad theming and class selectors for targeted layout refinements.

## classPrefix

Use `classPrefix` when embedding multiple independently styled instances:

```ts
createForm({
  container,
  schema,
  classPrefix: "customer-form"
});
```

The runtime uses the prefix for classes and generated DOM IDs.

## Custom Field Renderers

Register custom renderers by field type:

```ts
createForm({
  container,
  schema,
  renderers: {
    money: moneyRenderer
  }
});
```

Schema field:

```ts
{
  type: "money",
  name: "amount",
  label: "Amount",
  required: true,
  min: 1
}
```

The registry is intentionally simple: a field type maps to a render function. There is no plugin lifecycle, dependency injection container, or component framework requirement.

## FieldRenderer Context

Custom renderers receive a `FieldRenderContext`:

```ts
const renderer: FieldRenderer = (context) => {
  console.log(context.field.name);
  console.log(context.value);
  console.log(context.errors);
  return document.createElement("div");
};
```

Important context properties:

- `field`: normalized field schema
- `schema`: owning form schema
- `state`: current form state snapshot
- `classPrefix`: active CSS class prefix
- `inputId`, `helpId`, `errorId`: generated IDs
- `describedBy`: IDs that should be used for `aria-describedby`
- `value`: current field value
- `errors`: current field errors
- `events`: event registry for cleanup
- `setValue(value)`: update runtime state
- `markTouched()`: mark the field as touched

## Custom Money Renderer

```ts
import type { FieldRenderer } from "form-schema-runtime";

export const moneyRenderer: FieldRenderer = (context) => {
  const shell = document.createElement("div");
  shell.className = `${context.classPrefix}-field`;

  const label = document.createElement("label");
  label.className = `${context.classPrefix}-label`;
  label.htmlFor = context.inputId;
  label.textContent = context.field.required ? `${context.field.label} *` : context.field.label;

  const wrapper = document.createElement("div");
  wrapper.className = "money-control";

  const prefix = document.createElement("span");
  prefix.textContent = "EUR";

  const input = document.createElement("input");
  input.id = context.inputId;
  input.name = context.field.name;
  input.type = "number";
  input.value = context.value == null ? "" : String(context.value);
  input.required = context.field.required ?? false;
  input.disabled = context.field.disabled ?? false;
  input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");

  if (context.describedBy) {
    input.setAttribute("aria-describedby", context.describedBy);
  }

  context.events.listen(input, "input", () => {
    context.setValue(input.value === "" ? null : Number(input.value));
  });

  context.events.listen(input, "blur", () => {
    context.markTouched();
  });

  wrapper.append(prefix, input);
  shell.append(label);

  if (context.field.helpText) {
    const help = document.createElement("p");
    help.id = context.helpId;
    help.className = `${context.classPrefix}-help`;
    help.textContent = context.field.helpText;
    shell.append(help);
  }

  if (context.errors.length > 0) {
    const error = document.createElement("p");
    error.id = context.errorId;
    error.className = `${context.classPrefix}-error`;
    error.role = "alert";
    error.textContent = context.errors[0];
    shell.append(error);
  }

  shell.append(wrapper);
  return shell;
};
```

## setValue Integration

Call `context.setValue()` when the control value changes:

```ts
context.events.listen(input, "input", () => {
  context.setValue(input.value);
});
```

Do not mutate runtime state directly. Custom renderers should communicate through the provided context.

## Event Listener Cleanup

Use `context.events.listen()` instead of `addEventListener()`:

```ts
context.events.listen(input, "blur", () => {
  context.markTouched();
});
```

The runtime removes registered listeners before re-rendering and during `destroy()`.

## Accessibility Responsibilities

Custom renderers must preserve:

- label/control association
- generated `inputId`
- `name`
- `required`, `disabled`, and relevant native attributes
- `aria-invalid`
- `aria-describedby`
- help and error text IDs
- keyboard usability
- safe text rendering with `textContent`

## What Custom Renderers Should Not Do

Do not:

- use `innerHTML` for schema-provided text
- execute schema-provided strings
- bypass `context.setValue`
- attach unmanaged event listeners
- remove labels or error semantics
- create inaccessible custom widgets when a native control would work
- introduce framework dependencies into the core runtime

