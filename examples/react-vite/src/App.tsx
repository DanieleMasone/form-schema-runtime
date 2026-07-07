import { useEffect, useMemo, useRef, useState } from "react";
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

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<FormInstance | null>(null);
  const [submitResult, setSubmitResult] = useState<FormValues | null>(null);
  const [stateSummary, setStateSummary] = useState("Make a change to see runtime state.");

  const schema = useMemo<FormSchema>(
    () => ({
      id: "react-enterprise-access",
      title: "Enterprise access request",
      description: "A compact schema-driven access workflow rendered inside a React-owned page shell.",
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
          helpText: "Rendered by a custom field renderer registered by the React host.",
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
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // React owns this host element and surrounding UI. The runtime owns only
    // the form DOM inside the container, so React should not render children
    // into the same node or try to mirror every field value.
    const form = createForm({
      container: containerRef.current,
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
        setStateSummary(formatState(state));
      },
      onSubmit(values, state) {
        setSubmitResult(values);
        setStateSummary(formatState(state));
      },
      onValidationError(_errors, state) {
        setSubmitResult(null);
        setStateSummary(formatState(state));
      },
      onReset(state) {
        setSubmitResult(null);
        setStateSummary(formatState(state));
      }
    });

    formRef.current = form;

    return () => {
      // Cleanup is required because React StrictMode, route changes, or
      // conditional screens can mount and unmount this host component.
      form.destroy();
      formRef.current = null;
    };
  }, [schema]);

  return (
    <main className="example-shell">
      <section>
        <p className="eyebrow">React consumer app</p>
        <h1>Form Schema Runtime in React</h1>
        <p>
          React provides the container and lifecycle. The runtime renders validation, conditions, custom
          fields, and form state inside the themed container below.
        </p>
      </section>

      <section className="integration-note" aria-label="React integration notes">
        <strong>Integration pattern:</strong> keep React responsible for page state and submit output, and let
        the runtime own the generated form controls.
      </section>

      <section className="runtime-theme" aria-label="Runtime-owned form">
        <div ref={containerRef} />
      </section>

      <section className="output-grid" aria-label="Example output">
        <article className="result-panel" aria-live="polite">
          <h2>Submit result</h2>
          <pre>{submitResult ? JSON.stringify(submitResult, null, 2) : "Submit a valid form."}</pre>
        </article>

        <article className="result-panel" aria-live="polite">
          <h2>Runtime state</h2>
          <pre>{stateSummary}</pre>
        </article>
      </section>
    </main>
  );
}
