#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")

const SERVICES_ROOT = path.join(process.cwd(), "src", "server", "services")
const EXT_REGEX = /\.(ts|js)$/

function collectFiles(dir, out) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectFiles(entryPath, out)
    } else if (
      entry.isFile() &&
      EXT_REGEX.test(entry.name) &&
      !entry.name.endsWith(".test.ts")
    ) {
      out.push(entryPath)
    }
  }
}

function hasServerOnlyImport(content) {
  return /^import\s+["']server-only["']/m.test(content)
}

function main() {
  const files = []
  collectFiles(SERVICES_ROOT, files)

  const violations = []

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8")
    if (!hasServerOnlyImport(content)) {
      violations.push(
        path.relative(process.cwd(), filePath).replaceAll("\\", "/"),
      )
    }
  }

  if (violations.length === 0) {
    console.log("server-only import check passed.")
    return
  }

  console.error("Missing 'import \"server-only\"' in service files:")
  for (const v of violations) {
    console.error(`  ${v}`)
  }
  process.exit(1)
}

main()
