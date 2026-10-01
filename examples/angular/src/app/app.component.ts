import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  inject,
  type AfterViewInit,
  type ElementRef,
  type OnDestroy
} from "@angular/core";
import {
  createForm,
  type FieldRenderer,
  type FormInstance,
  type FormSchema,
  type FormStateSnapshot,
  type FormValues
} from "form-schema-runtime";

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

@Component({
  selector: "app-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <a class="example-skip-link" href="#example-content">Skip to example</a>
    <header class="example-header">
      <div class="example-header-inner">
        <p class="eyebrow">Angular consumer app</p>
        <h1>Form Schema Runtime in Angular</h1>
        <p>
          Angular owns the standalone component and lifecycle. The runtime owns the generated form,
          validation, conditions, custom renderer, and field state.
        </p>
      </div>
      <nav class="example-nav" aria-label="Project and framework examples">
        <a href="../../">Demo</a>
        <a href="../../docs/">Docs</a>
        <a href="../../api/">API</a>
        <a href="../react/">React</a>
        <a href="../vue/">Vue</a>
        <a href="../angular/" aria-current="page">Angular</a>
      </nav>
    </header>

    <main id="example-content" class="example-shell">
      <p class="integration-note">
        <strong>Integration pattern:</strong> mount after the view exists, keep Angular state at the page
        boundary, and destroy the runtime in <code>ngOnDestroy</code>.
      </p>

      <section class="runtime-theme" aria-label="Runtime-owned form">
        <div #formHost></div>
      </section>

      <section class="output-grid" aria-label="Example output">
        <article class="result-panel" aria-live="polite">
          <h2>Submit result</h2>
          <pre tabindex="0">{{ submitResultText }}</pre>
        </article>

        <article class="result-panel" aria-live="polite">
          <h2>Runtime state</h2>
          <pre tabindex="0">{{ stateSummaryText }}</pre>
        </article>
      </section>
    </main>
  `
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild("formHost", { static: true })
  private formHost!: ElementRef<HTMLElement>;

  protected submitResultText = "Submit a valid form.";
  protected stateSummaryText = "Make a change to see runtime state.";
  private form: FormInstance | null = null;
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly schema: FormSchema = {
    id: "angular-enterprise-access",
    title: "Enterprise access request",
    description: "A compact schema-driven access workflow rendered inside an Angular-owned page shell.",
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
        helpText: "Rendered by a custom field renderer registered by the Angular host.",
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

  ngAfterViewInit(): void {
    // Angular owns this host element and surrounding UI. The runtime owns only
    // the DOM inside #formHost, so this component should not wrap each runtime
    // field in Angular Reactive Forms controls.
    this.form = createForm({
      container: this.formHost.nativeElement,
      schema: this.schema,
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
      onChange: (_values, state) => {
        this.updateStateSummary(state);
      },
      onSubmit: (values, state) => {
        this.updateSubmitResult(values, state);
      },
      onValidationError: (_errors, state) => {
        this.submitResultText = "Submit a valid form.";
        this.updateStateSummary(state);
      },
      onReset: (state) => {
        this.submitResultText = "Submit a valid form.";
        this.updateStateSummary(state);
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup removes runtime listeners and DOM when Angular destroys this view.
    this.form?.destroy();
    this.form = null;
  }

  private updateSubmitResult(values: FormValues, state: FormStateSnapshot): void {
    this.submitResultText = JSON.stringify(values, null, 2);
    this.updateStateSummary(state);
  }

  private updateStateSummary(state: FormStateSnapshot): void {
    this.stateSummaryText = formatState(state);
    this.changeDetector.detectChanges();
  }
}
