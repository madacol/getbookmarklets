# Keep Mobile Install/Share Controls On One Row

## Subject

The mobile install controls no longer overlap, but the share button wrapped below the split install/dropdown control on an `/admin` script card. At normal mobile card width, the install combo and share button should stay on the same row.

## Evidence

- User sent a follow-up mobile screenshot showing `Install` plus dropdown on the first row and the share icon alone below it.
- Existing Playwright coverage only asserted non-overlap, so it allowed this wrapped layout.
- Generated local mobile screenshot at `/tmp/getbookmarklets-admin-mobile.png`; the split install control and share button rendered on the same row.

## Acceptance Criteria

- At a 432px mobile viewport on `/admin`, the install button, dropdown, and share button render on one row.
- The controls still do not overlap.
- The layout still wraps rather than overflows if the available width is genuinely too narrow.
- Relevant checks and Playwright coverage pass.

## Completed

- Tightened the install control row to use a compact fixed width budget for the split install control, menu button, and share button.
- Preserved wrapping only for extremely narrow viewports below 280px.
- Extended the mobile Playwright regression to require the share button to remain on the same row and to the right of the dropdown.

## Verification

- `pnpm check`
- `pnpm test:unit`
- `PGLITE_PORT=55448 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm exec playwright test -c ./playwright.config.full.js --grep "admin mobile install controls" "tests/review scripts.test.js"'`
