import { createForm } from "../src";
import type { FormInstance, FormStateSnapshot, FormValues } from "../src";
import "../src/styles/form-schema-runtime.css";
import "./styles.css";
import { moneyRenderer } from "./renderers/moneyRenderer";
import { type DemoExample, examples } from "./schemas/examples";
import { el, externalLink, formatJson, renderList } from "./ui";

interface SubmitResult {
  values: FormValues;
  state: FormStateSnapshot;
  submittedAt: string;
}

let activeExample: DemoExample = examples[0];
let form: FormInstance | null = null;
let latestState: FormStateSnapshot | null = null;
let latestSubmit: SubmitResult | null = null;

const root = document.querySelector<HTMLDivElement>("#demo-root");

if (!root) {
  throw new Error("Demo root element was not found.");
}

function createPanel(title: string, className = ""): { panel: HTMLElement; body: HTMLElement } {
  const panel = el("section", { className: `demo-panel ${className}`.trim() });
  const header = el("div", { className: "demo-panel-header" });
  const heading = el("h2", { className: "demo-panel-title", text: title });
  const body = el("div", { className: "demo-panel-body" });

  header.append(heading);
  panel.append(header, body);
  return { panel, body };
}

function createCodePanel(title: string): { panel: HTMLElement; code: HTMLPreElement } {
  const panel = el("section", { className: "demo-code-block" });
  const code = el("pre");

  panel.append(el("h2", { className: "demo-code-title", text: title }), code);
  return { panel, code };
}

function createDocumentationPanel(): HTMLElement {
  const { panel, body } = createPanel("Documentation");
  const links = el("nav", { className: "demo-doc-links", attributes: { "aria-label": "Documentation links" } });

  [
    ["Usage Guide", "docs/usage-guide.md"],
    ["Schema Reference", "docs/schema-reference.md"],
    ["Validation Guide", "docs/validation-guide.md"],
    ["Customization Guide", "docs/customization-guide.md"],
    ["Accessibility Guide", "docs/accessibility-guide.md"],
    ["Integration Guide", "docs/integration-guide.md"],
    ["Release Process", "docs/release-process.md"],
    ["API Documentation", "api/"],
    ["Coverage Report", "coverage/"],
    ["GitHub Repository", "https://github.com/DanieleMasone/form-schema-runtime"]
  ].forEach(([label, href]) => {
    links.append(externalLink(label, href));
  });

  body.append(
    el("p", {
      className: "demo-example-summary",
      text: "Start with the usage guide, then use the focused references for schemas, validation, customization, accessibility, and integration."
    }),
    links
  );

  return panel;
}

function createHero(): HTMLElement {
  const hero = el("section", { className: "demo-hero" });
  const copy = el("div", { className: "demo-hero-copy" });
  const links = el("nav", { className: "demo-links", attributes: { "aria-label": "Project links" } });
  const stats = el("div", { className: "demo-feature-grid" });

  copy.append(
    el("p", { className: "demo-eyebrow", text: "Framework-agnostic form runtime" }),
    el("h1", { className: "demo-title", text: "Form Schema Runtime" }),
    el("p", {
      className: "demo-subtitle",
      text:
        "Render accessible, customizable HTML forms from declarative JSON schemas without bringing a frontend framework into legacy or enterprise surfaces."
    })
  );

  links.append(
    externalLink("GitHub", "https://github.com/DanieleMasone/form-schema-runtime"),
    externalLink("API docs", "api/"),
    externalLink("Coverage", "coverage/"),
    externalLink(
      "Custom validators",
      "https://github.com/DanieleMasone/form-schema-runtime/blob/main/docs/examples/custom-validators.md"
    ),
    externalLink(
      "Custom renderers",
      "https://github.com/DanieleMasone/form-schema-runtime/blob/main/docs/examples/custom-renderers.md"
    )
  );

  [
    ["No framework runtime", "Plain DOM rendering into a provided container."],
    ["Accessible by default", "Labels, described-by wiring, invalid state, and linked error summary."],
    ["Typed extension points", "Synchronous validators and custom field renderers stay outside schema data."]
  ].forEach(([title, body]) => {
    const item = el("article", { className: "demo-feature" });
    item.append(el("h2", { text: title }), el("p", { text: body }));
    stats.append(item);
  });

  copy.append(links);
  hero.append(copy, stats);
  return hero;
}

const shell = el("div", { className: "demo-shell" });
const hero = createHero();
const toolbar = el("section", { className: "demo-toolbar", attributes: { "aria-label": "Demo controls" } });
const schemaControl = el("div", { className: "demo-control" });
const schemaLabel = el("label", { text: "Example schema", attributes: { for: "demo-schema-select" } });
const schemaSelect = el("select", { attributes: { id: "demo-schema-select" } });
const darkToggleLabel = el("label", { className: "demo-switch" });
const darkToggle = el("input", { attributes: { id: "demo-dark-mode", type: "checkbox" } });
const statusText = el("span", { className: "demo-status", text: "Idle" });
const content = el("main", { className: "demo-content" });
const leftColumn = el("div", { className: "demo-stack" });
const rightColumn = el("div", { className: "demo-stack" });
const formPanel = createPanel("Rendered form", "demo-form-panel");
const explainPanel = createPanel("What this demonstrates");
const documentationPanel = createDocumentationPanel();
const schemaPanel = createCodePanel("Active schema");
const valuesPanel = createCodePanel("Current values");
const statePanel = createCodePanel("Form state");
const errorsPanel = createCodePanel("Validation errors");
const submitPanel = createCodePanel("Submit result");

examples.forEach((example) => {
  const option = document.createElement("option");
  option.value = example.id;
  option.textContent = example.label;
  schemaSelect.append(option);
});

darkToggleLabel.append(darkToggle, document.createTextNode("Dark mode"));
schemaControl.append(schemaLabel, schemaSelect);
toolbar.append(schemaControl, darkToggleLabel, statusText);
leftColumn.append(documentationPanel, explainPanel.panel, formPanel.panel);
rightColumn.append(schemaPanel.panel, valuesPanel.panel, statePanel.panel, errorsPanel.panel, submitPanel.panel);
content.append(leftColumn, rightColumn);
shell.append(hero, toolbar, content);
root.append(shell);

function updateExplanation(): void {
  explainPanel.body.replaceChildren();
  const summary = el("p", { className: "demo-example-summary", text: activeExample.summary });
  const featureList = el("div", { className: "demo-feature-tags" });

  activeExample.features.forEach((feature) => {
    featureList.append(el("span", { className: "demo-tag", text: feature }));
  });

  explainPanel.body.append(summary, renderList(activeExample.guidance, "demo-guidance"), featureList);
}

function currentStateFallback(): FormStateSnapshot {
  return {
    values: form?.getValues() ?? activeExample.initialValues ?? {},
    touchedFields: [],
    dirtyFields: [],
    errors: {},
    visibleFields: [],
    isValid: true
  };
}

function updateInspectors(state?: FormStateSnapshot): void {
  latestState = state ?? latestState;
  const visibleState = latestState ?? currentStateFallback();

  schemaPanel.code.textContent = formatJson(activeExample.schema);
  valuesPanel.code.textContent = formatJson(visibleState.values);
  statePanel.code.textContent = formatJson({
    touchedFields: visibleState.touchedFields,
    dirtyFields: visibleState.dirtyFields,
    visibleFields: visibleState.visibleFields,
    isValid: visibleState.isValid
  });
  errorsPanel.code.textContent = formatJson(visibleState.errors);
  submitPanel.code.textContent = latestSubmit ? formatJson(latestSubmit) : "No successful submit yet.";
}

function renderActiveForm(): void {
  form?.destroy();
  latestState = null;
  latestSubmit = null;
  statusText.textContent = "Idle";
  updateExplanation();

  form = createForm({
    container: formPanel.body,
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
    onSubmit(values, state) {
      latestSubmit = {
        values,
        state,
        submittedAt: new Date().toISOString()
      };
      statusText.textContent = "Submitted";
      updateInspectors(state);
    },
    onValidationError(_errors, state) {
      statusText.textContent = "Validation required";
      updateInspectors(state);
    },
    onReset(state) {
      latestSubmit = null;
      statusText.textContent = "Reset";
      updateInspectors(state);
    }
  });

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
