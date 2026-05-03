"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
import { DepartmentSelect } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/DepartmentSelect"
import { OrganizationSearchField } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/OrganizationSearchField"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ChangeRole =
  | "student"
  | "company_admin"
  | "university_admin"
  | "department_head"
  | "super_admin"
  | "recruiter"

interface SetRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSubmit: (data: {
    userId: string
    role: ChangeRole
    universityId?: string
    companyId?: string
    departmentId?: string
  }) => void
  isPending: boolean
}

const roles: ChangeRole[] = [
  "student",
  "company_admin",
  "university_admin",
  "department_head",
  "super_admin",
  "recruiter",
]

export function SetRoleDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isPending,
}: SetRoleDialogProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const [role, setRole] = useState<ChangeRole>(
    (user?.role as ChangeRole) ?? "student",
  )
  const [universityId, setUniversityId] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [departmentId, setDepartmentId] = useState("")

  const isUniversitySearch = role === "student" || role === "department_head"
  const isCompanySearch = role === "recruiter"
  const showDepartmentSelect = role === "department_head" && !!universityId

  useEffect(() => {
    setRole((user?.role as ChangeRole) ?? "student")
    setUniversityId("")
    setCompanyId("")
    setDepartmentId("")
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    onSubmit({
      userId: user.id,
      role,
      ...(isUniversitySearch && universityId ? { universityId } : {}),
      ...(isCompanySearch && companyId ? { companyId } : {}),
      ...(showDepartmentSelect && departmentId ? { departmentId } : {}),
    })
  }

  const attachmentMissing =
    (isUniversitySearch && !universityId) || (isCompanySearch && !companyId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("dialogs.setRole.title")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogs.setRole.description", {
              email: user?.email ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("fields.role")}</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                if (!v) return
                setRole(v as ChangeRole)
                setUniversityId("")
                setCompanyId("")
                setDepartmentId("")
              }}
              items={roles.map((r) => ({
                value: r,
                label: t(`roles.${r}`),
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`roles.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <OrganizationSearchField
            role={role}
            value={isUniversitySearch ? universityId : companyId}
            onChange={(id) => {
              if (isUniversitySearch) {
                setUniversityId(id)
                setDepartmentId("")
              } else {
                setCompanyId(id)
              }
            }}
            onClear={() => {
              setUniversityId("")
              setCompanyId("")
              setDepartmentId("")
            }}
          />

          {showDepartmentSelect && (
            <DepartmentSelect
              universityId={universityId}
              departmentId={departmentId}
              onChange={(id) => setDepartmentId(id)}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => onOpenChange(false)}
            >
              {t("dialogs.cancel")}
            </Button>
            <Button
              type="submit"
              className="rounded-none"
              disabled={isPending || attachmentMissing}
            >
              {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t("dialogs.setRole.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
