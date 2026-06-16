# Custom Renderers

Custom renderers let consumers support design-system fields or domain-specific field types without changing the core runtime. A renderer receives a field context, creates DOM nodes, wires events through `setValue` and `markTouched`, and returns one root element.

```ts
import { createForm, type FieldRenderer } from "form-schema-runtime";

const moneyRenderer: FieldRenderer = (context) => {
  const wrapper = document.createElement("div");
  wrapper.className = `${context.classPrefix}-field`;

  const label = document.createElement("label");
  label.className = `${context.classPrefix}-label`;
  label.htmlFor = context.inputId;
  label.textContent = context.field.label;

  const input = document.createElement("input");
  input.className = `${context.classPrefix}-control`;
  input.id = context.inputId;
  input.name = context.field.name;
  input.type = "number";
  input.value = context.value == null ? "" : String(context.value);
  input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");

  if (context.describedBy) {
    input.setAttribute("aria-describedby", context.describedBy);
  }

  context.events.listen(input, "input", () => {
    context.setValue(input.value === "" ? null : Number(input.value));
  });
  context.events.listen(input, "blur", () => context.markTouched());

  wrapper.append(label, input);
  return wrapper;
};

createForm({
  container: document.querySelector("#app")!,
  schema,
  renderers: {
    money: moneyRenderer
  }
});
```

Renderers should use `textContent` for schema-provided labels, help text, options, and validation messages. They should also preserve label/input association, `aria-invalid`, and `aria-describedby` behavior.
