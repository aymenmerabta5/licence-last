import "server-only"

import type { ToolSet } from "ai"

import { logger } from "@/server/logging"
import { getArcadeTools } from "@/server/ai/tools/arcade"

export async function loadArcadeToolsOrFallback(args: {
  userId: string
  config?: {
    toolkit?: string
    limit?: number
    allowedToolkits?: string[]
  }
}): Promise<ToolSet> {
  try {
    return await getArcadeTools(args)
  } catch (error) {
    logger.warn(
      {
        err: error,
        event: "arcade_tool_discovery_failed",
        userId: args.userId,
        allowedToolkits: args.config?.allowedToolkits,
      },
      "Failed to load Arcade tools; continuing without Arcade integrations",
    )
    return {}
  }
}
