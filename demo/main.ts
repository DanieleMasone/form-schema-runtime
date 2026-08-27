import packageMetadata from "../package.json";
import { createForm } from "../src";
import type { FormInstance, FormStateSnapshot, FormValues } from "../src";
import "../src/styles/form-schema-runtime.css";
import "./styles.css";
import { moneyRenderer } from "./renderers/moneyRenderer";
import { type DemoExample, examples } from "./schemas/examples";
import { el, formatJson, renderList } from "./ui";

interface SubmitResult {
  values: FormValues;
  state: FormStateSnapshot;
  submittedAt: string;
}

type InspectorKey = "values" | "state" | "errors" | "submit";

const inspectorDefinitions: ReadonlyArray<{ key: InspectorKey; label: string }> = [
  { key: "values", label: "Values" },
  { key: "state", label: "State" },
  { key: "errors", label: "Errors" },
  { key: "submit", label: "Submit" }
];

let activeExample: DemoExample = examples[0];
let form: FormInstance | null = null;
let latestState: FormStateSnapshot | null = null;
let latestSubmit: SubmitResult | null = null;
let activeInspector: InspectorKey = "values";
let inspectorContent: Record<InspectorKey, string> = {
  values: "{}",
  state: "{}",
  errors: "{}",
  submit: "No successful submit yet."
};

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

function createProjectNavigation(): HTMLElement {
  const navigation = el("nav", { className: "demo-project-nav", attributes: { "aria-label": "Project" } });
  const links = [
    { label: "Demo", href: "./", current: true },
    { label: "Docs", href: "docs/" },
    { label: "API", href: "api/" },
    { label: "Examples", href: "#framework-examples" },
    { label: "Coverage", href: "coverage/" },
    { label: "npm", href: "https://www.npmjs.com/package/form-schema-runtime" },
    { label: "GitHub", href: "https://github.com/DanieleMasone/form-schema-runtime" }
  ];

  links.forEach(({ label, href, current }) => {
    navigation.append(
      el("a", {
        className: "demo-nav-link",
        text: label,
        attributes: { href, "aria-current": current ? "page" : undefined }
      })
    );
  });

  return navigation;
}

function createHero(): HTMLElement {
  const hero = el("header", { className: "demo-hero" });
  const content = el("div", { className: "demo-hero-content" });
  const copy = el("div", { className: "demo-hero-copy" });
  const actions = el("div", { className: "demo-actions" });
  const quickStart = el("section", {
    className: "demo-quickstart",
    attributes: { "aria-labelledby": "quickstart-title" }
  });
  const capabilities = el("ul", { className: "demo-capabilities" });

  copy.append(
    el("p", { className: "demo-eyebrow", text: "Framework-agnostic TypeScript library" }),
    el("h1", { className: "demo-title", text: "Form Schema Runtime" }),
    el("p", {
      className: "demo-subtitle",
      text: "Render accessible HTML forms from declarative JSON schemas without adding a frontend framework."
    })
  );

  actions.append(
    el("a", {
      className: "demo-primary-link",
      text: "Try the demo",
      attributes: { href: "#interactive-demo" }
    }),
    el("a", {
      className: "demo-version-link",
      text: `npm v${packageMetadata.version}`,
      attributes: { href: "https://www.npmjs.com/package/form-schema-runtime" }
    })
  );
  copy.append(actions);

  [
    "Plain DOM rendering with no framework dependency",
    "Accessible labels, validation, and focus behavior",
    "Typed validators and custom field renderers"
  ].forEach((item) => capabilities.append(el("li", { text: item })));

  quickStart.append(
    el("h2", { className: "demo-quickstart-title", text: "Install", attributes: { id: "quickstart-title" } }),
    el("code", { className: "demo-install-command", text: "npm install form-schema-runtime" }),
    capabilities
  );

  content.append(copy, quickStart);
  hero.append(content, createProjectNavigation());
  return hero;
}

function createResourceGroup(title: string, links: ReadonlyArray<readonly [string, string]>): HTMLElement {
  const group = el("section", { className: "demo-resource-group" });
  const navigation = el("nav", { attributes: { "aria-label": title } });

  links.forEach(([label, href]) => {
    navigation.append(el("a", { className: "demo-resource-link", text: label, attributes: { href } }));
  });

  group.append(el("h3", { text: title }), navigation);
  return group;
}

function createResources(): HTMLElement {
  const resources = el("section", {
    className: "demo-resources",
    attributes: { id: "framework-examples", "aria-labelledby": "resources-title" }
  });
  const headingGroup = el("div", { className: "demo-resources-heading" });
  const groups = el("div", { className: "demo-resource-grid" });

  headingGroup.append(
    el("h2", { text: "Continue exploring", attributes: { id: "resources-title" } }),
    el("p", {
      text: "Move from the live runtime to focused guides, generated API documentation, and real consumer builds."
    })
  );

  groups.append(
    createResourceGroup("Documentation", [
      ["Documentation index", "docs/"],
      ["Usage guide", "docs/usage-guide/"],
      ["Schema reference", "docs/schema-reference/"],
      ["Integration guide", "docs/integration-guide/"]
    ]),
    createResourceGroup("Framework examples", [
      ["React", "examples/react/"],
      ["Vue", "examples/vue/"],
      ["Angular", "examples/angular/"]
    ]),
    createResourceGroup("Repository", [
      ["API reference", "api/"],
      ["Coverage report", "coverage/"],
      ["npm package", "https://www.npmjs.com/package/form-schema-runtime"],
      ["GitHub repository", "https://github.com/DanieleMasone/form-schema-runtime"]
    ])
  );

  resources.append(headingGroup, groups);
  return resources;
}

const shell = el("div", { className: "demo-shell" });
const skipLink = el("a", {
  className: "demo-skip-link",
  text: "Skip to interactive demo",
  attributes: { href: "#interactive-demo" }
});
const hero = createHero();
const main = el("main", { className: "demo-main", attributes: { id: "main-content" } });
const toolbar = el("section", {
  className: "demo-toolbar",
  attributes: { id: "interactive-demo", "aria-labelledby": "demo-controls-title" }
});
const toolbarHeading = el("h2", {
  className: "demo-visually-hidden",
  text: "Interactive demo",
  attributes: { id: "demo-controls-title" }
});
const schemaControl = el("div", { className: "demo-control" });
const schemaLabel = el("label", { text: "Example schema", attributes: { for: "demo-schema-select" } });
const schemaSelect = el("select", { attributes: { id: "demo-schema-select" } });
const darkToggleLabel = el("label", { className: "demo-switch" });
const darkToggle = el("input", { attributes: { id: "demo-dark-mode", type: "checkbox" } });
const activityStatus = el("div", { className: "demo-status" });
const activityStatusLabel = el("span", {
  className: "demo-status-label",
  text: "Form activity",
  attributes: { id: "demo-status-label" }
});
const statusText = el("output", {
  className: "demo-status-value",
  text: "Ready",
  attributes: { "aria-labelledby": "demo-status-label", "aria-live": "polite" }
});
const workspace = el("section", {
  className: "demo-workspace",
  attributes: { "aria-label": "Interactive form demo" }
});
const formColumn = el("div", { className: "demo-stack demo-form-column" });
const inspectorColumn = el("aside", {
  className: "demo-stack demo-inspector-column",
  attributes: { "aria-label": "Live form inspection" }
});
const formPanel = createPanel("Live form", "demo-form-panel");
const explainPanel = createPanel("Scenario details", "demo-explanation-panel");
const inspectorPanel = el("section", { className: "demo-inspector" });
const inspectorHeader = el("div", { className: "demo-inspector-header" });
const inspectorTabs = el("div", {
  className: "demo-inspector-tabs",
  attributes: { role: "tablist", "aria-label": "Inspector view" }
});
const inspectorCode = el("pre", {
  className: "demo-inspector-code",
  attributes: { id: "demo-inspector-panel", role: "tabpanel", tabindex: "0" }
});
const inspectorButtons = new Map<InspectorKey, HTMLButtonElement>();
const schemaDetails = el("details", { className: "demo-schema-inspector" });
const schemaSummary = el("summary", { text: "Active schema" });
const schemaCode = el("pre", { attributes: { tabindex: "0", "aria-label": "Active schema JSON" } });

examples.forEach((example) => {
  const option = document.createElement("option");
  option.value = example.id;
  option.textContent = example.label;
  schemaSelect.append(option);
});

inspectorDefinitions.forEach(({ key, label }, index) => {
  const button = el("button", {
    className: "demo-inspector-tab",
    text: label,
    attributes: {
      id: `demo-inspector-${key}`,
      type: "button",
      role: "tab",
      "aria-controls": "demo-inspector-panel",
      "aria-selected": index === 0 ? "true" : "false",
      tabindex: index === 0 ? "0" : "-1"
    }
  });

  inspectorButtons.set(key, button);
  inspectorTabs.append(button);
});

darkToggleLabel.append(darkToggle, document.createTextNode("Dark mode"));
schemaControl.append(schemaLabel, schemaSelect);
activityStatus.append(activityStatusLabel, statusText);
toolbar.append(toolbarHeading, schemaControl, darkToggleLabel, activityStatus);
inspectorHeader.append(el("h2", { text: "Live inspector" }), inspectorTabs);
inspectorPanel.append(inspectorHeader, inspectorCode);
schemaDetails.append(schemaSummary, schemaCode);
formColumn.append(formPanel.panel);
inspectorColumn.append(inspectorPanel, explainPanel.panel, schemaDetails);
workspace.append(formColumn, inspectorColumn);
main.append(toolbar, workspace, createResources());
shell.append(skipLink, hero, main);
root.append(shell);

schemaDetails.open = !window.matchMedia("(max-width: 740px)").matches;

function setActiveInspector(key: InspectorKey, focus = false): void {
  activeInspector = key;

  inspectorButtons.forEach((button, buttonKey) => {
    const isActive = buttonKey === key;
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;

    if (isActive && focus) {
      button.focus();
    }
  });

  const activeButton = inspectorButtons.get(key);
  inspectorCode.setAttribute("aria-labelledby", activeButton?.id ?? "");
  inspectorCode.textContent = inspectorContent[key];
}

inspectorDefinitions.forEach(({ key }, index) => {
  const button = inspectorButtons.get(key);

  button?.addEventListener("click", () => setActiveInspector(key));
  button?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const lastIndex = inspectorDefinitions.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : event.key === "ArrowRight"
            ? (index + 1) % inspectorDefinitions.length
            : (index - 1 + inspectorDefinitions.length) % inspectorDefinitions.length;

    setActiveInspector(inspectorDefinitions[nextIndex].key, true);
  });
});

function updateExplanation(): void {
  explainPanel.body.replaceChildren();
  const summary = el("p", { className: "demo-example-summary", text: activeExample.summary });
  const featureList = el("div", {
    className: "demo-feature-tags",
    attributes: { "aria-label": "Demonstrated features" }
  });

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

  schemaCode.textContent = formatJson(activeExample.schema);
  inspectorContent = {
    values: formatJson(visibleState.values),
    state: formatJson({
      touchedFields: visibleState.touchedFields,
      dirtyFields: visibleState.dirtyFields,
      visibleFields: visibleState.visibleFields,
      isValid: visibleState.isValid
    }),
    errors: formatJson(visibleState.errors),
    submit: latestSubmit ? formatJson(latestSubmit) : "No successful submit yet."
  };
  setActiveInspector(activeInspector);
}

function renderActiveForm(): void {
  form?.destroy();
  latestState = null;
  latestSubmit = null;
  activeInspector = "values";
  statusText.textContent = "Ready";
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
      statusText.textContent = state.dirtyFields.length > 0 ? "Unsaved changes" : "Ready";
      updateInspectors(state);
    },
    onSubmit(values, state) {
      latestSubmit = {
        values,
        state,
        submittedAt: new Date().toISOString()
      };
      statusText.textContent = "Submitted";
      activeInspector = "submit";
      updateInspectors(state);
    },
    onValidationError(_errors, state) {
      statusText.textContent = "Validation required";
      activeInspector = "errors";
      updateInspectors(state);
    },
    onReset(state) {
      latestSubmit = null;
      statusText.textContent = "Reset";
      activeInspector = "values";
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
