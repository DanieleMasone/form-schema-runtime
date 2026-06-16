import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  build: {
    outDir: "dist-demo",
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  }
});
