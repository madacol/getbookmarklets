# Polish Mobile Install/Share Controls

## Subject

Make the mobile script card controls less crowded.

## Evidence

- User screenshot showed the split install button still says `Install bookmarklet`, which is too long on mobile.
- User requested the label be just `Install`.
- User asked whether the current up-arrow-from-box share icon is standard. Assessment: that icon is standard on Apple platforms, but the connected-nodes share icon is more broadly recognized on Android/general web.

## Completed Changes

- `src/lib/components/Install_Buttons.svelte` now uses label text `Install`.
- Default share icon changed from up-arrow-from-box to connected-nodes. Copied state still shows a checkmark.

## Verification

- `pnpm check` passed.
- `pnpm test:unit` passed: 10 files, 29 tests.
- `PGLITE_PORT=55441 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm test:integration -- tests/other.test.js'` passed: 4 tests.

## Acceptance Criteria

- Mobile cards show compact `Install` label.
- Share button remains icon-only and uses connected-nodes share icon by default.
- Existing install/userscript Playwright flow still passes.
