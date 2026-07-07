# React Vite Example

This is a small React consumer app for the published `form-schema-runtime` package.

It demonstrates an enterprise access request form with required fields, email validation, conditional privileged-access justification, a synchronous company email validator, a custom department renderer, scoped CSS variable overrides, submit output, and a compact runtime state snapshot.

For your own React app, install the runtime from npm:

```bash
npm install form-schema-runtime
```

```bash
npm install
npm run dev
npm run build
npm run preview
```

React owns the host container and lifecycle through `useRef` and `useEffect`. The form runtime owns only the DOM inside the referenced container and is destroyed in the effect cleanup, which prevents leaked listeners during route changes or React StrictMode remounts.

The Pages build is produced from the repository root with `npm run build:examples`, which sets the base path to `/form-schema-runtime/examples/react/`. No React adapter is needed because React only provides the host element and lifecycle. The default runtime CSS is imported once, and local styles scope the theme with CSS variables under `.runtime-theme`.
