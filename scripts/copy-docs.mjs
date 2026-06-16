import { cp, mkdir, stat } from "node:fs/promises";

const docsSource = new URL("../docs/", import.meta.url);
const docsTarget = new URL("../dist-demo/docs/", import.meta.url);

try {
  await stat(docsSource);
} catch {
  console.warn("Documentation source folder not found.");
  process.exit(0);
}

await mkdir(docsTarget, { recursive: true });
await cp(docsSource, docsTarget, { recursive: true });
