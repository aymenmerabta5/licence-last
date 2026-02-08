import { RPCHandler } from "@orpc/server/fetch"
import { onError } from "@orpc/server"
import { appRouter } from "@/server/orpc/router"

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("oRPC error:", error)
    }),
  ],
})

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
  })

  return response ?? new Response("Not found", { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
