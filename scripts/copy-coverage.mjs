import { appendFile, cp, mkdir, stat } from "node:fs/promises";

const coverageSource = new URL("../coverage/", import.meta.url);
const coverageTarget = new URL("../dist-demo/coverage/", import.meta.url);
const coverageBaseCss = new URL("base.css", coverageTarget);
const responsiveCoverageCss = `

/* GitHub Pages mobile guard for the generated Istanbul coverage report. */
@media only screen and (max-width: 900px) {
  html,
  body,
  .wrapper,
  .pad1 {
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
  }

  .coverage-summary,
  pre {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .coverage-summary {
    white-space: nowrap;
  }

  table.coverage {
    width: max-content;
  }
}
`;

try {
  await stat(coverageSource);
} catch {
  console.warn("Coverage report not found. Run `npm run test:coverage` before publishing Pages.");
  process.exit(0);
}

await mkdir(coverageTarget, { recursive: true });
await cp(coverageSource, coverageTarget, { recursive: true });
await stat(coverageBaseCss);
await appendFile(coverageBaseCss, responsiveCoverageCss);
