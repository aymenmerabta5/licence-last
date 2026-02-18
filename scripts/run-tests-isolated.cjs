#!/usr/bin/env node

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
  if (!fs.existsSync(rootPath)) {
    return
  }

  const stats = fs.statSync(rootPath)
  if (stats.isFile()) {
    if (TEST_FILE_REGEX.test(rootPath)) {
      out.push(rootPath)
    }
    return
  }

  const entries = fs.readdirSync(rootPath, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name)
    if (entry.isDirectory()) {
      collectTestFiles(entryPath, out)
      continue
    }
    if (entry.isFile() && TEST_FILE_REGEX.test(entry.name)) {
      out.push(entryPath)
    }
  }
}

function resolveRoots(argv) {
  if (argv.length === 0) {
    return [ROOT]
  }
  return argv.map((segment) => path.resolve(ROOT, segment))
}

function runTestFile(filePath) {
  const relative = toPosix(path.relative(ROOT, filePath))
  process.stdout.write(`\n[isolated-test] ${relative}\n`)

  const result = spawnSync(BUN_BIN, ["test", relative], {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
    env: process.env,
  })

  if (result.error) {
    process.stderr.write(`${result.error}\n`)
    return 1
  }

  return result.status ?? 1
}

function main() {
  const roots = resolveRoots(process.argv.slice(2))
  const files = []

  for (const root of roots) {
    collectTestFiles(root, files)
  }

  const uniqueSortedFiles = [...new Set(files)].sort((a, b) =>
    toPosix(a).localeCompare(toPosix(b)),
  )

  if (uniqueSortedFiles.length === 0) {
    process.stdout.write("No test files found for provided paths.\n")
    return
  }

  for (const filePath of uniqueSortedFiles) {
    const exitCode = runTestFile(filePath)
    if (exitCode !== 0) {
      process.exit(exitCode)
    }
  }

  process.stdout.write(
    `\n[isolated-test] completed ${uniqueSortedFiles.length} files successfully.\n`,
  )
}

main()
