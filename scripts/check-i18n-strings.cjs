#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")

const SCAN_DIRS = [
  path.join(process.cwd(), "src", "app", "[locale]"),
  path.join(process.cwd(), "src", "components"),
]

const EXT_REGEX = /\.(tsx|ts|jsx|js)$/

// Allowed hardcoded strings (exceptions that don't need translation)
const ALLOWED_STRINGS = new Set([
  "Stag",
  "Stag.io",
  ".io",
  "",
  " ",
  "true",
  "false",
  "px",
  "em",
  "rem",
  "svg",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "md",
  "html",
  "css",
  "json",
  "utf-8",
  "en",
  "fr",
  "ar",
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "aria-hidden",
  "aria-label",
  "aria-labelledby",
  "role",
  "presentation",
  "application",
  "dialog",
  "alertdialog",
  "status",
  "polite",
  "assertive",
  "off",
  "sr-only",
  "none",
  "hidden",
  "visible",
  "dropdown",
  "menu",
  "menubar",
  "tablist",
  "tabpanel",
  "navigation",
  "banner",
  "contentinfo",
  "complementary",
  "main",
  "search",
  "form",
  "region",
  "article",
  "figure",
  "figcaption",
  "blockquote",
  "time",
  "address",
  "details",
  "summary",
  "mark",
  "del",
  "ins",
  "sup",
  "sub",
  "kbd",
  "samp",
  "var",
  "dfn",
  "abbr",
  "data",
  "bdo",
  "bdi",
  "wbr",
  "ruby",
  "rt",
  "rp",
  "portal",
  "template",
  "slot",
  "part",
  "exportparts",
  "shadowroot",
  "shadowrootmode",
  "shadowrootdelegatesfocus",
  "shadowrootclonable",
  "shadowrootserializable",
  "popover",
  "auto",
  "manual",
  "hint",
  "error",
  "warning",
  "info",
  "success",
  "loading",
  "idle",
  "pending",
  "resolved",
  "rejected",
  "cancelled",
  "active",
  "inactive",
  "disabled",
  "enabled",
  "checked",
  "unchecked",
  "indeterminate",
  "mixed",
  "on",
  "off",
  "yes",
  "no",
  "ok",
  "cancel",
  "close",
  "open",
  "submit",
  "reset",
  "button",
  "text",
  "password",
  "email",
  "tel",
  "url",
  "search",
  "number",
  "date",
  "datetime-local",
  "month",
  "week",
  "time",
  "color",
  "file",
  "range",
  "checkbox",
  "radio",
  "select",
  "textarea",
  "fieldset",
  "legend",
  "label",
  "option",
  "optgroup",
  "datalist",
  "output",
  "progress",
  "meter",
  "canvas",
  "audio",
  "video",
  "source",
  "track",
  "embed",
  "object",
  "param",
  "iframe",
  "noscript",
  "script",
  "style",
  "link",
  "meta",
  "title",
  "base",
  "head",
  "body",
  "html",
  "doctype",
  "DOCTYPE",
  "public",
  "system",
  "about:blank",
  "javascript:",
  "tel:",
  "mailto:",
  "http:",
  "https:",
  "ws:",
  "wss:",
  "ftp:",
  "sftp:",
  "file:",
  "data:",
  "blob:",
  "filesystem:",
  "ionic:",
  "capacitor:",
])

const ALLOWED_STRING_PATTERNS = [
  /^\d+$/, // pure numbers
  /^\d+(px|rem|em|%|vh|vw|svh|svw|dvh|dvw|ch|ex|cap|ic|lh|rlh|vmin|vmax|cm|mm|Q|in|pc|pt)$/, // CSS units
  /^#[0-9a-fA-F]{3,8}$/, // hex colors
  /^rgba?\(/, // rgb colors
  /^hsla?\(/, // hsl colors
  /^calc\(/, // calc
  /^var\(/, // css var
  /^\d{4}-\d{2}-\d{2}/, // dates
  /^[A-Z_]+$/, // constants/enum values
  /^className[:=]/, // className values in objects
  /^\$\{.*\}$/, // template literal expressions
  /^\d+\.\d+$/, // floats
  /^v\d+\.\d+/, // version strings
  /^(top|bottom|left|right|center|middle|start|end|flex-start|flex-end|space-between|space-around|space-evenly|stretch|baseline|normal|auto|inherit|initial|revert|unset)$/, // CSS values
  /^(dark|light|system)$/, // theme values
  /^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/, // border styles
  /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|inline-table|table-row|table-cell|list-item|run-in)$/, // display values
  /^(static|relative|absolute|fixed|sticky)$/, // position values
  /^(row|row-reverse|column|column-reverse|wrap|wrap-reverse|nowrap)$/, // flex values
  /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$/, // transition timing
]

const FILE_ALLOWLIST = new Set([
  "src/app/[locale]/preview/agreement/page.tsx",
  "src/app/global-error.tsx",
])

function toPosixPath(filePath) {
  return filePath.replaceAll("\\", "/")
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

function isAllowedString(value) {
  const trimmed = value.trim()
  if (trimmed.length === 0) return true
  if (ALLOWED_STRINGS.has(trimmed)) return true
  if (ALLOWED_STRING_PATTERNS.some((p) => p.test(trimmed))) return true
  return false
}

function isLikelyUiText(value) {
  const trimmed = value.trim()
  if (trimmed.length < 2) return false
  if (trimmed.length > 80) return false
  if (/^\d+$/.test(trimmed)) return false
  if (/^\$\{/.test(trimmed)) return false
  if (/^[\d\s\W]+$/.test(trimmed)) return false
  if (!/[a-zA-Z].*[a-zA-Z]/.test(trimmed)) return false
  return true
}

function visitNode(node, sourceFile, hasTranslations, violations, normalizedPath) {
  if (ts.isJsxText(node)) {
    const text = node.text.trim()
    if (text && isLikelyUiText(text) && !isAllowedString(text)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
      violations.push({ file: normalizedPath, line: line + 1, text: text.slice(0, 40) })
    }
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const text = node.text
    const parent = node.parent
    if (parent && ts.isJsxAttribute(parent)) {
      const attrName = parent.name.text
      if (attrName.startsWith("aria-") || attrName.startsWith("data-") || attrName === "className" || attrName === "placeholder") {
        // skip
      }
    }

    if (isLikelyUiText(text) && !isAllowedString(text)) {
      if (hasTranslations) {
        const lower = text.toLowerCase()
        const uiKeywords = [
          "section", "settings", "profile", "account", "dashboard", "overview",
          "details", "information", "summary", "description", "experience",
          "projects", "candidates", "analytics", "decision",
        ]
        if (!uiKeywords.some((k) => lower.includes(k)) && text.length < 15) {
          // Continue to children
          ts.forEachChild(node, (child) =>
            visitNode(child, sourceFile, hasTranslations, violations, normalizedPath),
          )
          return
        }
      }

      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
      violations.push({ file: normalizedPath, line: line + 1, text: text.slice(0, 40) })
    }
  }

  ts.forEachChild(node, (child) =>
    visitNode(child, sourceFile, hasTranslations, violations, normalizedPath),
  )
}

function main() {
  const files = []
  for (const dir of SCAN_DIRS) {
    collectFiles(dir, files)
  }

  const violations = []

  for (const filePath of files) {
    const normalizedPath = toPosixPath(path.relative(process.cwd(), filePath))
    if (FILE_ALLOWLIST.has(normalizedPath)) continue
    if (normalizedPath.endsWith(".test.tsx") || normalizedPath.endsWith(".test.ts")) continue

    const content = fs.readFileSync(filePath, "utf8")
    const hasTranslations = /\buseTranslations\b/.test(content) || /\bgetTranslations\b/.test(content)

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )

    visitNode(sourceFile, sourceFile, hasTranslations, violations, normalizedPath)
  }

  if (violations.length === 0) {
    console.log("i18n strings check passed.")
    return
  }

  console.error("Found hardcoded strings that should likely be translated:")
  for (const v of violations) {
    console.error(`${v.file}:${v.line}  "${v.text}"`)
  }
  process.exit(1)
}

main()
