# Market Positioning

`form-schema-runtime` is intentionally a small runtime, not a product platform. It renders accessible native HTML forms from declarative schemas in places where a frontend framework cannot be assumed.

## What It Is

- A typed TypeScript runtime for schema-to-DOM form rendering.
- A plain DOM integration point for legacy pages, server-rendered applications, embedded widgets, and mixed frontend estates.
- A small validation and state layer for deterministic synchronous form behavior.
- A safe extension surface for application-owned validators, CSS, hooks, and custom field renderers.

## What It Is Not

- Not a visual form builder.
- Not a survey platform.
- Not a JSON Schema/AJV application framework.
- Not a React, Angular, Vue, or Svelte adapter package.
- Not a backend submission, storage, workflow, or approval system.
- Not a generic rule engine or executable expression language.

## Comparable Libraries

| Library or category | Primary fit | Why this project differs |
| --- | --- | --- |
| Form.io | Full form platform with hosted forms, builders, custom components, conditional logic, and submission workflows. | This project avoids platform concerns and keeps schemas non-executable. |
| JSON Forms | JSON Schema driven application forms with UI schemas, renderer sets, validation output, and framework integrations. | This project uses a smaller purpose-built schema and ships no framework renderer packages. |
| SurveyJS | Survey and questionnaire product suite with creator tooling, analytics, PDF output, branching, and enterprise workflows. | This project is a runtime library, not a survey product family. |
| Uniforms | React forms built from schema bridges and theme packages. | This project does not require React and does not ship themed framework components. |
| React Hook Form | React-first form state, validation integration, and resolver ecosystem. | This project renders DOM from schemas outside React. |
| Formik | React-first form state helpers for values, validation, visited fields, and submission. | This project targets non-React and mixed-framework surfaces. |
| Angular Reactive Forms | Angular-native model-driven forms, validators, controls, and template integration. | This project does not depend on Angular runtime or directives. |
| final-form | Framework-agnostic form state subscriptions and field registration. | This project also renders native controls from declarative schemas. |
| Zod, Yup, Valibot | Data validation and parsing libraries. | These can complement applications, but they do not render accessible form DOM. |

## V1 Capability Baseline

For this project to be credible as a v1 library, it needs:

- Common native field types: text, email, number, password, textarea, select, checkbox, radio, and sections.
- Deterministic synchronous validation: required, length, range, pattern, email, and named custom validators.
- Form state access: current values, touched fields, dirty fields, visible fields, validity, reset, validation, and destroy.
- Small declarative visibility rules: equality, inequality, includes, exists, and simple AND arrays.
- Stable customization: CSS variables, class prefixing, event hooks, and a custom renderer registry.
- Accessibility and DOM safety by default: native controls, labels, described-by wiring, invalid state, linked error summary, no unsafe HTML injection, and no executable schema expressions.
- Release hygiene: deterministic `npm ci`, aligned lockfile, package metadata, verified package contents, release notes, and Trusted Publishing/OIDC.

Those capabilities are already within the project scope. The right v1 hardening path is documentation, tests, demo coverage, and release verification rather than adding larger product features.

## Market Conclusion

The clearest market position is: a tiny, typed, framework-agnostic rendering runtime with strong accessibility and DOM-safety defaults for enterprise and legacy-friendly surfaces. It should not compete directly with full form platforms, survey suites, framework form libraries, schema validators, or visual builders.

The project is credible when consumers can answer four questions from the README and docs:

- How do I install and render a form?
- Which schema features are supported and intentionally unsupported?
- How do I integrate it into my host application lifecycle?
- What exactly ships to npm and how is it released?

## Explicit Non-Goals

- Async validation remains out of scope because it introduces lifecycle, cancellation, loading state, and backend policy concerns.
- Framework adapters remain out of scope because the core value is embedding in non-framework and mixed legacy surfaces.
- Visual builders remain out of scope because they turn the runtime into a product platform.
- Nested repeatable arrays remain out of scope for v1 because they require a larger state, validation, and accessibility model.
- Full rule engines remain out of scope because they increase complexity and can drift toward executable schema logic.
- Backend submission, storage, auth, and workflow automation remain outside the runtime boundary.
