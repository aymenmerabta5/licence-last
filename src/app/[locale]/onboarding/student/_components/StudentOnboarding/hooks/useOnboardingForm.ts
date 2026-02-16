import { useState, useMemo, useRef } from "react"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { useRouter } from "@/i18n/routing"
import { createStudentProfileSchema } from "@/lib/schemas/student"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { orpcClient, orpc } from "@/server/orpc/client"
import { authClient } from "@/lib/auth-client"

import type { StudentOnboardingFormValues } from "../types"

export function useOnboardingForm() {
  const t = useTranslations("onboarding.student")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("")

  const { data: meResult } = useQuery(orpc.users.getMe.queryOptions())
  const universityId = meResult?.university?.id ?? null

  // Fetch prioritized skills when a department is selected
  const { data: prioritizedResult } = useQuery({
    ...orpc.skills.listPrioritized.queryOptions({
      input: { departmentId: selectedDepartmentId },
    }),
    enabled: !!selectedDepartmentId,
  })

  // Fallback: fetch all skills when no department is selected
  const { data: allSkillsResult } = useQuery({
    ...orpc.skills.list.queryOptions(),
    enabled: !selectedDepartmentId,
  })

  const departmentSkills = useMemo(
    () => prioritizedResult?.departmentSkills ?? [],
    [prioritizedResult?.departmentSkills],
  )
  const otherSkills = useMemo(
    () =>
      selectedDepartmentId
        ? prioritizedResult?.otherSkills ?? []
        : allSkillsResult?.skills ?? [],
    [selectedDepartmentId, prioritizedResult?.otherSkills, allSkillsResult?.skills],
  )

  const { data: departmentsResult } = useQuery(
    orpc.departments.list.queryOptions({
      input: { universityId: universityId ?? "" },
      enabled: !!universityId,
    }),
  )
  const departments = useMemo(
    () => departmentsResult ?? [],
    [departmentsResult],
  )

  const schema = useMemo(() => createStudentProfileSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      bio: "",
      phone: "",
      githubUrl: "",
      portfolioUrl: "",
      studentNumber: "",
      departmentId: "",
      level: "",
      wilayaCode: 0,
      address: "",
      skillTagIds: [] as string[],
    } as StudentOnboardingFormValues,
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
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
          departmentId: value.departmentId || undefined,
          level: value.level || undefined,
          wilayaCode: value.wilayaCode || undefined,
          address: value.address || undefined,
          skillTagIds: value.skillTagIds,
        })

        // Refresh session cookie cache so the dashboard sees onboardingCompleted=true
        await authClient.getSession({ query: { disableCookieCache: true } })

        router.push("/dashboard")
      } catch (err) {
        setServerError(getErrorMessage(err, t("error")))
      }
    },
  })

  // Track previous department to clear skills on change
  const prevDeptRef = useRef("")
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId)

    // Clear selected skills when switching departments (old skills may not exist in new dept)
    if (prevDeptRef.current && prevDeptRef.current !== departmentId) {
      form.setFieldValue("skillTagIds", [])
    }
    prevDeptRef.current = departmentId
  }

  return {
    form,
    serverError,
    setServerError,
    departmentSkills,
    otherSkills,
    departments,
    selectedDepartmentId,
    handleDepartmentChange,
  }
}
