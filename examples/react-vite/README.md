# React Vite Example

This is a small React consumer app for the published `form-schema-runtime` package.

```bash
npm install
npm run dev
npm run build
```

React owns the host container and lifecycle. The form runtime owns only the DOM inside the referenced container and is destroyed in the effect cleanup.
