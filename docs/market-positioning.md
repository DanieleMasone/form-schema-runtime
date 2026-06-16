# Market Positioning

`form-schema-runtime` is intentionally a small runtime, not a platform. It focuses on rendering accessible native HTML forms from declarative schemas in places where a frontend framework cannot be assumed.

## Comparable Libraries

- Form.io provides a broad form platform with complex conditionals, validation criteria, and builder-oriented workflows. It is useful when teams need a complete form system, not when they need a small embeddable runtime.
- JSON Forms is schema driven, renderer based, and strong for application teams that already want framework integrations and JSON Schema/AJV style validation.
- Uniforms is a React form library with schema bridges and theme packages. It is attractive in React applications, but its value depends on the React ecosystem.
- React Hook Form and its resolver ecosystem are excellent for React state management and validation integration, but they are not framework agnostic.
- Angular Reactive Forms is a model-driven forms system inside Angular. It provides strong state and validation primitives, but requires Angular and its template/directive model.
- SurveyJS covers survey/product workflows with many question types, creator tooling, branching, theming, and enterprise features. It is intentionally much broader than this project.
- final-form focuses on form state subscriptions and field registration. It is not a schema-to-DOM runtime by itself.
- Zod and Yup style libraries are validation/schema tools. They are useful companions in some products, but they do not render accessible DOM forms.

## V1 Capability Baseline

For this project to be credible as a v1 library, it needs:

- Common native field types: text, email, number, password, textarea, select, checkbox, radio, and sections.
- Deterministic synchronous validation: required, length, range, pattern, email, and named custom validators.
- Form state access: current values, touched fields, dirty fields, validity, reset, validation, and destroy.
- Small declarative visibility rules: equality, inequality, includes, exists, and simple AND arrays.
- Stable customization: CSS variables, class prefixing, event hooks, and a custom renderer registry.
- Accessibility and DOM safety by default: native controls, labels, described-by wiring, invalid state, linked error summary, no unsafe HTML injection, and no executable schema expressions.

Those capabilities are already within the project scope. The right hardening path is documentation, tests, demo coverage, and CI alignment rather than adding larger product features.

## Explicit Non-Goals

- Async validation remains out of scope because it introduces lifecycle, cancellation, loading state, and backend policy concerns.
- Framework adapters remain out of scope because the core value is embedding in non-framework and mixed legacy surfaces.
- Visual builders remain out of scope because they turn the runtime into a product platform.
- Nested repeatable arrays remain out of scope for v1 because they require a larger state, validation, and accessibility model.
- Full rule engines remain out of scope because they increase complexity and can drift toward executable schema logic.
- Backend submission, storage, auth, and workflow automation remain outside the runtime boundary.

## Positioning Statement

`form-schema-runtime` should compete as a tiny, typed, framework-agnostic rendering runtime with a strong accessibility and security baseline. It should not compete with full form platforms, survey suites, framework form libraries, schema validators, or visual form builders.
