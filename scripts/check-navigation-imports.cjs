#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const SRC_ROOT = path.join(process.cwd(), "src")
const TARGET_EXTENSIONS = new Set([".ts", ".tsx"])

// Only these from next/navigation are NOT re-exported by @/i18n/routing and are acceptable
const ALLOWED_NEXT_NAVIGATION = new Set([
  "useSearchParams",
  "useParams",
  "redirect",
  "permanentRedirect",
  "notFound",
  "usePathname", // next-intl re-exports this but sometimes imported from next/navigation in edge cases
])

// Whitelisted files that genuinely need next/link or next/navigation
const FILE_ALLOWLIST = new Set([
  // i18n routing implementation itself
  "src/i18n/routing.ts",
  "src/i18n/request.ts",
  // Root layout / global components that set up routing
  "src/app/[locale]/layout.tsx",
  "src/app/layout.tsx",
])

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

function scriptKind(filePath) {
  return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
}

function getImportSpecifiers(node) {
  if (!ts.isImportDeclaration(node)) return null
  const moduleSpecifier = node.moduleSpecifier
  if (!ts.isStringLiteral(moduleSpecifier)) return null
  const source = moduleSpecifier.text

  const bindings = node.importClause?.namedBindings
  if (!bindings || !ts.isNamedImports(bindings)) {
    // Default import or namespace import
    return { source, names: [] }
  }

  const names = bindings.elements.map(
    (el) => el.propertyName?.text ?? el.name.text,
  )
  return { source, names }
}

function main() {
  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`Missing source root: ${SRC_ROOT}`)
    process.exit(1)
  }

  const files = listFiles(SRC_ROOT)
  const violations = []

  for (const filePath of files) {
    const normalizedPath = toPosixPath(path.relative(process.cwd(), filePath))
    if (FILE_ALLOWLIST.has(normalizedPath)) continue

    const sourceText = fs.readFileSync(filePath, "utf8")
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      scriptKind(filePath),
    )

    ts.forEachChild(sourceFile, (node) => {
      const importInfo = getImportSpecifiers(node)
      if (!importInfo) return

      // next/link should always come from @/i18n/routing
      if (importInfo.source === "next/link") {
        violations.push({
          file: normalizedPath,
          line:
            sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
              .line + 1,
          message: `Import from "next/link". Use "@/i18n/routing" instead for locale-aware routing.`,
        })
      }

      // next/navigation: block specific disallowed imports
      if (importInfo.source === "next/navigation") {
        for (const name of importInfo.names) {
          if (!ALLOWED_NEXT_NAVIGATION.has(name)) {
            violations.push({
              file: normalizedPath,
              line:
                sourceFile.getLineAndCharacterOfPosition(
                  node.getStart(sourceFile),
                ).line + 1,
              message: `Import "${name}" from "next/navigation" is not allowed. Use "@/i18n/routing" instead.`,
            })
          }
        }
      }
    })
  }

  if (violations.length === 0) {
    console.log("Navigation imports check passed.")
    return
  }

  console.error("Navigation import violations found:")
  for (const v of violations) {
    console.error(`${v.file}:${v.line}  ${v.message}`)
  }
  process.exit(1)
}

main()
