import { describe, expect, test } from "bun:test"

import { createBatchId, createEntityId } from "@/server/mcp/mock/id"

describe("mcp mock ids", () => {
  test("creates batch id with mcpdev prefix", () => {
    const batchId = createBatchId("student_discovery")
    expect(batchId.startsWith("mcpdev_batch_")).toBe(true)
  })

  test("creates deterministic entity ids for same sequence", () => {
    const batchId = "mcpdev_batch_student_discovery_abc"
    const one = createEntityId(batchId, "user", 1)
    const two = createEntityId(batchId, "user", 1)

    expect(one).toBe(two)
    expect(one.startsWith("mcpdev_user_")).toBe(true)
  })
})
