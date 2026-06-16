# Integration Guide

`form-schema-runtime` is designed for plain DOM integration. It can be used in modern ESM applications, legacy server-rendered pages, embedded widgets, micro-frontends, and framework wrappers without adding a framework dependency to the core package.

## Plain HTML and TypeScript

HTML:

```html
<div id="app"></div>
```

TypeScript:

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const schema: FormSchema = {
  id: "contact-form",
  fields: [
    {
      type: "text",
      name: "fullName",
      label: "Full name",
      required: true
    }
  ]
};

const form = createForm({
  container: document.querySelector("#app")!,
  schema
});
```

Call `form.destroy()` if the page replaces the container or unmounts this UI.

## Legacy Server-Rendered Page

Server-render a stable container:

```html
<div id="customer-form" data-customer-id="123"></div>
```

Load schema data from a safe source, then mount:

```ts
const container = document.querySelector<HTMLElement>("#customer-form");

if (!container) {
  throw new Error("Missing customer form container.");
}

const response = await fetch(`/customers/${container.dataset.customerId}/form-schema`);
const schema = await response.json();

const form = createForm({
  container,
  schema,
  onSubmit(values) {
    fetch("/customers/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
  }
});
```

Security notes:

- Treat remote schemas as untrusted data.
- Do not add executable expressions to schemas.
- Validate submitted values on the server too.
- Keep custom validators and renderers in application code, not in remote schema strings.

## Micro-Frontend or Embedded Widget

Mount into an owned container and clean up when the host removes the widget:

```ts
export function mountForm(container: HTMLElement, schema: FormSchema) {
  const form = createForm({
    container,
    schema,
    classPrefix: "customer-widget"
  });

  return {
    getValues: () => form.getValues(),
    setValues: (values: FormValues) => form.setValues(values),
    destroy: () => form.destroy()
  };
}
```

Guidance:

- Use `classPrefix` to avoid style collisions.
- Import the runtime CSS once or bundle it with the widget.
- Call `destroy()` when the host unmounts the widget.
- Avoid sharing one container with unrelated host DOM.

## Framework Application Wrapper

The core package does not ship React, Angular, Vue, or Svelte adapters. A framework app can still wrap the DOM runtime at its boundary.

Pattern:

```ts
let form: FormInstance | null = null;

function mount(container: HTMLElement, schema: FormSchema) {
  form?.destroy();

  form = createForm({
    container,
    schema,
    onChange(values) {
      updateFrameworkState(values);
    }
  });
}

function unmount() {
  form?.destroy();
  form = null;
}
```

Keep framework-specific lifecycle code in the host application. Do not move framework dependencies into the runtime package.

## ESM Usage

```ts
import { createForm } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

This is the recommended path for bundlers and modern TypeScript applications.

## IIFE and Global Usage

The package builds an IIFE bundle and exposes `FormSchemaRuntime` for direct script usage:

```html
<link rel="stylesheet" href="./form-schema-runtime.css" />
<script src="./form-schema-runtime.iife.js"></script>
<script>
  const form = FormSchemaRuntime.createForm({
    container: document.querySelector("#app"),
    schema: {
      id: "contact-form",
      fields: [
        {
          type: "text",
          name: "fullName",
          label: "Full name"
        }
      ]
    }
  });
</script>
```

Use the ESM package when a bundler is available.

## CSS Usage

For ESM:

```ts
import "form-schema-runtime/styles.css";
```

For direct browser usage, include the built CSS file:

```html
<link rel="stylesheet" href="./form-schema-runtime.css" />
```

Override variables in host CSS for theming.

## Lifecycle and Destroy Guidance

Call `destroy()` when:

- navigating away from a view
- closing a modal or embedded widget
- replacing the schema with a different form instance
- removing the container from the DOM

```ts
form.destroy();
```

Destroy removes listeners registered by the runtime and custom renderers that use `context.events.listen()`.

## Progressive Enhancement

For server-rendered applications, you can render a fallback message or plain HTML form first, then replace or enhance the container when JavaScript loads.

```html
<div id="profile-form">
  <p>Loading profile form...</p>
</div>
```

`createForm` replaces the container's children with the runtime form.

## Avoiding Event Listener Leaks

- Always call `destroy()` on unmount.
- Custom renderers should use `context.events.listen()`.
- Do not attach unmanaged listeners to long-lived globals from inside renderers.
- Do not reuse a destroyed form instance.

