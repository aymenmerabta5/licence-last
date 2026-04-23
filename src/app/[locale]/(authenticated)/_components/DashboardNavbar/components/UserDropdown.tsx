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
import { Button } from "@/components/ui/button"
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
  const { companyMembershipRole, universityMembershipRole } = useDashboard()
  const effectiveRole = user.effectiveRole ?? user.role ?? "student"
  const isStudent = effectiveRole === "student"
  const roleKey =
    effectiveRole === "company_admin" && companyMembershipRole === "recruiter"
      ? "recruiter"
      : effectiveRole === "university_admin" &&
          universityMembershipRole === "department_head"
        ? "department_head"
        : effectiveRole
  const roleLabel = t(`roles.${roleKey}` as any)

  const profileHref = `/profile/${user.id}` as Route

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="group h-auto min-w-0 items-center gap-2.5 rounded-none px-3 py-2 hover:bg-secondary/90"
          />
        }
      >
        <div className="hidden min-w-0 xl:flex items-center gap-2.5">
          <p className="max-w-[10rem] truncate text-sm font-medium text-heading transition-colors group-hover:text-primary">
            {user.name || "User Name"}
          </p>
          <UserRoleBadge
            role={roleKey}
            label={roleLabel}
            className="text-[8px] tracking-[0.1em] shrink-0"
          />
        </div>
        <div
          data-testid="user-dropdown-compact-badge"
          className="hidden sm:flex xl:hidden"
        >
          <UserRoleBadge
            role={roleKey}
            label={roleLabel}
            className="text-[8px] tracking-[0.1em]"
          />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/30 bg-background text-sm font-serif text-heading transition-colors group-hover:border-primary/50">
          {user.name?.charAt(0) || "U"}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {/* Profile Links */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
            {t("accountSettings")}
          </DropdownMenuLabel>
          {isStudent && (
            <Link href={profileHref}>
              <DropdownMenuItem className="h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                <User className="h-4 w-4 me-2" /> {t("viewProfile")}
              </DropdownMenuItem>
            </Link>
          )}
          <Link href="/dashboard/settings">
            <DropdownMenuItem className="h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
              <User className="h-4 w-4 me-2" /> {t("profileSettings")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        {/* Logout */}
        <DropdownMenuSeparator className="my-1.5 opacity-50" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="h-9 cursor-pointer transition-colors"
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
