"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { isNotificationPreferencesEnabledOnClient } from "@/lib/feature-flags-client"
import { cn } from "@/lib/utils"
import { orpc } from "@/server/orpc/client"

interface NotificationsTabProps {
  email: string
}

function isFeatureDisabledError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.toLowerCase().includes("disabled")
  )
}

export function NotificationsTab({ email }: NotificationsTabProps) {
  const queryClient = useQueryClient()
  const notificationPreferencesEnabled =
    isNotificationPreferencesEnabledOnClient()
  const queryOptions = orpc.notifications.getPreferences.queryOptions()

  const preferencesQuery = useQuery({
    ...queryOptions,
    retry: false,
    enabled: notificationPreferencesEnabled,
  })

  const updatePreferencesMutation = useMutation(
    orpc.notifications.updatePreferences.mutationOptions({
      onSuccess: async (next) => {
        queryClient.setQueryData(queryOptions.queryKey, next)
      },
    }),
  )

  const showSoonState =
    !notificationPreferencesEnabled ||
    (preferencesQuery.isError && isFeatureDisabledError(preferencesQuery.error))

  const preferences = preferencesQuery.data ?? {
    inAppEnabled: true,
    emailEnabled: true,
  }

  const setPreference = async (
    key: "inAppEnabled" | "emailEnabled",
    value: boolean,
  ) => {
    if (!notificationPreferencesEnabled) return
    await updatePreferencesMutation.mutateAsync({ [key]: value })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <Card className="border-border/60 bg-background/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-sm shadow-black/5 ring-1 ring-border/10">
        <CardHeader className="relative overflow-hidden px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 border-b border-border/20 bg-gradient-to-b from-secondary/40 via-secondary/10 to-transparent">
          <div
            className="absolute -top-12 -right-8 flex items-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none scale-[2] rotate-12"
            aria-hidden="true"
          >
            <Bell className="h-64 w-64 text-primary" />
          </div>

          <div className="relative z-10 flex items-center gap-4 mb-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
              <Bell className="h-6 w-6" />
            </span>
            <div className="flex items-center gap-3">
              <CardTitle className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">
                Alerts & Comms
              </CardTitle>
              {showSoonState && (
                <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-sm">
                  Soon
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="relative z-10 text-base font-medium text-muted-foreground/80 sm:ps-16 max-w-xl">
            Configure the systemic delivery of information. Decide what requires
            your immediate attention.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 sm:p-12 space-y-6 bg-gradient-to-b from-transparent to-secondary/[0.02]">
          {showSoonState ? (
            <div className="flex items-start gap-3.5 rounded-2xl bg-secondary/10 border border-border/15 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 mt-0.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Email notifications are active
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Important updates such as application status changes and new
                  messages are delivered to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Granular notification preferences will be available soon.
                </p>
              </div>
            </div>
          ) : (
            <>
              <label
                className={cn(
                  "flex items-start gap-3.5 rounded-2xl border border-border/20 p-4",
                  updatePreferencesMutation.isPending && "opacity-70",
                )}
              >
                <Checkbox
                  checked={preferences.inAppEnabled}
                  onCheckedChange={(checked) =>
                    setPreference("inAppEnabled", checked === true)
                  }
                  aria-label="Toggle in-app notifications"
                  disabled={updatePreferencesMutation.isPending}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">In-app notifications</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Show notification cards inside the dashboard for
                    application, interview, and message updates.
                  </p>
                </div>
              </label>

              <label
                className={cn(
                  "flex items-start gap-3.5 rounded-2xl border border-border/20 p-4",
                  updatePreferencesMutation.isPending && "opacity-70",
                )}
              >
                <Checkbox
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreference("emailEnabled", checked === true)
                  }
                  aria-label="Toggle email notifications"
                  disabled={updatePreferencesMutation.isPending}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Send updates and reminders to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    .
                  </p>
                </div>
              </label>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
