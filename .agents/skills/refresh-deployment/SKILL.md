---
name: refresh-deployment
description: Use when asked to deploy or refresh this project.
---

# Refresh Deployment

Build the current SvelteKit app, then redeploy the existing Caddy Sites Manager service.

```sh
pnpm build:vite
node /home/mada/tools/caddy-sites-manager/site-manager.js plan --config /home/mada/caddy-sites.json
node /home/mada/tools/caddy-sites-manager/site-manager.js deploy --config /home/mada/caddy-sites.json
curl -I --max-time 15 https://getbookmarklets.babyjarvis.com
```

Use `pnpm build:vite`, not `pnpm build`.
