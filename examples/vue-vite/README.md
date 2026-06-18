# Vue Vite Example

This is a small Vue consumer app for the published `form-schema-runtime` package.

```bash
npm install
npm run dev
npm run build
```

Vue owns the host element and lifecycle. The form runtime owns only the DOM inside the `ref` container and is destroyed in `onUnmounted`.
