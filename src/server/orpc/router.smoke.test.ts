import { describe, expect, test } from "bun:test"

const ROUTER_FILE_PATH = new URL("./router.ts", import.meta.url)

function extractAppRouterObject(source: string) {
  const startMarker = "export const appRouter = {"
  const startIndex = source.indexOf(startMarker)

  if (startIndex === -1) {
    return ""
  }

  let depth = 0
  let endIndex = -1

  for (let i = startIndex; i < source.length; i += 1) {
    const char = source[i]
    if (char === "{") {
      depth += 1
    } else if (char === "}") {
      depth -= 1
      if (depth === 0) {
        endIndex = i
        break
      }
    }
  }

  if (endIndex === -1) {
    return ""
  }

  return source.slice(startIndex, endIndex + 1)
}

describe("src/server/orpc/router smoke coverage", () => {
  test("all expected namespaces are present", async () => {
    const source = await Bun.file(ROUTER_FILE_PATH).text()
    const appRouterObject = extractAppRouterObject(source)
    const namespaceMatches = [
      ...appRouterObject.matchAll(/^ {2}([a-zA-Z][a-zA-Z0-9]*): \{/gm),
    ]
    const namespaces = namespaceMatches.map((match) => match[1]).sort()

    expect(namespaces).toEqual([
      "adminSettings",
      "adminUsers",
      "applications",
      "assistant",
      "companies",
      "departments",
      "deptHead",
      "documents",
      "fields",
      "interviews",
      "matching",
      "messages",
      "notifications",
      "offers",
      "placements",
      "skills",
      "stats",
      "studentCv",
      "students",
      "universities",
      "users",
    ])
  })

  test("each namespace exposes at least one procedure", async () => {
    const source = await Bun.file(ROUTER_FILE_PATH).text()
    const appRouterObject = extractAppRouterObject(source)
    const namespaceMatches = [
      ...appRouterObject.matchAll(
        /^ {2}([a-zA-Z][a-zA-Z0-9]*): \{([\s\S]*?)^ {2}},?$/gm,
      ),
    ]

    expect(namespaceMatches.length).toBeGreaterThan(0)

    for (const [, namespaceName, namespaceBody] of namespaceMatches) {
      const procedureCount = [
        ...namespaceBody.matchAll(/^ {4}[a-zA-Z][a-zA-Z0-9]*:/gm),
      ].length
      expect(
        procedureCount,
        `Namespace ${namespaceName} should expose at least one procedure`,
      ).toBeGreaterThan(0)
    }
  })
})
