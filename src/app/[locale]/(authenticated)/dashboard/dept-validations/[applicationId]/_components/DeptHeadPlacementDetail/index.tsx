"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { StudentInfoCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/StudentInfoCard"
import { CompanyOfferCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/CompanyOfferCard"
import { AISummaryPanel } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/AISummaryPanel"
import { ValidationForm } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/ValidationForm"
import { RejectDialog } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/RejectDialog"

import { useDeptHeadPlacementData } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementData"
import { useDeptHeadPlacementActions } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementActions"

export function DeptHeadPlacementDetail({
  applicationId,
}: {
  applicationId: string
}) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const td = useTranslations("dashboard.admin.deptValidations")
  const { application, isLoading } = useDeptHeadPlacementData(applicationId)
  const actions = useDeptHeadPlacementActions(applicationId, {
    expectedStartDate: application?.offer.expectedStartDate,
    expectedEndDate: application?.offer.expectedEndDate,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header — dept_head-specific back link */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/dept-validations" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {td("backToDashboard")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          {application?.student.name && application?.company.name && (
            <p className="text-sm text-muted-foreground font-light">
              {application.student.name} → {application.company.name}
            </p>
          )}
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && !application && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center space-y-2"
        >
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
        </motion.div>
      )}

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

      <AlertDialog
        open={actions.validateModal}
        onOpenChange={actions.setValidateModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              {t("confirmValidate")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("validateAndGenerate")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actions.actionLoading || actions.pdfLoading}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.handleConfirmValidate}
              disabled={actions.actionLoading || actions.pdfLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("validateAndGenerate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
