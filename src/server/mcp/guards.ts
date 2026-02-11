import { DevMcpError } from "@/server/mcp/errors"
import type { HealthReport } from "@/server/mcp/types"

interface GuardInput {
  env?: NodeJS.ProcessEnv
  argv?: string[]
}

function parseDatabaseFingerprint(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl)
    return {
      protocol: parsed.protocol.replace(":", ""),
      host: parsed.hostname || null,
      database: parsed.pathname.replace(/^\//, "") || null,
    }
  } catch {
    return {
      protocol: null,
      host: null,
      database: null,
    }
  }
}

export function getHealthReport(input: GuardInput = {}): HealthReport {
  const env = input.env ?? process.env
  const argv = input.argv ?? process.argv
  const databaseUrl = env.DATABASE_URL

  const mcpDevMode = env.MCP_DEV_MODE === "true"
  const argvFlag = argv.includes("--mcp-dev")

  const reasons: string[] = []

  if (!databaseUrl) {
    reasons.push("DATABASE_URL is not set")
  }

  if (!mcpDevMode && !argvFlag) {
    reasons.push("MCP_DEV_MODE=true or --mcp-dev flag is required")
  }

  if (env.NODE_ENV === "production") {
    reasons.push("NODE_ENV=production is blocked")
  }

  const db = databaseUrl ? parseDatabaseFingerprint(databaseUrl) : null
  const host = db?.host?.toLowerCase() ?? ""
  const dbName = db?.database?.toLowerCase() ?? ""

  if (host && !["localhost", "127.0.0.1", "::1"].includes(host)) {
    reasons.push("Only localhost databases are allowed for developer MCP")
  }

  if (/(prod|production|staging|stage)/i.test(host + " " + dbName)) {
    reasons.push("Database host/name looks like staging or production")
  }

  return {
    server: {
      name: "internex-local-dev-mcp",
      version: "1.0.0",
    },
    environment: {
      nodeEnv: env.NODE_ENV ?? null,
      mcpDevMode,
      argvFlag,
    },
    database: {
      configured: Boolean(databaseUrl),
      protocol: db?.protocol ?? null,
      host: db?.host ?? null,
      database: db?.database ?? null,
    },
    safe: reasons.length === 0,
    reasons,
  }
}

export function assertDevMcpAllowed(input: GuardInput = {}) {
  const report = getHealthReport(input)
  if (!report.safe) {
    throw new DevMcpError("UNSAFE_ENVIRONMENT", report.reasons.join("; "))
  }
}

export function assertMutatingConfirmed(confirmWrite?: boolean) {
  if (!confirmWrite) {
    throw new DevMcpError(
      "DRY_RUN_REQUIRED",
      "Mutating tool call blocked. Re-run with confirmWrite=true.",
    )
  }
}
