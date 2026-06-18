import { useEffect, useMemo, useRef, useState } from "react";
import { createForm, type FormInstance, type FormSchema, type FormValues } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
import "./app.css";

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<FormInstance | null>(null);
  const [submitResult, setSubmitResult] = useState<FormValues | null>(null);

  const schema = useMemo<FormSchema>(
    () => ({
      id: "react-lead-capture",
      title: "React lead capture",
      submitLabel: "Send lead",
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
          required: true,
          helpText: "Validation is handled by the runtime."
        },
        {
          type: "select",
          name: "plan",
          label: "Plan",
          required: true,
          options: [
            { label: "Starter", value: "starter" },
            { label: "Enterprise", value: "enterprise" }
          ]
        },
        {
          type: "textarea",
          name: "enterpriseNotes",
          label: "Enterprise notes",
          minLength: 10,
          visibleWhen: { field: "plan", equals: "enterprise" }
        }
      ]
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const form = createForm({
      container: containerRef.current,
      schema,
      onSubmit(values) {
        setSubmitResult(values);
      },
      onValidationError() {
        setSubmitResult(null);
      },
      onReset() {
        setSubmitResult(null);
      }
    });

    formRef.current = form;

    return () => {
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
          React provides the container and lifecycle. The runtime renders and owns the form DOM inside the
          container below.
        </p>
      </section>

      <div ref={containerRef} />

      <section className="result-panel" aria-live="polite">
        <h2>Submit result</h2>
        <pre>{submitResult ? JSON.stringify(submitResult, null, 2) : "Submit a valid form."}</pre>
      </section>
    </main>
  );
}
