# Feature Verification Matrix

This checklist tracks public runtime features against implementation, documentation, demo coverage, and automated tests.

## Fields and Attributes

| Feature | Implemented | Documented | Demo | Tests |
| --- | --- | --- | --- | --- |
| text, email, number, password, textarea | yes | README, API docs | customer onboarding, payment details | unit, e2e |
| select, checkbox, radio | yes | README, API docs | enterprise access request | unit, e2e |
| section/group | yes | README, API docs | customer onboarding | unit |
| label and placeholder | yes | README, API docs | customer onboarding | unit |
| help text | yes | README, API docs | all examples | unit |
| disabled and readonly | yes | README, API docs | enterprise access request | e2e |
| required fields | yes | README, API docs | all examples | unit, e2e |
| options | yes | README, API docs | select and radio examples | unit, e2e |
| initial values | yes | README, API docs | all examples | unit, e2e |

## Validation and State

| Feature | Implemented | Documented | Demo | Tests |
| --- | --- | --- | --- | --- |
| required, minLength, maxLength | yes | README, API docs | customer onboarding | unit, e2e |
| min, max | yes | README, API docs | customer onboarding, payment details | unit, e2e |
| pattern | yes | README, API docs | enterprise access request, payment details | unit, e2e |
| email validation | yes | README, API docs | customer onboarding | unit, e2e |
| custom synchronous validator | yes | README, API docs, examples | customer onboarding | unit |
| field-level errors | yes | README | all examples | unit, e2e |
| form-level error summary | yes | README | all examples | unit, e2e |
| current values, touched, dirty, validity | yes | README, API docs | inspector panels | unit, e2e |
| getValues, setValues, validate, reset, destroy | yes | README, API docs | rendered form controls | unit |
| submit, change, validation error, reset hooks | yes | README, API docs | submit/status panels | unit, e2e |

## Conditions and Customization

| Feature | Implemented | Documented | Demo | Tests |
| --- | --- | --- | --- | --- |
| equals, notEquals, includes, exists | yes | README, API docs | equals conditions | unit, e2e |
| simple AND condition arrays | yes | README, API docs | not highlighted | unit |
| CSS variables and stable classes | yes | README, API docs | light/dark demo styles | unit |
| classPrefix | yes | README, API docs | not highlighted | unit |
| custom field renderer registry | yes | README, API docs, examples | payment details | unit, e2e |

## Accessibility and Security

| Feature | Implemented | Documented | Demo | Tests |
| --- | --- | --- | --- | --- |
| label/input association | yes | README | all examples | unit |
| aria-invalid and aria-describedby | yes | README | validation flows | unit, e2e |
| error summary links and focus behavior | yes | README | validation flows | unit, e2e |
| native keyboard-friendly controls | yes | README | all examples | e2e |
| no unsafe HTML injection for schema text | yes | README | payment details notes | unit |
| no eval, Function constructor, or executable schema expressions | yes | README, AGENTS | architecture boundary | source audit |
| explicitly handled schema attributes | yes | README, AGENTS | all examples | unit |
