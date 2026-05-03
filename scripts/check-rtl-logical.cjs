#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")

const SCAN_DIRS = [
  path.join(process.cwd(), "src", "components"),
  path.join(process.cwd(), "src", "app", "[locale]"),
]

const EXT_REGEX = /\.(tsx|ts|jsx|js)$/

const TOKEN_PATTERNS = [
  /(?:^|\s)(?:[^\s"'`]+:)*text-left(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*text-right(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*border-l(?:-[^\s"'`]+)?(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*border-r(?:-[^\s"'`]+)?(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*rounded-l(?:-[^\s"'`]+)?(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*rounded-r(?:-[^\s"'`]+)?(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*-?ml-[^\s"'`]+(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*-?mr-[^\s"'`]+(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*pl-[^\s"'`]+(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*pr-[^\s"'`]+(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*-?left-(?:\d+|\[[^\]]+\]|px|full|auto)(?=$|\s|["'`])/,
  /(?:^|\s)(?:[^\s"'`]+:)*-?right-(?:\d+|\[[^\]]+\]|px|full|auto)(?=$|\s|["'`])/,
]

const EXCEPTION_PATTERNS = [/data-\[side=(left|right)\]/]

function hasPhysicalDirectionToken(line) {
  return TOKEN_PATTERNS.some((pattern) => pattern.test(line))
}

function hasException(line) {
  return EXCEPTION_PATTERNS.some((pattern) => pattern.test(line))
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

function main() {
  const files = []
  for (const dir of SCAN_DIRS) {
    collectFiles(dir, files)
  }

  if (files.length === 0) {
    console.log("RTL logical direction check passed (no files found).")
    return
  }

  const violations = []

  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, "utf8")
    const lines = fileContent.split(/\r?\n/)

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (!hasPhysicalDirectionToken(line) || hasException(line)) {
        continue
      }

      violations.push({
        filePath: path.relative(process.cwd(), filePath).replaceAll("\\", "/"),
        lineNumber: index + 1,
        line: line.trim(),
      })
    }
  }

  if (violations.length === 0) {
    console.log("RTL logical direction check passed.")
    return
  }

  console.error("Found physical-direction Tailwind utilities in scanned files:")
  for (const violation of violations) {
    console.error(
      `${violation.filePath}:${violation.lineNumber} ${violation.line}`,
    )
  }
  process.exit(1)
}

main()
