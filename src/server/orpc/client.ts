import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import type { AppRouter } from "./router"
import type { RouterClient } from "@orpc/server"

const link = new RPCLink({
  url:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/rpc`
      : "http://localhost:3000/api/rpc",
  headers: async () => {
    if (typeof window !== "undefined") {
      return {}
    }
    // Forward cookies during SSR
    const { headers } = await import("next/headers")
    return await headers()
  },
})

export const orpcClient: RouterClient<AppRouter> =
  createORPCClient(link)

/** TanStack Query utilities — use with useQuery/useMutation. */
export const orpc = createTanstackQueryUtils(orpcClient)
