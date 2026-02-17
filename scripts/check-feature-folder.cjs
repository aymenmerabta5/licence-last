#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const APP_ROOT = path.join(process.cwd(), "src", "app")
const MAX_STANDALONE_LINES = 260
const MAX_ORCHESTRATOR_LINES = 200
const MAX_SECTION_LINES = 330

function listTsxFiles(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      listTsxFiles(fullPath, files)
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith(".tsx")) {
      continue
    }

    if (entry.name.endsWith(".test.tsx")) {
      continue
    }

    files.push(fullPath)
  }

  return files
}

function relativePath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/")
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  return content.split(/\r?\n/).length
}

function getPolicy(filePath) {
  const normalized = relativePath(filePath)

  if (!normalized.includes("/_components/")) {
    return null
  }

  if (/\/_components\/[^/]+\/index\.tsx$/.test(normalized)) {
    return {
      max: MAX_ORCHESTRATOR_LINES,
      kind: "feature orchestrator",
    }
  }

  if (normalized.includes("/components/")) {
    return {
      max: MAX_SECTION_LINES,
      kind: "feature section",
    }
  }

  return {
    max: MAX_STANDALONE_LINES,
    kind: "standalone _components file",
  }
}

function main() {
  if (!fs.existsSync(APP_ROOT)) {
    console.error(`Missing app root: ${APP_ROOT}`)
    process.exit(1)
  }

  const files = listTsxFiles(APP_ROOT)
  const violations = []

  for (const filePath of files) {
    const policy = getPolicy(filePath)
    if (!policy) {
      continue
    }

    const lines = countLines(filePath)
    if (lines <= policy.max) {
      continue
    }

    violations.push({
      file: relativePath(filePath),
      lines,
      max: policy.max,
      kind: policy.kind,
    })
  }

  if (violations.length === 0) {
    console.log("Feature-folder architecture check passed.")
    return
  }

  console.error("Feature-folder architecture violations found:")
  for (const violation of violations) {
    console.error(
      `${violation.file} (${violation.lines} lines) exceeds ${violation.max} lines for ${violation.kind}.`,
    )
  }
  process.exit(1)
}

main()
