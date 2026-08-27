import { appendFile, cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const coverageSource = new URL("../coverage/", import.meta.url);
const coverageTarget = new URL("../dist-demo/coverage/", import.meta.url);
const coverageBaseCss = new URL("base.css", coverageTarget);
const coverageTargetPath = fileURLToPath(coverageTarget);
const coverageCanonicalBase = "https://danielemasone.github.io/form-schema-runtime/coverage/";
const coverageDescription = "Vitest code coverage report for form-schema-runtime.";
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

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const htmlFiles = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      htmlFiles.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.name.endsWith(".html")) {
      htmlFiles.push(entryPath);
    }
  }

  return htmlFiles;
}

function canonicalUrlFor(filePath) {
  const relativePath = path.relative(coverageTargetPath, filePath).split(path.sep).join("/");
  const canonicalPath =
    relativePath === "index.html"
      ? ""
      : relativePath.endsWith("/index.html")
        ? relativePath.slice(0, -"index.html".length)
        : relativePath;

  return new URL(canonicalPath, coverageCanonicalBase).href;
}

async function addPageMetadata(filePath) {
  const canonicalUrl = canonicalUrlFor(filePath);
  const html = await readFile(filePath, "utf8");
  const metadata = [
    html.includes('name="description"') ? "" : `    <meta name="description" content="${coverageDescription}" />`,
    html.includes('rel="canonical"') ? "" : `    <link rel="canonical" href="${canonicalUrl}" />`
  ]
    .filter(Boolean)
    .join("\n");

  if (!metadata) {
    return;
  }

  if (!html.includes("</head>")) {
    throw new Error(`Coverage page is missing a closing head element: ${filePath}`);
  }

  await writeFile(filePath, html.replace("</head>", `${metadata}\n</head>`), "utf8");
}

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

for (const htmlFile of await findHtmlFiles(coverageTargetPath)) {
  await addPageMetadata(htmlFile);
}
