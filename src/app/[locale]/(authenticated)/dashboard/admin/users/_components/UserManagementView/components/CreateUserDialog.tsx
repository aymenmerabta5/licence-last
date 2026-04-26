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

interface UniversityOption {
  id: string
  name: string
}

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    email: string
    password: string
    name: string
    role: "student" | "company_admin" | "university_admin" | "super_admin"
    universityId?: string
  }) => void
  isPending: boolean
  universities?: UniversityOption[]
}

const roles = [
  "student",
  "company_admin",
  "university_admin",
  "super_admin",
] as const

const rolesRequiringUniversity = new Set<string>([
  "student",
  "university_admin",
])

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  universities = [],
}: CreateUserDialogProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<(typeof roles)[number]>("student")
  const [universityId, setUniversityId] = useState("")

  const requiresUniversity = rolesRequiringUniversity.has(role)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      email,
      password,
      name,
      role,
      ...(requiresUniversity && universityId ? { universityId } : {}),
    })
    setEmail("")
    setPassword("")
    setName("")
    setRole("student")
    setUniversityId("")
  }

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
                setRole(v as typeof role)
                setUniversityId("")
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
          {requiresUniversity && (
            <div className="space-y-2">
              <Label>{t("fields.university")}</Label>
              <Select
                value={universityId}
                onValueChange={(v) => v && setUniversityId(v)}
                items={universities.map((u) => ({
                  value: u.id,
                  label: u.name,
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.selectUniversity")} />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("dialogs.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || (requiresUniversity && !universityId)}
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
