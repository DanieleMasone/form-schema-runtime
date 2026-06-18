# Real-World Examples

These examples show practical schema patterns for enterprise and legacy-friendly applications. They are intentionally plain TypeScript and do not require a framework adapter.

Framework consumer apps are also published on the GitHub Pages site: [React](https://danielemasone.github.io/form-schema-runtime/examples/react/), [Vue](https://danielemasone.github.io/form-schema-runtime/examples/vue/), and [Angular](https://danielemasone.github.io/form-schema-runtime/examples/angular/). They use the same package import and demonstrate lifecycle cleanup from framework-owned containers.

## Customer Onboarding

Use this pattern for a sales, CRM, or account-opening flow with required identity fields, help text, validation, and conditional company details.

```ts
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const schema: FormSchema = {
  id: "customer-onboarding",
  title: "Customer onboarding",
  submitLabel: "Create customer",
  resetLabel: "Clear",
  fields: [
    {
      type: "section",
      title: "Contact",
      fields: [
        {
          type: "text",
          name: "firstName",
          label: "First name",
          required: true,
          minLength: 2
        },
        {
          type: "text",
          name: "lastName",
          label: "Last name",
          required: true,
          minLength: 2
        },
        {
          type: "email",
          name: "email",
          label: "Work email",
          required: true,
          helpText: "Use the customer's primary business email address."
        }
      ]
    },
    {
      type: "section",
      title: "Account",
      fields: [
        {
          type: "select",
          name: "accountType",
          label: "Account type",
          required: true,
          options: [
            { label: "Individual", value: "individual" },
            { label: "Enterprise", value: "enterprise" }
          ]
        },
        {
          type: "text",
          name: "companyName",
          label: "Company name",
          required: true,
          visibleWhen: { field: "accountType", equals: "enterprise" }
        },
        {
          type: "number",
          name: "estimatedSeats",
          label: "Estimated seats",
          min: 1,
          max: 5000,
          visibleWhen: { field: "accountType", equals: "enterprise" }
        }
      ]
    }
  ]
};

const form = createForm({
  container: document.querySelector("#customer-form")!,
  schema,
  initialValues: { accountType: "individual" },
  onSubmit(values) {
    console.log("Create customer", values);
  }
});
```

This demonstrates sections, required fields, email validation, numeric ranges, initial values, and conditional enterprise-only fields.

## Enterprise Access Request

Use this pattern for internal access workflows where some controls are readonly or disabled, administrator access requires justification, and users must acknowledge policy.

```ts
const schema: FormSchema = {
  id: "enterprise-access-request",
  title: "Enterprise access request",
  submitLabel: "Submit request",
  fields: [
    {
      type: "text",
      name: "sourceSystem",
      label: "Source system",
      readonly: true,
      defaultValue: "Identity Portal"
    },
    {
      type: "email",
      name: "requesterEmail",
      label: "Requester email",
      required: true
    },
    {
      type: "select",
      name: "targetSystem",
      label: "Target system",
      required: true,
      options: [
        { label: "CRM", value: "crm" },
        { label: "Billing", value: "billing" },
        { label: "Data warehouse", value: "warehouse" }
      ]
    },
    {
      type: "radio",
      name: "accessLevel",
      label: "Access level",
      required: true,
      options: [
        { label: "Read only", value: "read" },
        { label: "Editor", value: "editor" },
        { label: "Administrator", value: "admin" }
      ]
    },
    {
      type: "textarea",
      name: "adminJustification",
      label: "Administrator access justification",
      required: true,
      minLength: 20,
      visibleWhen: { field: "accessLevel", equals: "admin" }
    },
    {
      type: "checkbox",
      name: "policyAccepted",
      label: "I confirm this access follows company policy",
      required: true
    }
  ]
};
```

This demonstrates select and radio options, readonly fields, conditional validation, long text requirements, and policy acknowledgement.

## Compliance Declaration

Use this pattern when a regulated workflow needs explicit declarations and a second field only when the user reports an exception.

```ts
const schema: FormSchema = {
  id: "compliance-declaration",
  title: "Compliance declaration",
  fields: [
    {
      type: "text",
      name: "reviewPeriod",
      label: "Review period",
      readonly: true,
      defaultValue: "2026 Q2"
    },
    {
      type: "radio",
      name: "declaration",
      label: "Declaration",
      required: true,
      options: [
        { label: "No exceptions", value: "clear" },
        { label: "Exception reported", value: "exception" }
      ]
    },
    {
      type: "textarea",
      name: "exceptionDetails",
      label: "Exception details",
      required: true,
      minLength: 30,
      visibleWhen: { field: "declaration", notEquals: "clear" }
    },
    {
      type: "checkbox",
      name: "attestation",
      label: "I attest that this declaration is accurate",
      required: true
    }
  ]
};
```

This demonstrates readonly context fields, `notEquals` conditions, conditional required text, and native checkbox validation.

## User Profile Management

Use this pattern for account settings where initial values come from an existing record and a custom validator lives in application code.

```ts
const schema: FormSchema = {
  id: "user-profile",
  title: "User profile",
  submitLabel: "Save profile",
  resetLabel: "Reset changes",
  fields: [
    {
      type: "text",
      name: "displayName",
      label: "Display name",
      required: true,
      minLength: 2,
      maxLength: 80
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true
    },
    {
      type: "text",
      name: "taxCode",
      label: "Tax code",
      validators: ["taxCode"]
    },
    {
      type: "checkbox",
      name: "marketingOptIn",
      label: "Receive product updates"
    }
  ]
};

const form = createForm({
  container: document.querySelector("#profile-form")!,
  schema,
  initialValues: {
    displayName: "Ada Lovelace",
    email: "ada@example.com",
    taxCode: "",
    marketingOptIn: false
  },
  validators: {
    taxCode(value) {
      if (!value) {
        return null;
      }

      return String(value).length === 16 ? null : "Tax code must contain 16 characters.";
    }
  },
  onChange(_values, state) {
    document.querySelector("#dirty-indicator")!.textContent =
      state.dirtyFields.length > 0 ? "Unsaved changes" : "Saved";
  },
  onSubmit(values) {
    console.log("Save profile", values);
  },
  onReset(state) {
    console.log("Restored profile", state.values);
  }
});
```

This demonstrates initial values, dirty-state integration, reset behavior, and named synchronous validators that stay outside schema data.

## Operational Guidance

- Validate submitted values on the server too.
- Keep schema content as data and keep executable logic in application code.
- Prefer native controls before custom renderers.
- Call `destroy()` when a route, modal, widget, or framework component unmounts the form.
- Use `classPrefix` when embedding inside a host page that has strict CSS boundaries.
