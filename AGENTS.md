# AGENTS.md

## Project Overview

`form-schema-runtime` is a lightweight, framework-agnostic TypeScript library that renders accessible HTML forms from declarative JSON schemas. It targets enterprise and legacy-friendly frontend surfaces where React, Angular, Vue, or Svelte cannot always be introduced.

## Architecture Boundaries

- Public API lives in `src/index.ts`.
- Schema types live in `src/schema/`.
- Validation must stay independent from DOM rendering.
- State must stay testable without depending on browser rendering.
- Conditions must remain intentionally small: equality, inequality, includes, exists, and simple AND arrays.
- DOM helpers and renderers must use explicit element creation.

## Public API Rules

- Do not widen the public API casually.
- Prefer stable types and small hooks over new lifecycle abstractions.
- Keep `createForm`, `CreateFormOptions`, `FormInstance`, schema types, custom validators, and custom renderers as the core surface.
- Do not expose internal normalization, validation, state, or renderer implementation details unless there is a clear consumer need.

## Testing Expectations

- Update tests when behavior changes.
- Use Vitest for schema, validation, state, condition, renderer, DOM, and accessibility-oriented behavior.
- Use Playwright for the built demo and GitHub Pages-style preview.
- Keep tests deterministic and avoid testing implementation details when behavior is enough.

## Accessibility Rules

- Labels must be associated with native controls.
- Invalid fields must use `aria-invalid`.
- Help and error text must be referenced by `aria-describedby` only when present.
- Error summary links must focus invalid controls.
- Prefer native controls over custom widgets.
- Required fields must be communicated through visible text and native attributes.

## Security and DOM Safety

- Do not use `innerHTML` for schema-provided content.
- Treat labels, help text, placeholders, option labels, validation messages, and summary text as untrusted.
- Do not execute schema-provided code.
- Do not support arbitrary JavaScript expressions, `eval`, or `Function` constructors.
- Do not blindly spread schema attributes onto DOM nodes.

## CI and Build Expectations

- Keep CI to meaningful steps: install, typecheck, lint, unit tests, coverage, build, Playwright, and Pages deployment.
- Prefer the latest Active LTS Node for CI. Use Current Node only when there is a concrete compatibility reason.
- Keep the lockfile aligned with the `packageManager` version declared in `package.json`.
- Keep npm, `packageManager`, and `package-lock.json` in sync; verify with `npm ci` before treating dependency work as complete.
- Keep TypeScript and TypeDoc on an officially supported pairing. Do not rely on a passing build when TypeDoc's declared peer range excludes the TypeScript version.
- Do not add matrix builds unless there is a demonstrated compatibility reason.
- Do not commit generated build outputs.
- Do not commit generated coverage reports.
- Do not commit generated TypeDoc output; it belongs in the Pages artifact.
- Keep `npm run build` producing the library, demo, API docs, and coverage page when coverage has been generated.
- Pages artifact structure should remain root demo, `/api/` TypeDoc, and `/coverage/` Vitest coverage.
- Avoid dependency bloat; do not keep direct dependencies, scripts, or generated artifacts that are only transitive toolchain details.

## Documentation Expectations

- Keep README aligned with actual implementation.
- Add meaningful English JSDoc for public and semi-public runtime types, hooks, render contexts, validators, state snapshots, and errors.
- Comment complex internal flows only where the comment explains an invariant, lifecycle edge, accessibility behavior, or cleanup responsibility.
- Document extension points that exist today.
- Keep usage documentation aligned with the public API, schema model, validation behavior, customization hooks, accessibility behavior, and lifecycle semantics.
- Update usage docs when schema, validation, customization, accessibility, integration, or lifecycle behavior changes.
- Do not document unsupported features or imply that non-goals are available.
- Do not turn README into a full manual; link to focused docs under `docs/`.
- Keep demo documentation links working in the GitHub Pages artifact.
- Keep examples executable or close to executable.
- Keep `docs/market-positioning.md` aligned with the library's framework-agnostic position and explicit non-goals.
- Avoid speculative Roadmap sections unless explicitly requested.
- Keep generated API docs focused on public exports from `src/index.ts`.
- Keep GitHub Pages useful and deployable: root demo plus `/api/` docs and `/coverage/` report.
- Keep the demo useful on desktop and mobile: no horizontal overflow, readable inspector panels, usable native controls, and visible links to API docs and coverage.
- Keep demo UI helpers, schema metadata, and repeated rendering helpers centralized when it improves readability.

## What Not To Do

- Do not introduce framework dependencies into the core runtime.
- Do not implement a generic rules engine.
- Do not add async validation unless explicitly requested.
- Do not add drag-and-drop builder features.
- Do not add backend code.
- Do not add more built-in field types unless the request is explicit and low risk.
- Do not use decorators, observables, dependency injection containers, or state machines without a concrete need.
