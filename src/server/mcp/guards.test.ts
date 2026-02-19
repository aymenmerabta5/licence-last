import { describe, expect, test } from "bun:test"

import {
  assertDevMcpAllowed,
  assertMutatingConfirmed,
  getHealthReport,
} from "@/server/mcp/guards"

describe("mcp guards", () => {
  test("marks safe for local dev mode", () => {
    const report = getHealthReport({
      env: {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/internex_dev",
        MCP_DEV_MODE: "true",
        NODE_ENV: "development",
      },
      argv: ["bun", "src/server/mcp/index.ts"],
    })

    expect(report.safe).toBe(true)
    expect(report.reasons).toHaveLength(0)
  })

  test("blocks when mcp dev mode is missing", () => {
    const report = getHealthReport({
      env: {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/internex_dev",
        NODE_ENV: "development",
      },
      argv: ["bun", "src/server/mcp/index.ts"],
    })

    expect(report.safe).toBe(false)
    expect(report.reasons.join(" ")).toContain("MCP_DEV_MODE")
  })

  test("blocks production-looking databases", () => {
    const report = getHealthReport({
      env: {
        DATABASE_URL: "postgresql://user:pass@localhost:5432/internex_prod",
        MCP_DEV_MODE: "true",
        NODE_ENV: "development",
      },
      argv: ["bun", "src/server/mcp/index.ts"],
    })

    expect(report.safe).toBe(false)
    expect(report.reasons.join(" ")).toContain("staging or production")
  })

  test("assertDevMcpAllowed throws on unsafe environment", () => {
    expect(() =>
      assertDevMcpAllowed({
        env: {
          DATABASE_URL: "postgresql://user:pass@localhost:5432/internex_prod",
          MCP_DEV_MODE: "true",
          NODE_ENV: "development",
        },
        argv: ["bun", "src/server/mcp/index.ts"],
      }),
    ).toThrow()
  })

  test("assertMutatingConfirmed throws when confirmWrite is false", () => {
    expect(() => assertMutatingConfirmed(false)).toThrow()
  })
})
