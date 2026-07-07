import { cp, mkdir, stat, writeFile } from "node:fs/promises";

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

const docsIndex = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>form-schema-runtime docs</title>
    <style>
      body {
        max-width: 760px;
        margin: 0 auto;
        padding: 32px 20px;
        color: #172033;
        background: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }

      a {
        color: #166a6f;
        font-weight: 700;
      }

      li {
        margin: 8px 0;
      }
    </style>
  </head>
  <body>
    <main>
      <p><a href="../">Live demo</a></p>
      <h1>form-schema-runtime docs</h1>
      <p>Markdown guides copied into the GitHub Pages artifact.</p>
      <ul>
        <li><a href="usage-guide.md">Usage Guide</a></li>
        <li><a href="schema-reference.md">Schema Reference</a></li>
        <li><a href="validation-guide.md">Validation Guide</a></li>
        <li><a href="customization-guide.md">Customization Guide</a></li>
        <li><a href="accessibility-guide.md">Accessibility Guide</a></li>
        <li><a href="integration-guide.md">Integration Guide</a></li>
        <li><a href="real-world-examples.md">Real-World Examples</a></li>
        <li><a href="feature-matrix.md">Feature Matrix</a></li>
        <li><a href="market-positioning.md">Market Positioning</a></li>
        <li><a href="release-process.md">Release Process</a></li>
      </ul>
      <p><a href="../api/">API docs</a> | <a href="../coverage/">Coverage report</a></p>
    </main>
  </body>
</html>
`;

await writeFile(new URL("index.html", docsTarget), docsIndex, "utf8");
