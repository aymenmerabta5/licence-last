import { onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import { isValidOrigin } from "@/lib/csrf"
import { createModuleLogger } from "@/server/logging"
import { appRouter } from "@/server/orpc/router"

const log = createModuleLogger("api/rpc")

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error"
      log.error({ err: error, event: "orpc_error" }, message)
    }),
  ],
})

async function handleRequest(request: Request) {
  if (!isValidOrigin(request)) {
    return new Response("Forbidden: invalid origin", { status: 403 })
  }

  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
  })

  return response ?? new Response("Not found", { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
