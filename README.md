# Form Schema Runtime

[![CI](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Library_Mode-646CFF?logo=vite)
![Accessibility](https://img.shields.io/badge/Accessibility-First-success)
![Framework](https://img.shields.io/badge/Framework-Agnostic-0F172A)

A lightweight, framework-agnostic TypeScript library for rendering accessible and customizable HTML forms from declarative JSON schemas.

The project is designed for enterprise and legacy-friendly environments where introducing React, Angular, or Vue is not always possible or desirable, but accessibility, validation, maintainability, and developer experience remain important.

---

## Why this project exists

Many frontend form solutions are tightly coupled to a specific framework.

In real-world enterprise environments, teams often need to:

* integrate forms into legacy applications
* progressively modernize large codebases
* embed forms into server-rendered pages
* support multiple frontend stacks
* maintain accessibility and validation standards
* avoid framework lock-in

This project explores a different approach:

> A framework-independent form runtime that transforms declarative schemas into accessible HTML while providing validation, state management, conditional logic, and customization capabilities.

---

## Key Features

### Schema-Driven Forms

Define forms using declarative JSON schemas.

Supported field types:

* Text
* Email
* Number
* Password
* Textarea
* Select
* Checkbox
* Radio

Additional capabilities:

* Form sections
* Grouped fields
* Labels
* Placeholders
* Help text
* Required fields
* Disabled fields
* Readonly fields
* Initial values

---

### Validation

Built-in validation support:

* Required
* Min length
* Max length
* Min value
* Max value
* Pattern matching
* Email validation

Additional features:

* Custom validators
* Field-level errors
* Form-level error summary
* Accessible validation feedback

---

### Form State Management

The runtime tracks:

* Current values
* Initial values
* Dirty fields
* Touched fields
* Validation state
* Field errors

Public APIs support:

* Value retrieval
* Value updates
* Validation
* Reset
* Cleanup and unmount

---

### Conditional Logic

Simple declarative conditional visibility.

Example:

```ts
{
  type: "text",
  name: "companyName",
  label: "Company Name",
  visibleWhen: {
    field: "accountType",
    equals: "enterprise"
  }
}
```

Supported operators:

* equals
* notEquals
* includes
* exists

The project intentionally avoids becoming a full rules engine.

---

### Customization

Designed for integration into existing design systems.

Customization options include:

* CSS variables
* Stable CSS class names
* Configurable class prefix
* Custom renderer registry
* Event hooks

Supported hooks:

* onChange
* onSubmit
* onValidationError
* onReset

---

### Accessibility

Accessibility is a first-class requirement.

Implemented features include:

* Proper label/input associations
* Stable generated IDs
* aria-invalid support
* aria-describedby support
* Keyboard-friendly controls
* Accessible error summary
* Error navigation and focus management

---

## Installation

```bash
npm install form-schema-runtime
```

---

## Quick Start

```ts
import { createForm } from "form-schema-runtime";

const schema = {
  id: "customer-form",
  title: "Customer Form",
  fields: [
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      required: true
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true
    }
  ]
};

const form = createForm({
  container: document.querySelector("#app")!,
  schema,
  onSubmit(values) {
    console.log(values);
  }
});
```

---

## Example Schema

```ts
const schema = {
  id: "enterprise-access-request",
  title: "Enterprise Access Request",

  fields: [
    {
      type: "select",
      name: "accountType",
      label: "Account Type",
      required: true,
      options: [
        { value: "standard", label: "Standard" },
        { value: "enterprise", label: "Enterprise" }
      ]
    },

    {
      type: "text",
      name: "companyName",
      label: "Company Name",

      visibleWhen: {
        field: "accountType",
        equals: "enterprise"
      }
    }
  ]
};
```

---

## Public API

Example usage:

```ts
const form = createForm({
  container,
  schema,
  initialValues,
  validators,
  renderers,
  onChange,
  onSubmit,
  onValidationError,
  onReset
});
```

Available methods:

```ts
form.getValues();
form.setValues(values);

form.validate();

form.reset();

form.destroy();
```

The public API is intentionally small and stable.

---

## Architecture Overview

The runtime is organized into independent modules:

```txt
schema/
validation/
state/
conditions/
renderer/
dom/
styles/
```

Key design goals:

* Separation of concerns
* Testability
* Minimal public surface area
* No framework dependency
* Security-conscious DOM rendering

---

## Security Considerations

Schema content should be treated as untrusted input.

The runtime:

* Avoids arbitrary code execution
* Avoids JavaScript expression evaluation
* Avoids `eval`
* Avoids `Function` constructors
* Avoids unsafe DOM injection

User-provided content is rendered through safe DOM APIs rather than direct HTML injection.

---

## Accessibility Strategy

The project follows accessibility-first principles.

Highlights:

* Labels are never replaced by placeholders.
* Validation errors are announced and linked.
* Error summaries provide direct navigation.
* Native HTML controls are preferred whenever possible.
* Keyboard workflows remain fully supported.

Accessibility is validated through both automated and manual testing.

---

## Custom Validators

Example:

```ts
const taxCodeValidator = (value) => {
  if (!value) {
    return null;
  }

  return value.length !== 16
    ? "Tax code must contain 16 characters"
    : null;
};
```

```ts
createForm({
  container,
  schema,
  validators: {
    taxCode: taxCodeValidator
  }
});
```

Additional examples are available under:

```txt
docs/examples/custom-validators.md
```

---

## Custom Renderers

Custom renderers allow consumers to extend supported field types without modifying the core runtime.

Example use cases:

* Currency fields
* Phone fields
* Date pickers
* Enterprise-specific controls

Additional examples are available under:

```txt
docs/examples/custom-renderers.md
```

---

## Demo Application

The repository includes a Vite-powered demo application featuring:

### Customer Onboarding

Typical customer registration workflow.

### Enterprise Access Request

Internal access provisioning scenario.

### Payment Details

Mock payment form demonstrating validation and conditional behavior.

The demo also includes:

* Live schema visualization
* Form state inspection
* Dark mode
* Accessibility demonstrations

---

## Testing Strategy

### Unit Tests

Implemented with Vitest.

Coverage includes:

* Schema normalization
* Validation
* State management
* Conditional logic
* Renderer registry
* DOM rendering behavior

---

### End-to-End Tests

Implemented with Playwright.

Coverage includes:

* Form rendering
* Validation flows
* Conditional visibility
* Error summary behavior
* Reset functionality
* Demo interactions

---

### Accessibility-Oriented Testing

Where practical, tests verify:

* Label associations
* aria-invalid state
* aria-describedby references
* Error summary navigation

---

## CI/CD

GitHub Actions pipeline:

```txt
Install
→ Type Check
→ Lint
→ Unit Tests
→ Build
→ Playwright Tests
```

The workflow intentionally remains simple and focused.

No unnecessary matrix builds are included.

---

## ADRs

Architecture decisions are documented in:

```txt
docs/adr/
```

Included:

```txt
0001-framework-agnostic-typescript-core.md
```

Topics covered:

* Framework independence
* TypeScript strict mode
* DOM rendering approach
* Architectural trade-offs

---

## Trade-Offs

This project intentionally does not support:

* Visual form builders
* Drag-and-drop editors
* Arbitrary JavaScript expressions
* Full rules engines
* Complex workflow engines
* Nested repeatable array fields
* Framework-specific abstractions

The objective is to remain lightweight, understandable, and maintainable.

---

## Roadmap

Potential future improvements:

* Async validation
* Internationalization support
* Schema versioning
* Additional built-in field types
* Framework adapters (React, Angular, Vue)
* Design-system integration examples

Future features will be evaluated carefully to avoid unnecessary complexity.

---

## Technical Goals

This repository is intended as a frontend engineering portfolio project focused on:

* TypeScript architecture
* Accessibility
* Form runtime design
* State management
* Validation systems
* Framework-agnostic development
* Enterprise frontend engineering practices

The emphasis is on maintainability, API design, and long-term sustainability rather than feature quantity.
