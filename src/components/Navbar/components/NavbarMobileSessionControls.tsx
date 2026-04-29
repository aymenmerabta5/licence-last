"use client"

import { useTranslations } from "next-intl"
import { useCallback } from "react"

import { NavbarMobileSessionControlsFallback } from "@/components/Navbar/components/NavbarMobileSessionControlsFallback"
import { Button } from "@/components/ui/button"
import { Link, useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"

export function NavbarMobileSessionControls({
  onNavigate,
}: {
  onNavigate: () => void
}) {
  const t = useTranslations("nav")
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const userInitial = (user?.name || user?.email || "U")
    .slice(0, 1)
    .toUpperCase()

  const handleLogout = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/")
        },
      },
    })
  }, [router])

  if (isPending) {
    return <NavbarMobileSessionControlsFallback />
  }

  if (!user) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="editorial"
          size="editorial"
          className="w-full"
          nativeButton={false}
          render={<Link href="/login" onClick={onNavigate} />}
        >
          {t("getStarted")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {userInitial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-heading truncate">
            {user.name ?? "Account"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="editorial"
          size="editorial"
          className="w-full"
          nativeButton={false}
          render={<Link href="/dashboard" onClick={onNavigate} />}
        >
          {t("dashboard")}
        </Button>
        <Button
          variant="editorial-outline"
          size="editorial"
          className="w-full"
          onClick={() => {
            onNavigate()
            void handleLogout()
          }}
        >
          {t("logout")}
        </Button>
      </div>
    </div>
  )
}
