"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/error-message"

import { InviteMemberForm } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/InviteMemberForm"
import { MembersList } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/components/MembersList"
import { useCompanyTeamData } from "@/app/[locale]/(authenticated)/dashboard/company/team/_components/CompanyTeamView/hooks/useCompanyTeamData"

interface CompanyTeamViewProps {
  currentUserId: string
}

export function CompanyTeamView({ currentUserId }: CompanyTeamViewProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const { members, isLoading, isError, error, inviteMutation, removeMutation } = useCompanyTeamData()

  const currentMember = useMemo(
    () => members.find((member) => member.userId === currentUserId),
    [members, currentUserId],
  )
  const canManageMembers = currentMember?.role === "owner"

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Company Workspace</p>
        <h1 className="font-serif text-3xl tracking-tight text-heading">Team Members</h1>
        <p className="text-sm text-muted-foreground">
          Owners manage team access. Recruiters can work on offers and candidates.
        </p>
      </header>

      {canManageMembers && (
        <InviteMemberForm
          email={email}
          name={name}
          isPending={inviteMutation.isPending}
          onEmailChange={setEmail}
          onNameChange={setName}
          onSubmit={(event) => {
            event.preventDefault()
            void inviteMutation.mutateAsync({ email, name: name.trim() || undefined })
              .then((result) => {
                setEmail("")
                setName("")
                toast.success(
                  result.createdUser
                    ? "Invite sent with password setup email."
                    : "Member added to company successfully.",
                )
              })
              .catch((inviteError) => {
                toast.error(getErrorMessage(inviteError, "Failed to invite member."))
              })
          }}
        />
      )}

      {!isLoading && !isError && !canManageMembers && (
        <div className="border border-border/50 bg-card/20 p-4 text-sm text-muted-foreground">
          Only company owners can invite or remove team members.
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading company members...</p>
      )}

      {isError && (
        <div className="border border-destructive/20 text-destructive p-4 text-sm">
          {getErrorMessage(error, "Failed to load company members.")}
        </div>
      )}

      {!isLoading && !isError && (
        <MembersList
          members={members}
          currentUserId={currentUserId}
          canManageMembers={canManageMembers}
          isRemoving={removeMutation.isPending}
          onRemove={(member) => {
            void removeMutation.mutateAsync({ userId: member.userId })
              .then(() => {
                toast.success("Member removed successfully.")
              })
              .catch((removeError) => {
                toast.error(getErrorMessage(removeError, "Failed to remove member."))
              })
          }}
        />
      )}
    </div>
  )
}
