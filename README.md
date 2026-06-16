# Form Schema Runtime

[![CI](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Library_Mode-646CFF?logo=vite)
![Accessibility](https://img.shields.io/badge/Accessibility-First-success)
![Framework](https://img.shields.io/badge/Framework-Agnostic-0F172A)

Framework-agnostic TypeScript runtime for rendering accessible, customizable HTML forms from declarative JSON schemas.

The project is designed for enterprise and legacy-friendly frontend applications where React, Angular, or Vue cannot always be introduced, but maintainability, accessibility, validation, customization, and integration quality still matter.

Live demo: [danielemasone.github.io/form-schema-runtime](https://danielemasone.github.io/form-schema-runtime/)

Generated API docs: [danielemasone.github.io/form-schema-runtime/api/](https://danielemasone.github.io/form-schema-runtime/api/)

Coverage report: [danielemasone.github.io/form-schema-runtime/coverage/](https://danielemasone.github.io/form-schema-runtime/coverage/)

## Why Framework-Agnostic

Large organizations often run a mix of server-rendered pages, legacy scripts, micro-frontends, and modern framework applications. A form runtime with no framework dependency can be embedded into those environments while preserving a consistent schema model, validation behavior, and accessibility baseline.

The core package renders native HTML controls into a provided container element. It does not ship a visual form builder, virtual DOM, generic rules engine, or framework clone.

## Installation

```bash
npm install form-schema-runtime
```

Import the runtime and CSS:

```ts
import { createForm } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

## Quick Start

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const schema: FormSchema = {
  id: "customer-onboarding",
  title: "Customer onboarding",
  fields: [
    {
      type: "text",
      name: "firstName",
      label: "First name",
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
};

const form = createForm({
  container: document.querySelector("#app")!,
  schema,
  onSubmit(values) {
    console.log(values);
  }
});
```

## Public API

```ts
const form = createForm({
  container,
  schema,
  initialValues,
  classPrefix: "fsr",
  validators: {
    taxCode: customTaxCodeValidator
  },
  renderers: {
    money: customMoneyRenderer
  },
  onChange(values, state) {},
  onSubmit(values, state) {},
  onValidationError(errors, state) {},
  onReset(state) {}
});

form.getValues();
form.setValues({ firstName: "Ada" });
form.validate();
form.reset();
form.destroy();
```

Only the stable API is exported from `src/index.ts`. Internal modules remain separated for testability, but consumers should treat them as implementation details.

## Schema Model

Supported built-in field types:

- `text`
- `email`
- `number`
- `password`
- `textarea`
- `select`
- `checkbox`
- `radio`

Schemas support sections, labels, placeholders, help text, disabled and readonly controls, required fields, options, initial values, validation rules, and simple conditional visibility.

```ts
const schema: FormSchema = {
  id: "enterprise-access-request",
  title: "Enterprise access request",
  fields: [
    {
      type: "select",
      name: "accountType",
      label: "Account type",
      required: true,
      options: [
        { value: "standard", label: "Standard" },
        { value: "enterprise", label: "Enterprise" }
      ]
    },
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
  ]
};
```

## Validation

Built-in validation is deterministic and independent from rendering:

- `required`
- `minLength`
- `maxLength`
- `min`
- `max`
- `pattern`
- email validation for `email` fields
- synchronous custom validators by name

```ts
const taxCodeValidator: CustomValidator = (value) => {
  if (!value) {
    return null;
  }

  return String(value).length === 16 ? null : "Tax code must contain 16 characters.";
};
```

More examples are in [docs/examples/custom-validators.md](docs/examples/custom-validators.md).

## Custom Renderers

Custom field types can be registered without introducing a plugin lifecycle:

```ts
const moneyRenderer: FieldRenderer = (context) => {
  const input = document.createElement("input");
  input.id = context.inputId;
  input.name = context.field.name;
  input.type = "number";
  input.value = context.value == null ? "" : String(context.value);
  input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");

  context.events.listen(input, "input", () => {
    context.setValue(input.value === "" ? null : Number(input.value));
  });

  return input;
};
```

More examples are in [docs/examples/custom-renderers.md](docs/examples/custom-renderers.md).

## Extension Points

The v1 extension surface is intentionally small:

- Register synchronous validators by name through `validators`.
- Register custom field renderers by field type through `renderers`.
- Customize styling with CSS variables and a stable class prefix.

Schemas do not contain executable JavaScript. Async validation, framework adapters, schema versioning machinery, and a generic rules engine are outside the current runtime.

## Accessibility

The runtime uses native form controls and implements practical accessibility behavior:

- Label/input association.
- Stable generated IDs.
- `aria-invalid` for invalid fields.
- `aria-describedby` for help and error text.
- Form-level error summary.
- Error summary links focus invalid controls.
- Required fields are represented in text and native control attributes.
- Placeholders are never used as label replacements.

## Security

Schemas are treated as untrusted data. Schema-provided labels, help text, placeholders, option labels, validation messages, and error summary text are rendered with DOM APIs and `textContent`, not `innerHTML`.

The runtime does not execute schema-provided code, does not evaluate JavaScript strings, does not use `eval`, and does not use the `Function` constructor. Schema attributes are explicitly handled rather than blindly copied to DOM nodes.

## Architecture

```txt
src/
  index.ts
  schema/
  validation/
  state/
  conditions/
  renderer/
  dom/
  styles/
```

Responsibilities are intentionally small:

- Schema normalization validates duplicate field names and derives field maps.
- Validation runs independently from DOM rendering.
- State tracks values, touched fields, dirty fields, and errors.
- Conditions support simple declarative visibility only.
- Renderers create explicit DOM nodes and clean up event listeners on destroy.

The core design decision is documented in [docs/adr/0001-framework-agnostic-typescript-core.md](docs/adr/0001-framework-agnostic-typescript-core.md).

## Demo

Run the Vite demo:

```bash
npm run dev
```

The demo includes:

- Customer onboarding form.
- Enterprise access request form.
- Payment details mock form.
- Live schema, current values, state, errors, and submit result.
- Feature notes explaining validation, conditional fields, and custom renderers.
- Dark mode through CSS variables.
- Custom `money` renderer.
- Links to GitHub, generated API docs, coverage, and implementation examples.

Build the static demo for GitHub Pages:

```bash
npm run build
```

The site output is written to `dist-demo`. The root contains the live demo, `dist-demo/api/` contains generated TypeDoc API documentation, and `dist-demo/coverage/` contains the generated Vitest coverage report when `npm run test:coverage` has been run before build.

## API Documentation

API documentation is generated from the public exports in `src/index.ts`:

```bash
npm run docs
```

Generated documentation is written to `dist-demo/api/` and is not committed.

## Coverage Report

Unit test coverage is generated with Vitest and the V8 coverage provider:

```bash
npm run test:coverage
```

The HTML report is written to `coverage/`. During `npm run build`, the report is copied into `dist-demo/coverage/` for GitHub Pages. Generated coverage output is not committed.

## Build Output

The package builds:

- ESM: `dist/form-schema-runtime.js`
- IIFE: `dist/form-schema-runtime.iife.js`
- CSS: `dist/form-schema-runtime.css`
- Declarations: `dist/types`

The IIFE build exposes `FormSchemaRuntime`.

## Scripts

```bash
npm run dev
npm run build
npm run build:lib
npm run build:demo
npm run build:docs
npm run build:coverage
npm run docs
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run test:watch
npm run test:e2e
npm run test:e2e:ui
npm run preview
```

## Testing Strategy

Unit tests use Vitest and jsdom. Coverage includes schema normalization, validators, custom validators, state tracking, reset behavior, conditional logic, renderer registry behavior, DOM rendering, and accessibility attributes where practical.

Playwright E2E tests cover the built static demo under the GitHub Pages base path, schema switching, required validation, error summary focus, conditional fields, reset, dark mode, inspector panels, project links, and basic keyboard navigation.

Coverage is generated from the unit suite with V8 coverage and published under `/coverage/` as part of the GitHub Pages artifact.

The public feature checklist is maintained in [docs/feature-matrix.md](docs/feature-matrix.md).

## CI/CD

GitHub Actions runs a simple verification pipeline:

```txt
checkout
setup Node
npm ci
typecheck
lint
unit tests
coverage report
build library, demo, API docs, and coverage page
install Playwright browsers
Playwright tests
upload Pages artifact on main
deploy Pages on main
```

No generated coverage reports or generated docs are committed.

## Trade-Offs

This v1 intentionally does not include:

- Drag-and-drop visual builders.
- Arbitrary JavaScript expressions inside schemas.
- A generic rules engine.
- Repeatable or nested array forms.
- Async validation.
- Framework-specific adapters.

These boundaries keep the runtime small, deterministic, and easy to embed in non-framework applications.
