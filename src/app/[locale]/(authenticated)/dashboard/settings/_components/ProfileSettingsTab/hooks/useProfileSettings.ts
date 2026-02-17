"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"

import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { orpc, orpcClient } from "@/server/orpc/client"

import type { MeResult, StudentProfileResult } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"

const studentProfileDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(120),
  bio: z.string().optional(),
  phone: z.string().optional(),
  githubUrl: z
    .string()
    .url({ error: "Invalid GitHub URL." })
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url({ error: "Invalid website URL." })
    .optional()
    .or(z.literal("")),
  studentNumber: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  wilayaCode: z.coerce
    .number()
    .int()
    .min(1)
    .max(58)
    .optional()
    .or(z.literal(0)),
  address: z.string().optional(),
})

export function useProfileSettings(
  me: MeResult,
  studentProfile: StudentProfileResult | null,
) {
  const queryClient = useQueryClient()

  const meQueryOptions = useMemo(() => orpc.users.getMe.queryOptions(), [])
  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )

  const [serverError, setServerError] = useState("")
  const [successTick, setSuccessTick] = useState(0)

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(me.user.image ?? null)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const updateMeMutation = useMutation(
    orpc.users.updateMe.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: meQueryOptions.queryKey,
        })
      },
    }),
  )

  const upsertDetailsMutation = useMutation(
    orpc.students.upsertProfileDetails.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: profileQueryOptions.queryKey,
        })
      },
    }),
  )

  const role = me.user.role ?? null
  const isStudent = role === "student"

  const initialValues = useMemo(() => {
    const profile = studentProfile?.profile
    return {
      name: me.user.name ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      githubUrl: profile?.githubUrl ?? "",
      portfolioUrl: profile?.portfolioUrl ?? "",
      studentNumber: profile?.studentNumber ?? "",
      department: profile?.department ?? "",
      level: profile?.level ?? "",
      wilayaCode: profile?.wilayaCode ?? 0,
      address: profile?.address ?? "",
    }
  }, [me.user.name, studentProfile?.profile])

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: ({ value }) =>
        mapZodErrors(studentProfileDetailsSchema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      if (!me.user) return
      setServerError("")
      setSuccessTick(0)

      try {
        const nextName = value.name.trim()
        const prevName = (me.user.name ?? "").trim()

        const tasks: Promise<unknown>[] = []
        if (nextName !== prevName) {
          tasks.push(updateMeMutation.mutateAsync({ name: nextName }))
        }

        if (isStudent) {
          tasks.push(
            upsertDetailsMutation.mutateAsync({
              bio: value.bio,
              phone: value.phone,
              githubUrl: value.githubUrl,
              portfolioUrl: value.portfolioUrl,
              studentNumber: value.studentNumber,
              department: value.department,
              level: value.level,
              wilayaCode: value.wilayaCode,
              address: value.address,
            }),
          )
        }

        await Promise.all(tasks)
        setSuccessTick((t) => t + 1)
      } catch (err) {
        setServerError(getErrorMessage(err, "Could not save changes."))
      }
    },
  })

  const isBusy = updateMeMutation.isPending || upsertDetailsMutation.isPending

  function resetToInitial() {
    setServerError("")
    setSuccessTick(0)

    form.setFieldValue("name", initialValues.name)
    form.setFieldValue("bio", initialValues.bio)
    form.setFieldValue("phone", initialValues.phone)
    form.setFieldValue("githubUrl", initialValues.githubUrl)
    form.setFieldValue("portfolioUrl", initialValues.portfolioUrl)
    form.setFieldValue("studentNumber", initialValues.studentNumber)
    form.setFieldValue("department", initialValues.department)
    form.setFieldValue("level", initialValues.level)
    form.setFieldValue("wilayaCode", initialValues.wilayaCode)
    form.setFieldValue("address", initialValues.address)
  }

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Reset input so the same file can be re-selected
      if (avatarInputRef.current) avatarInputRef.current.value = ""

      setIsAvatarUploading(true)
      try {
        const { url } = await orpcClient.users.uploadAvatar({ file })
        setAvatarUrl(url)
        await queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey })
        toast.success("Profile photo updated.")
      } catch (err) {
        toast.error(getErrorMessage(err, "Upload failed. Please try again."))
      } finally {
        setIsAvatarUploading(false)
      }
    },
    [queryClient, meQueryOptions.queryKey],
  )

  return {
    form,
    isStudent,
    isBusy,
    serverError,
    successTick,
    resetToInitial,
    avatarUrl,
    isAvatarUploading,
    avatarInputRef,
    handleAvatarUpload,
  }
}
