# React Vite Example

This is a small React consumer app for the published `form-schema-runtime` package.

```bash
npm install
npm run dev
npm run build
npm run preview
```

React owns the host container and lifecycle. The form runtime owns only the DOM inside the referenced container and is destroyed in the effect cleanup.

The Pages build is produced from the repository root with `npm run build:examples`, which sets the base path to `/form-schema-runtime/examples/react/`. No React adapter is needed because React only provides the host element and lifecycle.
