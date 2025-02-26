# GetBookmarklets Project Guide

## Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Test**: `npm run test` (unit tests)
- **Single Test**: `npm run test -- -t "test name"` or `npx vitest run testFileName.test.js`
- **Integration Test**: `npm run test:integration`
- **Full Test Suite**: `npm run test:full`
- **Type Check**: `npm run check`
- **Database Migration**: `npm run migrate up`

## Code Style
- **Imports**: ES modules with named exports/imports
- **Formatting**: No explicit formatter, maintain consistent indentation (2 spaces)
- **Types**: JSDoc annotations with TypeScript checking via jsconfig.json (strict mode)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Components**: Svelte components with .svelte extension
- **Error Handling**: DB errors should be caught and logged
- **Testing**: Playwright for integration, Vitest for unit tests
- **Database**: PostgreSQL with node-pg-migrate for migrations
- **Security**: Use argon2 for password hashing, validate all user inputs