import { afterEach, describe, expect, test } from "bun:test"

import {
  clearConfirmationTokensForTests,
  consumeConfirmationToken,
  issueConfirmationToken,
} from "@/server/mcp/confirmation"

describe("confirmation token flow", () => {
  afterEach(() => {
    clearConfirmationTokensForTests()
  })

  test("accepts matching payload and action", () => {
    const payload = { mode: "batch_only", batchId: "batch-1" }
    const { token } = issueConfirmationToken("seed_cleanup", payload)

    expect(() => consumeConfirmationToken(token, "seed_cleanup", payload)).not.toThrow()
  })

  test("rejects payload mismatch", () => {
    const payload = { mode: "batch_only", batchId: "batch-1" }
    const { token } = issueConfirmationToken("seed_cleanup", payload)

    expect(() =>
      consumeConfirmationToken(token, "seed_cleanup", {
        mode: "all_mcpdev_data",
        batchId: "batch-1",
      }),
    ).toThrow()
  })

  test("rejects expired token", async () => {
    const payload = { mode: "batch_only", batchId: "batch-1" }
    const { token } = issueConfirmationToken("seed_cleanup", payload, 1)

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(() => consumeConfirmationToken(token, "seed_cleanup", payload)).toThrow()
  })

  test("allows retry after payload mismatch", () => {
    const payload = { mode: "batch_only", batchId: "batch-1" }
    const { token } = issueConfirmationToken("seed_cleanup", payload)

    expect(() =>
      consumeConfirmationToken(token, "seed_cleanup", {
        mode: "all_mcpdev_data",
        batchId: "batch-1",
      }),
    ).toThrow("payload mismatch")

    expect(() => consumeConfirmationToken(token, "seed_cleanup", payload)).not.toThrow()
  })

  test("expired token is consumed even though it throws", async () => {
    const payload = { mode: "batch_only", batchId: "batch-1" }
    const { token } = issueConfirmationToken("seed_cleanup", payload, 1)

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(() => consumeConfirmationToken(token, "seed_cleanup", payload)).toThrow("expired")
    expect(() => consumeConfirmationToken(token, "seed_cleanup", payload)).toThrow("Unknown")
  })
})
