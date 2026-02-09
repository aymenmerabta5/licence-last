import { pgEnum } from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "company_admin",
  "admin",
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

export const offerStatusEnum = pgEnum("offer_status", [
  "draft",
  "published",
  "closed",
])

export const workModeEnum = pgEnum("work_mode", [
  "on_site",
  "hybrid",
  "remote",
])

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "company_accepted",
  "company_refused",
  "admin_validated",
  "admin_rejected",
  "withdrawn",
])

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

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "generated",
  "failed",
])
