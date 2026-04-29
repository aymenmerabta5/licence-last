"use client"

import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { EditUniversityFields } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/EditUniversityFields"
import type {
  UniversityListItem,
  UpdateUniversityPayload,
} from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { createUniversityUpdateSchema } from "@/lib/schemas/university"

interface EditUniversityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  university: UniversityListItem | null
  onConfirm: (payload: UpdateUniversityPayload) => void
  isUpdating: boolean
}

export function EditUniversityDialog({
  open,
  onOpenChange,
  university,
  onConfirm,
  isUpdating,
}: EditUniversityDialogProps) {
  const t = useTranslations("dashboard.admin.universities.editDialog")
  const tv = useTranslations("auth.validation")
  const schema = useMemo(() => createUniversityUpdateSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      name: "",
      abbreviation: "",
      phone: "",
      wilayaCode: "",
      city: "",
      address: "",
    },
    validators: {
      onSubmit: ({ value }) =>
        mapZodErrors(
          schema.safeParse({
            name: value.name,
            abbreviation: value.abbreviation || undefined,
            phone: value.phone || undefined,
            wilayaCode:
              value.wilayaCode.trim().length > 0
                ? Number(value.wilayaCode)
                : undefined,
            city: value.city || undefined,
            address: value.address || undefined,
          }),
        ),
    },
    onSubmit: async ({ value }) => {
      if (!university) return

      onConfirm({
        universityId: university.id,
        name: value.name.trim(),
        abbreviation: value.abbreviation.trim() || null,
        phone: value.phone.trim() || null,
        wilayaCode: value.wilayaCode.trim() ? Number(value.wilayaCode) : null,
        city: value.city.trim() || null,
        address: value.address.trim() || null,
      })
    },
  })

  useEffect(() => {
    if (!open || !university) return

    form.setFieldValue("name", university.name)
    form.setFieldValue("abbreviation", university.abbreviation ?? "")
    form.setFieldValue("phone", university.phone ?? "")
    form.setFieldValue(
      "wilayaCode",
      university.wilayaCode !== null ? String(university.wilayaCode) : "",
    )
    form.setFieldValue("city", university.city ?? "")
    form.setFieldValue("address", university.address ?? "")
  }, [form, open, university])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4 py-2"
        >
          <EditUniversityFields form={form as ReturnType<typeof useForm>} />

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="editorial-outline"
              className="rounded-xl h-10"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="editorial"
              className="rounded-xl h-10"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
