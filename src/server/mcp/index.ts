import "server-only"

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { logger } from "@/server/logging"
import { createInternexDevMcpServer } from "@/server/mcp/server"
import { assertDevMcpAllowed } from "@/server/mcp/guards"

async function main() {
  assertDevMcpAllowed()

  const server = createInternexDevMcpServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)
  logger.info({ event: "mcp_server_started", transport: "stdio", environment: "development" }, "Internex local developer MCP is running on stdio")
}

main().catch((error) => {
  logger.error({ err: error, event: "mcp_server_startup_failed", transport: "stdio" }, "Failed to start Internex developer MCP")
  process.exit(1)
})
