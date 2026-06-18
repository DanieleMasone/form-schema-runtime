# Feature Verification Matrix

This checklist tracks public runtime capabilities against implementation, documentation, demo coverage, unit tests, and Playwright coverage. "Partial" means the behavior is covered indirectly or in focused docs but is not highlighted as a standalone demo workflow.

## Fields

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| text, email, number, password | yes | README, Schema Reference, API docs | yes | yes | yes |
| textarea | yes | Schema Reference, Real-World Examples, API docs | yes | yes | partial |
| select | yes | Schema Reference, Usage Guide, API docs | yes | yes | yes |
| checkbox | yes | Schema Reference, Real-World Examples, API docs | yes | yes | yes |
| radio | yes | Schema Reference, Real-World Examples, API docs | yes | yes | yes |
| section/group | yes | Schema Reference, Usage Guide, API docs | yes | yes | partial |

## Field Features

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| labels | yes | Accessibility Guide, Schema Reference | yes | yes | yes |
| placeholder | yes | Schema Reference, Real-World Examples | yes | yes | partial |
| help text | yes | Accessibility Guide, Schema Reference | yes | yes | yes |
| required indicator and native required | yes | Accessibility Guide, Validation Guide | yes | yes | yes |
| disabled fields | yes | Schema Reference, Real-World Examples | yes | yes | yes |
| readonly fields | yes | Schema Reference, Real-World Examples | yes | yes | yes |
| default values | yes | Usage Guide, Schema Reference | yes | yes | yes |
| initial values | yes | Usage Guide, Integration Guide | yes | yes | yes |
| options | yes | Schema Reference, Real-World Examples | yes | yes | yes |
| duplicate option protection | yes | Schema Reference | no | yes | no |

## Validation

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| required | yes | Validation Guide, Accessibility Guide | yes | yes | yes |
| minLength and maxLength | yes | Validation Guide, Real-World Examples | yes | yes | partial |
| min and max | yes | Validation Guide, Real-World Examples | yes | yes | yes |
| pattern | yes | Validation Guide, Real-World Examples | yes | yes | yes |
| email validation | yes | Validation Guide, Real-World Examples | yes | yes | yes |
| custom synchronous validators | yes | Validation Guide, Customization Guide, examples | yes | yes | partial |
| custom validation messages | yes | Validation Guide, Schema Reference | partial | yes | no |
| hidden conditional fields skipped by validation | yes | Validation Guide, Usage Guide | yes | yes | yes |
| field-level errors | yes | Accessibility Guide, Validation Guide | yes | yes | yes |
| form-level error summary | yes | Accessibility Guide, Validation Guide | yes | yes | yes |

## State

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| current values | yes | Usage Guide, API docs | yes | yes | yes |
| touched fields | yes | Usage Guide, API docs | yes | yes | yes |
| dirty fields | yes | Usage Guide, API docs | yes | yes | yes |
| visible fields | yes | Usage Guide, API docs | yes | yes | yes |
| validity snapshot | yes | Usage Guide, API docs | yes | yes | yes |
| `getValues()` | yes | Usage Guide, API docs | yes | yes | partial |
| `setValues()` | yes | Usage Guide, API docs | partial | yes | no |
| `validate()` | yes | Usage Guide, API docs | yes | yes | yes |
| `reset()` | yes | Usage Guide, API docs | yes | yes | yes |
| `destroy()` | yes | Usage Guide, Integration Guide, API docs | no | yes | no |
| defensive value snapshots | yes | Usage Guide | no | yes | no |

## Conditions

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| equals | yes | Schema Reference, Usage Guide | yes | yes | yes |
| notEquals | yes | Schema Reference, Real-World Examples | partial | yes | no |
| includes | yes | Schema Reference, Real-World Examples | partial | yes | no |
| exists | yes | Schema Reference, Real-World Examples | partial | yes | no |
| simple AND arrays | yes | Schema Reference, Real-World Examples | partial | yes | no |
| arbitrary JavaScript expressions | no | Market Positioning, README | no | source audit | no |

## Customization

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| CSS variables | yes | Customization Guide | yes | partial | yes |
| stable CSS classes | yes | Customization Guide | yes | yes | yes |
| `classPrefix` | yes | Customization Guide, Integration Guide | partial | yes | no |
| event hooks | yes | Usage Guide, API docs | yes | yes | yes |
| custom validators | yes | Validation Guide, Customization Guide, examples | yes | yes | partial |
| custom field renderers | yes | Customization Guide, examples, API docs | yes | yes | yes |
| renderer listener cleanup | yes | Customization Guide, API docs | no | yes | no |

## Accessibility

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| native controls | yes | Accessibility Guide, README | yes | yes | yes |
| label/input association | yes | Accessibility Guide | yes | yes | yes |
| required communicated visibly and natively | yes | Accessibility Guide, Validation Guide | yes | yes | yes |
| help text in `aria-describedby` only when present | yes | Accessibility Guide | yes | yes | yes |
| error text in `aria-describedby` only when present | yes | Accessibility Guide | yes | yes | yes |
| `aria-invalid` on invalid controls | yes | Accessibility Guide | yes | yes | yes |
| error summary role and focus | yes | Accessibility Guide, Validation Guide | yes | yes | yes |
| summary links focus invalid controls | yes | Accessibility Guide | yes | yes | yes |
| keyboard navigation through native controls | yes | Accessibility Guide | yes | partial | yes |

## Security

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| schema labels rendered as text | yes | Security notes in docs | partial | yes | no |
| help text rendered as text | yes | Security notes in docs | partial | yes | no |
| option labels rendered as text | yes | Security notes in docs | partial | yes | no |
| validation messages rendered as text | yes | Security notes in docs | partial | yes | no |
| no `innerHTML` for schema-provided content | yes | README, Accessibility Guide | source audit | yes | no |
| no `eval` or `Function` constructors | yes | README, Market Positioning | source audit | source audit | no |
| no blind schema attribute spreading | yes | README, AGENTS | source audit | yes | no |

## Release and Package

| Capability | Implemented | Documented | Demo | Unit tests | E2E tests |
| --- | --- | --- | --- | --- | --- |
| aligned lockfile for `npm ci` | yes | Release Process | no | install check | CI |
| package metadata verification | yes | Release Process | no | release script | CI/release |
| package contents verification | yes | Release Process | no | release script | release |
| Trusted Publishing/OIDC release workflow | yes | Release Process | no | workflow audit | no |
| GitHub Pages artifact docs structure | yes | Release Process | yes | build check | yes |
| framework consumer examples excluded from npm package | yes | Integration Guide, examples README | links | `test:examples`, release script | yes |
