#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("node:child_process")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const ROOT = process.cwd()
const COVERAGE_DIR = path.join(ROOT, "coverage")
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
  fs.rmSync(COVERAGE_DIR, { recursive: true, force: true })
  fs.mkdirSync(COVERAGE_DIR, { recursive: true })

  // Collect all test files
  const files = []
  collectTestFiles(path.resolve(ROOT, "src"), files)
  const sorted = [...new Set(files)].sort((a, b) =>
    toPosix(a).localeCompare(toPosix(b)),
  )

  if (sorted.length === 0) {
    process.stdout.write("No test files found.\n")
    return
  }

  process.stdout.write(
    `[coverage] Running ${sorted.length} files isolated with --coverage\n`,
  )

  let failed = 0

  for (const filePath of sorted) {
    const relative = toPosix(path.relative(ROOT, filePath))

    const result = spawnSync(BUN_BIN, ["test", "--coverage", relative], {
      cwd: ROOT,
      encoding: "utf8",
      shell: process.platform === "win32",
      env: process.env,
    })

    const exitCode = result.error ? 1 : (result.status ?? 1)

    if (exitCode !== 0) {
      failed++
      process.stderr.write(`  FAIL: ${relative}\n`)
      process.stdout.write(`${result.stdout ?? ""}${result.stderr ?? ""}`)
    }
  }

  process.stdout.write(
    `\n[coverage] ${sorted.length} files, ${failed} failed\n`,
  )

  if (failed > 0) {
    process.exit(1)
  }
}

main()
