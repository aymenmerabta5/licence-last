#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const UI_ROOT = path.join(process.cwd(), "src", "components", "ui")
const TARGET_FILES = [
  path.join(UI_ROOT, "field.tsx"),
  path.join(UI_ROOT, "sidebar.tsx"),
  path.join(UI_ROOT, "sheet.tsx"),
  path.join(UI_ROOT, "drawer.tsx"),
]

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

function hasPhysicalDirectionToken(line) {
  return TOKEN_PATTERNS.some((pattern) => pattern.test(line))
}

function main() {
  if (!fs.existsSync(UI_ROOT)) {
    console.error(`Missing UI root: ${UI_ROOT}`)
    process.exit(1)
  }

  const files = TARGET_FILES.filter((filePath) => fs.existsSync(filePath))

  const violations = []

  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, "utf8")
    const lines = fileContent.split(/\r?\n/)

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (!hasPhysicalDirectionToken(line)) {
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

  console.error("Found physical-direction Tailwind utilities in shared UI:")
  for (const violation of violations) {
    console.error(
      `${violation.filePath}:${violation.lineNumber} ${violation.line}`,
    )
  }
  process.exit(1)
}

main()
