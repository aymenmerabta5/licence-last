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

// Simple TTL cache for tool definitions per user
const toolCache = new Map<string, { tools: ToolDefinition[]; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCachedTools(userId: string): ToolDefinition[] | null {
  const cached = toolCache.get(userId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tools
  }
  if (cached) {
    toolCache.delete(userId)
  }
  return null
}

function setCachedTools(userId: string, tools: ToolDefinition[]) {
  toolCache.set(userId, { tools, expiresAt: Date.now() + CACHE_TTL_MS })
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

async function fetchArcadeToolsWithRetry({
  arcade,
  userId,
  config,
}: {
  arcade: Arcade
  userId: string
  config?: GetArcadeToolsConfig
}): Promise<ToolDefinition[]> {
  const desiredLimit = config?.limit ?? 20
  const pageLimit = Math.max(desiredLimit, 50)

  let lastError: Error | null = null
  const maxRetries = 2

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Fast path: if allowedToolkits is provided, use the server-side `toolkit` filter
      if (config?.allowedToolkits && config.allowedToolkits.length > 0) {
        const out: ToolDefinition[] = []

        for (const toolkitName of config.allowedToolkits) {
          const page = await arcade.tools.list({
            user_id: userId,
            toolkit: toolkitName,
            limit: pageLimit,
          })

          out.push(...page.items)

          let current = page
          while (out.length < desiredLimit && current.hasNextPage()) {
            current = await current.getNextPage()
            out.push(...current.items)
          }

          if (out.length >= desiredLimit) break
        }

        // Deduplicate by qualified name
        const seen = new Set<string>()
        return out.filter((t) => {
          const key = t.qualified_name
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
      }

      // Fallback: list without allowedToolkits
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
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (attempt < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError ?? new Error("Failed to fetch Arcade tools")
}

export async function getArcadeTools({
  userId,
  config,
}: {
  userId: string
  config?: GetArcadeToolsConfig
}): Promise<ToolSet> {
  // Check cache first
  const cached = getCachedTools(userId)
  if (cached) {
    // Reconstruct ToolSet from cache
    const arcade = new Arcade({ apiKey: env.ARCADE_API_KEY })
    type ArcadeToolOutput = ExecuteToolResponse | ToolAuthorizationResponse

    const zodToolSet = toZodToolSet<ArcadeToolOutput>({
      tools: cached.slice(0, config?.limit ?? 20),
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

  const arcade = new Arcade({
    apiKey: env.ARCADE_API_KEY,
  })

  const toolsToConvert = await fetchArcadeToolsWithRetry({ arcade, userId, config })

  // Cache the tool definitions
  setCachedTools(userId, toolsToConvert)

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

export { stripNullishDeep }
