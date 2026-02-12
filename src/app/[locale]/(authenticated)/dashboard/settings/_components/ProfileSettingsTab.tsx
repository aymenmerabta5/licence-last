"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Loader2, MapPin, User } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectField, TextAreaField, TextField } from "@/components/form-fields"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { errorMessage } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import { WILAYA_OPTIONS_WITH_PLACEHOLDER } from "@/lib/wilayas"
import { orpc, orpcClient } from "@/server/orpc/client"

import { SkillsManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager"

type MeResult = Awaited<ReturnType<typeof orpcClient.users.getMe>>
type StudentProfileResult = Awaited<ReturnType<typeof orpcClient.students.getProfile>>

interface ProfileSettingsTabProps {
  me: MeResult | undefined
  studentProfile: StudentProfileResult | null | undefined
  isLoading: boolean
}

const studentProfileDetailsSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }).max(120),
  bio: z.string().optional(),
  phone: z.string().optional(),
  githubUrl: z.string().url({ error: "Invalid GitHub URL." }).optional().or(z.literal("")),
  portfolioUrl: z
    .string()
    .url({ error: "Invalid website URL." })
    .optional()
    .or(z.literal("")),
  studentNumber: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  wilayaCode: z.coerce.number().int().min(1).max(58).optional().or(z.literal(0)),
  address: z.string().optional(),
})

export function ProfileSettingsTab({ me, studentProfile, isLoading }: ProfileSettingsTabProps) {
  if (isLoading || !me) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="bg-secondary/10 px-8 py-10 border-b border-border/20">
            <CardTitle className="font-serif text-2xl">Profile Identity</CardTitle>
            <CardDescription className="font-medium">
              Loading your settings...
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-3">
              <div className="h-4 w-2/3 bg-secondary/30 rounded" />
              <div className="h-4 w-1/2 bg-secondary/30 rounded" />
              <div className="h-4 w-3/5 bg-secondary/30 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProfileSettingsTabForm
      me={me}
      studentProfile={studentProfile ?? null}
    />
  )
}

interface ProfileSettingsTabFormProps {
  me: MeResult
  studentProfile: StudentProfileResult | null
}

function ProfileSettingsTabForm({ me, studentProfile }: ProfileSettingsTabFormProps) {
  const queryClient = useQueryClient()

  const meQueryOptions = useMemo(() => orpc.users.getMe.queryOptions(), [])
  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )

  const [serverError, setServerError] = useState("")
  const [successTick, setSuccessTick] = useState(0)

  const updateMeMutation = useMutation(
    orpc.users.updateMe.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey })
      },
    }),
  )

  const upsertDetailsMutation = useMutation(
    orpc.students.upsertProfileDetails.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey })
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
      onSubmit: ({ value }) => mapZodErrors(studentProfileDetailsSchema.safeParse(value)),
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-secondary/10 px-8 py-10 relative overflow-hidden border-b border-border/20">
          <div
            className="absolute inset-y-0 end-6 flex items-center opacity-[0.06] pointer-events-none"
            aria-hidden="true"
          >
            <User className="h-44 w-44" />
          </div>
          <CardTitle className="font-serif text-2xl">Profile Identity</CardTitle>
          <CardDescription className="font-medium">
            Information that will be visible to companies and administrators
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <ServerError message={serverError} />
          <SuccessMessage message={successTick > 0 ? "Saved." : ""} />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-8"
          >
            <form.Subscribe selector={(state) => [state.values.name] as const}>
              {([name]) => {
                const avatarInitial = (name.trim().charAt(0) || "A").toUpperCase()

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                    <div className="relative group">
                      <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-serif font-bold transition-all group-hover:bg-primary/20">
                        {avatarInitial}
                      </div>
                      <button
                        type="button"
                        disabled
                        className="absolute -bottom-2 -end-2 h-10 w-10 rounded-2xl bg-background border border-border shadow-lg flex items-center justify-center opacity-60 cursor-not-allowed dark:bg-card"
                        aria-label="Profile photo upload coming soon"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm">Profile Picture</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Uploads are coming soon. For now, your avatar is generated from your name.
                      </p>
                    </div>
                  </div>
                )
              }}
            </form.Subscribe>

            <div className="h-px bg-border/20 w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.Field name="name">
                {(field) => (
                  <TextField
                    id="settings-full-name"
                    label="Full Name"
                    icon={User}
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    error={
                      field.state.meta.errors.length > 0
                        ? errorMessage(field.state.meta.errors[0])
                        : undefined
                    }
                    disabled={isBusy}
                    autoComplete="name"
                  />
                )}
              </form.Field>

              <TextField
                id="settings-email"
                label="Email"
                icon={User}
                value={me?.user.email ?? ""}
                onChange={() => {}}
                disabled
              />
            </div>

            {isStudent && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form.Field name="department">
                    {(field) => (
                      <TextField
                        id="settings-department"
                        label="Department"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        disabled={isBusy}
                      />
                    )}
                  </form.Field>

                  <form.Field name="level">
                    {(field) => (
                      <TextField
                        id="settings-level"
                        label="Level"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        disabled={isBusy}
                      />
                    )}
                  </form.Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form.Field name="wilayaCode">
                    {(field) => (
                      <SelectField
                        id="settings-wilaya"
                        label="Wilaya"
                        icon={MapPin}
                        value={field.state.value}
                        onChange={(next) => field.handleChange(Number(next))}
                        onBlur={field.handleBlur}
                        disabled={isBusy}
                        options={WILAYA_OPTIONS_WITH_PLACEHOLDER}
                      />
                    )}
                  </form.Field>

                  <form.Field name="address">
                    {(field) => (
                      <TextField
                        id="settings-address"
                        label="Address"
                        icon={MapPin}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        disabled={isBusy}
                      />
                    )}
                  </form.Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form.Field name="githubUrl">
                    {(field) => (
                      <TextField
                        id="settings-github-url"
                        label="GitHub URL"
                        type="url"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        error={
                          field.state.meta.errors.length > 0
                            ? errorMessage(field.state.meta.errors[0])
                            : undefined
                        }
                        disabled={isBusy}
                      />
                    )}
                  </form.Field>

                  <form.Field name="portfolioUrl">
                    {(field) => (
                      <TextField
                        id="settings-portfolio-url"
                        label="Portfolio / LinkedIn URL"
                        type="url"
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        error={
                          field.state.meta.errors.length > 0
                            ? errorMessage(field.state.meta.errors[0])
                            : undefined
                        }
                        disabled={isBusy}
                      />
                    )}
                  </form.Field>
                </div>

                <form.Field name="bio">
                  {(field) => (
                    <TextAreaField
                      id="settings-bio"
                      label="Professional Narrative (Bio)"
                      value={field.state.value}
                      onChange={field.handleChange}
                      onBlur={field.handleBlur}
                      rows={5}
                      className="min-h-[140px]"
                    />
                  )}
                </form.Field>

                <div className="h-px bg-border/20 w-full" />
                <SkillsManager />
              </>
            )}

            <div className="pt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="editorial-outline"
                className="rounded-xl h-12 px-8 bg-background border-border/40"
                onClick={resetToInitial}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
                {([isSubmitting]) => (
                  <Button
                    type="submit"
                    variant="editorial"
                    className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20"
                    disabled={isBusy || isSubmitting}
                    aria-label="Save profile changes"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
