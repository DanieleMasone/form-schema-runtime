import { createForm } from "../src";
import type { FieldRenderer, FormInstance, FormSchema, FormStateSnapshot, FormValues } from "../src";
import "../src/styles/form-schema-runtime.css";
import "./styles.css";
import {
  customerOnboardingInitialValues,
  customerOnboardingSchema
} from "./schemas/customerOnboarding";
import {
  enterpriseAccessRequestInitialValues,
  enterpriseAccessRequestSchema
} from "./schemas/enterpriseAccessRequest";
import { paymentDetailsInitialValues, paymentDetailsSchema } from "./schemas/paymentDetails";

interface DemoExample {
  id: string;
  label: string;
  schema: FormSchema;
  initialValues?: FormValues;
}

const examples: DemoExample[] = [
  {
    id: "customer-onboarding",
    label: "Customer onboarding",
    schema: customerOnboardingSchema,
    initialValues: customerOnboardingInitialValues
  },
  {
    id: "enterprise-access-request",
    label: "Enterprise access request",
    schema: enterpriseAccessRequestSchema,
    initialValues: enterpriseAccessRequestInitialValues
  },
  {
    id: "payment-details",
    label: "Payment details",
    schema: paymentDetailsSchema,
    initialValues: paymentDetailsInitialValues
  }
];

let activeExample = examples[0];
let form: FormInstance | null = null;
let latestState: FormStateSnapshot | null = null;

function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

const moneyRenderer: FieldRenderer = (context) => {
  const shell = el("div", `${context.classPrefix}-field`);
  const label = el("label", `${context.classPrefix}-label`, context.field.required ? `${context.field.label} *` : context.field.label);
  const control = el("div", "demo-money-control");
  const prefix = el("span", "demo-money-prefix", "EUR");
  const input = el("input", `${context.classPrefix}-control`);
  const describedBy = context.describedBy;

  label.setAttribute("for", context.inputId);
  input.id = context.inputId;
  input.name = context.field.name;
  input.type = "number";
  input.min = String(context.field.min ?? 0);
  input.step = "0.01";
  input.value = context.value === null || context.value === undefined ? "" : String(context.value);
  input.required = context.field.required ?? false;
  input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");

  if (describedBy) {
    input.setAttribute("aria-describedby", describedBy);
  }

  context.events.listen(input, "input", () => {
    context.setValue(input.value === "" ? null : Number(input.value));
  });
  context.events.listen(input, "blur", () => context.markTouched());

  shell.append(label);

  if (context.field.helpText) {
    const help = el("p", `${context.classPrefix}-help`, context.field.helpText);
    help.id = context.helpId;
    shell.append(help);
  }

  control.append(prefix, input);
  shell.append(control);

  if (context.errors.length > 0) {
    const error = el("p", `${context.classPrefix}-error`, context.errors[0]);
    error.id = context.errorId;
    error.setAttribute("role", "alert");
    shell.append(error);
  }

  return shell;
};

const root = document.querySelector<HTMLDivElement>("#demo-root");

if (!root) {
  throw new Error("Demo root element was not found.");
}

const shell = el("div", "demo-shell");
const header = el("header", "demo-header");
const titleGroup = el("div", "demo-title-group");
const title = el("h1", "demo-title", "Form Schema Runtime");
const subtitle = el("p", "demo-subtitle", "Framework-agnostic form rendering for enterprise UI surfaces");
const toolbar = el("div", "demo-toolbar");
const schemaControl = el("div", "demo-control");
const schemaLabel = el("label", undefined, "Example schema");
const schemaSelect = el("select");
const darkToggleLabel = el("label", "demo-switch");
const darkToggle = el("input");
const content = el("main", "demo-content");
const formPanel = el("section", "demo-panel");
const formPanelHeader = el("div", "demo-panel-header");
const formPanelTitle = el("h2", "demo-panel-title", "Rendered form");
const statusText = el("span", "demo-status", "Idle");
const formHost = el("div", "demo-form-host");
const inspectorPanel = el("section", "demo-inspector-grid");
const schemaBlock = el("section", "demo-code-block");
const stateBlock = el("section", "demo-code-block");
const errorBlock = el("section", "demo-code-block");
const schemaCode = el("pre");
const stateCode = el("pre");
const errorCode = el("pre");

schemaLabel.setAttribute("for", "demo-schema-select");
schemaSelect.id = "demo-schema-select";
examples.forEach((example) => {
  const option = document.createElement("option");
  option.value = example.id;
  option.textContent = example.label;
  schemaSelect.append(option);
});

darkToggle.type = "checkbox";
darkToggle.id = "demo-dark-mode";
darkToggleLabel.append(darkToggle, document.createTextNode("Dark mode"));
schemaControl.append(schemaLabel, schemaSelect);
toolbar.append(schemaControl, darkToggleLabel);
titleGroup.append(title, subtitle);
header.append(titleGroup, toolbar);
formPanelHeader.append(formPanelTitle, statusText);
formPanel.append(formPanelHeader, formHost);
schemaBlock.append(el("h2", "demo-code-title", "Schema"), schemaCode);
stateBlock.append(el("h2", "demo-code-title", "State"), stateCode);
errorBlock.append(el("h2", "demo-code-title", "Errors"), errorCode);
inspectorPanel.append(schemaBlock, stateBlock, errorBlock);
content.append(formPanel, inspectorPanel);
shell.append(header, content);
root.append(shell);

function updateInspectors(state?: FormStateSnapshot): void {
  latestState = state ?? latestState;
  schemaCode.textContent = formatJson(activeExample.schema);
  stateCode.textContent = formatJson(
    latestState ?? {
      values: form?.getValues() ?? activeExample.initialValues ?? {},
      touchedFields: [],
      dirtyFields: [],
      visibleFields: [],
      isValid: true
    }
  );
  errorCode.textContent = formatJson(latestState?.errors ?? {});
}

function renderActiveForm(): void {
  form?.destroy();
  statusText.textContent = "Idle";

  form = createForm({
    container: formHost,
    schema: activeExample.schema,
    initialValues: activeExample.initialValues,
    renderers: {
      money: moneyRenderer
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
      statusText.textContent = state.dirtyFields.length > 0 ? "Unsaved changes" : "Idle";
      updateInspectors(state);
    },
    onSubmit(_values, state) {
      statusText.textContent = "Submitted";
      updateInspectors(state);
    },
    onValidationError(_errors, state) {
      statusText.textContent = "Validation required";
      updateInspectors(state);
    },
    onReset(state) {
      statusText.textContent = "Reset";
      updateInspectors(state);
    }
  });

  latestState = null;
  updateInspectors();
}

schemaSelect.addEventListener("change", () => {
  activeExample = examples.find((example) => example.id === schemaSelect.value) ?? examples[0];
  renderActiveForm();
});

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("demo-dark", darkToggle.checked);
});

renderActiveForm();
