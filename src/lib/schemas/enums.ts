import { z } from "zod"
import {
  internshipTypeEnum,
  workModeEnum,
  applicationStatusEnum,
  applicationPipelineStageEnum,
  userRoleEnum,
  companyStatusEnum,
  companyReportStatusEnum,
  companyReportSeverityEnum,
  offerStatusEnum,
  proficiencyLevelEnum,
} from "@/server/db/schema/enums"

export const internshipTypeSchema = z.enum(internshipTypeEnum.enumValues)
export type InternshipType = z.infer<typeof internshipTypeSchema>

export const workModeSchema = z.enum(workModeEnum.enumValues)
export type WorkMode = z.infer<typeof workModeSchema>

export const applicationStatusSchema = z.enum(applicationStatusEnum.enumValues)
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>

export const pipelineStageSchema = z.enum(applicationPipelineStageEnum.enumValues)
export type PipelineStage = z.infer<typeof pipelineStageSchema>

export const userRoleSchema = z.enum(userRoleEnum.enumValues)
export type UserRole = z.infer<typeof userRoleSchema>

export const companyStatusSchema = z.enum(companyStatusEnum.enumValues)
export type CompanyStatus = z.infer<typeof companyStatusSchema>

export const companyReportStatusSchema = z.enum(companyReportStatusEnum.enumValues)
export type CompanyReportStatus = z.infer<typeof companyReportStatusSchema>

export const companyReportSeveritySchema = z.enum(companyReportSeverityEnum.enumValues)
export type CompanyReportSeverity = z.infer<typeof companyReportSeveritySchema>

export const offerStatusSchema = z.enum(offerStatusEnum.enumValues)
export type OfferStatus = z.infer<typeof offerStatusSchema>

export const proficiencyLevelSchema = z.enum(proficiencyLevelEnum.enumValues)
export type ProficiencyLevel = z.infer<typeof proficiencyLevelSchema>

export function isInternshipType(value: string): value is InternshipType {
  return internshipTypeSchema.safeParse(value).success
}

export function isWorkMode(value: string): value is WorkMode {
  return workModeSchema.safeParse(value).success
}
