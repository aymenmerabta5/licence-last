"use client"

import { useTranslations } from "next-intl"
import { Search, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  onCreateClick: () => void
}

const roles = ["all", "student", "company_admin", "university_admin", "super_admin"] as const

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onCreateClick,
}: UserFiltersProps) {
  const t = useTranslations("dashboard.superAdmin.users")

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-9"
        />
      </div>

      <Select value={roleFilter} onValueChange={(v) => v && onRoleFilterChange(v)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t("filterByRole")} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {role === "all" ? t("allRoles") : t(`roles.${role}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("createUser")}
      </Button>
    </div>
  )
}
