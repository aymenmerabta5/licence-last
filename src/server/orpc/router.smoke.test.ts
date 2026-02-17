import { describe, expect, mock, test } from "bun:test"

mock.module("@/env", () => ({
  env: {
    DATABASE_URL: "postgresql://localhost:5432/test",
    BETTER_AUTH_SECRET: "test-secret-key-for-testing",
    NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000",
    REDIS_RATE_LIMIT_ENABLED: "false",
    LOG_LEVEL: "info",
  },
}))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => [],
        innerJoin: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      }),
    }),
    query: {},
  },
}))

describe("src/server/orpc/router smoke coverage", () => {
  test("all expected namespaces are present", async () => {
    const { appRouter } = await import("./router")
    expect(Object.keys(appRouter).sort()).toEqual([
      "adminUsers",
      "applications",
      "assistant",
      "companies",
      "departments",
      "deptHead",
      "documents",
      "matching",
      "notifications",
      "offers",
      "placements",
      "skills",
      "stats",
      "students",
      "universities",
      "users",
    ])
  })

  test("each namespace exposes at least one procedure", async () => {
    const { appRouter } = await import("./router")
    for (const [namespace, procedures] of Object.entries(appRouter)) {
      expect(procedures).toBeDefined()
      expect(Object.keys(procedures).length).toBeGreaterThan(0)

      for (const [procedureName, procedure] of Object.entries(procedures)) {
        expect(
          procedure,
          `Procedure ${namespace}.${procedureName} should be defined`,
        ).toBeDefined()
      }
    }
  })
})
