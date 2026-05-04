"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Eye, Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { orpc } from "@/server/orpc/client"

interface ImpersonationBannerProps {
  userName: string
  className?: string
}

export function ImpersonationBanner({
  userName,
  className,
}: ImpersonationBannerProps) {
  const t = useTranslations("dashboard.superAdmin.impersonation")
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const stopImpersonating = async () => {
    setIsPending(true)
    try {
      await authClient.admin.stopImpersonating()
      const meQueryOptions = orpc.users.getMe.queryOptions()
      await queryClient.resetQueries({ queryKey: meQueryOptions.queryKey })
      router.push("/dashboard/admin/users")
      router.refresh()
    } catch {
      // silently fail — page refresh should restore state
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium",
        className,
      )}
    >
      <Eye className="h-4 w-4 shrink-0" />
      <span>{t("banner", { name: userName })}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={stopImpersonating}
        disabled={isPending}
        className="h-7 gap-1.5 text-amber-950 hover:bg-amber-600 hover:text-amber-950"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
        {t("stop")}
      </Button>
    </div>
  )
}
