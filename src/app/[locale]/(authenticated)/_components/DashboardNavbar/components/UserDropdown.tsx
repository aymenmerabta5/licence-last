"use client"

import { User } from "lucide-react"
import { Route } from "next"
import { useTranslations } from "next-intl"
import type { NavbarUser } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/types"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"

interface UserDropdownProps {
  user: NavbarUser
  onLogout: () => void
  isLoggingOut: boolean
}

export function UserDropdown({
  user,
  onLogout,
  isLoggingOut,
}: UserDropdownProps) {
  const t = useTranslations("dashboard.navbar")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 transition-all outline-none group">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-serif text-heading group-hover:text-primary transition-colors">
            {user.name || "User Name"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans">
            {user.role
              ? t(`roles.${user.role || "student"}` as any)
              : t("roles.student" as any)}
          </p>
        </div>
        <div className="h-10 w-10 border border-border/20 flex items-center justify-center text-heading font-serif text-lg group-hover:border-primary/50 transition-colors bg-background">
          {user.name?.charAt(0) || "U"}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 mt-2 p-1.5 rounded-xl border-border/40 shadow-xl backdrop-blur-xl bg-background/95"
      >
        {/* Profile Links */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
            {t("accountSettings")}
          </DropdownMenuLabel>
          <Link href={`/profile/${user.id}` as Route}>
            <DropdownMenuItem className="rounded-lg h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
              <User className="h-4 w-4 me-2" /> {t("viewProfile")}
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/settings">
            <DropdownMenuItem className="rounded-lg h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
              <User className="h-4 w-4 me-2" /> {t("profileSettings")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        {/* Logout */}
        <DropdownMenuSeparator className="my-1.5 opacity-50" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/5 focus:text-destructive rounded-lg h-9 cursor-pointer transition-colors"
            disabled={isLoggingOut}
            onClick={onLogout}
          >
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
