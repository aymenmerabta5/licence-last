"use client"

import { useCallback, useState } from "react"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "@/i18n/routing"

/**
 * Shared logout handler. Calls `authClient.signOut()` and redirects to "/".
 *
 * @example
 * const { logout, isLoggingOut } = useLogout()
 * <Button onClick={logout} disabled={isLoggingOut}>Logout</Button>
 */
export function useLogout() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    setIsLoggingOut(true)
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/")
        },
      },
    })
    setIsLoggingOut(false)
  }, [router])

  return { logout, isLoggingOut }
}
