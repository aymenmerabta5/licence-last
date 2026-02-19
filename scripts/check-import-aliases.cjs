#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const SRC_ROOT = path.join(process.cwd(), "src")
const TARGET_EXTENSIONS = new Set([".ts", ".tsx"])
const STYLE_EXTENSIONS = [".css", ".scss", ".sass", ".less"]

function toPosixPath(filePath) {
  return filePath.replaceAll("\\", "/")
}

function listFiles(directoryPath, files = []) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory()) {
      listFiles(fullPath, files)
      continue
    }

    if (!entry.isFile() || !TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      continue
    }

    files.push(fullPath)
  }

  return files
}

function isRelativeSpecifier(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../")
}

function isStyleSpecifier(specifier) {
  return STYLE_EXTENSIONS.some((extension) => specifier.endsWith(extension))
}

function scriptKind(filePath) {
  return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
}

function addViolationIfNeeded(
  node,
  sourceFile,
  sourceText,
  filePath,
  violations,
) {
  if (!node || !ts.isStringLiteral(node)) {
    return
  }

  const specifier = node.text
  if (!isRelativeSpecifier(specifier) || isStyleSpecifier(specifier)) {
    return
  }

  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  )
  const normalizedPath = toPosixPath(path.relative(process.cwd(), filePath))
  const rawSpecifier = sourceText.slice(
    node.getStart(sourceFile),
    node.getEnd(),
  )

  violations.push({
    file: normalizedPath,
    line: line + 1,
    column: character + 1,
    specifier: rawSpecifier,
  })
}

function validateFile(filePath, violations) {
  const sourceText = fs.readFileSync(filePath, "utf8")
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(filePath),
  )

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      addViolationIfNeeded(
        node.moduleSpecifier,
        sourceFile,
        sourceText,
        filePath,
        violations,
      )
    } else if (ts.isExportDeclaration(node)) {
      addViolationIfNeeded(
        node.moduleSpecifier,
        sourceFile,
        sourceText,
        filePath,
        violations,
      )
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

function main() {
  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`Missing source root: ${SRC_ROOT}`)
    process.exit(1)
  }

  const files = listFiles(SRC_ROOT)
  const violations = []

  for (const filePath of files) {
    validateFile(filePath, violations)
  }

  if (violations.length === 0) {
    console.log("Import alias check passed.")
    return
  }

  console.error(
    "Relative imports are forbidden in src/**/*.{ts,tsx}. Use @/ aliases (styles are exempt):",
  )

  for (const violation of violations) {
    console.error(
      `${violation.file}:${violation.line}:${violation.column} ${violation.specifier}`,
    )
  }

  process.exit(1)
}

main()
