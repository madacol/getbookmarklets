# Fix Install Dropdown Touch Behavior

## Subject

The polished mobile install controls looked right, but tapping the dropdown arrow did not show the install option menu.

## Evidence

- User reported the visual design was aesthetically correct and should be preserved.
- User expected the arrow to show the alternate install option.
- Local screenshot before the final fix had the menu item present in the DOM but clipped out of sight by the parent title row.

## Completed

- Kept primary `Install` as the bookmarklet action.
- Replaced the fragile `<details>` dropdown with an explicit button and Svelte state.
- Kept the dropdown menu focused on the alternate `Install as Userscript` action.
- Restored the polished joined-control styling in a new commit after the earlier visual commit was removed from history.
- Allowed the script title row to overflow visibly so the dropdown panel is not clipped, while preserving title truncation inside the title element.
- Strengthened the mobile Playwright regression to confirm the menu item is visible and hit-testable after tapping the arrow.

## Verification

- `PGLITE_PORT=55454 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm exec playwright test -c ./playwright.config.full.js --grep "admin mobile install controls" "tests/review scripts.test.js"'`
- `pnpm check`
- `pnpm test:unit`
- Screenshot: `/tmp/getbookmarklets-install-dropdown-open-final.png`
