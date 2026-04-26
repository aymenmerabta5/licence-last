"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"

/**
 * Shared logout handler. Calls `authClient.signOut()` and redirects to "/".
 *
 * @example
 * const { logout, isLoggingOut } = useLogout()
 * <Button onClick={logout} disabled={isLoggingOut}>Logout</Button>
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    setIsLoggingOut(true)
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.clear()
          router.replace("/")
        },
      },
    })
    setIsLoggingOut(false)
  }, [queryClient, router])

  return { logout, isLoggingOut }
}
