"use client"

import { User } from "lucide-react"
import { Route } from "next"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
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
import { UserRoleBadge } from "@/components/UserRoleBadge"
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
  const { companyMembershipRole } = useDashboard()
  const effectiveRole = user.effectiveRole ?? user.role ?? "student"
  const roleKey =
    effectiveRole === "company_admin" && companyMembershipRole === "recruiter"
      ? "recruiter"
      : effectiveRole
  const roleLabel = t(`roles.${roleKey}` as any)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex min-w-0 items-center gap-2.5 outline-none">
        <div className="hidden min-w-0 xl:flex items-center gap-2.5">
          <p className="max-w-[10rem] truncate text-sm font-medium text-heading transition-colors group-hover:text-primary">
            {user.name || "User Name"}
          </p>
          <UserRoleBadge
            role={effectiveRole}
            label={roleLabel}
            className="text-[9px]"
          />
        </div>
        <div
          data-testid="user-dropdown-compact-badge"
          className="flex xl:hidden"
        >
          <UserRoleBadge
            role={effectiveRole}
            label={roleLabel}
            className="text-[9px]"
          />
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/30 bg-background text-lg font-serif text-heading transition-colors group-hover:border-primary/50">
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
