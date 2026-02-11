import { createHash, randomUUID } from "node:crypto"

import type { ScenarioName } from "@/server/mcp/types"

function hashShort(input: string) {
  return createHash("sha1").update(input).digest("hex").slice(0, 8)
}

function sanitize(input: string) {
  return input.replace(/[^a-z0-9_]+/gi, "_").toLowerCase()
}

export function createBatchId(scenario: ScenarioName): string {
  const stamp = Date.now().toString(36)
  return `mcpdev_batch_${sanitize(scenario)}_${stamp}_${randomUUID().slice(0, 8)}`
}

export function createEntityId(
  batchId: string,
  entity: string,
  sequence: number,
): string {
  const entitySafe = sanitize(entity)
  const suffix = sequence.toString(36)
  return `mcpdev_${entitySafe}_${hashShort(batchId)}_${suffix}`
}
