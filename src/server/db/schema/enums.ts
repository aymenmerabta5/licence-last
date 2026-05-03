import { pgEnum } from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "company_admin",
  "dept_head", // DEPRECATED: legacy value kept for PG enum compat, never assigned to new users
  "university_admin",
  "super_admin",
])

export const companyStatusEnum = pgEnum("company_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
])

export const universityDomainStatusEnum = pgEnum("university_domain_status", [
  "pending",
  "approved",
  "rejected",
  "disabled",
])

export const companyMemberRoleEnum = pgEnum("company_member_role", [
  "owner",
  "recruiter",
])

export const universityMemberRoleEnum = pgEnum("university_member_role", [
  "department_head",
])

export const offerStatusEnum = pgEnum("offer_status", [
  "draft",
  "published",
  "closed",
])

export const workModeEnum = pgEnum("work_mode", ["on_site", "hybrid", "remote"])

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "company_accepted",
  "company_refused",
  "admin_validated",
  "admin_rejected",
  "withdrawn",
])

export const applicationPipelineStageEnum = pgEnum(
  "application_pipeline_stage",
  ["applied", "screening", "interview", "offer", "accepted", "validated", "rejected"],
)

export const documentTypeEnum = pgEnum("document_type", [
  "agreement",
  "certificate",
])

export const internshipTypeEnum = pgEnum("internship_type", [
  "pfe",
  "immersion",
  "summer",
  "practical",
])

export const assistantMessageRoleEnum = pgEnum("assistant_message_role", [
  "system",
  "user",
  "assistant",
])

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "generated",
  "failed",
])

export const proficiencyLevelEnum = pgEnum("proficiency_level", [
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
  "native",
])

export const companyReportStatusEnum = pgEnum("company_report_status", [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
])

export const companyReportSeverityEnum = pgEnum("company_report_severity", [
  "low",
  "medium",
  "high",
  "critical",
])

export const universityStatusEnum = pgEnum("university_status", [
  "pending",
  "approved",
  "rejected",
])

export const interviewStatusEnum = pgEnum("interview_status", [
  "pending_confirmation",
  "confirmed",
  "cancelled",
  "completed",
])
