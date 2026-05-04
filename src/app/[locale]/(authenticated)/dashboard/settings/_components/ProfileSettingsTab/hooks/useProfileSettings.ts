"use client"

import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { studentProfileDetailsSchema } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/profileSettingsSchema"
import type {
  MeResult,
  StudentProfileResult,
} from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"
import { resolveLocalizedError } from "@/lib/error-message"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { orpc, orpcClient } from "@/server/orpc/client"

export type ProfileSettingsFormApi = ReturnType<
  typeof useProfileSettings
>["form"]

export function useProfileSettings(
  me: MeResult,
  studentProfile: StudentProfileResult | null,
) {
  const t = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()

  const meQueryOptions = useMemo(() => orpc.users.getMe.queryOptions(), [])
  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )

  const [serverError, setServerError] = useState("")
  const [successTick, setSuccessTick] = useState(0)

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    me.user.image ?? null,
  )
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [isAvatarDeleting, setIsAvatarDeleting] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const updateMeMutation = useMutation({
    ...orpc.users.updateMe.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: meQueryOptions.queryKey })
      const previousData = queryClient.getQueryData(meQueryOptions.queryKey)
      queryClient.setQueryData(meQueryOptions.queryKey, (old) => {
        if (!old) return old
        return { ...old, user: { ...old.user, name: variables.name } }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(meQueryOptions.queryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey })
    },
  })

  const upsertDetailsMutation = useMutation({
    ...orpc.students.upsertProfileDetails.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: profileQueryOptions.queryKey,
      })
      const previousData = queryClient.getQueryData(
        profileQueryOptions.queryKey,
      )
      queryClient.setQueryData<StudentProfileResult>(
        profileQueryOptions.queryKey,
        (old) => {
          if (!old?.profile) return old
          return {
            ...old,
            profile: {
              ...old.profile,
              bio: variables.bio ?? old.profile.bio,
              phone: variables.phone ?? old.profile.phone,
              githubUrl: variables.githubUrl ?? old.profile.githubUrl,
              portfolioUrl: variables.portfolioUrl ?? old.profile.portfolioUrl,
              studentNumber:
                variables.studentNumber ?? old.profile.studentNumber,
              department: variables.department ?? old.profile.department,
              level: variables.level ?? old.profile.level,
              wilayaCode:
                (variables.wilayaCode as number | undefined) ??
                old.profile.wilayaCode,
              address: variables.address ?? old.profile.address,
            },
          }
        },
      )
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          profileQueryOptions.queryKey,
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey })
    },
  })

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
        setServerError(
          resolveLocalizedError(err, {
            t,
            fallbackKey: "errors.common.saveChangesFailed",
          }),
        )
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
        await queryClient.invalidateQueries({
          queryKey: meQueryOptions.queryKey,
        })
        await authClient.getSession({ query: { disableCookieCache: true } })
        router.refresh()
        toast.success(t("errors.common.profilePhotoUpdated"))
      } catch (err) {
        toast.error(
          resolveLocalizedError(err, {
            t,
            fallbackKey: "errors.common.uploadFailed",
          }),
        )
      } finally {
        setIsAvatarUploading(false)
      }
    },
    [queryClient, meQueryOptions.queryKey, t, router],
  )

  const handleAvatarDelete = useCallback(async () => {
    if (!avatarUrl) return
    setIsAvatarDeleting(true)
    try {
      await orpcClient.users.deleteAvatar({})
      setAvatarUrl(null)
      await queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey })
      await authClient.getSession({ query: { disableCookieCache: true } })
      router.refresh()
      toast.success(t("errors.common.profilePhotoRemoved"))
    } catch (err) {
      toast.error(
        resolveLocalizedError(err, {
          t,
          fallbackKey: "errors.common.profilePhotoRemoveFailed",
        }),
      )
    } finally {
      setIsAvatarDeleting(false)
    }
  }, [avatarUrl, meQueryOptions.queryKey, queryClient, t, router])

  return {
    form,
    isStudent,
    isBusy,
    serverError,
    successTick,
    resetToInitial,
    avatarUrl,
    isAvatarUploading,
    isAvatarDeleting,
    avatarInputRef,
    handleAvatarUpload,
    handleAvatarDelete,
  }
}
