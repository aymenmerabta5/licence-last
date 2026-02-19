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
  const queryOptions = orpc.notifications.getPreferences.queryOptions()

  const preferencesQuery = useQuery({
    ...queryOptions,
    retry: false,
  })

  const updatePreferencesMutation = useMutation(
    orpc.notifications.updatePreferences.mutationOptions({
      onSuccess: async (next) => {
        queryClient.setQueryData(queryOptions.queryKey, next)
      },
    }),
  )

  const showSoonState =
    preferencesQuery.isError && isFeatureDisabledError(preferencesQuery.error)

  const preferences = preferencesQuery.data ?? {
    inAppEnabled: true,
    emailEnabled: true,
  }

  const setPreference = async (
    key: "inAppEnabled" | "emailEnabled",
    value: boolean,
  ) => {
    await updatePreferencesMutation.mutateAsync({ [key]: value })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm pt-0">
        <CardHeader className="relative overflow-hidden px-8 pt-7 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
          <div
            className="absolute inset-y-0 end-8 flex items-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <Bell className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight">
              Notifications
            </CardTitle>
            {showSoonState && (
              <Badge className="bg-secondary/50 text-muted-foreground border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">
                Soon
              </Badge>
            )}
          </div>
          <CardDescription className="font-medium ps-10">
            Fine-tune how and when you receive updates.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-4">
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
