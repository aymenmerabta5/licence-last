"use client"

import { Loader2, RefreshCw, Users } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CompanyTeamHeader } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/CompanyTeamHeader"
import { InviteMemberForm } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/InviteMemberForm"
import type { MemberItem } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/MembersList"
import { MembersList } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/MembersList"
import { RemoveMemberDialog } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/RemoveMemberDialog"
import { useCompanyTeamData } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/hooks/useCompanyTeamData"
import { Button } from "@/components/ui/button"
import { resolveLocalizedError } from "@/lib/error-message"
import { reveal, revealWithDelay } from "@/lib/animations"

interface CompanyTeamViewProps {
  currentUserId: string
}

export function CompanyTeamView({ currentUserId }: CompanyTeamViewProps) {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [memberToRemove, setMemberToRemove] = useState<MemberItem | null>(null)
  const {
    members,
    isLoading,
    isError,
    error,
    inviteMutation,
    removeMutation,
    refetch,
  } = useCompanyTeamData()

  const currentMember = useMemo(
    () => members.find((member) => member.userId === currentUserId),
    [members, currentUserId],
  )
  const canManageMembers = currentMember?.role === "owner"

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <CompanyTeamHeader />

      {canManageMembers && (
        <InviteMemberForm
          email={email}
          name={name}
          isPending={inviteMutation.isPending}
          onEmailChange={setEmail}
          onNameChange={setName}
          onSubmit={(event) => {
            event.preventDefault()
            void inviteMutation
              .mutateAsync({ email, name: name.trim() || undefined })
              .then((result) => {
                setEmail("")
                setName("")
                toast.success(
                  result.createdUser
                    ? t("errors.common.companyInviteSent")
                    : t("errors.common.companyMemberAdded"),
                )
              })
              .catch((inviteError) => {
                toast.error(
                  resolveLocalizedError(inviteError, {
                    t,
                    fallbackKey: "errors.common.companyInviteFailed",
                  }),
                )
              })
          }}
        />
      )}

      {!isLoading && !isError && !canManageMembers && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="border border-border/50 bg-card/20 p-4 text-sm text-muted-foreground"
        >
          {t("dashboard.company.team.ownerOnlyNotice")}
        </motion.div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
            {t("dashboard.company.team.loading")}
          </span>
        </div>
      )}

      {isError && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            {resolveLocalizedError(error, {
              t,
              fallbackKey: "errors.common.companyMembersLoadFailed",
            })}
          </p>
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="gap-1.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("dashboard.error.retry", { defaultMessage: "Try again" })}
          </Button>
        </motion.div>
      )}

      {!isLoading && !isError && members.length === 0 && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="border border-dashed border-border/60 p-12 text-center space-y-4"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
            <Users className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-lg text-heading">
              {t("dashboard.company.team.empty")}
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <>
          <MembersList
            members={members}
            currentUserId={currentUserId}
            canManageMembers={canManageMembers}
            isRemoving={removeMutation.isPending}
            onRemove={setMemberToRemove}
          />
          <RemoveMemberDialog
            member={memberToRemove}
            open={memberToRemove !== null}
            isPending={removeMutation.isPending}
            onOpenChange={(open) => {
              if (!open) {
                setMemberToRemove(null)
              }
            }}
            onConfirm={(member) => {
              setMemberToRemove(null)
              removeMutation.mutate(
                { userId: member.userId },
                {
                  onSuccess: () => {
                    toast.success(t("errors.common.companyMemberRemoved"))
                  },
                  onError: (removeError) => {
                    toast.error(
                      resolveLocalizedError(removeError, {
                        t,
                        fallbackKey: "errors.common.companyMemberRemoveFailed",
                      }),
                    )
                  },
                },
              )
            }}
          />
        </>
      )}
    </div>
  )
}
