"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

export function useImpersonation() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const impersonate = async (userId: string) => {
    setIsPending(true)
    try {
      const { error } = await authClient.admin.impersonateUser({ userId })
      if (error) {
        toast.error(error.message ?? "Failed to impersonate")
        return
      }
      toast.success("Impersonating user")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Failed to impersonate")
    } finally {
      setIsPending(false)
    }
  }

  return { impersonate, isPending }
}
