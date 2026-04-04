import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useTranslations: () =>
    (key: string, values?: { number?: number }) => {
      if (key === "form.applicationLabel") {
        return "Application"
      }
      if (key === "slots.slot") {
        return `Slot ${values?.number ?? ""}`.trim()
      }
      return key
    },
}))

import { CompanyProposeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanyProposeForm"
import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"

const DEFAULT_SLOTS: ProposedSlotDraft[] = [
  {
    id: "slot-1",
    startsAt: "",
    endsAt: "",
    location: "",
    meetingUrl: "",
  },
]

describe("CompanyProposeForm", () => {
  test("does not render a manual application id input", () => {
    render(
      <CompanyProposeForm
        offers={[{ id: "offer-1", title: "Backend Internship" }]}
        applications={[
          {
            id: "app-1",
            studentName: "Alex Student",
            pipelineStage: "interview",
            createdAt: "2026-02-19T10:00:00.000Z",
          },
        ]}
        selectedOfferId="offer-1"
        applicationId=""
        note=""
        slots={DEFAULT_SLOTS}
        canSubmit={false}
        isSubmitting={false}
        isOffersLoading={false}
        isApplicationsLoading={false}
        onOfferChange={mock(() => {})}
        onApplicationIdChange={mock(() => {})}
        onNoteChange={mock(() => {})}
        onSlotChange={mock(() => {})}
        onAddSlot={mock(() => {})}
        onRemoveSlot={mock(() => {})}
        onSubmit={mock(async () => {})}
      />,
    )

    expect(screen.queryByText("Application ID (manual)")).toBeNull()
    expect(screen.queryByPlaceholderText("app_...")).toBeNull()
    expect(screen.getByText("Application")).toBeDefined()
  })
})
