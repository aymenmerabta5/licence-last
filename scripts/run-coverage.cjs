#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("node:child_process")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const COVERAGE_DIR = path.join(process.cwd(), "coverage")
const BUN_BIN = "bun"

const segments = [
  {
    name: "unit-core",
    args: [
      "test",
      "--coverage",
      "src/lib",
      "src/server/services",
      "src/server/db",
      "src/server/caching",
      "src/server/storage",
      "src/server/email",
      "src/server/logging",
      "src/server/openapi",
      "src/server/ai",
      "src/server/pdfs",
      "src/server/mcp",
      "src/server/orpc/utils",
    ],
  },
  { name: "api-health", args: ["test", "--coverage", "src/app/api/health"] },
  { name: "api-rpc", args: ["test", "--coverage", "src/app/api/rpc"] },
  {
    name: "api-assistant-chat",
    args: ["test", "--coverage", "src/app/api/assistant/chat"],
  },
  {
    name: "api-assistant-auth-status",
    args: ["test", "--coverage", "src/app/api/assistant/auth/status"],
  },
  { name: "app-locale", args: ["test", "--coverage", "src/app/[locale]"] },
]

function runSegment(segment, index) {
  const result = spawnSync(BUN_BIN, segment.args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: false,
  })

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`
  const reportPath = path.join(COVERAGE_DIR, `${index + 1}-${segment.name}.txt`)

  fs.writeFileSync(reportPath, output)
  process.stdout.write(output)

  if (result.error) {
    process.stderr.write(`${result.error}\n`)
    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function main() {
  fs.rmSync(COVERAGE_DIR, { recursive: true, force: true })
  fs.mkdirSync(COVERAGE_DIR, { recursive: true })

  const runAt = new Date().toISOString()
  const headerLines = [
    "# Bun Coverage Segments",
    "",
    `Generated at: ${runAt}`,
    "",
  ]
  fs.writeFileSync(path.join(COVERAGE_DIR, "README.md"), `${headerLines.join("\n")}\n`)

  for (const [index, segment] of segments.entries()) {
    const sectionHeader = [`## ${index + 1}. ${segment.name}`, ""].join("\n")
    fs.appendFileSync(path.join(COVERAGE_DIR, "README.md"), sectionHeader)
    runSegment(segment, index)
  }
}

main()
