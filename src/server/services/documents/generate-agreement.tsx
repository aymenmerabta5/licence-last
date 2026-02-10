import "server-only"

import { renderToBuffer } from "@react-pdf/renderer"

import { db } from "@/server/db"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { university } from "@/server/db/schema/universities"
import { studentProfile } from "@/server/db/schema/students"
import { eq } from "drizzle-orm"
import {
  ConventionDeStageTemplate,
  type AgreementData,
} from "./templates/agreement"

export interface GenerateAgreementInput {
  placementId: string
  locale?: string
}

export interface GenerateAgreementResult {
  success: boolean
  documentId: string
  buffer?: Buffer
}

export async function generateAgreement(
  input: GenerateAgreementInput,
): Promise<GenerateAgreementResult> {
  const { placementId, locale = "en" } = input

  // Get placement with all related data
  const [placementRecord] = await db
    .select()
    .from(placement)
    .where(eq(placement.id, placementId))
    .limit(1)

  if (!placementRecord) {
    throw new Error("Placement not found")
  }

  // Get application with related data
  const [app] = await db
    .select({
      applicationId: application.id,
      offerId: application.offerId,
      studentUserId: application.studentUserId,
      offerTitle: internshipOffer.title,
      offerInternshipType: internshipOffer.internshipType,
      offerWorkMode: internshipOffer.workMode,
      offerDurationWeeks: internshipOffer.durationWeeks,
      companyId: internshipOffer.companyId,
      companyName: company.name,
      companyAddress: company.address,
      companyPhone: company.phone,
      companyRepresentativeName: company.representativeName,
      companyContactEmail: company.contactEmail,
      studentName: user.name,
      studentEmail: user.email,
      studentUniversityId: user.universityId,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .where(eq(application.id, placementRecord.applicationId))
    .limit(1)

  if (!app) {
    throw new Error("Application not found")
  }

  // Get student profile
  const [profile] = await db
    .select({
      phone: studentProfile.phone,
      studentNumber: studentProfile.studentNumber,
      department: studentProfile.department,
      address: studentProfile.address,
    })
    .from(studentProfile)
    .where(eq(studentProfile.userId, app.studentUserId))
    .limit(1)

  // Get university
  let uni = null
  if (app.studentUniversityId) {
    const [universityRecord] = await db
      .select({
        name: university.name,
        departmentName: university.departmentName,
        deanName: university.deanName,
        address: university.address,
        phone: university.phone,
      })
      .from(university)
      .where(eq(university.id, app.studentUniversityId))
      .limit(1)
    uni = universityRecord
  }

  // Prepare agreement data
  const agreementData: AgreementData = {
    studentName: app.studentName ?? "Unknown",
    studentEmail: app.studentEmail,
    studentPhone: profile?.phone ?? null,
    studentNumber: profile?.studentNumber ?? null,
    studentDepartment: profile?.department ?? null,
    studentAddress: profile?.address ?? null,
    companyName: app.companyName,
    companyAddress: app.companyAddress,
    companyPhone: app.companyPhone,
    companyRepresentativeName: app.companyRepresentativeName,
    companyContactEmail: app.companyContactEmail,
    universityName: uni?.name ?? null,
    universityDepartmentName: uni?.departmentName ?? null,
    universityDeanName: uni?.deanName ?? null,
    universityAddress: uni?.address ?? null,
    universityPhone: uni?.phone ?? null,
    offerTitle: app.offerTitle,
    internshipType: app.offerInternshipType,
    startDate: placementRecord.startDate,
    endDate: placementRecord.endDate,
    workMode: app.offerWorkMode,
    durationWeeks: app.offerDurationWeeks,
  }

  // Generate PDF
  const pdfBuffer = await renderToBuffer(
    <ConventionDeStageTemplate data={agreementData} locale={locale} />,
  )

  // Get or create document record
  let [documentRecord] = await db
    .select()
    .from(placementDocument)
    .where(eq(placementDocument.placementId, placementId))
    .limit(1)

  if (!documentRecord) {
    const [newDoc] = await db
      .insert(placementDocument)
      .values({
        id: crypto.randomUUID(),
        placementId,
        type: "agreement",
        status: "generated",
        meta: {
          generatedAt: new Date().toISOString(),
          locale,
          fileName: `convention_${placementId}.pdf`,
        },
      })
      .returning()
    documentRecord = newDoc
  } else {
    await db
      .update(placementDocument)
      .set({
        status: "generated",
        meta: {
          generatedAt: new Date().toISOString(),
          locale,
          fileName: `convention_${placementId}.pdf`,
        },
      })
      .where(eq(placementDocument.id, documentRecord.id))
  }

  return {
    success: true,
    documentId: documentRecord.id,
    buffer: Buffer.from(pdfBuffer),
  }
}
