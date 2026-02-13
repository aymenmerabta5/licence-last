"use client"

import { useMemo, useRef, useState } from "react"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import {
  asRecord,
  findLatestToolOutput,
  getStringProp,
} from "@/lib/ai/tool-output"
import { orpc } from "@/server/orpc/client"

import type { OfferDetailProps } from "../types"

export function useOfferApplication(offer: OfferDetailProps["offer"], existingApp: OfferDetailProps["existingApplication"]) {
  const t = useTranslations("dashboard.offerDetail")

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [coverLetterDraft, setCoverLetterDraft] = useState<string | null>(null)
  const [application, setApplication] = useState(existingApp)
  const [successMsg, setSuccessMsg] = useState("")

  const aiActiveRef = useRef(false)

  const aiTransport = useMemo(
    () => new DefaultChatTransport({ api: "/api/assistant/chat" }),
    [],
  )

  const {
    status: aiStatus,
    error: aiError,
    sendMessage: sendAiMessage,
    setMessages: setAiMessages,
  } = useChat({
    transport: aiTransport,
    onFinish: ({ messages }) => {
      if (!aiActiveRef.current) return
      aiActiveRef.current = false

      const out = asRecord(
        findLatestToolOutput(messages, "student_cover_letter_draft"),
      )
      const letter = getStringProp(out, "coverLetter")
      if (!letter) return

      setCoverLetterDraft(letter)
    },
  })

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

  const isOfferClosed =
    offer.closesAt && new Date(offer.closesAt) < new Date()

  function draftCoverLetter() {
    aiActiveRef.current = true
    setCoverLetterDraft(null)
    setAiMessages([])

    const context = {
      intent: "student_cover_letter_draft",
      offer: {
        title: offer.title,
        description: offer.description,
        internshipType: offer.internshipType,
        workMode: offer.workMode,
        wilayaCode: offer.wilayaCode,
        durationWeeks: offer.durationWeeks,
        skills: offer.skills.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category ?? null,
        })),
      },
      company: {
        name: offer.companyName,
        description: offer.companyDescription,
        address: offer.companyAddress,
      },
      currentCoverLetter: coverLetter || null,
    }

    void sendAiMessage(
      { text: t("copilot.prompts.draftCoverLetter") },
      { body: { context } },
    )
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
    aiStatus,
    aiError,
    draftCoverLetter,
  }
}
