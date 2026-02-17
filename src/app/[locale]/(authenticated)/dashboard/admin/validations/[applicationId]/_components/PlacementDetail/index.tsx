"use client"

import { usePlacementData } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementData"
import { usePlacementActions } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementActions"
import { PlacementHeader } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/PlacementHeader"
import { StudentInfoCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/StudentInfoCard"
import { CompanyOfferCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/CompanyOfferCard"
import { AISummaryPanel } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/AISummaryPanel"
import { ValidationForm } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/ValidationForm"
import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/RejectDialog"

export function PlacementDetailClient({
  applicationId,
}: {
  applicationId: string
}) {
  const { application, isLoading } = usePlacementData(applicationId)
  const actions = usePlacementActions(applicationId, {
    expectedStartDate: application?.offer.expectedStartDate,
    expectedEndDate: application?.offer.expectedEndDate,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PlacementHeader
        isLoading={isLoading}
        hasApplication={!!application}
        studentName={application?.student.name}
        companyName={application?.company.name}
      />

      {application && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentInfoCard application={application} />
          <CompanyOfferCard application={application} />

          <AISummaryPanel
            aiSummary={actions.aiSummary}
            isSummarizing={actions.isSummarizing}
            summaryError={actions.summaryError}
            onGenerate={() => {
              actions.generateAiSummary({
                id: application.id,
                createdAt: application.createdAt,
                companyActionAt: application.companyActionAt,
                coverLetter: application.coverLetter,
                student: { name: application.student?.name ?? null },
                profile: {
                  level: application.profile?.level ?? null,
                  department: application.profile?.department ?? null,
                },
                university: application.university
                  ? {
                      name: application.university.name ?? null,
                      abbreviation:
                        application.university.abbreviation ?? null,
                    }
                  : null,
                offer: {
                  title: application.offer?.title ?? null,
                  internshipType:
                    application.offer?.internshipType ?? null,
                  workMode: application.offer?.workMode ?? null,
                  wilayaCode: application.offer?.wilayaCode ?? null,
                  durationWeeks:
                    application.offer?.durationWeeks ?? null,
                },
                company: { name: application.company?.name ?? null },
                skills: application.skills.map((s) => ({
                  id: s.id,
                  name: s.name,
                  category: s.category ?? null,
                })),
              })
            }}
          />

          <ValidationForm
            startDate={actions.startDate}
            onStartDateChange={actions.setStartDate}
            endDate={actions.endDate}
            onEndDateChange={actions.setEndDate}
            expectedStartDate={actions.expectedStartDate}
            expectedEndDate={actions.expectedEndDate}
            showOutOfRangeWarning={actions.showOutOfRangeWarning}
            actionLoading={actions.actionLoading}
            pdfLoading={actions.pdfLoading}
            onValidate={actions.handleValidate}
            onOpenReject={() => actions.setRejectModal(true)}
          />
        </div>
      )}

      {actions.rejectModal && (
        <RejectDialog
          studentName={application?.student.name || "Student"}
          rejectReason={actions.rejectReason}
          onRejectReasonChange={actions.setRejectReason}
          actionLoading={actions.actionLoading}
          onConfirm={actions.handleReject}
          onClose={() => {
            actions.setRejectModal(false)
            actions.setRejectReason("")
          }}
        />
      )}
    </div>
  )
}
