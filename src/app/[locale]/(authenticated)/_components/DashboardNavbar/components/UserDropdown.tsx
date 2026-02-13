"use client"

import { User } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Route } from "next"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AccountSwitcherSection } from "./AccountSwitcherSection"
import { useAccountSwitcher } from "../hooks/useAccountSwitcher"
import type { NavbarUser } from "../types"

interface UserDropdownProps {
  user: NavbarUser
  onLogout: () => void
  isLoggingOut: boolean
}

export function UserDropdown({ user, onLogout, isLoggingOut }: UserDropdownProps) {
  const t = useTranslations("dashboard.navbar")
  const tSwitcher = useTranslations("dashboard.accountSwitcher")
  const switcher = useAccountSwitcher(user.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 rounded-full hover:bg-secondary/80 transition-all outline-none group">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px] shrink-0 group-hover:bg-primary group-hover:text-white transition-all ring-2 ring-transparent group-hover:ring-primary/20">
          {user.name?.charAt(0) || "U"}
        </div>
        <div className="hidden sm:block text-start pe-1">
          <p className="text-xs font-bold leading-none text-heading">{user.name || "User Name"}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{user.role || "Student"}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 mt-2 p-1.5 rounded-xl border-border/40 shadow-xl backdrop-blur-xl bg-background/95">
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

        {/* Account Switcher */}
        <AccountSwitcherSection
          sessions={switcher.sessions}
          isLoading={switcher.isLoading}
          currentUserId={switcher.currentUserId}
          switchingToken={switcher.switchingToken}
          removingToken={switcher.removingToken}
          onSwitch={switcher.switchAccount}
          onRemove={switcher.removeAccount}
          onAdd={switcher.addAccount}
        />

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
