import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const docsSourceRoot = path.join(repositoryRoot, "docs");
const docsTargetRoot = path.join(repositoryRoot, "dist-demo", "docs");
const siteBase = "/form-schema-runtime/";

const primaryDocs = [
  { title: "Usage Guide", source: "usage-guide.md", description: "Installation, setup, lifecycle, state, and common workflows." },
  { title: "Schema Reference", source: "schema-reference.md", description: "Supported schema nodes, fields, validation rules, and visibility conditions." },
  { title: "Validation Guide", source: "validation-guide.md", description: "Built-in validators, custom synchronous validators, errors, and summaries." },
  { title: "Customization Guide", source: "customization-guide.md", description: "CSS variables, stable classes, classPrefix, and custom field renderers." },
  { title: "Accessibility Guide", source: "accessibility-guide.md", description: "Labels, described-by wiring, invalid state, summary links, and focus behavior." },
  { title: "Integration Guide", source: "integration-guide.md", description: "Plain DOM, embedded widgets, and React, Vue, and Angular lifecycle patterns." },
  { title: "Real-World Examples", source: "real-world-examples.md", description: "Practical schema patterns for enterprise and legacy-friendly applications." },
  { title: "Feature Matrix", source: "feature-matrix.md", description: "Implemented, documented, demoed, and tested runtime capabilities." },
  { title: "Market Positioning", source: "market-positioning.md", description: "Scope, non-goals, and comparison with adjacent form ecosystems." },
  { title: "Release Process", source: "release-process.md", description: "GitHub Release publishing, npm Trusted Publishing/OIDC, and verification." }
];

const supplementalDocs = [
  { title: "Custom Validators Example", source: "examples/custom-validators.md" },
  { title: "Custom Renderers Example", source: "examples/custom-renderers.md" },
  { title: "ADR 0001: Framework-Agnostic TypeScript Core", source: "adr/0001-framework-agnostic-typescript-core.md" }
];

function slugFromSource(source) {
  return source.replace(/\.md$/u, "").replaceAll("\\", "/");
}

function outputDirectoryForSource(source) {
  return path.join(docsTargetRoot, slugFromSource(source));
}

function pageHref(source) {
  return `${siteBase}docs/${slugFromSource(source)}/`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function rewriteHref(href) {
  if (/^(?:https?:|mailto:|#)/u.test(href)) {
    return href;
  }

  if (href.startsWith("../examples/")) {
    return `https://github.com/DanieleMasone/form-schema-runtime/tree/main/${href.slice(3)}`;
  }

  if (href.startsWith("docs/")) {
    return `${siteBase}${href.replace(/\.md$/u, "/")}`;
  }

  if (href.endsWith(".md")) {
    return `${siteBase}docs/${href.replace(/\.md$/u, "/")}`;
  }

  return href;
}

function renderInline(markdown) {
  const codeSpans = [];
  let html = escapeHtml(markdown).replace(/`([^`]+)`/gu, (_match, code) => {
    const token = `@@CODE${codeSpans.length}@@`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  html = html
    .replace(/\*\*([^*]+)\*\*/gu, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gu, (_match, label, href) => {
      const rewrittenHref = escapeHtml(rewriteHref(href));
      return `<a href="${rewrittenHref}">${label}</a>`;
    });

  codeSpans.forEach((code, index) => {
    html = html.replace(`@@CODE${index}@@`, code);
  });

  return html;
}

function renderTable(rows) {
  const parsedRows = rows.map((row) =>
    row
      .trim()
      .replace(/^\||\|$/gu, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  const [head, , ...body] = parsedRows;

  return `<div class="docs-table-wrap"><table><thead><tr>${head
    .map((cell) => `<th>${renderInline(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function isTableStart(lines, index) {
  return (
    lines[index]?.includes("|") &&
    /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/u.test(lines[index + 1] ?? "")
  );
}

function renderList(lines, startIndex, ordered) {
  const items = [];
  let index = startIndex;
  const pattern = ordered ? /^\s*\d+\.\s+(.+)$/u : /^\s*-\s+(.+)$/u;

  while (index < lines.length) {
    const match = lines[index].match(pattern);

    if (!match) {
      break;
    }

    items.push(`<li>${renderInline(match[1])}</li>`);
    index += 1;
  }

  return {
    html: `<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`,
    nextIndex: index
  };
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/gu, "\n").split("\n");
  const headings = [];
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        `<pre class="docs-code"><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(
          code.join("\n")
        )}</code></pre>`
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/u);

    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const baseId = slugify(text);
      const duplicateCount = headings.filter((item) => item.baseId === baseId).length;
      const id = duplicateCount > 0 ? `${baseId}-${duplicateCount + 1}` : baseId;

      headings.push({ id, baseId, level, text });
      blocks.push(`<h${level} id="${id}">${renderInline(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const rows = [];

      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(lines[index]);
        index += 1;
      }

      blocks.push(renderTable(rows));
      continue;
    }

    if (/^\s*-\s+/u.test(line)) {
      const result = renderList(lines, index, false);
      blocks.push(result.html);
      index = result.nextIndex;
      continue;
    }

    if (/^\s*\d+\.\s+/u.test(line)) {
      const result = renderList(lines, index, true);
      blocks.push(result.html);
      index = result.nextIndex;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("```") &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !isTableStart(lines, index) &&
      !/^\s*(?:-|\d+\.)\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return {
    html: blocks.join("\n"),
    headings
  };
}

function navigationLinks() {
  return primaryDocs
    .map((doc) => `<a href="${pageHref(doc.source)}">${escapeHtml(doc.title)}</a>`)
    .join("");
}

function renderToc(headings) {
  const tocItems = headings.filter((heading) => heading.level >= 2 && heading.level <= 3);

  if (tocItems.length < 2) {
    return "";
  }

  return `<aside class="docs-toc" aria-label="Table of contents"><h2>On This Page</h2><ol>${tocItems
    .map((heading) => `<li class="toc-level-${heading.level}"><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`)
    .join("")}</ol></aside>`;
}

function pageShell({ title, description, body, toc = "" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | form-schema-runtime</title>
    <link rel="stylesheet" href="${siteBase}docs/assets/docs.css" />
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="docs-header">
      <div>
        <a class="docs-brand" href="${siteBase}">form-schema-runtime</a>
        <p>${escapeHtml(description)}</p>
      </div>
      <nav class="docs-top-links" aria-label="Project links">
        <a href="${siteBase}">Demo</a>
        <a href="${siteBase}api/">API</a>
        <a href="${siteBase}coverage/">Coverage</a>
        <a href="https://www.npmjs.com/package/form-schema-runtime">npm</a>
        <a href="https://github.com/DanieleMasone/form-schema-runtime">GitHub</a>
      </nav>
    </header>
    <div class="docs-layout">
      <nav class="docs-side-nav" aria-label="Documentation">${navigationLinks()}</nav>
      <main id="content" class="docs-content">
        ${body}
      </main>
      ${toc}
    </div>
  </body>
</html>`;
}

function renderIndexPage() {
  const primaryCards = primaryDocs
    .map(
      (doc) => `<article class="docs-card"><h2><a href="${pageHref(doc.source)}">${escapeHtml(doc.title)}</a></h2><p>${escapeHtml(
        doc.description
      )}</p></article>`
    )
    .join("");
  const supplementalLinks = supplementalDocs
    .map((doc) => `<li><a href="${pageHref(doc.source)}">${escapeHtml(doc.title)}</a></li>`)
    .join("");

  return pageShell({
    title: "Documentation",
    description: "HTML documentation generated from the repository Markdown sources.",
    body: `<section class="docs-hero">
          <p class="docs-eyebrow">Documentation</p>
          <h1>Documentation</h1>
          <p>These pages are generated at build time from the repository Markdown docs. Use them for the live GitHub Pages experience; use the Markdown files when browsing source on GitHub.</p>
        </section>
        <section class="docs-card-grid" aria-label="Primary documentation">${primaryCards}</section>
        <section class="docs-extra">
          <h2>Supplemental Docs</h2>
          <ul>${supplementalLinks}</ul>
        </section>`
  });
}

function docsStyles() {
  return `:root {
  --docs-bg: #f7f9fc;
  --docs-panel: #ffffff;
  --docs-text: #172033;
  --docs-muted: #5d6b7d;
  --docs-border: #d8e0ea;
  --docs-primary: #166a6f;
  --docs-primary-dark: #104d52;
  --docs-code-bg: #101827;
  --docs-code-text: #edf4ff;
  --docs-radius: 8px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-padding-top: 16px;
}

body {
  margin: 0;
  color: var(--docs-text);
  background: var(--docs-bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.65;
}

a {
  color: var(--docs-primary);
  font-weight: 700;
}

a:hover {
  color: var(--docs-primary-dark);
}

.skip-link {
  position: absolute;
  left: 16px;
  top: 12px;
  z-index: 10;
  padding: 8px 10px;
  transform: translateY(-160%);
  border-radius: var(--docs-radius);
  color: #ffffff;
  background: var(--docs-primary);
}

.skip-link:focus {
  transform: translateY(0);
}

.docs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 24px clamp(16px, 4vw, 48px);
  border-bottom: 1px solid var(--docs-border);
  background: var(--docs-panel);
}

.docs-brand {
  display: inline-block;
  margin-bottom: 6px;
  color: var(--docs-text);
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
}

.docs-header p {
  max-width: 62ch;
  margin: 0;
  color: var(--docs-muted);
}

.docs-top-links,
.docs-side-nav {
  display: flex;
  gap: 10px;
}

.docs-top-links {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.docs-top-links a,
.docs-side-nav a {
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius);
  background: var(--docs-panel);
  text-decoration: none;
}

.docs-top-links a {
  padding: 8px 10px;
}

.docs-layout {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr) minmax(180px, 240px);
  gap: 24px;
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 24px clamp(14px, 3vw, 40px) 48px;
}

.docs-side-nav,
.docs-toc {
  position: sticky;
  top: 16px;
  align-self: start;
  max-height: calc(100vh - 32px);
  overflow: auto;
}

.docs-side-nav {
  flex-direction: column;
}

.docs-side-nav a {
  padding: 9px 10px;
  color: var(--docs-text);
}

.docs-content {
  min-width: 0;
  padding: clamp(18px, 3vw, 36px);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius);
  background: var(--docs-panel);
}

.docs-content > :first-child {
  margin-top: 0;
}

.docs-content h1 {
  margin: 0 0 18px;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.05;
}

.docs-content h2 {
  margin-top: 36px;
  padding-top: 10px;
  border-top: 1px solid var(--docs-border);
  font-size: 1.55rem;
}

.docs-content h3 {
  margin-top: 26px;
  font-size: 1.2rem;
}

.docs-content p,
.docs-content li {
  max-width: 78ch;
}

.docs-content code {
  padding: 0.1em 0.35em;
  border-radius: 5px;
  background: #edf2f7;
  font-size: 0.92em;
}

.docs-code {
  overflow-x: auto;
  max-width: 100%;
  padding: 16px;
  border-radius: var(--docs-radius);
  background: var(--docs-code-bg);
}

.docs-code code {
  padding: 0;
  color: var(--docs-code-text);
  background: transparent;
}

.docs-table-wrap {
  overflow-x: auto;
  max-width: 100%;
  margin: 20px 0;
}

table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border: 1px solid var(--docs-border);
  text-align: left;
  vertical-align: top;
}

th {
  background: #eef5f6;
}

.docs-toc {
  padding: 16px;
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius);
  background: var(--docs-panel);
}

.docs-toc h2 {
  margin: 0 0 8px;
  font-size: 0.95rem;
}

.docs-toc ol {
  margin: 0;
  padding-left: 18px;
}

.docs-toc li {
  margin: 6px 0;
}

.docs-toc .toc-level-3 {
  margin-left: 12px;
}

.docs-hero {
  padding-bottom: 24px;
}

.docs-eyebrow {
  margin: 0 0 8px;
  color: var(--docs-primary);
  font-weight: 800;
  text-transform: uppercase;
}

.docs-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.docs-card {
  padding: 16px;
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius);
  background: #fbfdff;
}

.docs-card h2 {
  margin: 0 0 8px;
  padding: 0;
  border: 0;
  font-size: 1.1rem;
}

.docs-card p {
  margin: 0;
  color: var(--docs-muted);
}

.docs-extra {
  margin-top: 28px;
}

@media (max-width: 1040px) {
  .docs-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .docs-side-nav,
  .docs-toc {
    position: static;
    max-height: none;
  }

  .docs-side-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .docs-header {
    display: block;
  }

  .docs-top-links {
    justify-content: flex-start;
    margin-top: 16px;
  }

  .docs-side-nav,
  .docs-card-grid {
    grid-template-columns: 1fr;
  }

  .docs-content {
    padding: 18px 14px;
  }

  .docs-content h1 {
    font-size: 2rem;
  }
}
`;
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function renderDocPage(doc) {
  const sourcePath = path.join(docsSourceRoot, doc.source);
  const markdown = await readFile(sourcePath, "utf8");
  const rendered = renderMarkdown(markdown);
  const targetDirectory = outputDirectoryForSource(doc.source);
  const title = doc.title;

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(
    path.join(targetDirectory, "index.html"),
    pageShell({
      title,
      description: doc.description ?? "Generated HTML documentation for form-schema-runtime.",
      body: rendered.html,
      toc: renderToc(rendered.headings)
    }),
    "utf8"
  );
}

try {
  await stat(docsSourceRoot);
} catch {
  console.warn("Documentation source folder not found.");
  process.exit(0);
}

await rm(docsTargetRoot, { recursive: true, force: true });
await mkdir(path.join(docsTargetRoot, "assets"), { recursive: true });
await writeFile(path.join(docsTargetRoot, "assets", "docs.css"), docsStyles(), "utf8");
await writeFile(path.join(docsTargetRoot, "index.html"), renderIndexPage(), "utf8");

for (const doc of [...primaryDocs, ...supplementalDocs]) {
  const sourcePath = path.join(docsSourceRoot, doc.source);

  if (await fileExists(sourcePath)) {
    await renderDocPage(doc);
  }
}

console.log("HTML documentation generated in dist-demo/docs.");
