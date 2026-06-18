# Form Schema Runtime

[![CI](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Library_Mode-646CFF?logo=vite)
![Accessibility](https://img.shields.io/badge/Accessibility-First-success)
![Framework](https://img.shields.io/badge/Framework-Agnostic-0F172A)

Framework-agnostic TypeScript runtime for rendering accessible, customizable HTML forms from declarative JSON schemas.

It targets enterprise and legacy-friendly frontend surfaces where React, Angular, Vue, or Svelte cannot always be introduced, but teams still need typed schemas, validation, state hooks, accessible native controls, and safe DOM rendering.

- Live demo: [danielemasone.github.io/form-schema-runtime](https://danielemasone.github.io/form-schema-runtime/)
- API docs: [danielemasone.github.io/form-schema-runtime/api/](https://danielemasone.github.io/form-schema-runtime/api/)
- Coverage report: [danielemasone.github.io/form-schema-runtime/coverage/](https://danielemasone.github.io/form-schema-runtime/coverage/)
- Framework examples: [React](https://danielemasone.github.io/form-schema-runtime/examples/react/), [Vue](https://danielemasone.github.io/form-schema-runtime/examples/vue/), [Angular](https://danielemasone.github.io/form-schema-runtime/examples/angular/)

## Installation

```bash
npm install form-schema-runtime
```

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

## Quick Start

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

Use the returned instance for `getValues`, `setValues`, `validate`, `reset`, and `destroy`. See the usage guide for the full lifecycle.

## Documentation

- [Usage Guide](docs/usage-guide.md)
- [Schema Reference](docs/schema-reference.md)
- [Validation Guide](docs/validation-guide.md)
- [Customization Guide](docs/customization-guide.md)
- [Accessibility Guide](docs/accessibility-guide.md)
- [Integration Guide](docs/integration-guide.md)
- [Real-World Examples](docs/real-world-examples.md)
- [Framework Consumer Examples](examples/README.md)
- [React Vite Example](examples/react-vite/)
- [Vue Vite Example](examples/vue-vite/)
- [Angular Example](examples/angular/)
- [Release Process](docs/release-process.md)
- [Generated API Docs](https://danielemasone.github.io/form-schema-runtime/api/)
- [Feature Matrix](docs/feature-matrix.md)
- [Market Positioning](docs/market-positioning.md)
- [Coverage Report](https://danielemasone.github.io/form-schema-runtime/coverage/)

## Architecture

The public API lives in `src/index.ts`. Schema normalization, validation, state, condition evaluation, DOM helpers, and renderers stay separated so each concern remains testable.

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

The library renders native controls into a caller-provided container. Schema text is treated as untrusted data and rendered with DOM APIs rather than `innerHTML`.

## Build And Test

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
npm run build:examples
npm run test:consumer
npm run test:examples
npm run test:e2e
```

`npm run build` produces the library package, the GitHub Pages demo, TypeDoc API docs, copied Markdown docs, and the coverage page when coverage has been generated.

`npm run build:examples` builds the React, Vue, and Angular consumer apps and copies them into the Pages artifact under `/examples/react/`, `/examples/vue/`, and `/examples/angular/`.

## Release

Releases are GitHub Release driven. Publishing to npm is handled by a dedicated release workflow using npm Trusted Publishing/OIDC, with no long-lived npm publish token in GitHub secrets.

`v1.0.0` is the first stable release. Historical notes for `v0.1.0` and `v0.1.1` are documented in the release process. npm versions cannot be overwritten, so each release needs a new `package.json` version and matching GitHub Release tag.

See [docs/release-process.md](docs/release-process.md) for setup, tag conventions, verification, publishing, provenance, and failure handling.

## Trade-Offs

This v1 intentionally does not include:

- Drag-and-drop visual builders.
- Arbitrary JavaScript expressions inside schemas.
- A generic rules engine.
- Repeatable or nested array forms.
- Async validation.
- Framework-specific adapters.
- Backend submission or storage.

Those boundaries keep the runtime small, deterministic, and easy to embed in non-framework applications.
