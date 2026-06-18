import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const isWindows = process.platform === "win32";
const npmCache = path.join(repositoryRoot, ".cache", "npm");
const pagesExamplesRoot = path.join(repositoryRoot, "dist-demo", "examples");

const examples = [
  {
    name: "React Vite",
    directory: "react-vite",
    route: "react",
    buildArgs: ["run", "build", "--", "--base=/form-schema-runtime/examples/react/"],
    outputCandidates: ["dist"]
  },
  {
    name: "Vue Vite",
    directory: "vue-vite",
    route: "vue",
    buildArgs: ["run", "build", "--", "--base=/form-schema-runtime/examples/vue/"],
    outputCandidates: ["dist"]
  },
  {
    name: "Angular",
    directory: "angular",
    route: "angular",
    buildArgs: ["run", "build", "--", "--base-href=/form-schema-runtime/examples/angular/"],
    allowExistingOutputOnWindowsFailure: true,
    outputCandidates: [
      path.join("dist", "form-schema-runtime-angular-example", "browser"),
      path.join("dist", "form-schema-runtime-angular-example")
    ]
  }
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function runNpm(args, cwd, label, options = {}) {
  console.log(`\n${label}`);

  const command = isWindows ? "powershell.exe" : "npm";
  const commandArgs = isWindows ? createWindowsNpmArgs(args, cwd) : args;
  const result = spawnSync(command, commandArgs, {
    cwd: isWindows ? repositoryRoot : cwd,
    env: {
      ...process.env,
      npm_config_cache: npmCache
    },
    stdio: "inherit"
  });

  if (result.error) {
    fail(`${label} failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    if (options.allowFailure) {
      console.warn(`${label} failed with exit code ${result.status}; checking for existing build output.`);
      return false;
    }

    fail(`${label} failed with exit code ${result.status}.`);
  }

  return true;
}

function createWindowsNpmArgs(args, cwd) {
  const argumentList = args.map(quotePowerShellArg).join(", ");
  const command = [
    `$process = Start-Process -FilePath 'npm.cmd'`,
    `-ArgumentList @(${argumentList})`,
    `-WorkingDirectory ${quotePowerShellArg(cwd)}`,
    "-Wait -NoNewWindow -PassThru;",
    "exit $process.ExitCode"
  ].join(" ");

  return ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command];
}

function quotePowerShellArg(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function findBuiltOutput(exampleRoot, candidates) {
  const builtOutput = findExistingBuiltOutput(exampleRoot, candidates);

  if (builtOutput) {
    return builtOutput;
  }

  fail(`No built index.html found in ${candidates.map((candidate) => path.join(exampleRoot, candidate)).join(", ")}.`);
}

function findExistingBuiltOutput(exampleRoot, candidates) {
  for (const candidate of candidates) {
    const candidatePath = path.join(exampleRoot, candidate);

    if (existsSync(path.join(candidatePath, "index.html"))) {
      return candidatePath;
    }
  }

  return null;
}

mkdirSync(npmCache, { recursive: true });
mkdirSync(pagesExamplesRoot, { recursive: true });

examples.forEach((example) => {
  const exampleRoot = path.join(repositoryRoot, "examples", example.directory);

  runNpm(
    ["install", "--package-lock=false", "--no-audit", "--no-fund", "--cache", npmCache],
    exampleRoot,
    `Installing ${example.name} example dependencies`
  );
  const existingOutput =
    isWindows && example.allowExistingOutputOnWindowsFailure
      ? findExistingBuiltOutput(exampleRoot, example.outputCandidates)
      : null;

  if (existingOutput) {
    console.warn(
      `Using existing ${example.name} build output on Windows because Angular CLI cannot build as a nested sandbox child process.`
    );
  } else {
    runNpm(example.buildArgs, exampleRoot, `Building ${example.name} example`, {
      allowFailure: isWindows && example.allowExistingOutputOnWindowsFailure
    });
  }

  const builtOutput = findBuiltOutput(exampleRoot, example.outputCandidates);
  const destination = path.join(pagesExamplesRoot, example.route);

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(builtOutput, destination, { recursive: true });

  console.log(`Copied ${example.name} example to ${path.relative(repositoryRoot, destination)}.`);
});

console.log("\nFramework examples built for GitHub Pages.");
