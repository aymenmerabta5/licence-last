"use client"

import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { CompanyTeamHeader } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/CompanyTeamHeader"
import { InviteMemberForm } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/InviteMemberForm"
import type { MemberItem } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/MembersList"
import { MembersList } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/MembersList"
import { RemoveMemberDialog } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/RemoveMemberDialog"
import { useCompanyTeamData } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/hooks/useCompanyTeamData"
import { resolveLocalizedError } from "@/lib/error-message"

interface CompanyTeamViewProps {
  currentUserId: string
}

export function CompanyTeamView({ currentUserId }: CompanyTeamViewProps) {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [memberToRemove, setMemberToRemove] = useState<MemberItem | null>(null)
  const { members, isLoading, isError, error, inviteMutation, removeMutation } =
    useCompanyTeamData()

  const currentMember = useMemo(
    () => members.find((member) => member.userId === currentUserId),
    [members, currentUserId],
  )
  const canManageMembers = currentMember?.role === "owner"

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
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
        <div className="border border-border/50 bg-card/20 p-4 text-sm text-muted-foreground">
          {t("dashboard.company.team.ownerOnlyNotice")}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("dashboard.company.team.loading")}
        </p>
      )}

      {isError && (
        <div className="border border-destructive/20 text-destructive p-4 text-sm">
          {resolveLocalizedError(error, {
            t,
            fallbackKey: "errors.common.companyMembersLoadFailed",
          })}
        </div>
      )}

      {!isLoading && !isError && (
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
              void removeMutation
                .mutateAsync({ userId: member.userId })
                .then(() => {
                  setMemberToRemove(null)
                  toast.success(t("errors.common.companyMemberRemoved"))
                })
                .catch((removeError) => {
                  toast.error(
                    resolveLocalizedError(removeError, {
                      t,
                      fallbackKey: "errors.common.companyMemberRemoveFailed",
                    }),
                  )
                })
            }}
          />
        </>
      )}
    </div>
  )
}
