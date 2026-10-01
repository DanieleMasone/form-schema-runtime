# Framework Consumer Examples

These examples are separate consumer applications for the published `form-schema-runtime` npm package. They are not adapters, they are not part of the core runtime, and they are intentionally excluded from the npm package tarball.

Each example imports the public package:

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

For a consumer application, install the runtime from npm:

```bash
npm install form-schema-runtime
```

The framework owns the host container and page lifecycle. `form-schema-runtime` owns only the DOM inside the container passed to `createForm`.

All three examples use the same "enterprise access request" scenario. They demonstrate required validation, email validation, conditional visibility, a synchronous custom validator, a custom department renderer, scoped CSS variable overrides, submit handling, a small runtime state snapshot, and `form.destroy()` cleanup.

## Examples

- [React Vite](react-vite/): mounts the runtime with `useRef` and `useEffect`.
- [Vue Vite](vue-vite/): mounts the runtime with `ref`, `onMounted`, and `onUnmounted`.
- [Angular](angular/): mounts the runtime from a standalone component with `ViewChild`, `ElementRef`, `AfterViewInit`, and `OnDestroy`.

## Published Pages Routes

- [React example](https://danielemasone.github.io/form-schema-runtime/examples/react/)
- [Vue example](https://danielemasone.github.io/form-schema-runtime/examples/vue/)
- [Angular example](https://danielemasone.github.io/form-schema-runtime/examples/angular/)

The Pages routes are built from the consumer apps and copied into `dist-demo/examples/`. Generated output stays out of git.

## Build For Pages

From the repository root:

```bash
npm run build
npm run build:examples
npm run test:examples
```

`build:examples` installs each example with `npm ci` using its committed lockfile, builds it with the correct GitHub Pages base path, and copies the static output to `dist-demo/examples/react/`, `dist-demo/examples/vue/`, and `dist-demo/examples/angular/`. `test:examples` checks package imports, lifecycle patterns, custom validators, custom renderers, CSS variable theming, package exclusion, and the built Pages output.

## Run An Example

Run commands inside one example directory:

```bash
npm ci
npm run build
npm run dev
npm run preview
```

Use Node 24 LTS (24.15 or newer) and the npm version declared in the root `packageManager`. Commit each example's lockfile when manually updating dependencies. This repository does not commit example `node_modules`, generated build output, or package tarballs.

## Why No Framework Adapters

The core runtime is framework-agnostic on purpose. Framework applications can integrate it at their DOM boundary without adding React, Vue, Angular, or Svelte dependencies to the runtime package. Use framework-native forms instead when every field needs to be a framework component, async validator, field array, or framework-specific form-control abstraction.
