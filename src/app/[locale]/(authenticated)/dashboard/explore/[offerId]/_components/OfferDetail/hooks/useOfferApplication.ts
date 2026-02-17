"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { orpc } from "@/server/orpc/client"

import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"

export function useOfferApplication(
  offer: OfferDetailProps["offer"],
  existingApp: OfferDetailProps["existingApplication"],
) {
  const t = useTranslations("dashboard.offerDetail")

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [coverLetterDraft, setCoverLetterDraft] = useState<string | null>(null)
  const [application, setApplication] = useState(existingApp)
  const [successMsg, setSuccessMsg] = useState("")

  const applyMutation = useMutation(
    orpc.applications.apply.mutationOptions({
      onSuccess: (data) => {
        setApplication({
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
    offer.closesAt && new Date(offer.closesAt) < new Date()

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
