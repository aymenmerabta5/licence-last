"use client"

import { usePlacementData } from "./hooks/usePlacementData"
import { usePlacementActions } from "./hooks/usePlacementActions"
import { PlacementHeader } from "./components/PlacementHeader"
import { StudentInfoCard } from "./components/StudentInfoCard"
import { CompanyOfferCard } from "./components/CompanyOfferCard"
import { AISummaryPanel } from "./components/AISummaryPanel"
import { ValidationForm } from "./components/ValidationForm"
import { RejectDialog } from "./components/RejectDialog"

export function PlacementDetailClient({
  applicationId,
}: {
  applicationId: string
}) {
  const { application, isLoading } = usePlacementData(applicationId)
  const actions = usePlacementActions(applicationId)

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
            aiStatus={actions.aiStatus}
            aiError={actions.aiError}
            aiActiveRef={actions.aiActiveRef}
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
