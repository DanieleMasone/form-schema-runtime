import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const docsRoot = path.join(repositoryRoot, "dist-demo", "docs");
const requiredPages = [
  "index.html",
  "usage-guide/index.html",
  "schema-reference/index.html",
  "validation-guide/index.html",
  "customization-guide/index.html",
  "accessibility-guide/index.html",
  "integration-guide/index.html",
  "real-world-examples/index.html",
  "feature-matrix/index.html",
  "market-positioning/index.html",
  "release-process/index.html",
  "examples/custom-validators/index.html",
  "examples/custom-renderers/index.html",
  "adr/0001-framework-agnostic-typescript-core/index.html",
  "assets/docs.css"
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function walkFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return walkFiles(entryPath);
    }

    return [entryPath];
  });
}

if (!existsSync(docsRoot)) {
  fail("dist-demo/docs is missing. Run npm run build before npm run test:site-docs.");
} else {
  requiredPages.forEach((page) => {
    const pagePath = path.join(docsRoot, page);

    if (!existsSync(pagePath)) {
      fail(`Missing generated docs asset: ${page}`);
    }
  });

  const markdownFiles = walkFiles(docsRoot).filter((filePath) => filePath.endsWith(".md"));

  if (markdownFiles.length > 0) {
    fail(`dist-demo/docs must expose generated HTML docs, not raw Markdown files: ${markdownFiles.join(", ")}`);
  }

  const indexHtml = readFileSync(path.join(docsRoot, "index.html"), "utf8");
  const usageHtml = readFileSync(path.join(docsRoot, "usage-guide", "index.html"), "utf8");

  [
    "/form-schema-runtime/docs/usage-guide/",
    "/form-schema-runtime/docs/schema-reference/",
    "/form-schema-runtime/docs/validation-guide/",
    "/form-schema-runtime/docs/customization-guide/",
    "/form-schema-runtime/docs/accessibility-guide/",
    "/form-schema-runtime/docs/integration-guide/",
    "/form-schema-runtime/docs/real-world-examples/",
    "/form-schema-runtime/docs/feature-matrix/",
    "/form-schema-runtime/docs/market-positioning/",
    "/form-schema-runtime/docs/release-process/"
  ].forEach((href) => {
    if (!indexHtml.includes(href)) {
      fail(`Docs index is missing link ${href}.`);
    }
  });

  if (!usageHtml.includes("<pre") || !usageHtml.includes("<code")) {
    fail("Usage Guide HTML must render fenced code blocks.");
  }
}

if (process.exitCode) {
  process.exit();
}

console.log("Generated HTML documentation verification passed.");
