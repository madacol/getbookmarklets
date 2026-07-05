# Resolve Live Admin 500

## Subject

The live tailnet `/admin` page returned `500 Internal Error` on mobile.

## Evidence

- User sent a screenshot showing `bookmarklets.ts.babyjarvis.com/` with `500 Internal Error` after trying the admin page.
- `systemctl --user status getbookmarklets-local-production.service` showed the service active and running `scripts/serve-local-production.js`.
- Journal logs showed the service crashed while serving old hashed SvelteKit build assets after `.svelte-kit/output` changed under the running preview server:
  - missing `.../_app/immutable/entry/start.CGOFci__.js`
  - missing `.../_app/immutable/nodes/3.BnaY33cB.js`
- Unauthenticated `https://getbookmarklets.ts.babyjarvis.com/admin` returned 404, which matches the permission wrapper's no-session behavior.
- An authenticated check using a temporary `master` session returned HTTP 200 for `https://getbookmarklets.ts.babyjarvis.com/admin`; the temporary session was deleted immediately afterward.

## Completed Changes

- Test builds now set `SVELTE_KIT_OUT_DIR=.svelte-kit-test`.
- Full Playwright web server commands now preview from `.svelte-kit-test`.
- `.svelte-kit-test` is ignored by git.
- The refresh deployment skill now stops `getbookmarklets-local-production.service` before rebuilding so the live preview process does not serve a half-rewritten `.svelte-kit/output`.

## Deployment

- Ran the updated refresh flow:
  - stopped `getbookmarklets-local-production.service`;
  - ran `pnpm build:vite`;
  - ran `site-manager deploy website.json`;
  - checked `https://getbookmarklets.babyjarvis.com`.
- `site-manager` deployed two managed hosts for this manifest:
  - `getbookmarklets.babyjarvis.com`;
  - `getbookmarklets.ts.babyjarvis.com`.

## Verification

- `pnpm check` passed.
- `pnpm test:unit` passed: 10 files, 29 tests.
- `PGLITE_PORT=55442 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm test:integration -- "tests/review scripts.test.js"'` passed: 7 tests.
- The test build output showed `.svelte-kit-test/output/...`, confirming it did not rewrite `.svelte-kit/output`.
- Recent service logs after the isolated test build showed no new `.svelte-kit/output` ENOENT crashes.
- After deployment, `systemctl --user status getbookmarklets-local-production.service --no-pager` showed the service active.
- After deployment, `journalctl --user -u getbookmarklets-local-production.service --since '2026-07-05 07:59:00' --no-pager` showed a clean stop/start and no missing asset crash.
- `curl -I --max-time 15 https://getbookmarklets.ts.babyjarvis.com/` returned HTTP 200.
- Authenticated `https://getbookmarklets.ts.babyjarvis.com/admin` returned HTTP 200 using a temporary `master` session that was deleted immediately afterward.

## Acceptance Criteria

- The correct current tailnet admin URL returns the admin page for the logged-in master user, not 500.
- Recent service logs no longer show missing `.svelte-kit/output` immutable asset errors after deployment.
- Deployment changes were committed/deployed separately from app feature changes.
- Playwright/test builds do not rewrite the live `.svelte-kit/output` directory.
- The local refresh skill stops the existing service before rebuilding, then lets `site-manager deploy website.json` restart it.
