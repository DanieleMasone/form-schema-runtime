import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const docsRoot = path.join(repositoryRoot, "dist-demo", "docs");
const docsStylesSource = path.join(repositoryRoot, "site-docs", "docs.css");
const docsNavigationSource = path.join(repositoryRoot, "site-docs", "navigation.js");
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
  "assets/docs.css",
  "assets/navigation.js"
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
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

function resolveLocalSiteTarget(href) {
  const sitePrefix = "/form-schema-runtime/";

  if (!href.startsWith(sitePrefix)) {
    return null;
  }

  const relativePath = decodeURIComponent(href.slice(sitePrefix.length).split(/[?#]/u)[0]);

  if (!relativePath) {
    return path.join(repositoryRoot, "dist-demo", "index.html");
  }

  return relativePath.endsWith("/")
    ? path.join(repositoryRoot, "dist-demo", relativePath, "index.html")
    : path.join(repositoryRoot, "dist-demo", relativePath);
}

if (!existsSync(docsRoot)) {
  fail("dist-demo/docs is missing. Run npm run build before npm run test:site-docs.");
} else {
  assert(existsSync(docsStylesSource), "site-docs/docs.css is missing.");
  assert(existsSync(docsNavigationSource), "site-docs/navigation.js is missing.");

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

  walkFiles(docsRoot)
    .filter((filePath) => filePath.endsWith(".html"))
    .forEach((filePath) => {
      const html = readFileSync(filePath, "utf8");

      assert(html.includes('<html lang="en">'), `Generated docs page must declare English language: ${filePath}.`);
      assert(html.includes('meta name="viewport"'), `Generated docs page must include viewport metadata: ${filePath}.`);
      assert(html.includes('meta name="description"'), `Generated docs page must include a description: ${filePath}.`);
      assert(
        html.includes('rel="canonical" href="https://danielemasone.github.io/form-schema-runtime/docs/'),
        `Generated docs page must include a Pages canonical URL: ${filePath}.`
      );
      assert(html.includes('<main id="content"'), `Generated docs page must expose the main content landmark: ${filePath}.`);
      assert(html.includes('class="docs-navigation"'), `Generated docs page must include responsive docs navigation: ${filePath}.`);
      assert(
        html.includes('src="/form-schema-runtime/docs/assets/navigation.js"'),
        `Generated docs page must load the responsive navigation controller: ${filePath}.`
      );
      assert(
        html.includes('<a href="/form-schema-runtime/docs/" aria-current="page">Docs</a>'),
        `Generated docs page must identify Docs as the current product area: ${filePath}.`
      );

      [...html.matchAll(/href="([^"]+)"/gu)].forEach((match) => {
        const href = match[1];

        if (href.includes(".md")) {
          fail(`Generated docs link must not expose Markdown directly: ${href} in ${filePath}.`);
        }

        const localTarget = resolveLocalSiteTarget(href);

        if (localTarget && !existsSync(localTarget)) {
          fail(`Generated docs link target is missing: ${href} in ${filePath}.`);
        }
      });
    });

  const indexHtml = readFileSync(path.join(docsRoot, "index.html"), "utf8");
  const usageHtml = readFileSync(path.join(docsRoot, "usage-guide", "index.html"), "utf8");
  const featureMatrixHtml = readFileSync(path.join(docsRoot, "feature-matrix", "index.html"), "utf8");
  const generatedStyles = readFileSync(path.join(docsRoot, "assets", "docs.css"), "utf8");
  const sourceStyles = readFileSync(docsStylesSource, "utf8");
  const generatedNavigation = readFileSync(path.join(docsRoot, "assets", "navigation.js"), "utf8");
  const sourceNavigation = readFileSync(docsNavigationSource, "utf8");

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

  if (!usageHtml.includes('<pre class="docs-code" tabindex="0">') || !usageHtml.includes("<code")) {
    fail("Usage Guide HTML must render fenced code blocks.");
  }

  assert(usageHtml.includes('class="docs-toc"'), "Usage Guide must expose a responsive table of contents.");
  assert(
    usageHtml.includes('href="/form-schema-runtime/docs/usage-guide/" aria-current="page"'),
    "Usage Guide navigation must expose its current-page state."
  );
  assert(
    featureMatrixHtml.includes('class="docs-table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"'),
    "Feature Matrix tables must provide a keyboard-scrollable local region."
  );
  assert(generatedStyles === sourceStyles, "Generated docs CSS must be copied from site-docs/docs.css without divergence.");
  assert(
    generatedNavigation === sourceNavigation,
    "Generated docs navigation must be copied from site-docs/navigation.js without divergence."
  );
}

if (process.exitCode) {
  process.exit();
}

console.log("Generated HTML documentation verification passed.");
