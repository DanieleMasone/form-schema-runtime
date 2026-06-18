import { Component, ViewChild, type AfterViewInit, type ElementRef, type OnDestroy } from "@angular/core";
import { createForm, type FormInstance, type FormSchema } from "form-schema-runtime";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <main class="example-shell">
      <section>
        <p class="eyebrow">Angular consumer app</p>
        <h1>Form Schema Runtime in Angular</h1>
        <p>
          Angular provides the standalone component and host element. The runtime renders the form DOM inside
          the container below.
        </p>
      </section>

      <div #formHost></div>

      <section class="result-panel" aria-live="polite">
        <h2>Submit result</h2>
        <pre>{{ submitResultText }}</pre>
      </section>
    </main>
  `
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild("formHost", { static: true })
  private formHost!: ElementRef<HTMLElement>;

  protected submitResultText = "Submit a valid form.";
  private form: FormInstance | null = null;

  private readonly schema: FormSchema = {
    id: "angular-access-request",
    title: "Angular access request",
    submitLabel: "Request access",
    fields: [
      {
        type: "text",
        name: "fullName",
        label: "Full name",
        required: true,
        minLength: 2
      },
      {
        type: "email",
        name: "email",
        label: "Work email",
        required: true
      },
      {
        type: "radio",
        name: "accessLevel",
        label: "Access level",
        required: true,
        options: [
          { label: "Read", value: "read" },
          { label: "Administrator", value: "admin" }
        ]
      },
      {
        type: "textarea",
        name: "justification",
        label: "Administrator justification",
        required: true,
        minLength: 12,
        visibleWhen: { field: "accessLevel", equals: "admin" }
      }
    ]
  };

  ngAfterViewInit(): void {
    this.form = createForm({
      container: this.formHost.nativeElement,
      schema: this.schema,
      onSubmit: (values) => {
        this.submitResultText = JSON.stringify(values, null, 2);
      },
      onValidationError: () => {
        this.submitResultText = "Submit a valid form.";
      },
      onReset: () => {
        this.submitResultText = "Submit a valid form.";
      }
    });
  }

  ngOnDestroy(): void {
    this.form?.destroy();
    this.form = null;
  }
}
