# Angular Example

This is a small Angular standalone consumer app for the published `form-schema-runtime` package.

It uses Angular 21 so it works with the current Node 20, 22, and 24 ranges supported by Angular without requiring the newer Angular 22 Node floor.

For your own Angular app, install the runtime from npm:

```bash
npm install form-schema-runtime
```

```bash
npm install
npm run dev
npm run build
npm run preview
```

Angular owns the standalone component and host element. The form runtime owns only the DOM inside the `ViewChild` container and is destroyed in `ngOnDestroy`.

The Pages build is produced from the repository root with `npm run build:examples`, which sets the base href to `/form-schema-runtime/examples/angular/`. No Angular adapter is needed because Angular only provides the host element and lifecycle.
