import { createHash, randomUUID } from "node:crypto"

import { DevMcpError } from "@/server/mcp/errors"

interface PendingConfirmation {
  action: string
  payloadHash: string
  expiresAt: number
}

const pending = new Map<string, PendingConfirmation>()

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  )

  return `{${entries
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
    .join(",")}}`
}

function hashPayload(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex")
}

export function issueConfirmationToken(
  action: string,
  payload: unknown,
  ttlMs = 5 * 60 * 1000,
) {
  const token = `mcpconfirm_${randomUUID()}`
  const expiresAt = Date.now() + ttlMs

  pending.set(token, {
    action,
    payloadHash: hashPayload(payload),
    expiresAt,
  })

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
  }
}

export function consumeConfirmationToken(
  token: string,
  action: string,
  payload: unknown,
) {
  const existing = pending.get(token)
  if (!existing) {
    throw new DevMcpError("INVALID_CONFIRMATION", "Unknown confirmation token")
  }

  if (existing.action !== action) {
    throw new DevMcpError(
      "INVALID_CONFIRMATION",
      "Confirmation token action mismatch",
    )
  }

  if (Date.now() > existing.expiresAt) {
    pending.delete(token)
    throw new DevMcpError("INVALID_CONFIRMATION", "Confirmation token expired")
  }

  const currentHash = hashPayload(payload)
  if (currentHash !== existing.payloadHash) {
    throw new DevMcpError(
      "INVALID_CONFIRMATION",
      "Confirmation payload mismatch. Recreate cleanup plan.",
    )
  }

  pending.delete(token)
}

export function clearConfirmationTokensForTests() {
  pending.clear()
}
