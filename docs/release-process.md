# Release Process

This project publishes npm packages from GitHub Releases. A release is intentional only when a GitHub Release is published for a version tag such as `v0.1.0`.

## Release Philosophy

- Keep CI and release separate.
- Use GitHub Releases as the human approval gate.
- Publish only package files needed by consumers.
- Do not commit generated build output, coverage reports, TypeDoc output, Playwright reports, or npm package tarballs.
- Prefer short-lived OIDC credentials over long-lived automation tokens.

## Why GitHub Release Driven

The release workflow runs on:

```yaml
release:
  types: [published]
```

This means publishing a GitHub Release is the explicit release action. Pull requests and normal pushes verify the project through CI, but they do not publish to npm.

GitHub can generate release notes from merged pull requests and contributors. The repository also includes `.github/release.yml` to keep generated notes grouped into Features, Fixes, Documentation, Maintenance, Dependencies, Tests, and Other Changes.

Expected PR labels:

- `feature` or `enhancement`
- `bug` or `fix`
- `documentation` or `docs`
- `maintenance` or `chore`
- `dependencies`
- `tests` or `test`
- `ignore-for-release` to omit a PR from generated notes

## Why npm Trusted Publishing/OIDC

The release workflow uses npm Trusted Publishing through GitHub Actions OIDC.

Benefits:

- no persistent `NPM_TOKEN` stored in GitHub secrets
- short-lived publish credentials minted for the matching workflow
- automatic provenance for public packages from public repositories
- fewer token rotation and exposure risks

The workflow intentionally runs:

```bash
npm publish --access public
```

It does not pass `--provenance` because npm Trusted Publishing from GitHub Actions automatically generates provenance attestations when the package and repository are public.

## One-Time npm Setup

Trusted Publishing must be configured once on npmjs.com for the package.

Configure:

- Package name: `form-schema-runtime`
- Provider: GitHub Actions
- GitHub owner/repository: `DanieleMasone/form-schema-runtime`
- Workflow filename: `release.yml`
- Environment name: leave blank unless the workflow later adds an npm release environment
- Allowed action: `npm publish`

All npm trusted publisher fields are case-sensitive. The package `repository.url` in `package.json` must exactly match the GitHub repository:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/DanieleMasone/form-schema-runtime.git"
}
```

## Version and Tag Convention

Use semantic versions in `package.json` and matching Git tags:

```txt
package.json version: 0.1.0
GitHub Release tag: v0.1.0
```

The release workflow rejects tags that do not match `v<semver>` or do not match the package version.

## Preparing a Release

1. Make sure `main` is green in CI.
2. Update `package.json` version.
3. Update docs if public behavior changed.
4. Run local verification:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm run verify:release -- --pack
npm pack --dry-run
```

5. Commit the source changes. Do not commit `dist/`, `dist-demo/`, `coverage/`, `test-results/`, or `*.tgz`.
6. Push to `main`.

## Creating a GitHub Release

1. Open GitHub Releases.
2. Draft a new release.
3. Create or select tag `v<package-version>`, for example `v0.1.0`.
4. Set the release title to the tag or a concise release title.
5. Use GitHub's generated release notes.
6. Review the generated notes.
7. Publish the release.

Publishing the release starts `.github/workflows/release.yml`.

## What the Release Workflow Does

The workflow:

1. checks out the repository
2. sets up Node 24 and the npm registry
3. installs with `npm ci`
4. verifies tag/version/package metadata
5. runs typecheck
6. runs lint
7. runs unit tests
8. generates coverage
9. builds the package, demo, API docs, Markdown docs, and coverage page
10. verifies package contents with `npm pack --dry-run --json`
11. runs `npm pack --dry-run`
12. publishes to npm with Trusted Publishing/OIDC

## Package Contents

The npm package intentionally includes only:

- `dist/`
- `README.md`
- `LICENSE`
- `package.json` because npm always includes it

It must not include source files, tests, demo, generated Pages output, coverage, Playwright reports, or package tarballs.

## Verifying a Published Package

After a successful release:

```bash
npm view form-schema-runtime version
npm view form-schema-runtime dist-tags
npm view form-schema-runtime repository homepage bugs
npm view form-schema-runtime --json
```

Install it in a throwaway project and verify:

```ts
import { createForm } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

For direct browser usage, verify that the IIFE build exposes:

```txt
FormSchemaRuntime
```

## If Publishing Fails

- If the workflow fails before `npm publish`, fix the issue and publish a new GitHub Release only when the tag/version still represent the intended package.
- If npm authentication fails, verify the npm trusted publisher package name, owner/repository, workflow filename, allowed action, and optional environment.
- If the version was already published, increment `package.json` to a new version and create a new release tag. npm versions cannot be reused after publication.
- If a bad package was published, prefer publishing a corrected version. Use npm deprecation for guidance to users when needed.

## CI vs Release

CI runs on pushes and pull requests. It verifies install, typecheck, lint, unit tests, coverage, build, Playwright, and Pages deployment on `main`.

Release runs only when a GitHub Release is published. It repeats the package quality checks and publishes to npm.

## Official References

- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [GitHub generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [GitHub Actions Node.js package publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
- [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
