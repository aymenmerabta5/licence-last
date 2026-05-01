"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrganizationSearchField } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/components/OrganizationSearchField"

type CreateUserRole =
  | "student"
  | "company_admin"
  | "university_admin"
  | "department_head"
  | "super_admin"
  | "recruiter"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    email: string
    password: string
    name: string
    role: CreateUserRole
    universityId?: string
    companyId?: string
  }) => void
  isPending: boolean
}

const roles: CreateUserRole[] = [
  "student",
  "company_admin",
  "university_admin",
  "department_head",
  "super_admin",
  "recruiter",
]
export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CreateUserDialogProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<CreateUserRole>("student")
  const [universityId, setUniversityId] = useState("")
  const [companyId, setCompanyId] = useState("")
  const isUniversitySearch = role === "student" || role === "department_head"
  const isCompanySearch = role === "recruiter"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      email,
      password,
      name,
      role,
      ...(isUniversitySearch && universityId
        ? { universityId }
        : {}),
      ...(isCompanySearch && companyId ? { companyId } : {}),
    })
    setEmail("")
    setPassword("")
    setName("")
    setRole("student")
    setUniversityId("")
    setCompanyId("")
  }

  const attachmentMissing =
    (isUniversitySearch && !universityId) ||
    (isCompanySearch && !companyId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("dialogs.create.title")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogs.create.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">{t("fields.name")}</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">{t("fields.email")}</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">{t("fields.password")}</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("fields.role")}</Label>
            <Select
              value={role}
              onValueChange={(v) => {
                if (!v) return
                setRole(v as CreateUserRole)
                setUniversityId("")
                setCompanyId("")
              }}
              items={roles.map((r) => ({ value: r, label: t(`roles.${r}`) }))}
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
              if (isUniversitySearch) setUniversityId(id)
              else setCompanyId(id)
            }}
            onClear={() => {
              setUniversityId("")
              setCompanyId("")
            }}
          />

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
              {t("dialogs.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
