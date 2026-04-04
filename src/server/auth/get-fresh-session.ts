import "server-only"

import { auth } from "@/lib/auth"

export async function getFreshAuthSession(requestHeaders: Headers) {
  return auth.api.getSession({
    headers: requestHeaders,
    query: {
      disableCookieCache: true,
    },
  })
}
