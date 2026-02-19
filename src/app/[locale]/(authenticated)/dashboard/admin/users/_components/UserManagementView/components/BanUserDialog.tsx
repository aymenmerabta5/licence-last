"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { AdminUser } from "@/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/types"
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

interface BanUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSubmit: (data: {
    userId: string
    banReason?: string
    banExpiresIn?: number
  }) => void
  isPending: boolean
}

const durations = [
  { value: "permanent", seconds: 0 },
  { value: "1h", seconds: 3600 },
  { value: "24h", seconds: 86400 },
  { value: "7d", seconds: 604800 },
  { value: "30d", seconds: 2592000 },
] as const

export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isPending,
}: BanUserDialogProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState("permanent")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const dur = durations.find((d) => d.value === duration)
    onSubmit({
      userId: user.id,
      ...(reason && { banReason: reason }),
      ...(dur && dur.seconds > 0 && { banExpiresIn: dur.seconds }),
    })
    setReason("")
    setDuration("permanent")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {t("dialogs.ban.title")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogs.ban.description", { email: user?.email ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">{t("dialogs.ban.reason")}</Label>
            <Input
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("dialogs.ban.reasonPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dialogs.ban.duration")}</Label>
            <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {t(`dialogs.ban.durations.${d.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("dialogs.cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t("dialogs.ban.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
