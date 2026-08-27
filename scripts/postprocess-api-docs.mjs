import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiTarget = new URL("../dist-demo/api/", import.meta.url);
const apiTargetPath = fileURLToPath(apiTarget);
const apiCanonicalBase = "https://danielemasone.github.io/form-schema-runtime/api/";

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
  const relativePath = path.relative(apiTargetPath, filePath).split(path.sep).join("/");
  const canonicalPath = relativePath === "index.html" ? "" : relativePath;

  return new URL(canonicalPath, apiCanonicalBase).href;
}

async function setCanonicalUrl(filePath) {
  const canonicalUrl = canonicalUrlFor(filePath);
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}"/>`;
  const html = await readFile(filePath, "utf8");
  const existingCanonicalPattern = /<link rel="canonical" href="[^"]*"\s*\/?>/u;

  if (existingCanonicalPattern.test(html)) {
    await writeFile(filePath, html.replace(existingCanonicalPattern, canonicalTag), "utf8");
    return;
  }

  if (!html.includes("</head>")) {
    throw new Error(`TypeDoc page is missing a closing head element: ${filePath}`);
  }

  await writeFile(filePath, html.replace("</head>", `${canonicalTag}</head>`), "utf8");
}

try {
  await stat(apiTarget);
} catch {
  console.warn("TypeDoc output not found. Run `npm run build:docs` after installing dependencies.");
  process.exit(0);
}

for (const htmlFile of await findHtmlFiles(apiTargetPath)) {
  await setCanonicalUrl(htmlFile);
}
