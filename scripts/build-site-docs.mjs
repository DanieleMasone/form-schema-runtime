import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const docsSourceRoot = path.join(repositoryRoot, "docs");
const docsTargetRoot = path.join(repositoryRoot, "dist-demo", "docs");
const docsStylesSource = path.join(repositoryRoot, "site-docs", "docs.css");
const docsNavigationSource = path.join(repositoryRoot, "site-docs", "navigation.js");
const siteBase = "/form-schema-runtime/";
const siteOrigin = "https://danielemasone.github.io";

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
  {
    title: "Custom Validators Example",
    source: "examples/custom-validators.md",
    description: "A complete synchronous custom validator example."
  },
  {
    title: "Custom Renderers Example",
    source: "examples/custom-renderers.md",
    description: "A complete accessible custom field renderer example."
  },
  {
    title: "ADR 0001: Framework-Agnostic TypeScript Core",
    source: "adr/0001-framework-agnostic-typescript-core.md",
    description: "The architectural decision behind the framework-agnostic DOM runtime."
  }
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

  return `<div class="docs-table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"><table><thead><tr>${head
    .map((cell) => `<th scope="col">${renderInline(cell)}</th>`)
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
        `<pre class="docs-code" tabindex="0"><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(
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

function navigationLinks(currentSource) {
  return primaryDocs
    .map((doc) => {
      const current = doc.source === currentSource ? ' aria-current="page"' : "";
      return `<a href="${pageHref(doc.source)}"${current}>${escapeHtml(doc.title)}</a>`;
    })
    .join("");
}

function renderToc(headings) {
  const tocItems = headings.filter((heading) => heading.level >= 2 && heading.level <= 3);

  if (tocItems.length < 2) {
    return "";
  }

  return `<details class="docs-toc"><summary>On this page</summary><ol>${tocItems
    .map((heading) => `<li class="toc-level-${heading.level}"><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`)
    .join("")}</ol></details>`;
}

function pageShell({ title, description, body, toc = "", currentSource, canonicalPath }) {
  const mainClass = toc ? "docs-main docs-main--with-toc" : "docs-main";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${siteOrigin}${canonicalPath}" />
    <title>${escapeHtml(title)} | form-schema-runtime</title>
    <link rel="stylesheet" href="${siteBase}docs/assets/docs.css" />
    <script type="module" src="${siteBase}docs/assets/navigation.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="docs-header">
      <div>
        <a class="docs-brand" href="${siteBase}">form-schema-runtime</a>
        <p>${escapeHtml(description)}</p>
      </div>
      <nav class="docs-top-links" aria-label="Project">
        <a href="${siteBase}">Demo</a>
        <a href="${siteBase}docs/" aria-current="page">Docs</a>
        <a href="${siteBase}api/">API</a>
        <a href="${siteBase}#framework-examples">Examples</a>
        <a href="${siteBase}coverage/">Coverage</a>
        <a href="https://www.npmjs.com/package/form-schema-runtime">npm</a>
        <a href="https://github.com/DanieleMasone/form-schema-runtime">GitHub</a>
      </nav>
    </header>
    <div class="docs-layout">
      <details class="docs-navigation">
        <summary>Documentation pages</summary>
        <nav class="docs-side-nav" aria-label="Documentation">${navigationLinks(currentSource)}</nav>
      </details>
      <main id="content" class="${mainClass}">
        ${toc}
        <article class="docs-content">
          ${body}
        </article>
      </main>
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
    description: "Guides and references for installing, configuring, extending, and integrating form-schema-runtime.",
    canonicalPath: `${siteBase}docs/`,
    body: `<section class="docs-hero">
          <p class="docs-eyebrow">Documentation</p>
          <h1>Documentation</h1>
          <p>Start with the Usage Guide for a working form, then use the focused references for schema design, validation, customization, accessibility, and framework lifecycle integration.</p>
        </section>
        <section class="docs-card-grid" aria-label="Primary documentation">${primaryCards}</section>
        <section class="docs-extra">
          <h2>Supplemental documentation</h2>
          <ul>${supplementalLinks}</ul>
        </section>`
  });
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

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(
    path.join(targetDirectory, "index.html"),
    pageShell({
      title: doc.title,
      description: doc.description,
      body: rendered.html,
      toc: renderToc(rendered.headings),
      currentSource: doc.source,
      canonicalPath: pageHref(doc.source)
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
await copyFile(docsStylesSource, path.join(docsTargetRoot, "assets", "docs.css"));
await copyFile(docsNavigationSource, path.join(docsTargetRoot, "assets", "navigation.js"));
await writeFile(path.join(docsTargetRoot, "index.html"), renderIndexPage(), "utf8");

for (const doc of [...primaryDocs, ...supplementalDocs]) {
  const sourcePath = path.join(docsSourceRoot, doc.source);

  if (await fileExists(sourcePath)) {
    await renderDocPage(doc);
  }
}

console.log("HTML documentation generated in dist-demo/docs.");
