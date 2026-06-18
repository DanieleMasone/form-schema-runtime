<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { createForm, type FormInstance, type FormSchema, type FormValues } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
import "./app.css";

const containerRef = ref<HTMLElement | null>(null);
const submitResult = ref<FormValues | null>(null);
let form: FormInstance | null = null;

const schema: FormSchema = {
  id: "vue-support-request",
  title: "Vue support request",
  submitLabel: "Send request",
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
      label: "Email",
      required: true
    },
    {
      type: "select",
      name: "priority",
      label: "Priority",
      required: true,
      options: [
        { label: "Normal", value: "normal" },
        { label: "Urgent", value: "urgent" }
      ]
    },
    {
      type: "textarea",
      name: "message",
      label: "Message",
      required: true,
      minLength: 12
    }
  ]
};

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  form = createForm({
    container: containerRef.value,
    schema,
    onSubmit(values) {
      submitResult.value = values;
    },
    onValidationError() {
      submitResult.value = null;
    },
    onReset() {
      submitResult.value = null;
    }
  });
});

onUnmounted(() => {
  form?.destroy();
  form = null;
});
</script>

<template>
  <main class="example-shell">
    <section>
      <p class="eyebrow">Vue consumer app</p>
      <h1>Form Schema Runtime in Vue</h1>
      <p>Vue provides the container and lifecycle. The runtime renders the form DOM inside the container below.</p>
    </section>

    <div ref="containerRef"></div>

    <section class="result-panel" aria-live="polite">
      <h2>Submit result</h2>
      <pre>{{ submitResult ? JSON.stringify(submitResult, null, 2) : "Submit a valid form." }}</pre>
    </section>
  </main>
</template>
