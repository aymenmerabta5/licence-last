import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) =>
    ({
      agreement: "Agreement",
      certificate: "Certificate",
      download: "Download",
      downloading: "Downloading...",
      "status.pending": "Pending",
      "status.generated": "Generated",
      "status.failed": "Failed",
      "placement.company": "Company",
      "placement.offer": "Offer",
      "placement.type": "Type",
      "placement.startDate": "Start date",
      "placement.endDate": "End date",
      "placement.validatedAt": "Validated on",
      "placement.verificationCode": "Verification code",
      "placement.notAvailable": "Not available",
      "feedback.ctaDescription": "Feedback description",
      "feedback.ctaLabel": "Leave feedback",
    })[key] ?? key,
}))

const { PlacementDocumentCard } = await import(
  "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard"
)

describe("PlacementDocumentCard", () => {
  afterEach(() => {
    cleanup()
  })

  test("disables pending student document downloads with status-aware copy", () => {
    render(
      <PlacementDocumentCard
        placement={{
          placementId: "placement-1",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          companyName: "Acme",
          startDate: "2030-01-01T00:00:00.000Z",
          endDate: "2030-02-01T00:00:00.000Z",
          validatedAt: "2030-01-05T00:00:00.000Z",
          documents: [
            {
              id: "agreement-1",
              type: "agreement",
              status: "pending",
              verificationCode: null,
              createdAt: "2030-01-05T00:00:00.000Z",
            },
          ],
        }}
        downloadingDocumentId={null}
        onDownload={() => {}}
        onOpenFeedback={() => {}}
      />,
    )

    const button = screen.getByRole("button", {
      name: "Pending",
    }) as HTMLButtonElement

    expect(button.disabled).toBe(true)
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull()
  })
})
