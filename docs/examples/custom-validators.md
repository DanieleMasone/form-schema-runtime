# Custom Validators

Custom validators are synchronous functions registered outside the schema. The schema only names the validator, so declarative schema data never executes code.

```ts
import { createForm, type CustomValidator } from "form-schema-runtime";

const taxCodeValidator: CustomValidator = (value, context) => {
  if (!value) {
    return null;
  }

  const country = context.values.country;

  if (country === "IT" && String(value).length !== 16) {
    return "Italian tax codes must contain 16 characters.";
  }

  return null;
};

createForm({
  container: document.querySelector("#app")!,
  schema: {
    id: "customer",
    fields: [
      {
        type: "text",
        name: "taxCode",
        label: "Tax code",
        validators: ["taxCode"]
      }
    ]
  },
  validators: {
    taxCode: taxCodeValidator
  }
});
```

Validator context includes the current field name, all current values, and the normalized schema. Validators return a message string for invalid values or `null` for valid values.

Keep validators deterministic and side-effect free. Async validation is intentionally outside v1 so validation behavior remains predictable in legacy and embedded environments.
