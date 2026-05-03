import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

mock.module("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) =>
    ({
      agreement: "Agreement",
      certificate: "Certificate",
      generate: "Generate Certificate",
      generating: "Generating...",
      download: "Download",
      downloading: "Downloading...",
      ownerOnlyGenerate: "Owners issue certificates",
      "status.notGenerated": "Not generated",
      "status.pending": "Pending",
      "status.generated": "Generated",
      "status.failed": "Failed",
      "placement.student": "Student",
      "placement.offer": "Offer",
      "placement.type": "Type",
      "placement.startDate": "Start date",
      "placement.endDate": "End date",
      "placement.validatedAt": "Validated on",
      "placement.verificationCode": "Verification code",
      "placement.notAvailable": "Not available",
    })[key] ?? key,
}))

const { PlacementCertificateCard } = await import(
  "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementCertificateCard"
)

describe("PlacementCertificateCard", () => {
  afterEach(() => {
    cleanup()
  })

  const placement = {
    placementId: "placement-1",
    offerTitle: "Frontend Internship",
    internshipType: "pfe",
    studentName: "Student User",
    studentEmail: "student@example.com",
    startDate: "2030-01-01T00:00:00.000Z",
    endDate: "2030-02-01T00:00:00.000Z",
    validatedAt: "2030-01-05T00:00:00.000Z",
    documents: [
      {
        id: "agreement-1",
        type: "agreement" as const,
        status: "generated" as const,
        locale: "en",
        borderStyle: "classic",
        verificationCode: "INTX-AAAA-BBBB",
        createdAt: "2030-01-05T00:00:00.000Z",
      },
    ],
  }

  test("shows certificate generation controls for owners", () => {
    render(
      <PlacementCertificateCard
        placement={placement}
        companyMembershipRole="owner"
        generatingPlacementId={null}
        downloadingDocumentId={null}
        onDownloadDocument={() => {}}
        onOpenGenerateDialog={() => {}}
      />,
    )

    expect(
      screen.getByRole("button", { name: "Generate Certificate" }),
    ).toBeDefined()
  })

  test("replaces certificate generation with owner-only copy for recruiters", () => {
    render(
      <PlacementCertificateCard
        placement={placement}
        companyMembershipRole="recruiter"
        generatingPlacementId={null}
        downloadingDocumentId={null}
        onDownloadDocument={() => {}}
        onOpenGenerateDialog={() => {}}
      />,
    )

    const button = screen.getByRole("button", {
      name: "Owners issue certificates",
    }) as HTMLButtonElement

    expect(button.disabled).toBe(true)
    expect(
      screen.queryByRole("button", { name: "Generate Certificate" }),
    ).toBeNull()
  })

  test("disables pending document actions with status-aware copy", () => {
    render(
      <PlacementCertificateCard
        placement={{
          ...placement,
          documents: [
            {
              id: "agreement-1",
              type: "agreement",
              status: "pending",
              locale: "en",
              borderStyle: "classic",
              verificationCode: null,
              createdAt: "2030-01-05T00:00:00.000Z",
            },
            {
              id: "certificate-1",
              type: "certificate",
              status: "pending",
              locale: "en",
              borderStyle: "classic",
              verificationCode: null,
              createdAt: "2030-01-05T00:00:00.000Z",
            },
          ],
        }}
        companyMembershipRole="owner"
        generatingPlacementId={null}
        downloadingDocumentId={null}
        onDownloadDocument={() => {}}
        onOpenGenerateDialog={() => {}}
      />,
    )

    const buttons = screen.getAllByRole("button", { name: "Pending" })

    expect(buttons).toHaveLength(2)
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true)
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true)
  })
})
