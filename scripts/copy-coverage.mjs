import { cp, mkdir, stat } from "node:fs/promises";

const coverageSource = new URL("../coverage/", import.meta.url);
const coverageTarget = new URL("../dist-demo/coverage/", import.meta.url);

try {
  await stat(coverageSource);
} catch {
  console.warn("Coverage report not found. Run `npm run test:coverage` before publishing Pages.");
  process.exit(0);
}

await mkdir(coverageTarget, { recursive: true });
await cp(coverageSource, coverageTarget, { recursive: true });
