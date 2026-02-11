import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

import type { SeedBatchRecord } from "@/server/mcp/types"

interface LedgerFile {
  version: 1
  updatedAt: string
  batches: SeedBatchRecord[]
}

function getLedgerPath() {
  if (process.env.MCP_DEV_LEDGER_PATH) {
    return process.env.MCP_DEV_LEDGER_PATH
  }
  return path.join(process.cwd(), ".agent", "mcp", "dev-ledger.json")
}

function getLedgerDirectory() {
  return path.dirname(getLedgerPath())
}

function createEmptyLedger(): LedgerFile {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    batches: [],
  }
}

export async function readSeedLedger() {
  try {
    const raw = await readFile(getLedgerPath(), "utf8")
    const parsed = JSON.parse(raw) as Partial<LedgerFile>
    if (parsed.version !== 1 || !Array.isArray(parsed.batches)) {
      return createEmptyLedger()
    }

    return {
      version: 1 as const,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      batches: parsed.batches,
    }
  } catch {
    return createEmptyLedger()
  }
}

async function writeLedger(ledger: LedgerFile) {
  const ledgerPath = getLedgerPath()
  await mkdir(getLedgerDirectory(), { recursive: true })
  const tempPath = `${ledgerPath}.tmp`
  await writeFile(tempPath, JSON.stringify(ledger, null, 2))
  await rename(tempPath, ledgerPath)
}

export async function appendSeedBatch(record: SeedBatchRecord) {
  const ledger = await readSeedLedger()

  const next: LedgerFile = {
    version: 1,
    updatedAt: new Date().toISOString(),
    batches: [record, ...ledger.batches].slice(0, 100),
  }

  await writeLedger(next)
}

export async function removeSeedBatches(batchIds: string[]) {
  if (batchIds.length === 0) return

  const ledger = await readSeedLedger()
  const skip = new Set(batchIds)
  const next: LedgerFile = {
    version: 1,
    updatedAt: new Date().toISOString(),
    batches: ledger.batches.filter((batch) => !skip.has(batch.batchId)),
  }

  await writeLedger(next)
}

export function getLedgerPathForTests() {
  return getLedgerPath()
}
