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

## Examples

- [React Vite](react-vite/): mounts the runtime with `useRef` and `useEffect`.
- [Vue Vite](vue-vite/): mounts the runtime with `ref`, `onMounted`, and `onUnmounted`.
- [Angular](angular/): mounts the runtime from a standalone component with `ViewChild`, `AfterViewInit`, and `OnDestroy`.

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

`build:examples` installs each example with `npm install --package-lock=false`, builds it with the correct GitHub Pages base path, and copies the static output to `dist-demo/examples/react/`, `dist-demo/examples/vue/`, and `dist-demo/examples/angular/`. `test:examples` checks package imports, lifecycle patterns, package exclusion, and the built Pages output.

## Run An Example

Run commands inside one example directory:

```bash
npm install
npm run build
npm run dev
npm run preview
```

Use the package manager lockfile policy of the consuming application. This repository does not commit example `node_modules`, generated build output, or package tarballs.

## Why No Framework Adapters

The core runtime is framework-agnostic on purpose. Framework applications can integrate it at their DOM boundary without adding React, Vue, Angular, or Svelte dependencies to the runtime package.
