"use client"

import { useState } from "react"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { CreateFieldForm } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/components/CreateFieldForm"
import { FieldSkillsModal } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/components/FieldSkillsModal"
import { FieldsListSection } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/components/FieldsListSection"
import { useFieldsActions } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/hooks/useFieldsActions"
import { useFieldsData } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/hooks/useFieldsData"
import { reveal, revealWithDelay } from "@/lib/animations"

export function FieldsView() {
  const t = useTranslations("dashboard.admin.fields")
  const { fields, isLoading, refetch } = useFieldsData()
  const actions = useFieldsActions()
  const [skillsModalFieldId, setSkillsModalFieldId] = useState<string | null>(
    null,
  )

  const skillsModalField =
    fields.find((f) => f.id === skillsModalFieldId) ?? null

  const handleCreate = async (name: string, description: string) => {
    await actions.createField(name, description)
    refetch()
  }

  const handleDelete = async (fieldId: string) => {
    await actions.deleteField(fieldId)
    refetch()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-heading">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <motion.div {...reveal} transition={revealWithDelay(0.08)}>
        <CreateFieldForm
          onSubmit={handleCreate}
          isSubmitting={actions.isCreating}
        />
      </motion.div>

      <FieldsListSection
        fields={fields}
        isLoading={isLoading}
        onManageSkills={setSkillsModalFieldId}
        onDelete={handleDelete}
      />

      {skillsModalField && (
        <FieldSkillsModal
          fieldId={skillsModalField.id}
          fieldName={skillsModalField.name}
          open={Boolean(skillsModalFieldId)}
          onOpenChange={(open) => !open && setSkillsModalFieldId(null)}
        />
      )}
    </div>
  )
}
