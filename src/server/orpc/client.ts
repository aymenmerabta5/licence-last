import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import type { AppRouter } from "@/server/orpc/router"

function getRpcBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000"
}

const link = new RPCLink({
  url: `${getRpcBaseUrl()}/api/rpc`,
  headers: async () => {
    if (typeof window !== "undefined") {
      return {}
    }
    // Forward cookies during SSR
    const { headers } = await import("next/headers")
    return await headers()
  },
})

export const orpcClient: RouterClient<AppRouter> = createORPCClient(link)

/** TanStack Query utilities — use with useQuery/useMutation. */
export const orpc = createTanstackQueryUtils(orpcClient)
