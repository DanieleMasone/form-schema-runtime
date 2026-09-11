import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const docsRoot = path.join(repositoryRoot, "dist-demo", "docs");
const docsStylesSource = path.join(repositoryRoot, "site-docs", "docs.css");
const docsNavigationSource = path.join(repositoryRoot, "site-docs", "navigation.js");
const faviconTarget = path.join(repositoryRoot, "dist-demo", "favicon.svg");
const readmePath = path.join(repositoryRoot, "README.md");
const coverageSummaryPath = path.join(repositoryRoot, "coverage", "coverage-summary.json");
const coverageBadgePath = path.join(repositoryRoot, "dist-demo", "badges", "coverage.json");
const coverageEndpointUrl = "https://danielemasone.github.io/form-schema-runtime/badges/coverage.json";
const coverageBadgeUrl = `https://img.shields.io/endpoint?url=${encodeURIComponent(coverageEndpointUrl)}`;
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

function expectedCanonicalUrl(rootDirectory, filePath, publicBaseUrl) {
  const relativePath = path.relative(rootDirectory, filePath).split(path.sep).join("/");
  const canonicalPath =
    relativePath === "index.html"
      ? ""
      : relativePath.endsWith("/index.html")
        ? relativePath.slice(0, -"index.html".length)
        : relativePath;

  return new URL(canonicalPath, publicBaseUrl).href;
}

function verifyGeneratedArea({ label, rootDirectory, publicBaseUrl, faviconPattern }) {
  assert(existsSync(rootDirectory), `${label} output is missing.`);

  if (!existsSync(rootDirectory)) {
    return;
  }

  walkFiles(rootDirectory)
    .filter((filePath) => filePath.endsWith(".html"))
    .forEach((filePath) => {
      const html = readFileSync(filePath, "utf8");
      const canonicalUrl = expectedCanonicalUrl(rootDirectory, filePath, publicBaseUrl);

      assert(/<html[^>]+lang="en"/u.test(html), `${label} page must declare English language: ${filePath}.`);
      assert(html.includes('meta name="viewport"'), `${label} page must include viewport metadata: ${filePath}.`);
      assert(html.includes('meta name="description"'), `${label} page must include a description: ${filePath}.`);
      assert(faviconPattern.test(html), `${label} page must include a favicon: ${filePath}.`);
      assert(
        html.includes(`rel="canonical" href="${canonicalUrl}"`),
        `${label} page must use its exact public canonical URL ${canonicalUrl}: ${filePath}.`
      );
    });
}

function expectedCoverageColor(percentage) {
  if (percentage >= 90) {
    return "brightgreen";
  }

  if (percentage >= 80) {
    return "green";
  }

  if (percentage >= 70) {
    return "yellowgreen";
  }

  if (percentage >= 60) {
    return "yellow";
  }

  return "red";
}

function verifyCoverageBadge() {
  assert(existsSync(coverageSummaryPath), "coverage/coverage-summary.json is missing.");
  assert(existsSync(coverageBadgePath), "dist-demo/badges/coverage.json is missing.");

  if (!existsSync(coverageSummaryPath) || !existsSync(coverageBadgePath)) {
    return;
  }

  const summary = JSON.parse(readFileSync(coverageSummaryPath, "utf8"));
  const badge = JSON.parse(readFileSync(coverageBadgePath, "utf8"));
  const linesPercentage = summary?.total?.lines?.pct;

  assert(
    typeof linesPercentage === "number" && Number.isFinite(linesPercentage),
    "Coverage summary must contain a numeric total.lines.pct."
  );
  assert(badge.schemaVersion === 1, "Coverage badge schemaVersion must be 1.");
  assert(badge.label === "coverage", 'Coverage badge label must be "coverage".');
  assert(badge.message === `${linesPercentage}%`, "Coverage badge must expose the generated Lines percentage.");
  assert(badge.color === expectedCoverageColor(linesPercentage), "Coverage badge color must follow the Lines thresholds.");
}

function verifyReadmeBadges() {
  const readme = readFileSync(readmePath, "utf8");
  const badgeLinks = [...readme.matchAll(/\[!\[([^\]]+)\]\((https:\/\/[^)\s]+)\)\]\((https:\/\/[^)\s]+)\)/gu)].map(
    ([, label, imageUrl, targetUrl]) => ({ label, imageUrl, targetUrl })
  );
  const expectedBadges = [
    {
      label: "CI",
      imageUrl:
        "https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml/badge.svg?branch=main&event=push",
      targetUrl: "https://github.com/DanieleMasone/form-schema-runtime/actions/workflows/ci.yml"
    },
    {
      label: "npm version",
      imageUrl: "https://img.shields.io/npm/v/form-schema-runtime",
      targetUrl: "https://www.npmjs.com/package/form-schema-runtime"
    },
    {
      label: "coverage",
      imageUrl: coverageBadgeUrl,
      targetUrl: "https://danielemasone.github.io/form-schema-runtime/coverage/"
    }
  ];

  assert(badgeLinks.length === expectedBadges.length, "README must contain exactly three high-signal badges.");
  expectedBadges.forEach((expectedBadge) => {
    assert(
      badgeLinks.some(
        (badge) =>
          badge.label === expectedBadge.label &&
          badge.imageUrl === expectedBadge.imageUrl &&
          badge.targetUrl === expectedBadge.targetUrl
      ),
      `README is missing the expected dynamic ${expectedBadge.label} badge.`
    );
  });
  assert(!readme.includes("img.shields.io/badge/"), "README must not contain static Shields project badges.");
}

if (!existsSync(docsRoot)) {
  fail("dist-demo/docs is missing. Run npm run build before npm run test:site-docs.");
} else {
  assert(existsSync(docsStylesSource), "site-docs/docs.css is missing.");
  assert(existsSync(docsNavigationSource), "site-docs/navigation.js is missing.");
  assert(existsSync(faviconTarget), "dist-demo/favicon.svg is missing.");

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
        html.includes('rel="icon" type="image/svg+xml" href="/form-schema-runtime/favicon.svg"'),
        `Generated docs page must include the shared favicon: ${filePath}.`
      );
      assert(
        html.includes('rel="canonical" href="https://danielemasone.github.io/form-schema-runtime/docs/'),
        `Generated docs page must include a Pages canonical URL: ${filePath}.`
      );
      assert(html.includes('property="og:type" content="website"'), `Generated docs page must declare its Open Graph type: ${filePath}.`);
      assert(html.includes('property="og:site_name" content="form-schema-runtime"'), `Generated docs page must identify its Open Graph site: ${filePath}.`);
      assert(html.includes('property="og:title" content="'), `Generated docs page must include an Open Graph title: ${filePath}.`);
      assert(html.includes('property="og:description" content="'), `Generated docs page must include an Open Graph description: ${filePath}.`);
      const canonicalUrl = html.match(/rel="canonical" href="([^"]+)"/u)?.[1];
      assert(
        canonicalUrl !== undefined && html.includes(`property="og:url" content="${canonicalUrl}"`),
        `Generated docs page Open Graph URL must match its canonical URL: ${filePath}.`
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

verifyGeneratedArea({
  label: "TypeDoc",
  rootDirectory: path.join(repositoryRoot, "dist-demo", "api"),
  publicBaseUrl: "https://danielemasone.github.io/form-schema-runtime/api/",
  faviconPattern: /rel="icon" href="[^"]*favicon\.svg"/u
});
verifyGeneratedArea({
  label: "Coverage",
  rootDirectory: path.join(repositoryRoot, "dist-demo", "coverage"),
  publicBaseUrl: "https://danielemasone.github.io/form-schema-runtime/coverage/",
  faviconPattern: /rel="shortcut icon"[^>]+href="[^"]*favicon\.png"/u
});
verifyCoverageBadge();
verifyReadmeBadges();

if (process.exitCode) {
  process.exit();
}

console.log("Generated HTML documentation verification passed.");
