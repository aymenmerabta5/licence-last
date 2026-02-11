import { RPCHandler } from "@orpc/server/fetch"
import { onError } from "@orpc/server"
import { appRouter } from "@/server/orpc/router"
import { env } from "@/env"

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error: unknown) => {
      // Only log error code and message, not the full object (avoids leaking PII)
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("oRPC error:", message)
    }),
  ],
})

/**
 * Validate Origin header for state-changing requests (CSRF protection).
 * Compares the Origin against the configured base URL.
 */
function isValidOrigin(request: Request): boolean {
  // Only enforce on state-changing methods
  if (request.method === "GET" || request.method === "HEAD") {
    return true
  }

  const origin = request.headers.get("origin")
  if (!origin) {
    // No origin header — block by default for POST/PUT/DELETE
    return false
  }

  const allowedOrigin = new URL(env.NEXT_PUBLIC_BETTER_AUTH_URL).origin
  return origin === allowedOrigin
}

async function handleRequest(request: Request) {
  // CSRF: reject cross-origin state-changing requests
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
