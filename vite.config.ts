import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "FormSchemaRuntime",
      formats: ["es", "iife"],
      fileName: (format) =>
        format === "es" ? "form-schema-runtime.js" : "form-schema-runtime.iife.js",
      cssFileName: "form-schema-runtime"
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
