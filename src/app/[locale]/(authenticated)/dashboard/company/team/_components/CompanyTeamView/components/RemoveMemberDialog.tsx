"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export interface RemovableMember {
  userId: string
  email: string
  name: string | null
}

interface RemoveMemberDialogProps {
  member: RemovableMember | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (member: RemovableMember) => void
}

export function RemoveMemberDialog({
  member,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: RemoveMemberDialogProps) {
  const t = useTranslations("dashboard.company.team")
  const memberLabel = member?.name?.trim() || member?.email || ""

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">
            {t("removeDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("removeDialog.description", { name: memberLabel })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="rounded-none"
          >
            {t("removeDialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !member}
            onClick={() => member && onConfirm(member)}
            className="rounded-none"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("removeDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
