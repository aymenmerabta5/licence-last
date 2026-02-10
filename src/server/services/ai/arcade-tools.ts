import "server-only"

import Arcade from "@arcadeai/arcadejs"
import type {
  ExecuteToolResponse,
  ToolDefinition,
} from "@arcadeai/arcadejs/resources/tools/tools"
import {
  executeOrAuthorizeZodTool,
  toZodToolSet,
  type ToolAuthorizationResponse,
} from "@arcadeai/arcadejs/lib/index"
import { tool } from "ai"
import type { ToolSet } from "ai"

import { env } from "@/env"

interface GetArcadeToolsConfig {
  toolkit?: string
  limit?: number
  allowedToolkits?: string[]
}

function stripNullishDeep(value: unknown): unknown {
  if (value === null || value === undefined) return undefined

  if (Array.isArray(value)) {
    const items = value
      .map((item) => stripNullishDeep(item))
      .filter((item) => item !== undefined)
    return items
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    const cleaned: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      const next = stripNullishDeep(v)
      if (next !== undefined) {
        cleaned[k] = next
      }
    }
    return cleaned
  }

  return value
}

export async function getArcadeTools({
  userId,
  config,
}: {
  userId: string
  config?: GetArcadeToolsConfig
}): Promise<ToolSet> {
  const arcade = new Arcade({
    apiKey: env.ARCADE_API_KEY,
  })

  const desiredLimit = config?.limit ?? 20
  const pageLimit = Math.max(desiredLimit, 50)

  const toolsToConvert: ToolDefinition[] = await (async () => {
    // Fast path: if allowedToolkits is provided, use the server-side `toolkit` filter.
    // This avoids relying on pagination order across the entire global tool catalogue.
    if (config?.allowedToolkits && config.allowedToolkits.length > 0) {
      const out: ToolDefinition[] = []

      for (const toolkitName of config.allowedToolkits) {
        const page = await arcade.tools.list({
          user_id: userId,
          toolkit: toolkitName,
          limit: pageLimit,
        })

        out.push(...page.items)

        // Some toolkits can have more than one page. Only fetch extra pages if needed.
        let current = page
        while (out.length < desiredLimit && current.hasNextPage()) {
          current = await current.getNextPage()
          out.push(...current.items)
        }

        if (out.length >= desiredLimit) break
      }

      // Deduplicate by qualified name to keep deterministic output.
      const seen = new Set<string>()
      return out.filter((t) => {
        const key = t.qualified_name
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    // Fallback: list without allowedToolkits. Paginate until we have enough.
    const out: ToolDefinition[] = []
    let page = await arcade.tools.list({
      user_id: userId,
      toolkit: config?.toolkit,
      limit: pageLimit,
    })
    out.push(...page.items)

    while (out.length < desiredLimit && page.hasNextPage()) {
      page = await page.getNextPage()
      out.push(...page.items)
    }

    return out
  })()

  type ArcadeToolOutput = ExecuteToolResponse | ToolAuthorizationResponse

  const zodToolSet = toZodToolSet<ArcadeToolOutput>({
    tools: toolsToConvert.slice(0, desiredLimit),
    client: arcade,
    userId,
    executeFactory: executeOrAuthorizeZodTool,
  })

  const toolSet: ToolSet = {}

  for (const [toolName, zodTool] of Object.entries(zodToolSet)) {
    toolSet[toolName] = tool({
      description: zodTool.description,
      inputSchema: zodTool.parameters,
      execute: async (input) => {
        const cleanedInput = stripNullishDeep(input)
        return zodTool.execute(cleanedInput)
      },
    })
  }

  return toolSet
}
