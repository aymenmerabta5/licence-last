# Internex Local Developer MCP

Local stdio MCP server for development workflows only.

## Run

```bash
bun run mcp:dev
```

This script uses `.env.development` and passes `--mcp-dev`.  
Server startup is blocked unless the environment passes the safety guard.

## Available Tools

- `internex.dev.health`
- `internex.dev.seed.list_scenarios`
- `internex.dev.seed.run`
- `internex.dev.users.set_role`
- `internex.dev.companies.set_status`
- `internex.dev.offers.transition_status`
- `internex.dev.applications.transition`
- `internex.dev.seed.cleanup_plan`
- `internex.dev.seed.cleanup_execute`

## Cleanup Safety

Destructive cleanup uses a two-step flow:

1. Call `internex.dev.seed.cleanup_plan`
2. Use the returned `token` with `internex.dev.seed.cleanup_execute`

Seed batches are tracked in `.agent/mcp/dev-ledger.json`.
