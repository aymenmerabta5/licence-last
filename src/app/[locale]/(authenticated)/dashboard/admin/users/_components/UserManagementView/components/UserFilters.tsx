"use client"

import { Plus, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  canCreate: boolean
}

const roles = [
  "all",
  "student",
  "company_admin",
  "university_admin",
  "department_head",
  "recruiter",
  "super_admin",
] as const

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onCreateClick,
  canCreate,
}: UserFiltersProps) {
  const t = useTranslations("dashboard.superAdmin.users")

  return (
    <div
      data-testid="user-filters"
      className="grid gap-3 border border-border/80 bg-background p-4 shadow-[4px_4px_0_0_oklch(var(--border))] md:grid-cols-[minmax(0,1fr)_180px] xl:grid-cols-[minmax(0,1fr)_180px_auto]"
    >
      <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-9 rounded-none"
        />
      </div>

      <Select
        value={roleFilter}
        onValueChange={(v) => v && onRoleFilterChange(v)}
        items={roles.map((role) => ({
          value: role,
          label: role === "all" ? t("allRoles") : t(`roles.${role}`),
        }))}
      >
        <SelectTrigger className="w-full min-w-0">
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

      {canCreate && (
        <Button
          onClick={onCreateClick}
          className="w-full justify-center gap-2 rounded-none md:w-auto md:justify-self-end"
        >
          <Plus className="h-4 w-4" />
          {t("createUser")}
        </Button>
      )}
    </div>
  )
}
