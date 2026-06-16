import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { get } from "node:https";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "form-schema-runtime";
const EXPECTED_FILES = [
  "LICENSE",
  "README.md",
  "dist/form-schema-runtime.css",
  "dist/form-schema-runtime.iife.js",
  "dist/form-schema-runtime.js",
  "dist/types/index.d.ts",
  "dist/types/styles.css.d.ts",
  "package.json"
];
const EXPECTED_BUILT_FILES = [
  "dist/form-schema-runtime.css",
  "dist/form-schema-runtime.iife.js",
  "dist/form-schema-runtime.js",
  "dist/types/index.d.ts",
  "dist/types/styles.css.d.ts"
];
const FORBIDDEN_PACKAGE_PATHS = [
  ".cache/",
  ".tmp/",
  ".vite/",
  ".vitest/",
  "blob-report/",
  "coverage/",
  "demo/",
  "dist-demo/",
  "docs/",
  "e2e/",
  "playwright-report/",
  "src/",
  "test-results/",
  "tests/",
  "tmp/"
];

const args = process.argv.slice(2);
const tagArgIndex = args.indexOf("--tag");
const releaseTag = tagArgIndex >= 0 ? args[tagArgIndex + 1] : undefined;
const shouldVerifyPack = args.includes("--pack");
const shouldCheckPublished = args.includes("--check-published");
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function validatePackageMetadata() {
  assert(packageJson.name === PACKAGE_NAME, `Expected package name "${PACKAGE_NAME}", got "${packageJson.name}".`);
  assert(packageJson.version, "package.json must include a version.");
  assert(packageJson.description, "package.json must include a description.");
  assert(packageJson.license, "package.json must include a license.");
  assert(packageJson.author, "package.json must include an author.");
  assert(packageJson.repository?.type === "git", "package.json must include repository.type = git.");
  assert(
    packageJson.repository?.url === "git+https://github.com/DanieleMasone/form-schema-runtime.git",
    "package.json repository.url must exactly match the GitHub repository configured for npm Trusted Publishing."
  );
  assert(packageJson.homepage === "https://danielemasone.github.io/form-schema-runtime/", "package.json homepage is missing or incorrect.");
  assert(packageJson.bugs?.url === "https://github.com/DanieleMasone/form-schema-runtime/issues", "package.json bugs.url is missing or incorrect.");
  assert(Array.isArray(packageJson.keywords) && packageJson.keywords.length > 0, "package.json keywords must be present.");
  assert(Array.isArray(packageJson.sideEffects) && packageJson.sideEffects.includes("**/*.css"), "CSS side effects must be declared.");
  assert(JSON.stringify(packageJson.files) === JSON.stringify(["dist", "README.md", "LICENSE"]), "package.json files must publish only dist, README.md, and LICENSE.");
  assert(packageJson.exports?.["."], 'package.json exports must include ".".');
  assert(packageJson.exports?.["./styles.css"], 'package.json exports must include "./styles.css".');
  assert(packageJson.main === "./dist/form-schema-runtime.js", "package.json main is incorrect.");
  assert(packageJson.module === "./dist/form-schema-runtime.js", "package.json module is incorrect.");
  assert(packageJson.types === "./dist/types/index.d.ts", "package.json types is incorrect.");
  assert(packageJson.exports?.["."]?.types === "./dist/types/index.d.ts", "Root export must expose declaration types.");
  assert(packageJson.exports?.["."]?.import === "./dist/form-schema-runtime.js", "Root export must expose ESM import.");
  assert(packageJson.exports?.["."]?.default === "./dist/form-schema-runtime.js", "Root export must expose a default runtime path.");
  assert(packageJson.exports?.["./styles.css"]?.types === "./dist/types/styles.css.d.ts", "CSS export must expose declaration types.");
  assert(packageJson.exports?.["./styles.css"]?.default === "./dist/form-schema-runtime.css", "CSS export must expose ./styles.css.");
  assert(packageJson.unpkg === "./dist/form-schema-runtime.iife.js", "unpkg IIFE path is incorrect.");
  assert(packageJson.jsdelivr === "./dist/form-schema-runtime.iife.js", "jsDelivr IIFE path is incorrect.");
  assert(packageJson.publishConfig?.access === "public", "publishConfig.access must be public.");
  assert(packageJson.private !== true, "Package must not be private.");
}

function fetchNpmPackageMetadata(packageName) {
  const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

  return new Promise((resolve, reject) => {
    const request = get(
      registryUrl,
      {
        headers: {
          accept: "application/vnd.npm.install-v1+json, application/json",
          "user-agent": `${PACKAGE_NAME}-release-verifier`
        }
      },
      (response) => {
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode === 404) {
            resolve(null);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`npm registry returned HTTP ${response.statusCode} for ${packageName}.`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`npm registry returned invalid JSON for ${packageName}.`, { cause: error }));
          }
        });
      }
    );

    request.on("error", (error) => {
      reject(new Error(`Unable to query npm registry for ${packageName}.`, { cause: error }));
    });
    request.setTimeout(30000, () => {
      request.destroy(new Error(`Timed out querying npm registry for ${packageName}.`));
    });
  });
}

async function validatePublishedVersionAvailability() {
  const metadata = await fetchNpmPackageMetadata(packageJson.name);

  if (!metadata) {
    return;
  }

  if (metadata.versions?.[packageJson.version]) {
    fail(`${packageJson.name}@${packageJson.version} is already published on npm.
Bump package.json version and create a new matching GitHub Release tag.
npm package versions are immutable and cannot be overwritten.`);
  }
}

function assertBuiltFile(relativePath, label) {
  const normalizedPath = relativePath.replace(/^\.\//, "");
  const absolutePath = fileURLToPath(new URL(`../${normalizedPath}`, import.meta.url));

  assert(existsSync(absolutePath), `${label} is missing after build: ${relativePath}.`);
}

function validateBuiltOutput() {
  EXPECTED_BUILT_FILES.forEach((file) => assertBuiltFile(file, "Expected build output"));
  assertBuiltFile(packageJson.module, "ESM entry");
  assertBuiltFile(packageJson.main, "Main entry");
  assertBuiltFile(packageJson.unpkg, "IIFE entry");
  assertBuiltFile(packageJson.exports["./styles.css"].default, "CSS export");
  assertBuiltFile(packageJson.exports["./styles.css"].types, "CSS export declaration entry");
  assertBuiltFile(packageJson.types, "Declaration entry");
  assertBuiltFile(packageJson.exports["."].types, "Root export declaration entry");
}

function validateReleaseTag() {
  if (!releaseTag) {
    return;
  }

  const tagPattern = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
  assert(tagPattern.test(releaseTag), `Release tag "${releaseTag}" must use v<semver>, for example v0.1.0.`);

  const versionFromTag = releaseTag.slice(1);
  assert(
    versionFromTag === packageJson.version,
    `Release tag "${releaseTag}" does not match package.json version "${packageJson.version}".`
  );
}

function validatePackContents() {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : "npm";
  const args = npmExecPath
    ? [npmExecPath, "pack", "--dry-run", "--json"]
    : ["pack", "--dry-run", "--json"];
  const output = execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: fileURLToPath(new URL("../.cache/npm", import.meta.url))
    },
    stdio: ["ignore", "pipe", "inherit"]
  });
  const [pack] = JSON.parse(output);
  const files = pack.files.map((file) => file.path).sort();

  EXPECTED_FILES.forEach((file) => {
    assert(files.includes(file), `Package dry-run is missing ${file}.`);
  });

  files.forEach((file) => {
    assert(!file.endsWith(".tgz"), `Package dry-run includes forbidden tarball ${file}.`);

    FORBIDDEN_PACKAGE_PATHS.forEach((prefix) => {
      assert(!file.startsWith(prefix), `Package dry-run includes forbidden path ${file}.`);
    });
  });
}

validatePackageMetadata();
validateReleaseTag();

if (shouldVerifyPack) {
  validateBuiltOutput();
  validatePackContents();
}

if (shouldCheckPublished) {
  await validatePublishedVersionAvailability();
}

if (process.exitCode) {
  process.exit();
}

console.log("Release verification passed.");
