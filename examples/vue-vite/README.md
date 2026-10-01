# Vue Vite Example

This is a small Vue consumer app for the published `form-schema-runtime` package.

It demonstrates an enterprise access request form with required fields, email validation, conditional privileged-access justification, a synchronous company email validator, a custom department renderer, scoped CSS variable overrides, submit output, and a compact runtime state snapshot.

For your own Vue app, install the runtime from npm:

```bash
npm install form-schema-runtime
```

```bash
npm ci
npm run dev
npm run build
npm run preview
```

Vue owns the host element and lifecycle through `ref`, `onMounted`, and `onUnmounted`. The form runtime owns only the DOM inside the `ref` container and is destroyed in `onUnmounted`, which prevents leaked listeners when the view unmounts.

The Pages build is produced from the repository root with `npm run build:examples`, which sets the base path to `/form-schema-runtime/examples/vue/`. No Vue adapter is needed because Vue only provides the host element and lifecycle. The default runtime CSS is imported once, and local styles scope the theme with CSS variables under `.runtime-theme`.
