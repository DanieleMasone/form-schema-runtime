import { evaluateCondition } from "../conditions/evaluateCondition";
import { createElement } from "../dom/createElement";
import { createErrorSummaryId, createFieldDomId } from "../dom/ids";
import type { EventRegistry } from "../dom/events";
import type {
  FieldValue,
  FormStateSnapshot,
  NormalizedField,
  NormalizedFormSchema,
  NormalizedSchemaNode,
  NormalizedSection
} from "../schema/types";
import { builtInRenderers, createDefaultFieldContext } from "./renderField";
import type { RendererRegistry } from "./rendererRegistry";

export interface RenderFormOptions {
  schema: NormalizedFormSchema;
  state: FormStateSnapshot;
  classPrefix: string;
  events: EventRegistry;
  registry: RendererRegistry;
  onSubmit(): void;
  onReset(): void;
  onValueChange(fieldName: string, value: FieldValue): void;
  onTouched(fieldName: string): void;
}

function isSection(node: NormalizedSchemaNode): node is NormalizedSection {
  return node.type === "section";
}

export function collectVisibleFields(
  nodes: NormalizedSchemaNode[],
  values: FormStateSnapshot["values"],
  parentVisible = true
): string[] {
  return nodes.flatMap((node) => {
    const visible = parentVisible && evaluateCondition(node.visibleWhen, values);

    if (!visible) {
      return [];
    }

    if (isSection(node)) {
      return collectVisibleFields(node.fields, values, visible);
    }

    return [node.name];
  });
}

function renderErrorSummary(options: RenderFormOptions): HTMLElement | null {
  const entries = Object.entries(options.state.errors).filter(([fieldName]) =>
    options.state.visibleFields.includes(fieldName)
  );

  if (entries.length === 0) {
    return null;
  }

  const summary = createElement("div", {
    className: `${options.classPrefix}-error-summary`,
    attributes: {
      id: createErrorSummaryId(options.schema.id, options.classPrefix),
      role: "alert",
      tabindex: "-1"
    }
  });
  const title = createElement("h2", {
    className: `${options.classPrefix}-error-summary-title`,
    text: "There is a problem with this form"
  });
  const list = createElement("ul", { className: `${options.classPrefix}-error-summary-list` });

  entries.forEach(([fieldName, messages]) => {
    const field = options.schema.fieldMap.get(fieldName);

    if (!field || messages.length === 0) {
      return;
    }

    const item = createElement("li");
    const inputId = createFieldDomId(options.schema.id, field.name, options.classPrefix);
    const link = createElement("a", {
      text: `${field.label}: ${messages[0]}`,
      attributes: { href: `#${inputId}` }
    });

    options.events.listen(link, "click", (event) => {
      event.preventDefault();
      document.getElementById(inputId)?.focus();
    });

    item.append(link);
    list.append(item);
  });

  summary.append(title, list);
  return summary;
}

function renderField(field: NormalizedField, options: RenderFormOptions): HTMLElement {
  const renderer = options.registry.get(field.type) ?? builtInRenderers[field.type];

  if (!renderer) {
    throw new Error(`No renderer registered for field type "${field.type}".`);
  }

  return renderer(
    createDefaultFieldContext(
      field,
      options.schema,
      options.state,
      options.classPrefix,
      options.events,
      options.onValueChange,
      options.onTouched
    )
  );
}

function renderNode(node: NormalizedSchemaNode, options: RenderFormOptions): HTMLElement | null {
  if (!evaluateCondition(node.visibleWhen, options.state.values)) {
    return null;
  }

  if (!isSection(node)) {
    return renderField(node, options);
  }

  const section = createElement("fieldset", { className: `${options.classPrefix}-section` });
  const legend = createElement("legend", { className: `${options.classPrefix}-section-title`, text: node.title });

  section.append(legend);

  if (node.description) {
    section.append(
      createElement("p", { className: `${options.classPrefix}-section-description`, text: node.description })
    );
  }

  node.fields.forEach((child) => {
    const renderedChild = renderNode(child, options);

    if (renderedChild) {
      section.append(renderedChild);
    }
  });

  return section;
}

export function renderForm(options: RenderFormOptions): HTMLFormElement {
  const form = createElement("form", {
    className: `${options.classPrefix}-form`,
    attributes: { novalidate: true }
  });
  const summary = renderErrorSummary(options);

  options.events.listen(form, "submit", (event) => {
    event.preventDefault();
    options.onSubmit();
  });
  options.events.listen(form, "reset", (event) => {
    event.preventDefault();
    options.onReset();
  });

  if (options.schema.title) {
    form.append(createElement("h1", { className: `${options.classPrefix}-title`, text: options.schema.title }));
  }

  if (options.schema.description) {
    form.append(
      createElement("p", { className: `${options.classPrefix}-description`, text: options.schema.description })
    );
  }

  if (summary) {
    form.append(summary);
  }

  options.schema.fields.forEach((node) => {
    const renderedNode = renderNode(node, options);

    if (renderedNode) {
      form.append(renderedNode);
    }
  });

  const actions = createElement("div", { className: `${options.classPrefix}-actions` });
  actions.append(
    createElement("button", {
      className: `${options.classPrefix}-button ${options.classPrefix}-button--primary`,
      text: options.schema.submitLabel ?? "Submit",
      attributes: { type: "submit" }
    }),
    createElement("button", {
      className: `${options.classPrefix}-button`,
      text: options.schema.resetLabel ?? "Reset",
      attributes: { type: "reset" }
    })
  );
  form.append(actions);

  return form;
}
