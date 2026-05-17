#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")

const SCAN_DIRS = [
  path.join(process.cwd(), "src", "components"),
  path.join(process.cwd(), "src", "app", "[locale]"),
]

const EXT_REGEX = /\.(tsx|ts|jsx|js)$/

// Patterns that indicate inline animation definitions that should come from @/lib/animations
const INLINE_REVEAL_PATTERNS = [
  // initial={{ opacity: 0, y: 20 }} or similar
  /initial=\{\{\s*opacity\s*:\s*0\s*,\s*y\s*:\s*\d+\s*\}\}/,
  // animate={{ opacity: 1, y: 0 }} or similar
  /animate=\{\{\s*opacity\s*:\s*1\s*,\s*y\s*:\s*0\s*\}\}/,
]

const EXCEPTION_FILES = new Set([
  // The library itself is exempt
  "src/lib/animations.ts",
])

function shouldSkipFile(filePath) {
  const normalized = path
    .relative(process.cwd(), filePath)
    .replaceAll("\\", "/")
  if (EXCEPTION_FILES.has(normalized)) return true
  if (normalized.endsWith(".test.tsx") || normalized.endsWith(".test.ts"))
    return true
  return false
}

function collectFiles(dir, out) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectFiles(entryPath, out)
    } else if (entry.isFile() && EXT_REGEX.test(entry.name)) {
      out.push(entryPath)
    }
  }
}

function hasRevealImport(content) {
  return /from\s+["']@\/lib\/animations["']/.test(content)
}

function findInlineReveal(content) {
  for (const pattern of INLINE_REVEAL_PATTERNS) {
    const match = pattern.exec(content)
    if (match) return match[0]
  }
  return null
}

function main() {
  const files = []
  for (const dir of SCAN_DIRS) {
    collectFiles(dir, files)
  }

  const violations = []

  for (const filePath of files) {
    if (shouldSkipFile(filePath)) continue

    const content = fs.readFileSync(filePath, "utf8")

    // Already imports from @/lib/animations — assume compliant
    if (hasRevealImport(content)) continue

    const inline = findInlineReveal(content)
    if (!inline) continue

    const lines = content.split(/\r?\n/)
    let lineNumber = 1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(inline.slice(0, 20))) {
        lineNumber = i + 1
        break
      }
    }

    violations.push({
      filePath: path.relative(process.cwd(), filePath).replaceAll("\\", "/"),
      lineNumber,
      snippet: inline.slice(0, 60),
    })
  }

  if (violations.length === 0) {
    console.log("Animation imports check passed.")
    return
  }

  console.error(
    "Found inline animation definitions that should use @/lib/animations imports:",
  )
  for (const v of violations) {
    console.error(`${v.filePath}:${v.lineNumber}  ${v.snippet}`)
  }
  process.exit(1)
}

main()
