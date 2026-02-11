import { unlink } from "node:fs/promises"
import path from "node:path"

import { beforeEach, describe, expect, test } from "bun:test"

import { appendSeedBatch, readSeedLedger, removeSeedBatches } from "@/server/mcp/mock/ledger"
import type { SeedBatchRecord } from "@/server/mcp/types"

function createRecord(batchId: string): SeedBatchRecord {
  return {
    batchId,
    scenario: "student_discovery",
    scale: 1,
    createdAt: new Date("2026-02-11T00:00:00.000Z").toISOString(),
    entities: {
      universityIds: ["u1"],
      userIds: ["user1"],
      companyIds: ["company1"],
      offerIds: ["offer1"],
      applicationIds: ["app1"],
      placementIds: [],
      documentIds: [],
      notificationIds: [],
      skillTagIds: [],
    },
  }
}

describe("seed ledger", () => {
  beforeEach(async () => {
    const ledgerPath = path.join(process.cwd(), ".next", "tmp-mcp-ledger.json")
    process.env.MCP_DEV_LEDGER_PATH = ledgerPath
    try {
      await unlink(ledgerPath)
    } catch {
      // no-op
    }
  })

  test("starts empty when file does not exist", async () => {
    const ledger = await readSeedLedger()
    expect(ledger.batches).toHaveLength(0)
  })

  test("appends and removes batches", async () => {
    await appendSeedBatch(createRecord("batch-1"))
    await appendSeedBatch(createRecord("batch-2"))

    const afterAppend = await readSeedLedger()
    expect(afterAppend.batches.map((batch) => batch.batchId)).toEqual(["batch-2", "batch-1"])

    await removeSeedBatches(["batch-2"])

    const afterRemove = await readSeedLedger()
    expect(afterRemove.batches.map((batch) => batch.batchId)).toEqual(["batch-1"])
  })
})
