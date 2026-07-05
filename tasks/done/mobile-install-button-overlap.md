# Fix Mobile Install Button Overlap

## Subject

The script card install controls overlapped on mobile. The split install/dropdown control and the icon-only share button should render as separate controls without covering each other.

## Evidence

- User sent a mobile screenshot showing the `Install` button, dropdown segment, and share icon visually stacked over the same horizontal space on an `/admin` script card.
- The install controls forced `flex-wrap: nowrap` under `480px` while the nested button internals still had intrinsic widths, allowing constrained layouts to collapse visually.

## Completed Changes

- Added Playwright coverage for the admin mobile install controls.
- Removed the mobile `nowrap` rule that could force controls to occupy the same visual space.
- Gave the split install control a compact stable width and explicit inner button sizing.
- Kept the share button as a fixed-width square flex item separated by the row gap.

## Verification

- `pnpm check` passed.
- `pnpm test:unit` passed: 10 files, 29 tests.
- `PGLITE_PORT=55445 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm test:integration -- tests/other.test.js "tests/review scripts.test.js"'` passed: 12 tests.

## Acceptance Criteria

- At a mobile viewport, the install button, dropdown summary, and share button boxes do not overlap.
- The primary button remains labeled `Install`.
- The userscript dropdown remains accessible.
- The share button remains icon-only.
- Focused Playwright coverage verifies the rendered mobile layout.
