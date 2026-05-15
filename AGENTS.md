# Project Notes

- This is a SvelteKit JavaScript codebase. Keep type annotations in JSDoc, and prefer type guards or precise local typedefs over broad `any` casts.
- When a test passes a deliberately partial SvelteKit event or browser framework object, keep any unavoidable cast at that call boundary only. Do not disable checking for the whole file.
- For this project, run `pnpm check`, `pnpm test:unit`, and relevant Playwright tests after runtime-affecting changes.
- Use the local PGlite wrapper for integration/E2E flows that need Postgres: `pnpm with:pglite -- <command>`.
- Save long or noisy command output to a temp file so it can be inspected with targeted commands.
- For broad or ambiguous non-trivial changes, start with a high-level plan and leave room for user redirection before going deep.
- Before adding a special case or bypassing a subsystem boundary, confirm the intended behavior with the user.
- Before taking shortcuts, identify why the shortcut is needed and what would avoid it. If the shortcut is still the best option, explain the tradeoff and let the user decide.
- When implementation depends on an external payload or event shape at a system boundary, inspect the real payload before designing around it.
- Refactors should identify the main seams between subsystems and reduce each seam to a small semantic boundary.

## Testing

- New user-facing features should include E2E coverage when practical.
- For non-trivial behavior changes, use red/green TDD when practical: write or identify the failing coverage first, then make it pass.
- Tests should catch regressions, not mirror implementation. Ask what real bug a failing test would catch.
- For bug fixes and new behavior, add a failing test first unless existing coverage already fails for the right reason.
- For behavior removals, prefer removal-driven testing: delete or update tests that encode the removed behavior, then add only the coverage needed for the replacement behavior.
- Do not add absence tests by default. Add them only when the absence is a meaningful invariant with a real regression risk.
- Prefer integration tests for glue code and unit tests for pure functions, keeping tests focused on externally observable behavior.
