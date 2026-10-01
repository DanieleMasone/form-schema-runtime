# Angular Example

This is a small Angular standalone consumer app for the published `form-schema-runtime` package.

It uses Angular 22 and TypeScript 6. For the repository build, use Node 24 LTS (24.15 or newer) and the npm version declared in the root `packageManager`. The official Angular migration makes `ChangeDetectionStrategy.Eager` explicit to preserve the example's change detection behavior.

It demonstrates an enterprise access request form with required fields, email validation, conditional privileged-access justification, a synchronous company email validator, a custom department renderer, scoped CSS variable overrides, submit output, and a compact runtime state snapshot.

For your own Angular app, install the runtime from npm:

```bash
npm install form-schema-runtime
```

```bash
npm ci
npm run dev
npm run build
npm run preview
```

Angular owns the standalone component and host element through `ViewChild`, `ElementRef`, and `AfterViewInit`. The form runtime owns only the DOM inside the `ViewChild` container and is destroyed in `ngOnDestroy`, which prevents leaked listeners when Angular tears down the component.

The Pages build is produced from the repository root with `npm run build:examples`, which sets the base href to `/form-schema-runtime/examples/angular/`. No Angular adapter is needed because Angular only provides the host element and lifecycle, and the example intentionally does not wrap runtime fields in Angular Reactive Forms. The default runtime CSS is imported globally, and local styles scope the theme with CSS variables under `.runtime-theme`.
