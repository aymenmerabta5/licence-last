import "server-only"

import Arcade from "@arcadeai/arcadejs"
import type { ExecuteToolResponse } from "@arcadeai/arcadejs/resources/tools/tools"
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

  const listLimit = config?.allowedToolkits
    ? Math.max(config?.limit ?? 20, 50)
    : (config?.limit ?? 20)

  const toolsPage = await arcade.tools.list({
    user_id: userId,
    toolkit: config?.toolkit,
    limit: listLimit,
  })

  const allowedSet = config?.allowedToolkits
    ? new Set(config.allowedToolkits.map((t) => t.toLowerCase()))
    : null

  const toolsToConvert = allowedSet
    ? toolsPage.items.filter((t) => allowedSet.has(t.toolkit.name.toLowerCase()))
    : toolsPage.items

  type ArcadeToolOutput = ExecuteToolResponse | ToolAuthorizationResponse

  const zodToolSet = toZodToolSet<ArcadeToolOutput>({
    tools: toolsToConvert.slice(0, config?.limit ?? 20),
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
