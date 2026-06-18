# Framework Consumer Examples

These examples are separate consumer applications for the published `form-schema-runtime` npm package. They are not adapters, they are not part of the core runtime, and they are intentionally excluded from the npm package tarball.

Each example imports the public package:

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

The framework owns the host container and page lifecycle. `form-schema-runtime` owns only the DOM inside the container passed to `createForm`.

## Examples

- [React Vite](react-vite/): mounts the runtime with `useRef` and `useEffect`.
- [Vue Vite](vue-vite/): mounts the runtime with `ref`, `onMounted`, and `onUnmounted`.
- [Angular](angular/): mounts the runtime from a standalone component with `ViewChild`, `AfterViewInit`, and `OnDestroy`.

## Verify Example Structure

From the repository root:

```bash
npm run test:examples
```

This checks that each example has a valid package manifest, uses the published npm package import, imports the runtime CSS, and avoids local source imports.

It does not install or build React, Vue, and Angular on every root verification run. Build the individual consumer apps when changing their source or dependency ranges.

## Run An Example

Run commands inside one example directory:

```bash
npm install
npm run build
npm run dev
```

Use the package manager lockfile policy of the consuming application. This repository does not commit example `node_modules`, generated build output, or package tarballs.

## Why No Framework Adapters

The core runtime is framework-agnostic on purpose. Framework applications can integrate it at their DOM boundary without adding React, Vue, Angular, or Svelte dependencies to the runtime package.
