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

## Runnable Framework Examples

The repository includes small consumer applications that install `form-schema-runtime` from npm and demonstrate framework lifecycle integration without adding adapters:

- [React Vite example](../examples/react-vite/)
- [Vue Vite example](../examples/vue-vite/)
- [Angular example](../examples/angular/)

These examples are intentionally outside the published npm package. They show the framework-owned container pattern, submit handling, validation, and `form.destroy()` cleanup.

## React Integration

React applications can mount the DOM runtime inside a ref-owned container. Keep schema and callback identity stable with `useMemo` and `useCallback` in the host app when possible, because changing those references intentionally recreates the form.

```tsx
import { useEffect, useRef } from "react";
import { createForm, type FormInstance, type FormSchema, type FormValues } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

interface RuntimeFormProps {
  schema: FormSchema;
  initialValues?: FormValues;
  onSubmit(values: FormValues): void;
}

export function RuntimeForm({ schema, initialValues, onSubmit }: RuntimeFormProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<FormInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    formRef.current?.destroy();
    formRef.current = createForm({
      container: containerRef.current,
      schema,
      initialValues,
      onSubmit
    });

    return () => {
      formRef.current?.destroy();
      formRef.current = null;
    };
  }, [schema, initialValues, onSubmit]);

  return <div ref={containerRef} />;
}
```

Guidance:

- Import the runtime CSS once in the application entry point or wrapper.
- Do not render React children inside the same container that the runtime owns.
- Destroy and recreate the instance when the schema changes.
- Memoize schema objects and callbacks if the wrapper should not remount on every render.

## Angular Integration

Angular applications can mount after the view initializes and destroy the runtime in `ngOnDestroy`. Import the CSS globally, for example in `src/styles.css`:

```css
@import "form-schema-runtime/styles.css";
```

Standalone component example:

```ts
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from "@angular/core";
import { createForm, type FormInstance, type FormSchema, type FormValues } from "form-schema-runtime";

@Component({
  selector: "runtime-form",
  standalone: true,
  template: `<div #container></div>`
})
export class RuntimeFormComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) schema!: FormSchema;
  @Input() initialValues?: FormValues;
  @Output() submitted = new EventEmitter<FormValues>();
  @ViewChild("container", { static: true }) private container!: ElementRef<HTMLDivElement>;

  private form: FormInstance | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.mount();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.viewReady) {
      this.mount();
    }
  }

  ngOnDestroy(): void {
    this.form?.destroy();
    this.form = null;
  }

  private mount(): void {
    this.form?.destroy();
    this.form = createForm({
      container: this.container.nativeElement,
      schema: this.schema,
      initialValues: this.initialValues,
      onSubmit: (values) => this.submitted.emit(values)
    });
  }
}
```

Guidance:

- Let Angular own the wrapper element and let the runtime own only its inner DOM.
- Destroy the instance when Angular destroys the component.
- Recreate the instance when replacing the schema or initial values.
- Keep Angular validators and async workflows outside the schema runtime.

## Vue Integration

Vue applications can mount the runtime in `onMounted`, recreate it when props change, and clean it up in `onUnmounted`.

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { createForm, type FormInstance, type FormSchema, type FormValues } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const props = defineProps<{
  schema: FormSchema;
  initialValues?: FormValues;
}>();

const emit = defineEmits<{
  submit: [values: FormValues];
}>();

const container = ref<HTMLDivElement | null>(null);
const form = shallowRef<FormInstance | null>(null);

function mount(): void {
  if (!container.value) {
    return;
  }

  form.value?.destroy();
  form.value = createForm({
    container: container.value,
    schema: props.schema,
    initialValues: props.initialValues,
    onSubmit(values) {
      emit("submit", values);
    }
  });
}

onMounted(mount);
watch(() => [props.schema, props.initialValues], mount, { deep: false });

onUnmounted(() => {
  form.value?.destroy();
  form.value = null;
});
</script>

<template>
  <div ref="container"></div>
</template>
```

Guidance:

- Import CSS in the wrapper or app entry.
- Keep runtime-owned DOM out of Vue templates.
- Prefer replacing the schema object when the form definition changes.
- Use Vue for surrounding page state, routing, and API calls.

## Avoiding Double Rendering

The framework should render the page shell, route state, panels, and submit result UI. `form-schema-runtime` should render only the form controls inside the container passed to `createForm`.

Avoid:

- mapping every schema field to framework components and also calling `createForm`
- putting framework children inside the runtime-owned container
- mutating runtime-created form controls from framework templates
- leaving an old instance alive before remounting a new schema

## When Native Framework Forms Are Better

Use the framework's native form tools instead when the form is deeply tied to framework component composition, async validators, field arrays, drag-and-drop builders, or framework-specific validation libraries. `form-schema-runtime` is a better fit when the schema is data-driven, synchronous, native-control based, and needs to work consistently across framework and non-framework surfaces.

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
