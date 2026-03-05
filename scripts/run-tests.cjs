#!/usr/bin/env node

// Runs all tests: bulk via `bun test`, then oRPC route tests isolated
// (route tests use mock.module() which leaks across files in one process)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require("node:child_process")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { readdirSync } = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const ROOT = process.cwd()

// Step 1: Run all tests except oRPC route tests (they need isolation)
const bulkDirs = [
  "src/lib",
  "src/hooks",
  "src/components",
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
  "src/server/auth",
  "src/server/orpc/utils",
  "src/server/orpc/ratelimit-middleware.test.ts",
  "src/server/orpc/router.smoke.test.ts",
  "src/app",
  "src/proxy.test.ts",
]

process.stdout.write("[test] Running bulk tests...\n")
const bulk = spawnSync("bun", ["test", ...bulkDirs], {
  cwd: ROOT,
  stdio: "inherit",
  shell: false,
})

if (bulk.status !== 0) {
  process.exit(bulk.status ?? 1)
}

// Step 2: Run oRPC route tests isolated (mock.module requires it)
const routeDir = path.join(ROOT, "src/server/orpc/routes")
const routeFiles = readdirSync(routeDir)
  .filter((f) => f.endsWith(".route.test.ts"))
  .sort()

process.stdout.write(`\n[test] Running ${routeFiles.length} route tests isolated...\n`)

for (const file of routeFiles) {
  const relative = `src/server/orpc/routes/${file}`
  const result = spawnSync("bun", ["test", relative], {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
  })

  if (result.status !== 0) {
    process.stderr.write(`FAIL: ${relative}\n`)
    process.exit(result.status ?? 1)
  }
}

process.stdout.write(
  `\n[test] All tests passed (bulk + ${routeFiles.length} isolated route tests)\n`,
)
