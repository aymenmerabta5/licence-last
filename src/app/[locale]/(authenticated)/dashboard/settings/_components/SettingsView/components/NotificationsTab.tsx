"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Mail } from "lucide-react"
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
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
        <div className="flex items-center gap-2.5">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg text-heading">
            Alerts & Communications
          </h2>
        </div>
        {showSoonState && (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] border border-primary/30 bg-primary/10 text-primary">
            Soon
          </span>
        )}
      </div>

      <div className="px-6 py-4 border-b border-border/20">
        <p className="text-sm font-light text-muted-foreground">
          Configure the delivery of notifications. Decide what requires your
          immediate attention.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {showSoonState ? (
          <div className="flex items-start gap-3 border border-border/40 bg-muted/10 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-heading">
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
                "flex items-start gap-3 border border-border/40 p-4 cursor-pointer hover:bg-primary/[0.02] transition-colors",
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
                <p className="text-sm font-medium text-heading">
                  In-app notifications
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Show notification cards inside the dashboard for application,
                  interview, and message updates.
                </p>
              </div>
            </label>

            <label
              className={cn(
                "flex items-start gap-3 border border-border/40 p-4 cursor-pointer hover:bg-primary/[0.02] transition-colors",
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
                <p className="text-sm font-medium text-heading">
                  Email notifications
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Send updates and reminders to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>
            </label>
          </>
        )}
      </div>
    </div>
  )
}
