# Release Process

This project publishes npm packages from GitHub Releases. Publishing is intentional only when a GitHub Release is published for a tag that exactly matches `package.json`.

## Published Versions And Stable Release

The published npm history is:

- npm package: `form-schema-runtime`
- `0.1.0` was published manually.
- `0.1.1` was published through the GitHub Release workflow with npm Trusted Publishing/OIDC.
- `1.0.0` is the first stable npm release.

npm package versions are immutable. Re-running an existing release workflow cannot overwrite an already published version such as `form-schema-runtime@0.1.0` or `form-schema-runtime@0.1.1`; npm will reject the publish with an error that the version was previously published.

Do not rerun an existing release expecting npm to overwrite the package. Do not unpublish published versions, delete GitHub Releases, force-push tags, or create replacement tags unless explicitly requested by the repository owner.

The stable release used the package version and matching GitHub Release tag:

- package version: `1.0.0`
- GitHub Release tag: `v1.0.0`

Future versions must also keep `package.json` and the GitHub Release tag aligned, for example package version `1.0.1` with tag `v1.0.1`. Future versions must be published through GitHub Release + npm Trusted Publishing/OIDC. The release workflow checks npm before publishing and fails early if the package version already exists.

## Release Philosophy

- Keep CI and release publishing separate.
- Use GitHub Releases as the human approval gate.
- Publish only package files needed by consumers.
- Verify package consumption before publishing.
- Prefer npm Trusted Publishing/OIDC over long-lived npm publish tokens.
- Do not commit generated build output, coverage reports, TypeDoc output, Playwright reports, temporary consumer projects, or npm package tarballs.

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

## One-Time npm Setup

The first manual publication is complete. Keep this setup accurate for future automated releases:

1. Create or log in to the npm account that will own the package.
2. Enable 2FA as appropriate for the account and organization.
3. Verify that `form-schema-runtime` is available or owned by the intended maintainer.
4. Configure npm Trusted Publisher for the package.
5. Configure provider: GitHub Actions.
6. Configure GitHub owner/repository: `DanieleMasone/form-schema-runtime`.
7. Configure workflow filename: `release.yml`.
8. Configure package name: `form-schema-runtime`.
9. Leave environment blank unless the workflow later adds an npm release environment.
10. Allow action: `npm publish`.

All npm Trusted Publisher fields are case-sensitive. The package `repository.url` in `package.json` must exactly match the GitHub repository:

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/DanieleMasone/form-schema-runtime.git"
}
```

## GitHub Setup

Before publishing:

- Confirm GitHub Actions are enabled for the repository.
- Confirm the release workflow has `contents: read` and `id-token: write` permissions.
- Confirm repository Pages deployment is handled by CI.
- Confirm the release creator has permission to create GitHub Releases and tags.
- Confirm `main` is green before drafting the release.

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

## Version and Tag Convention

Use semantic versions in `package.json` and matching Git tags:

```txt
package.json version: 1.0.0
GitHub Release tag: v1.0.0
```

The release workflow rejects tags that do not match `v<semver>` or do not match the package version. It also queries npm and rejects versions that are already published.

Examples:

- `package.json` version `1.0.0` requires GitHub tag `v1.0.0`.
- `package.json` version `1.0.1` requires GitHub tag `v1.0.1`.

## Preparing a Release

1. Make sure `main` is green in CI.
2. Confirm `package.json` version is the intended release version.
3. Update docs if public behavior changed.
4. Run local verification:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
npm run build:examples
npm run test:examples
npm run test:consumer
npm run test:e2e
npm run verify:release -- --tag v<package-version> --pack
npm run verify:release -- --tag v<package-version> --check-published
npm pack --dry-run
```

5. Commit the source changes.
6. Do not commit `dist/`, `dist-demo/`, `coverage/`, `playwright-report/`, `test-results/`, temporary consumer projects, or `*.tgz`.
7. Push to `main`.

## Creating a GitHub Release

1. Open GitHub Releases.
2. Draft a new release.
3. Create or select tag `v<package-version>`, for example `v1.0.0`.
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
10. installs the packed package in a temporary consumer project
11. verifies ESM import, CSS export, TypeScript declarations, and IIFE availability
12. verifies package contents with `npm pack --dry-run --json`
13. runs `npm pack --dry-run`
14. checks that the package version is not already published on npm
15. publishes to npm with Trusted Publishing/OIDC

## Package Contents

The npm package intentionally includes only:

- `dist/`
- `README.md`
- `LICENSE`
- `package.json` because npm always includes it

It must not include source files, tests, demo, generated Pages output, coverage, Playwright reports, temporary consumer projects, or package tarballs.

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
import { createForm, type FormSchema } from "form-schema-runtime";
import "form-schema-runtime/styles.css";
```

Also verify:

- TypeScript resolves `FormSchema`.
- The package can be imported as ESM.
- The CSS export resolves.
- The IIFE build exists for direct browser usage.
- npm provenance is present when available.

For direct browser usage, the IIFE build exposes:

```txt
FormSchemaRuntime
```

## If Publishing Fails

- If the workflow fails before `npm publish`, fix the issue and create a new GitHub Release/tag when the tag should represent a new attempt.
- If the workflow fails because the version is already published, bump `package.json` to a new version and create a new matching GitHub Release tag.
- Do not rerun the same release expecting npm to overwrite an existing version.
- If npm authentication fails, verify the npm Trusted Publisher package name, owner/repository, workflow filename, allowed action, and optional environment.
- If publish succeeds with a bad package, deprecate the bad version and publish a corrected patch version.
- Do not overwrite or reuse published npm versions. npm versions are immutable after publication.

## What Not To Commit

Never commit:

- generated npm package tarballs
- `dist/`
- `dist-demo/`
- `coverage/`
- generated TypeDoc output
- Playwright reports
- temporary consumer projects
- local npm caches

## CI vs Release

CI runs on pushes and pull requests. It verifies install, typecheck, lint, unit tests, coverage, build, framework example builds, framework example checks, consumer package smoke test, Playwright, and Pages deployment on `main`.

Release runs only when a GitHub Release is published. It repeats the package quality checks, runs the consumer smoke test, verifies package contents, and publishes to npm.

## Official References

- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [GitHub generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [GitHub Actions Node.js package publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
- [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
