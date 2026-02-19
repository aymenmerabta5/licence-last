"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { orpc } from "@/server/orpc/client"

export function useOfferApplication(
  offer: OfferDetailProps["offer"],
  existingApp: OfferDetailProps["existingApplication"],
) {
  const t = useTranslations("dashboard.offerDetail")

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [coverLetterDraft, setCoverLetterDraft] = useState<string | null>(null)
  const [localApplication, setLocalApplication] =
    useState<OfferDetailProps["existingApplication"]>(null)
  const [successMsg, setSuccessMsg] = useState("")

  const checkApplicationQuery = useQuery({
    ...orpc.applications.checkApplication.queryOptions({
      input: { offerId: offer.id },
    }),
    enabled: existingApp === null,
  })

  const application =
    localApplication ?? existingApp ?? checkApplicationQuery.data ?? null

  const applyMutation = useMutation(
    orpc.applications.apply.mutationOptions({
      onSuccess: (data) => {
        setLocalApplication({
          id: data.applicationId,
          status: "applied",
          createdAt: new Date(),
        })
        setShowApplyForm(false)
        setSuccessMsg(t("applicationSuccess"))
      },
    }),
  )

  const draftMutation = useMutation(
    orpc.applications.generateCoverLetter.mutationOptions({
      onSuccess: (data) => {
        setCoverLetterDraft(data.coverLetter)
      },
    }),
  )

  const isOfferClosed =
    offer.status !== "published" ||
    (offer.applicationDeadlineAt &&
      new Date(offer.applicationDeadlineAt) < new Date())

  function draftCoverLetter() {
    setCoverLetterDraft(null)
    draftMutation.mutate({
      offerTitle: offer.title,
      offerDescription: offer.description,
      internshipType: offer.internshipType,
      workMode: offer.workMode,
      skills: offer.skills.map((s) => s.name),
      companyName: offer.companyName,
      companyDescription: offer.companyDescription,
      currentCoverLetter: coverLetter || null,
    })
  }

  return {
    showApplyForm,
    setShowApplyForm,
    coverLetter,
    setCoverLetter,
    coverLetterDraft,
    setCoverLetterDraft,
    application,
    successMsg,
    isOfferClosed,
    applyMutation,
    isDrafting: draftMutation.isPending,
    draftError: draftMutation.error,
    draftCoverLetter,
  }
}
