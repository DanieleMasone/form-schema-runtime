import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const examplesRoot = path.join(repositoryRoot, "examples");
const pagesExamplesRoot = path.join(repositoryRoot, "dist-demo", "examples");
const shouldVerifyPages = process.argv.includes("--pages");
const ignoredDirectoryNames = new Set([".angular", ".vite", "dist", "node_modules"]);
const localSourcePatterns = [
  /from\s+["'](?:\.\.\/)+src(?:\/index)?["']/,
  /from\s+["'](?:\.\.\/)+src\//,
  /import\s+["'](?:\.\.\/)+src\//,
  /form-schema-runtime["']\s*:\s*["'](?:file:|link:|workspace:|\.\.?\/)/
];

const examples = [
  {
    directory: "react-vite",
    pagesRoute: "react",
    pagesBase: "/form-schema-runtime/examples/react/",
    requiredFiles: ["index.html", "package.json", "README.md", "src/App.tsx", "src/main.tsx"],
    requiredDependencies: ["form-schema-runtime", "react", "react-dom"],
    requiredDevDependencies: ["@vitejs/plugin-react", "typescript", "vite"],
    requiredPatterns: [/useRef/, /useEffect/, /createForm/, /form\.destroy\(\)/]
  },
  {
    directory: "vue-vite",
    pagesRoute: "vue",
    pagesBase: "/form-schema-runtime/examples/vue/",
    requiredFiles: ["index.html", "package.json", "README.md", "src/App.vue", "src/main.ts"],
    requiredDependencies: ["form-schema-runtime", "vue"],
    requiredDevDependencies: ["@vitejs/plugin-vue", "typescript", "vite", "vue-tsc"],
    requiredPatterns: [/ref<HTMLElement \| null>/, /onMounted/, /onUnmounted/, /createForm/, /form\?\.destroy\(\)/]
  },
  {
    directory: "angular",
    pagesRoute: "angular",
    pagesBase: "/form-schema-runtime/examples/angular/",
    requiredFiles: [
      "angular.json",
      "package.json",
      "README.md",
      "src/app/app.component.ts",
      "src/index.html",
      "src/main.ts",
      "src/styles.css",
      "tsconfig.app.json",
      "tsconfig.json"
    ],
    requiredDependencies: ["@angular/core", "@angular/platform-browser", "form-schema-runtime", "rxjs", "zone.js"],
    requiredDevDependencies: ["@angular/build", "@angular/cli", "@angular/compiler-cli", "typescript"],
    requiredPatterns: [/ViewChild/, /ElementRef/, /AfterViewInit/, /OnDestroy/, /createForm/, /form\?\.destroy\(\)/]
  }
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

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function walkFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      if (ignoredDirectoryNames.has(entry)) {
        return [];
      }

      return walkFiles(entryPath);
    }

    return [entryPath];
  });
}

function readTextFiles(directory) {
  return walkFiles(directory)
    .filter((filePath) => /\.(?:css|html|json|md|ts|tsx|vue)$/.test(filePath))
    .map((filePath) => readFileSync(filePath, "utf8"))
    .join("\n");
}

function assertDependencySet(packageJson, names, dependencyKind, exampleDirectory) {
  names.forEach((name) => {
    assert(
      typeof packageJson[dependencyKind]?.[name] === "string",
      `${exampleDirectory} must declare ${name} in ${dependencyKind}.`
    );
  });
}

assert(existsSync(examplesRoot), "examples/ directory is missing.");
assert(existsSync(path.join(examplesRoot, "README.md")), "examples/README.md is missing.");

const rootPackageJson = readJson(path.join(repositoryRoot, "package.json"));
assert(
  !rootPackageJson.files?.some((file) => file === "examples" || file.startsWith("examples/")),
  "Root package.json files must not include examples/."
);

examples.forEach((example) => {
  const exampleRoot = path.join(examplesRoot, example.directory);
  const manifestPath = path.join(exampleRoot, "package.json");

  assert(existsSync(exampleRoot), `${example.directory} example directory is missing.`);
  example.requiredFiles.forEach((file) => {
    assert(existsSync(path.join(exampleRoot, file)), `${example.directory} is missing ${file}.`);
  });

  const packageJson = readJson(manifestPath);
  const sourceText = readTextFiles(exampleRoot);
  const packageDependency = packageJson.dependencies?.["form-schema-runtime"];

  assert(packageJson.private === true, `${example.directory} must be private.`);
  assert(typeof packageJson.scripts?.dev === "string", `${example.directory} must have a dev script.`);
  assert(typeof packageJson.scripts?.build === "string", `${example.directory} must have a build script.`);
  assertDependencySet(packageJson, example.requiredDependencies, "dependencies", example.directory);
  assertDependencySet(packageJson, example.requiredDevDependencies, "devDependencies", example.directory);
  assert(
    typeof packageDependency === "string" && !/^(?:file:|link:|workspace:|\.\.?\/)/.test(packageDependency),
    `${example.directory} must consume form-schema-runtime from npm, not local source.`
  );
  assert(
    sourceText.includes('from "form-schema-runtime"'),
    `${example.directory} must import runtime APIs from the public package.`
  );
  assert(
    sourceText.includes('"form-schema-runtime/styles.css"'),
    `${example.directory} must import the public CSS export.`
  );

  localSourcePatterns.forEach((pattern) => {
    assert(!pattern.test(sourceText), `${example.directory} must not import local runtime source.`);
  });

  example.requiredPatterns.forEach((pattern) => {
    assert(pattern.test(sourceText), `${example.directory} is missing required integration pattern ${pattern}.`);
  });
});

if (shouldVerifyPages) {
  assert(
    existsSync(path.join(repositoryRoot, "dist-demo", "index.html")),
    "dist-demo is missing. Run npm run build and npm run build:examples before npm run test:examples."
  );

  examples.forEach((example) => {
    const pageIndexPath = path.join(pagesExamplesRoot, example.pagesRoute, "index.html");

    assert(existsSync(pageIndexPath), `Pages output is missing ${example.pagesRoute}/index.html.`);

    if (existsSync(pageIndexPath)) {
      const indexHtml = readFileSync(pageIndexPath, "utf8");

      assert(
        indexHtml.includes(example.pagesBase),
        `${example.directory} Pages output must use base path ${example.pagesBase}.`
      );
    }
  });
}

if (process.exitCode) {
  process.exit();
}

console.log(shouldVerifyPages ? "Example source and Pages output verification passed." : "Example structure verification passed.");
