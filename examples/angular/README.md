# Angular Example

This is a small Angular standalone consumer app for the published `form-schema-runtime` package.

It uses Angular 21 so it works with the current Node 20, 22, and 24 ranges supported by Angular without requiring the newer Angular 22 Node floor.

```bash
npm install
npm run dev
npm run build
```

Angular owns the standalone component and host element. The form runtime owns only the DOM inside the `ViewChild` container and is destroyed in `ngOnDestroy`.
