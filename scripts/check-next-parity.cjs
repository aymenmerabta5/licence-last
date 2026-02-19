#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const APP_ROOT = path.join(process.cwd(), "src", "app")
const TARGET_EXTENSIONS = new Set([".ts", ".tsx"])

const IMG_ALLOWLIST = new Set([
  "src/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/LogoUploadSection.tsx",
  "src/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/CompanyCard.tsx",
  "src/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/OfferHeader.tsx",
  "src/app/[locale]/(authenticated)/dashboard/explore/_components/OfferCard.tsx",
  "src/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/components/ProfileHeader.tsx",
  "src/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView/components/SavedOffersList.tsx",
  "src/app/[locale]/company/[slug]/page.tsx",
])

const INTERNAL_ANCHOR_ALLOWLIST = new Set(["src/app/global-error.tsx"])

function toPosixPath(filePath) {
  return filePath.replaceAll("\\", "/")
}

function relativePath(filePath) {
  return toPosixPath(path.relative(process.cwd(), filePath))
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

function getJsxTagName(tagName) {
  if (ts.isIdentifier(tagName)) {
    return tagName.text
  }

  if (ts.isJsxNamespacedName(tagName)) {
    return `${tagName.namespace.text}:${tagName.name.text}`
  }

  return null
}

function getJsxAttribute(attributes, attributeName) {
  for (const attribute of attributes.properties) {
    if (!ts.isJsxAttribute(attribute)) {
      continue
    }

    if (attribute.name.text === attributeName) {
      return attribute
    }
  }

  return null
}

function getStringAttributeValue(attribute) {
  if (!attribute?.initializer) {
    return null
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text
  }

  if (!ts.isJsxExpression(attribute.initializer)) {
    return null
  }

  const expression = attribute.initializer.expression
  if (!expression) {
    return null
  }

  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.text
  }

  return null
}

function addViolation(sourceFile, node, filePath, violations, message) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  )
  violations.push({
    file: relativePath(filePath),
    line: line + 1,
    column: character + 1,
    message,
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
  const normalizedPath = relativePath(filePath)

  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = getJsxTagName(node.tagName)
      if (tagName === "img" && !IMG_ALLOWLIST.has(normalizedPath)) {
        addViolation(
          sourceFile,
          node,
          filePath,
          violations,
          "Raw <img> is forbidden. Use next/image or add a documented allowlist entry.",
        )
      }

      if (tagName === "a" && !INTERNAL_ANCHOR_ALLOWLIST.has(normalizedPath)) {
        const hrefAttribute = getJsxAttribute(node.attributes, "href")
        const hrefValue = getStringAttributeValue(hrefAttribute)

        if (hrefValue?.startsWith("/") && !hrefValue.startsWith("//")) {
          addViolation(
            sourceFile,
            node,
            filePath,
            violations,
            'Internal <a href="/..."> is forbidden in app routes. Use next/link (or i18n Link).',
          )
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

function main() {
  if (!fs.existsSync(APP_ROOT)) {
    console.error(`Missing app root: ${APP_ROOT}`)
    process.exit(1)
  }

  const files = listFiles(APP_ROOT)
  const violations = []

  for (const filePath of files) {
    validateFile(filePath, violations)
  }

  if (violations.length === 0) {
    console.log("Next parity check passed.")
    return
  }

  console.error("Next parity violations found:")
  for (const violation of violations) {
    console.error(
      `${violation.file}:${violation.line}:${violation.column} ${violation.message}`,
    )
  }

  process.exit(1)
}

main()
