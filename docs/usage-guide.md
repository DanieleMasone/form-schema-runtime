# Usage Guide

`form-schema-runtime` renders accessible HTML forms from declarative JSON schemas. It owns the DOM inside a container element, tracks form state, runs deterministic validation, and exposes a small controller API for values, validation, reset, and cleanup.

Use it when you need a typed, framework-agnostic form runtime for plain HTML, server-rendered pages, embedded widgets, micro-frontends, or applications where adding React, Angular, Vue, or Svelte is not appropriate.

Do not use it when you need a visual form builder, a generic rules engine, async validation workflows, nested repeatable array forms, backend submission, or framework-specific adapters. Those are intentionally outside v1.

## Installation

```bash
npm install form-schema-runtime
```

Import the runtime and its CSS:

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

The CSS import provides accessible default styling and CSS variables that can be overridden by the host application.

## Minimal Setup

Create a container in your page:

```html
<div id="app"></div>
```

Define a schema and create a form:

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const schema: FormSchema = {
  id: "contact-form",
  title: "Contact form",
  fields: [
    {
      type: "text",
      name: "fullName",
      label: "Full name",
      required: true
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true
    }
  ]
};

const form = createForm({
  container: document.querySelector("#app")!,
  schema,
  onSubmit(values) {
    console.log(values);
  }
});
```

`createForm` renders immediately. The returned `form` instance controls the mounted form until `destroy()` is called.

## Creating a Form

The minimum required options are:

```ts
const form = createForm({
  container,
  schema
});
```

Common options:

```ts
const form = createForm({
  container,
  schema,
  initialValues: {
    accountType: "consumer"
  },
  classPrefix: "my-form",
  validators: {
    taxCode(value) {
      return String(value).length === 16 ? null : "Tax code must contain 16 characters.";
    }
  },
  renderers: {
    money: moneyRenderer
  },
  onChange(values, state) {},
  onSubmit(values, state) {},
  onValidationError(errors, state) {},
  onReset(state) {}
});
```

The runtime clears and owns the container's children. Do not mount unrelated UI inside the same container after `createForm` has been called.

## Reading Values

Use `getValues()` to read a defensive copy of current values:

```ts
const values = form.getValues();
console.log(values.email);
```

The returned object is a snapshot. Mutating it does not mutate runtime state.

## Setting Values

Use `setValues()` to merge known schema field values into the form:

```ts
form.setValues({
  fullName: "Ada Lovelace",
  email: "ada@example.com"
});
```

Unknown field names are ignored by the state layer. Setting values re-renders the form, updates conditional visibility, and triggers `onChange`.

## Validating Manually

Use `validate()` when validation should run before a custom action:

```ts
if (form.validate()) {
  saveDraft(form.getValues());
}
```

Validation updates field-level errors and the error summary. Hidden conditional fields are not validated.

## Handling Submit

The rendered form handles native submit events. If validation passes, `onSubmit` receives values and a state snapshot:

```ts
const form = createForm({
  container,
  schema,
  onSubmit(values, state) {
    console.log(values, state.isValid);
  }
});
```

The runtime prevents the browser's default form submission. Submit values yourself from `onSubmit` if you want to call an API or update another part of the page.

## Handling Validation Errors

Use `onValidationError` to react when submit or `validate()` fails:

```ts
const form = createForm({
  container,
  schema,
  onValidationError(errors, state) {
    console.warn(errors, state.visibleFields);
  }
});
```

The runtime also renders field-level errors, marks invalid controls with `aria-invalid`, renders a form-level error summary, and focuses that summary.

## Handling Change Events

Use `onChange` for live state synchronization:

```ts
const form = createForm({
  container,
  schema,
  onChange(values, state) {
    updatePreview(values);
    console.log(state.dirtyFields);
  }
});
```

`onChange` runs after user input and after `setValues()`.

## Resetting the Form

Use `reset()` to restore initial values, clear touched and dirty fields, and clear errors:

```ts
form.reset();
```

`onReset` runs after reset:

```ts
const form = createForm({
  container,
  schema,
  onReset(state) {
    console.log(state.values);
  }
});
```

## Destroying or Unmounting

Call `destroy()` when removing the form, changing routes, closing a widget, or replacing the container:

```ts
form.destroy();
```

Destroy removes runtime event listeners, clears the owned DOM, and makes other instance methods throw. Calling `destroy()` more than once is safe.

## Complete Working Example

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const schema: FormSchema = {
  id: "support-request",
  title: "Support request",
  submitLabel: "Send request",
  resetLabel: "Clear",
  fields: [
    {
      type: "section",
      title: "Contact",
      fields: [
        {
          type: "text",
          name: "fullName",
          label: "Full name",
          required: true,
          minLength: 2
        },
        {
          type: "email",
          name: "email",
          label: "Email",
          required: true
        }
      ]
    },
    {
      type: "section",
      title: "Request",
      fields: [
        {
          type: "select",
          name: "topic",
          label: "Topic",
          required: true,
          options: [
            { label: "Billing", value: "billing" },
            { label: "Technical support", value: "technical" }
          ]
        },
        {
          type: "textarea",
          name: "message",
          label: "Message",
          required: true,
          minLength: 20,
          maxLength: 500
        },
        {
          type: "checkbox",
          name: "urgent",
          label: "This request is urgent"
        }
      ]
    }
  ]
};

const container = document.querySelector("#app");

if (!container) {
  throw new Error("Missing #app container.");
}

const form = createForm({
  container,
  schema,
  initialValues: {
    topic: "technical"
  },
  onChange(values, state) {
    console.log("Changed", values, state.dirtyFields);
  },
  onSubmit(values) {
    console.log("Submit", values);
  },
  onValidationError(errors) {
    console.warn("Invalid", errors);
  },
  onReset(state) {
    console.log("Reset", state.values);
  }
});

document.querySelector("#validate")?.addEventListener("click", () => {
  console.log(form.validate());
});

window.addEventListener("beforeunload", () => {
  form.destroy();
});
```

