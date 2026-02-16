import "server-only"

import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { eq, and } from "drizzle-orm"

import { db } from "@/server/db"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { studentProfile } from "@/server/db/schema/students"
import { university } from "@/server/db/schema/universities"
import {
  ConventionDeStageTemplate,
  type AgreementData,
} from "@/server/pdfs/AgreementTemplate"
import { generateVerificationCode } from "./verification-code"
import { generateQRCodeDataUrl } from "./qr-utils"
import { env } from "@/env"

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

  const [placementRecord] = await db
    .select()
    .from(placement)
    .where(eq(placement.id, placementId))
    .limit(1)

  if (!placementRecord) {
    throw new Error("Placement not found")
  }

  const [row] = await db
    .select({
      applicationId: application.id,

      offerTitle: internshipOffer.title,
      internshipType: internshipOffer.internshipType,
      workMode: internshipOffer.workMode,
      durationWeeks: internshipOffer.durationWeeks,

      companyName: company.name,
      companyAddress: company.address,
      companyPhone: company.phone,
      companyRepresentativeName: company.representativeName,
      companyContactEmail: company.contactEmail,

      studentName: user.name,
      studentEmail: user.email,
      studentUniversityId: user.universityId,

      studentPhone: studentProfile.phone,
      studentNumber: studentProfile.studentNumber,
      studentDepartment: studentProfile.department,
      studentAddress: studentProfile.address,

      universityName: university.name,
      universityDepartmentName: university.departmentName,
      universityAddress: university.address,
      universityPhone: university.phone,
    })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .innerJoin(company, eq(internshipOffer.companyId, company.id))
    .innerJoin(user, eq(application.studentUserId, user.id))
    .leftJoin(studentProfile, eq(user.id, studentProfile.userId))
    .leftJoin(university, eq(user.universityId, university.id))
    .where(eq(application.id, placementRecord.applicationId))
    .limit(1)

  if (!row) {
    throw new Error("Application not found")
  }

  // Check for existing document to preserve verification code on regeneration
  const [existingDoc] = await db
    .select()
    .from(placementDocument)
    .where(
      and(
        eq(placementDocument.placementId, placementId),
        eq(placementDocument.type, "agreement"),
      ),
    )
    .limit(1)

  const verificationCode = existingDoc?.verificationCode ?? generateVerificationCode()
  const verificationUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/${locale}/verify/${verificationCode}`
  const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl)

  const data: AgreementData = {
    // Student info
    studentName: row.studentName ?? "Unknown",
    studentEmail: row.studentEmail,
    studentPhone: row.studentPhone ?? null,
    studentNumber: row.studentNumber ?? null,
    studentDepartment: row.studentDepartment ?? null,
    studentAddress: row.studentAddress ?? null,

    // Company info
    companyName: row.companyName,
    companyAddress: row.companyAddress ?? null,
    companyPhone: row.companyPhone ?? null,
    companyRepresentativeName: row.companyRepresentativeName ?? null,
    companyContactEmail: row.companyContactEmail ?? null,

    // University info
    universityName: row.universityName ?? null,
    universityDepartmentName: row.universityDepartmentName ?? null,
    universityAddress: row.universityAddress ?? null,
    universityPhone: row.universityPhone ?? null,

    // Placement info
    offerTitle: row.offerTitle,
    internshipType: row.internshipType,
    startDate: placementRecord.startDate,
    endDate: placementRecord.endDate,
    workMode: row.workMode ?? null,
    durationWeeks: row.durationWeeks ?? null,
  }

  const pdfBuffer = await renderToBuffer(
    createElement(ConventionDeStageTemplate, {
      data,
      locale,
      verificationCode,
      qrCodeDataUrl,
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  )

  let documentRecord = existingDoc

  if (!documentRecord) {
    const [newDoc] = await db
      .insert(placementDocument)
      .values({
        id: crypto.randomUUID(),
        placementId,
        type: "agreement",
        status: "generated",
        verificationCode,
        meta: {
          generatedAt: new Date().toISOString(),
          locale,
          fileName: `agreement_${placementId}.pdf`,
          applicationId: row.applicationId,
          studentUniversityId: row.studentUniversityId,
        },
      })
      .returning()
    documentRecord = newDoc
  } else {
    await db
      .update(placementDocument)
      .set({
        status: "generated",
        verificationCode,
        meta: {
          generatedAt: new Date().toISOString(),
          locale,
          fileName: `agreement_${placementId}.pdf`,
          applicationId: row.applicationId,
          studentUniversityId: row.studentUniversityId,
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
