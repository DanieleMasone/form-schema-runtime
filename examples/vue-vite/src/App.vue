<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  createForm,
  type FieldRenderer,
  type FormInstance,
  type FormSchema,
  type FormStateSnapshot,
  type FormValues
} from "form-schema-runtime";
import "form-schema-runtime/styles.css";
import "./app.css";

const containerRef = ref<HTMLElement | null>(null);
const submitResult = ref<FormValues | null>(null);
const stateSummary = ref("Make a change to see runtime state.");
let form: FormInstance | null = null;

function formatState(state: FormStateSnapshot): string {
  return JSON.stringify(
    {
      isValid: state.isValid,
      dirtyFields: state.dirtyFields,
      touchedFields: state.touchedFields,
      visibleFields: state.visibleFields
    },
    null,
    2
  );
}

const departmentBadgeRenderer: FieldRenderer = (context) => {
  const shell = document.createElement("div");
  shell.className = `${context.classPrefix}-field department-field`;

  const label = document.createElement("span");
  label.id = `${context.inputId}-label`;
  label.className = `${context.classPrefix}-label`;
  label.textContent = context.field.required ? `${context.field.label} *` : context.field.label;
  shell.append(label);

  if (context.field.helpText) {
    const help = document.createElement("p");
    help.id = context.helpId;
    help.className = `${context.classPrefix}-help`;
    help.textContent = context.field.helpText;
    shell.append(help);
  }

  const group = document.createElement("div");
  group.className = "department-picker";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-labelledby", label.id);

  if (context.describedBy) {
    group.setAttribute("aria-describedby", context.describedBy);
  }

  context.field.options?.forEach((option, index) => {
    const optionId = `${context.inputId}-${index}`;
    const optionShell = document.createElement("div");
    optionShell.className = "department-choice";
    const input = document.createElement("input");
    input.id = optionId;
    input.className = "department-input";
    input.type = "radio";
    input.name = context.field.name;
    input.value = String(option.value);
    input.required = context.field.required ?? false;
    input.checked = String(context.value ?? "") === String(option.value);
    input.setAttribute("aria-invalid", context.errors.length > 0 ? "true" : "false");

    const optionLabel = document.createElement("label");
    optionLabel.className = "department-option";
    optionLabel.htmlFor = optionId;
    optionLabel.textContent = option.label;

    context.events.listen(input, "change", () => context.setValue(String(option.value)));
    context.events.listen(input, "blur", () => context.markTouched());

    optionShell.append(input, optionLabel);
    group.append(optionShell);
  });

  shell.append(group);

  if (context.errors.length > 0) {
    const error = document.createElement("p");
    error.id = context.errorId;
    error.className = `${context.classPrefix}-error`;
    error.role = "alert";
    error.textContent = context.errors[0];
    shell.append(error);
  }

  return shell;
};

const schema: FormSchema = {
  id: "vue-enterprise-access",
  title: "Enterprise access request",
  description: "A compact schema-driven access workflow rendered inside a Vue-owned page shell.",
  submitLabel: "Submit request",
  resetLabel: "Clear",
  fields: [
    {
      type: "text",
      name: "sourceSystem",
      label: "Source system",
      readonly: true,
      defaultValue: "Identity Portal"
    },
    {
      type: "text",
      name: "requesterName",
      label: "Requester name",
      required: true,
      minLength: 2
    },
    {
      type: "email",
      name: "requesterEmail",
      label: "Work email",
      required: true,
      validators: ["companyEmail"],
      helpText: "Use an @example.com address for this demo."
    },
    {
      type: "select",
      name: "accessType",
      label: "Access type",
      required: true,
      defaultValue: "standard",
      options: [
        { label: "Standard application access", value: "standard" },
        { label: "Privileged production access", value: "privileged" }
      ]
    },
    {
      type: "radio",
      name: "role",
      label: "Requested role",
      required: true,
      defaultValue: "auditor",
      options: [
        { label: "Auditor", value: "auditor" },
        { label: "Operator", value: "operator" },
        { label: "Administrator", value: "administrator" }
      ]
    },
    {
      type: "departmentBadge",
      name: "department",
      label: "Department",
      required: true,
      defaultValue: "security",
      helpText: "Rendered by a custom field renderer registered by the Vue host.",
      options: [
        { label: "Security", value: "security" },
        { label: "Finance", value: "finance" },
        { label: "Operations", value: "operations" }
      ]
    },
    {
      type: "checkbox",
      name: "requiresAdminApproval",
      label: "I understand privileged access requires administrator approval"
    },
    {
      type: "textarea",
      name: "businessJustification",
      label: "Privileged access justification",
      required: true,
      minLength: 20,
      visibleWhen: { field: "accessType", equals: "privileged" },
      helpText: "Visible only when privileged access is selected."
    }
  ]
};

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  // Vue owns this host element and surrounding UI. The runtime owns only the
  // generated form DOM inside the container, which avoids double-rendering the
  // same controls in Vue templates.
  form = createForm({
    container: containerRef.value,
    schema,
    validators: {
      companyEmail(value) {
        if (!value) {
          return null;
        }

        return String(value).toLowerCase().endsWith("@example.com")
          ? null
          : "Use your @example.com work email.";
      }
    },
    renderers: {
      departmentBadge: departmentBadgeRenderer
    },
    onChange(_values, state) {
      stateSummary.value = formatState(state);
    },
    onSubmit(values, state) {
      submitResult.value = values;
      stateSummary.value = formatState(state);
    },
    onValidationError(_errors, state) {
      submitResult.value = null;
      stateSummary.value = formatState(state);
    },
    onReset(state) {
      submitResult.value = null;
      stateSummary.value = formatState(state);
    }
  });
});

onUnmounted(() => {
  // Cleanup removes runtime listeners and DOM when Vue tears down this view.
  form?.destroy();
  form = null;
});
</script>

<template>
  <main class="example-shell">
    <section>
      <p class="eyebrow">Vue consumer app</p>
      <h1>Form Schema Runtime in Vue</h1>
      <p>
        Vue provides the container and lifecycle. The runtime renders validation, conditions, custom fields,
        and form state inside the themed container below.
      </p>
    </section>

    <section class="integration-note" aria-label="Vue integration notes">
      <strong>Integration pattern:</strong> keep Vue responsible for page state and submit output, and let the
      runtime own the generated form controls.
    </section>

    <section class="runtime-theme" aria-label="Runtime-owned form">
      <div ref="containerRef"></div>
    </section>

    <section class="output-grid" aria-label="Example output">
      <article class="result-panel" aria-live="polite">
        <h2>Submit result</h2>
        <pre>{{ submitResult ? JSON.stringify(submitResult, null, 2) : "Submit a valid form." }}</pre>
      </article>

      <article class="result-panel" aria-live="polite">
        <h2>Runtime state</h2>
        <pre>{{ stateSummary }}</pre>
      </article>
    </section>
  </main>
</template>
