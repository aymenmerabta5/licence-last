import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { useRouter } from "@/i18n/routing"
import { createStudentProfileSchema } from "@/lib/schemas/student"
import { orpcClient, orpc } from "@/server/orpc/client"

import type { StudentOnboardingFormValues } from "../types"

export function useOnboardingForm() {
  const t = useTranslations("onboarding.student")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")

  const { data: skillTags = [] } = useQuery(orpc.skills.list.queryOptions())

  const schema = useMemo(() => createStudentProfileSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      bio: "",
      phone: "",
      githubUrl: "",
      portfolioUrl: "",
      studentNumber: "",
      department: "",
      level: "",
      wilayaCode: 0,
      address: "",
      skillTagIds: [] as string[],
    } as StudentOnboardingFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        const fieldErrors: Record<string, string> = {}

        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path[0]
            if (path !== undefined && !fieldErrors[String(path)]) {
              fieldErrors[String(path)] = issue.message
            }
          }
        }

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        await orpcClient.students.upsertProfile({
          bio: value.bio || undefined,
          phone: value.phone || undefined,
          githubUrl: value.githubUrl || undefined,
          portfolioUrl: value.portfolioUrl || undefined,
          studentNumber: value.studentNumber || undefined,
          department: value.department || undefined,
          level: value.level || undefined,
          wilayaCode: value.wilayaCode || undefined,
          address: value.address || undefined,
          skillTagIds: value.skillTagIds,
        })

        router.push("/dashboard")
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : t("error")
        )
      }
    },
  })

  return {
    form,
    serverError,
    setServerError,
    skillTags,
  }
}
