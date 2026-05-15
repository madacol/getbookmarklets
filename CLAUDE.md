# GetBookmarklets Project Guide

## Commands
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Test**: `pnpm test` (unit tests)
- **Single Test**: `pnpm test:unit -- -t "test name"` or `pnpm vitest run testFileName.test.js`
- **Integration Test**: `pnpm test:integration`
- **Full Test Suite**: `pnpm test:full`
- **Type Check**: `pnpm check`
- **Database Migration**: `pnpm migrate up`

## Code Style
- **Imports**: ES modules with named exports/imports
- **Formatting**: No explicit formatter, maintain consistent indentation (2 spaces)
- **Types**: JSDoc annotations with TypeScript checking via jsconfig.json (strict mode)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Components**: Svelte components with .svelte extension
- **Error Handling**: DB errors should be caught and logged
- **Testing**: Playwright for integration, Vitest for unit tests
- **Database**: PostgreSQL with the local migration runner in `scripts/migrate.js`
- **Security**: Use argon2 for password hashing, validate all user inputs
