---
name: refresh-deployment
description: Use when asked to deploy or refresh this project.
---

# Refresh Deployment

Run from the project root. Build the current SvelteKit app, then refresh this project's Caddy Sites Manager manifest.

```sh
pnpm build:vite
site-manager deploy website.json
curl -I --max-time 15 https://getbookmarklets.babyjarvis.com
```

Use `pnpm build:vite`, not `pnpm build`.
