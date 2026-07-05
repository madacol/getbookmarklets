# Refresh Outdated E2E Tests

## Completed

Updated stale Playwright tests so they assert the current app behavior and UI structure.

## Changes

- Replaced old `.server.error` checks with accessible `role="alert"` checks for add-script validation errors.
- Changed the signup test to assert that no alert is rendered instead of expecting an absent `.error` element to be empty.
- Moved the HTTP script fixture server off hardcoded port `3000` and onto an available loopback port.
- Updated the client-side source URL test to select the current `textarea[name="source_url"]` and assert textarea value instead of old placeholder/text expectations.

## Verification

- `pnpm check`
- `pnpm test:unit`
- Focused PGlite-backed Playwright rerun of the previously failing files: 16 passed.
- Full `pnpm test:integration:pglite`: 29 passed.
