# Vue Vite Example

This is a small Vue consumer app for the published `form-schema-runtime` package.

For your own Vue app, install the runtime from npm:

```bash
npm install form-schema-runtime
```

```bash
npm install
npm run dev
npm run build
npm run preview
```

Vue owns the host element and lifecycle. The form runtime owns only the DOM inside the `ref` container and is destroyed in `onUnmounted`.

The Pages build is produced from the repository root with `npm run build:examples`, which sets the base path to `/form-schema-runtime/examples/vue/`. No Vue adapter is needed because Vue only provides the host element and lifecycle.
