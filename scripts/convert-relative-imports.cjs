#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ts = require("typescript")

const PROJECT_ROOT = process.cwd()
const SRC_ROOT = path.join(PROJECT_ROOT, "src")
const EXTENSIONS = new Set([".ts", ".tsx"])
const STYLE_EXTENSIONS = new Set([".css", ".scss", ".sass", ".less"])

function listFiles(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      listFiles(fullPath, files)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    if (!EXTENSIONS.has(path.extname(entry.name))) {
      continue
    }

    files.push(fullPath)
  }

  return files
}

function isRelative(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../")
}

function isStyleSpecifier(specifier) {
  return [...STYLE_EXTENSIONS].some((ext) => specifier.endsWith(ext))
}

function toPosix(filePath) {
  return filePath.replaceAll("\\", "/")
}

function resolveAlias(fromFilePath, specifier) {
  if (!isRelative(specifier) || isStyleSpecifier(specifier)) {
    return null
  }

  const absoluteTarget = path.resolve(path.dirname(fromFilePath), specifier)
  const relativeToSrc = path.relative(SRC_ROOT, absoluteTarget)

  if (relativeToSrc.startsWith("..") || path.isAbsolute(relativeToSrc)) {
    return null
  }

  return `@/${toPosix(relativeToSrc)}`
}

function getScriptKind(filePath) {
  return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
}

function transformFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  )

  const replacements = []

  function pushReplacement(node) {
    if (!ts.isStringLiteral(node)) {
      return
    }

    const nextSpecifier = resolveAlias(filePath, node.text)
    if (!nextSpecifier || nextSpecifier === node.text) {
      return
    }

    const original = content.slice(node.getStart(sourceFile), node.getEnd())
    const quote = original[0] === '"' ? '"' : "'"

    replacements.push({
      start: node.getStart(sourceFile),
      end: node.getEnd(),
      text: `${quote}${nextSpecifier}${quote}`,
    })
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      pushReplacement(node.moduleSpecifier)
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      pushReplacement(node.moduleSpecifier)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1
    ) {
      pushReplacement(node.arguments[0])
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  if (replacements.length === 0) {
    return false
  }

  replacements.sort((a, b) => b.start - a.start)
  let nextContent = content

  for (const replacement of replacements) {
    nextContent =
      nextContent.slice(0, replacement.start) +
      replacement.text +
      nextContent.slice(replacement.end)
  }

  fs.writeFileSync(filePath, nextContent)
  return true
}

function main() {
  const files = listFiles(SRC_ROOT)
  let changed = 0

  for (const filePath of files) {
    if (transformFile(filePath)) {
      changed += 1
    }
  }

  console.log(`Updated ${changed} file(s).`)
}

main()
