import type { FieldRenderer } from "../../src";
import { el } from "../ui";

export const moneyRenderer: FieldRenderer = (context) => {
  const shell = el("div", { className: `${context.classPrefix}-field` });
  const label = el("label", {
    className: `${context.classPrefix}-label`,
    text: context.field.required ? `${context.field.label} *` : context.field.label,
    attributes: { for: context.inputId }
  });
  const control = el("div", { className: "demo-money-control" });
  const prefix = el("span", { className: "demo-money-prefix", text: "EUR" });
  const input = el("input", {
    className: `${context.classPrefix}-control`,
    attributes: {
      id: context.inputId,
      name: context.field.name,
      type: "number",
      min: context.field.min ?? 0,
      max: context.field.max,
      step: "0.01",
      required: context.field.required ?? false,
      "aria-invalid": context.errors.length > 0 ? "true" : "false",
      "aria-describedby": context.describedBy || undefined
    }
  });

  input.value = context.value === null || context.value === undefined ? "" : String(context.value);
  context.events.listen(input, "input", () => {
    context.setValue(input.value === "" ? null : Number(input.value));
  });
  context.events.listen(input, "blur", () => context.markTouched());

  shell.append(label);

  if (context.field.helpText) {
    shell.append(el("p", { className: `${context.classPrefix}-help`, text: context.field.helpText, attributes: { id: context.helpId } }));
  }

  control.append(prefix, input);
  shell.append(control);

  if (context.errors.length > 0) {
    shell.append(
      el("p", {
        className: `${context.classPrefix}-error`,
        text: context.errors[0],
        attributes: { id: context.errorId, role: "alert" }
      })
    );
  }

  return shell;
};
