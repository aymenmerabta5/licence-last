#!/usr/bin/env node

// Runs every test file in its own process to avoid mock.module collisions.
// Bun's mock.module() leaks across files when run in a single process on Linux.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("node:child_process")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const ROOT = process.cwd()
const BUN_BIN = "bun"
const TEST_FILE_REGEX = /\.test\.(ts|tsx)$/

function toPosix(filePath) {
  return filePath.split(path.sep).join("/")
}

function collectTestFiles(rootPath, out) {
  if (!fs.existsSync(rootPath)) return
  const stats = fs.statSync(rootPath)
  if (stats.isFile()) {
    if (TEST_FILE_REGEX.test(rootPath)) out.push(rootPath)
    return
  }
  const entries = fs.readdirSync(rootPath, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name)
    if (entry.isDirectory()) {
      collectTestFiles(entryPath, out)
    } else if (entry.isFile() && TEST_FILE_REGEX.test(entry.name)) {
      out.push(entryPath)
    }
  }
}

function main() {
  const roots =
    process.argv.length > 2
      ? process.argv.slice(2).map((s) => path.resolve(ROOT, s))
      : [path.resolve(ROOT, "src")]

  const files = []
  for (const root of roots) {
    collectTestFiles(root, files)
  }

  const sorted = [...new Set(files)].sort((a, b) =>
    toPosix(a).localeCompare(toPosix(b)),
  )

  if (sorted.length === 0) {
    process.stdout.write("No test files found.\n")
    return
  }

  process.stdout.write(`[test] Running ${sorted.length} files isolated\n`)

  for (const filePath of sorted) {
    const relative = toPosix(path.relative(ROOT, filePath))
    const result = spawnSync(BUN_BIN, ["test", relative], {
      cwd: ROOT,
      stdio: "inherit",
      shell: false,
    })

    if (result.error) {
      process.stderr.write(`${result.error}\n`)
      process.exit(1)
    }
    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  }

  process.stdout.write(`\n[test] ${sorted.length} files passed\n`)
}

main()
