import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmExecPath = process.env.npm_execpath;
const npmCache = path.join(repositoryRoot, ".cache", "npm");
const tempRoot = mkdtempSync(path.join(tmpdir(), "form-schema-runtime-consumer-"));
let tarballPath;

function run(command, args, cwd = repositoryRoot) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      env: {
        ...process.env,
        npm_config_cache: npmCache
      },
      stdio: ["ignore", "pipe", "inherit"]
    });
  } catch (error) {
    const renderedCommand = [command, ...args].join(" ");
    throw new Error(`Command failed in ${cwd}: ${renderedCommand}`, { cause: error });
  }
}

function runNpm(args, cwd = repositoryRoot) {
  if (npmExecPath) {
    return run(process.execPath, [npmExecPath, ...args], cwd);
  }

  return run(npmCommand, args, cwd);
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function packLibrary() {
  const output = runNpm(["pack", "--json"]);
  const [pack] = JSON.parse(output);

  if (!pack?.filename) {
    throw new Error("npm pack did not return a tarball filename.");
  }

  tarballPath = path.join(repositoryRoot, pack.filename);

  if (!existsSync(tarballPath)) {
    throw new Error(`Expected npm pack tarball at ${tarballPath}.`);
  }
}

function createConsumerProject() {
  runNpm(["init", "-y"], tempRoot);
  runNpm(["install", tarballPath], tempRoot);

  const sourceDirectory = path.join(tempRoot, "src");
  mkdirSync(sourceDirectory, { recursive: true });

  writeFileSync(
    path.join(sourceDirectory, "consumer.ts"),
    `import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";

const schema: FormSchema = {
  id: "consumer-smoke",
  title: "Consumer smoke",
  fields: [
    {
      type: "text",
      name: "fullName",
      label: "Full name",
      required: true
    }
  ]
};

if (typeof createForm !== "function") {
  throw new Error("createForm export is not a function.");
}

export { schema };
`
  );

  writeJson(path.join(tempRoot, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      allowArbitraryExtensions: true
    },
    include: ["src"]
  });
}

function typecheckConsumer() {
  const tscPath = require.resolve("typescript/bin/tsc");
  run(process.execPath, [tscPath, "-p", path.join(tempRoot, "tsconfig.json")], tempRoot);
}

function verifyInstalledPackage() {
  const verifierPath = path.join(tempRoot, "verify-package.mjs");

  writeFileSync(
    verifierPath,
    `import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.join(process.cwd(), "node_modules", "form-schema-runtime");
const packageJsonPath = path.join(packageRoot, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const runtime = await import("form-schema-runtime");
assert(typeof runtime.createForm === "function", "ESM import did not expose createForm.");

const esmEntry = fileURLToPath(import.meta.resolve("form-schema-runtime"));
const cssEntry = fileURLToPath(import.meta.resolve("form-schema-runtime/styles.css"));

assert(existsSync(esmEntry), "Resolved ESM entry does not exist.");
assert(existsSync(cssEntry), "Resolved CSS export does not exist.");
assert(existsSync(path.join(packageRoot, packageJson.types)), "Package types entry does not exist.");
assert(existsSync(path.join(packageRoot, packageJson.exports["."].types)), "Root export types do not exist.");
assert(existsSync(path.join(packageRoot, packageJson.unpkg)), "IIFE bundle does not exist.");
assert(packageJson.exports["./styles.css"].types === "./dist/types/styles.css.d.ts", "CSS export types are incorrect.");
assert(packageJson.exports["./styles.css"].default === "./dist/form-schema-runtime.css", "CSS export is incorrect.");
`
  );

  run(process.execPath, [verifierPath], tempRoot);
}

try {
  runNpm(["run", "build:lib"]);
  packLibrary();
  createConsumerProject();
  typecheckConsumer();
  verifyInstalledPackage();
  console.log("Consumer smoke test passed.");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });

  if (tarballPath) {
    rmSync(tarballPath, { force: true });
  }
}
