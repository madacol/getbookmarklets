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

## Constraints

- Do not guess from the screenshot alone; verify the live `/admin` response and logs after the latest request.
- Avoid deleting production state blindly.
- If the fix is deployment process related, keep it separate from application code fixes.

## Acceptance Criteria

- `https://bookmarklets.ts.babyjarvis.com/admin` or the correct current tailnet admin URL returns the admin page for the logged-in master user, not 500.
- Recent service logs no longer show missing `.svelte-kit/output` immutable asset errors after deployment.
- If deployment changes are required, they are committed/deployed separately from app feature changes.

## Next Action

Reproduce with `curl` or browser-accessible request, inspect fresh journal lines, then decide whether this is fixed by rebuilding/restarting after current commits or requires changing deployment/build isolation.

