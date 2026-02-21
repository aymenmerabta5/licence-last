# Stag Local Developer MCP

Local stdio MCP server for development workflows only.

## Run

```bash
bun run mcp:dev
```

This script uses `.env.development` and passes `--mcp-dev`.  
Server startup is blocked unless the environment passes the safety guard.

## Available Tools

- `stag.dev.health`
- `stag.dev.seed.list_scenarios`
- `stag.dev.seed.run`
- `stag.dev.users.set_role`
- `stag.dev.companies.set_status`
- `stag.dev.offers.transition_status`
- `stag.dev.applications.transition`
- `stag.dev.seed.cleanup_plan`
- `stag.dev.seed.cleanup_execute`

## Cleanup Safety

Destructive cleanup uses a two-step flow:

1. Call `stag.dev.seed.cleanup_plan`
2. Use the returned `token` with `stag.dev.seed.cleanup_execute`

Seed batches are tracked in `.agent/mcp/dev-ledger.json`.
