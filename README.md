# Form Schema Runtime

[![CI](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/form-schema-runtime)](https://www.npmjs.com/package/form-schema-runtime)
[![coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fdanielemasone.github.io%2Fform-schema-runtime%2Fbadges%2Fcoverage.json)](https://danielemasone.github.io/form-schema-runtime/coverage/)

Framework-agnostic TypeScript runtime for rendering accessible, customizable HTML forms from declarative JSON schemas.

It targets enterprise and legacy-friendly frontend surfaces where React, Angular, Vue, or Svelte cannot always be introduced, but teams still need typed schemas, validation, state hooks, accessible native controls, and safe DOM rendering.

- Live demo: [danielemasone.github.io/form-schema-runtime](https://danielemasone.github.io/form-schema-runtime/)
- Documentation: [danielemasone.github.io/form-schema-runtime/docs/](https://danielemasone.github.io/form-schema-runtime/docs/)
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

Use the returned instance for `getValues`, `setValues`, `validate`, `reset`, and `destroy`. See the [Usage Guide](https://danielemasone.github.io/form-schema-runtime/docs/usage-guide/) for the full lifecycle.

## Documentation

- Start at the [Documentation Index](https://danielemasone.github.io/form-schema-runtime/docs/).
- Guides: [Usage](https://danielemasone.github.io/form-schema-runtime/docs/usage-guide/), [Schema](https://danielemasone.github.io/form-schema-runtime/docs/schema-reference/), [Validation](https://danielemasone.github.io/form-schema-runtime/docs/validation-guide/), [Customization](https://danielemasone.github.io/form-schema-runtime/docs/customization-guide/), [Accessibility](https://danielemasone.github.io/form-schema-runtime/docs/accessibility-guide/), [Integration](https://danielemasone.github.io/form-schema-runtime/docs/integration-guide/), and [Real-World Examples](https://danielemasone.github.io/form-schema-runtime/docs/real-world-examples/).
- Project reference: [Feature Matrix](https://danielemasone.github.io/form-schema-runtime/docs/feature-matrix/), [Market Positioning](https://danielemasone.github.io/form-schema-runtime/docs/market-positioning/), and [Release Process](https://danielemasone.github.io/form-schema-runtime/docs/release-process/).
- Generated reports: [API Docs](https://danielemasone.github.io/form-schema-runtime/api/) and [Coverage](https://danielemasone.github.io/form-schema-runtime/coverage/).
- Framework examples: [React](https://danielemasone.github.io/form-schema-runtime/examples/react/), [Vue](https://danielemasone.github.io/form-schema-runtime/examples/vue/), and [Angular](https://danielemasone.github.io/form-schema-runtime/examples/angular/).

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
npm run test:site-docs
npm run build:examples
npm run test:consumer
npm run test:examples
npm run test:e2e
```

`npm run build` produces the library package, the GitHub Pages demo, TypeDoc API docs, generated HTML docs from the Markdown sources, and the coverage page when coverage has been generated.

`npm run build:examples` builds the React, Vue, and Angular consumer apps and copies them into the Pages artifact under `/examples/react/`, `/examples/vue/`, and `/examples/angular/`. The examples consume the published npm package and demonstrate lifecycle cleanup, custom validators, custom renderers, and CSS variable theming without framework adapters.

## Release

Releases are GitHub Release driven. Publishing to npm is handled by a dedicated release workflow using npm Trusted Publishing/OIDC, with no long-lived npm publish token in GitHub secrets.

`v1.0.0` is the first stable release. Historical notes for `v0.1.0` and `v0.1.1` are documented in the release process. npm versions cannot be overwritten, so each release needs a new `package.json` version and matching GitHub Release tag.

See the [Release Process](https://danielemasone.github.io/form-schema-runtime/docs/release-process/) for setup, tag conventions, verification, publishing, provenance, and failure handling.

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

## License

Released under the [MIT License](https://github.com/DanieleMasone/form-schema-runtime/blob/main/LICENSE).

Copyright (c) 2026 Daniele Masone.
