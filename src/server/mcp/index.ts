import "server-only"

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { createInternexDevMcpServer } from "@/server/mcp/server"
import { assertDevMcpAllowed } from "@/server/mcp/guards"

async function main() {
  assertDevMcpAllowed()

  const server = createInternexDevMcpServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)
  console.error("Internex local developer MCP is running on stdio.")
}

main().catch((error) => {
  console.error("Failed to start Internex developer MCP:", error)
  process.exit(1)
})
