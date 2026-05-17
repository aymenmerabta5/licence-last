"use client"

import { LayoutDashboard, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback } from "react"
import { NavbarSessionControlsFallback } from "@/components/Navbar/components/NavbarSessionControlsFallback"
import {
  NAVBAR_AVATAR_BADGE_CLASS,
  NAVBAR_ICON_CONTROL_CLASS,
} from "@/components/navbar-control-styles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"

export function NavbarSessionControls() {
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
    return <NavbarSessionControlsFallback />
  }

  if (!user) {
    return (
      <Button
        variant="editorial"
        size="editorial"
        nativeButton={false}
        render={<Link href="/login" />}
        aria-label={t("aria.getStarted")}
      >
        {t("getStarted")}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="editorial"
        size="editorial"
        className="hidden sm:inline-flex"
        nativeButton={false}
        render={<Link href="/dashboard" />}
        aria-label={t("aria.dashboard")}
      >
        {t("dashboard")}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              className={`${NAVBAR_ICON_CONTROL_CLASS} p-1`}
            />
          }
          aria-label={t("aria.accountMenu")}
        >
          <Avatar
            className={`${NAVBAR_AVATAR_BADGE_CLASS} h-9 w-9 text-[13px] font-bold`}
          >
            {user?.image && (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            )}
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
              {user.name ?? user.email ?? "Account"}
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4 me-2" />
              {t("dashboard")}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5 opacity-50" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              className="h-9 cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 me-2" /> {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
