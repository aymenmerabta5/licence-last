import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "bun:test"

const ALLOWED_DIRECT_INSERT_FILES = new Set([
  "src/server/services/notifications/create.ts",
])

function collectTypeScriptFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...collectTypeScriptFiles(fullPath))
      continue
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath.replaceAll("\\", "/"))
    }
  }

  return files
}

describe("src/server/services/notifications architecture", () => {
  test("disallows direct notification inserts outside notification service", () => {
    const roots = [
      "src/server/services",
      "src/server/orpc/routes",
    ]

    const files = roots.flatMap(collectTypeScriptFiles)
    const offenders: string[] = []

    for (const file of files) {
      if (ALLOWED_DIRECT_INSERT_FILES.has(file)) {
        continue
      }
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
        continue
      }

      const source = readFileSync(file, "utf-8")
      if (source.includes("db.insert(notification)")) {
        offenders.push(file)
      }
    }

    expect(offenders).toEqual([])
  })
})
