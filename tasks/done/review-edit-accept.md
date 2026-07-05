# Fix Pending Review Edit-And-Accept Flow

## Subject

The `/admin` review queue should allow a reviewer to edit a script that is still `needs_review`, then accept the edited version. The accepted row must store the edited source URL and the hash of the edited source, not the original submitted content.

## Evidence

- User reported that pending-review scripts have an edit button, but accepting after edits does not update the content/hash being accepted.
- The pending review UI rendered `<Script source_url={script.source_url} />`, but the accept form posted a hidden `source_url` initialized from the original script.
- The accept action fetched and hashed the posted URL, but updated only `status` and `content_hash`, and constrained the update by `script_id` plus `source_url`.
- Local regression added in `tests/review scripts.test.js`: edit pending script in CodeMirror, accept it, assert DB row has edited data URL and edited hash.

## Completed Changes

- `/admin` pending-review UI keeps a local `reviewScripts` state copy and binds `script.source_url` into the editable `Script` component.
- The accept form posts the current edited `source_url`.
- The accept action writes `source_url`, `status = 'accepted'`, and `content_hash` for the matching `script_id` when row status is `needs_review`.
- Accept/update actions share `23505` duplicate URL handling.
- Unit expectations now require `accept` to update `source_url`.

## Verification

- `pnpm check` passed.
- `pnpm test:unit` passed: 10 files, 29 tests.
- `PGLITE_PORT=55440 pnpm with:pglite -- sh -c 'pnpm test:build:pglite && pnpm test:integration -- "tests/review scripts.test.js"'` passed: 7 tests.

## Acceptance Criteria

- A pending script edited in `/admin` can be accepted.
- The DB row changes from original `source_url` to edited `data:text/javascript,...` URL.
- `content_hash` equals SHA-256 of the edited source.
- Existing accept/reject/update/delete review tests pass.
