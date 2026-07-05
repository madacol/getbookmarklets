# Resolve Live Admin 500

## Subject

The live tailnet `/admin` page is returning `500 Internal Error` on mobile.

## Evidence

- User sent a screenshot showing `bookmarklets.ts.babyjarvis.com/` page with `500 Internal Error` after trying the admin page.
- `systemctl --user status getbookmarklets-local-production.service` shows service active and running `scripts/serve-local-production.js`.
- Recent journal logs show the service has crashed at least twice while serving old hashed SvelteKit build assets after `.svelte-kit/output` changed under the running preview server:
  - missing `.../_app/immutable/entry/start.CGOFci__.js`
  - missing `.../_app/immutable/nodes/3.BnaY33cB.js`
- This is probably caused by building in-place while `vite preview` serves `.svelte-kit/output`, not necessarily by `/admin` route logic.
- Unauthenticated `https://getbookmarklets.ts.babyjarvis.com/admin` returned 404, which matches the permission wrapper's no-session behavior.
- An authenticated check using a temporary `master` session returned HTTP 200 for `https://getbookmarklets.ts.babyjarvis.com/admin`; the temporary session was deleted immediately afterward.

## Constraints

- Do not guess from the screenshot alone; verify the live `/admin` response and logs after the latest request.
- Avoid deleting production state blindly.
- If the fix is deployment process related, keep it separate from application code fixes.

## Acceptance Criteria

- `https://bookmarklets.ts.babyjarvis.com/admin` or the correct current tailnet admin URL returns the admin page for the logged-in master user, not 500.
- Recent service logs no longer show missing `.svelte-kit/output` immutable asset errors after deployment.
- If deployment changes are required, they are committed/deployed separately from app feature changes.
- Playwright/test builds do not rewrite the live `.svelte-kit/output` directory.
- The local refresh skill stops the existing service before rebuilding, then lets `site-manager deploy website.json` restart it.

## Current Changes

- Test builds now set `SVELTE_KIT_OUT_DIR=.svelte-kit-test`.
- Full Playwright web server commands now preview from `.svelte-kit-test`.
- `.svelte-kit-test` is ignored by git.
- The refresh deployment skill now stops `getbookmarklets-local-production.service` before rebuilding so the live preview process does not serve a half-rewritten `.svelte-kit/output`.

## Verification

- `pnpm check` passed.
- `pnpm test:unit` passed: 10 files, 29 tests.
- `PGLITE_PORT=55442 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm test:integration -- "tests/review scripts.test.js"'` passed: 7 tests.
- The test build output showed `.svelte-kit-test/output/...`, confirming it did not rewrite `.svelte-kit/output`.
- Recent service logs after that test build showed no new `.svelte-kit/output` ENOENT crashes.

## Next Action

Commit this deploy/test isolation change, deploy using the updated skill, then verify live admin and recent logs.
