---
name: refactor
description: Identify refactoring opportunities in the codebase and propose improvements with clear context and options
args: "[optional focus area or file path]"
---

# /refactor - Identify and propose refactoring opportunities

Scan the codebase, or a specific area, for refactoring opportunities. Present each one clearly enough for the user to decide.

## Behavior

1. Look for refactors that are worth doing.
2. For each refactor found:
   - Explain the context and concern.
   - Include file paths and line numbers when they make the issue easier to evaluate.
   - If there are multiple valid approaches, present options and let the user decide.
3. Prefer small semantic boundaries between subsystems.
4. Parallelize independent approved changes when possible.

## Examples

```text
/refactor
/refactor actions/
/refactor type safety in database
/refactor src/lib/components/Script.svelte
```
