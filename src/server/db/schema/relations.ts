import { relations } from "drizzle-orm"

import { user } from "./auth"
import { university, universityDomain } from "./universities"
import { company, companyMember } from "./companies"
import { studentProfile, studentSkill } from "./students"
import { skillTag } from "./skills"
import { internshipOffer, internshipOfferSkill } from "./internships"
import { application } from "./applications"
import { placement, placementDocument } from "./placements"
import { notification } from "./notifications"

// ── Auth ──────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  university: one(university, {
    fields: [user.universityId],
    references: [university.id],
  }),
  studentProfile: one(studentProfile, {
    fields: [user.id],
    references: [studentProfile.userId],
  }),
  studentSkills: many(studentSkill),
  companyMemberships: many(companyMember),
  applications: many(application),
  notifications: many(notification),
}))

// ── Universities ──────────────────────────────────────

export const universityRelations = relations(university, ({ many }) => ({
  domains: many(universityDomain),
  students: many(user),
}))

export const universityDomainRelations = relations(
  universityDomain,
  ({ one }) => ({
    university: one(university, {
      fields: [universityDomain.universityId],
      references: [university.id],
    }),
  }),
)

// ── Students ──────────────────────────────────────────

export const studentProfileRelations = relations(
  studentProfile,
  ({ one }) => ({
    user: one(user, {
      fields: [studentProfile.userId],
      references: [user.id],
    }),
  }),
)

export const studentSkillRelations = relations(studentSkill, ({ one }) => ({
  user: one(user, {
    fields: [studentSkill.userId],
    references: [user.id],
  }),
  skill: one(skillTag, {
    fields: [studentSkill.skillTagId],
    references: [skillTag.id],
  }),
}))

// ── Skills ────────────────────────────────────────────

export const skillTagRelations = relations(skillTag, ({ many }) => ({
  studentSkills: many(studentSkill),
  offerSkills: many(internshipOfferSkill),
}))

// ── Companies ─────────────────────────────────────────

export const companyRelations = relations(company, ({ many }) => ({
  members: many(companyMember),
  offers: many(internshipOffer),
}))

export const companyMemberRelations = relations(companyMember, ({ one }) => ({
  company: one(company, {
    fields: [companyMember.companyId],
    references: [company.id],
  }),
  user: one(user, {
    fields: [companyMember.userId],
    references: [user.id],
  }),
}))

// ── Internships ───────────────────────────────────────

export const internshipOfferRelations = relations(
  internshipOffer,
  ({ one, many }) => ({
    company: one(company, {
      fields: [internshipOffer.companyId],
      references: [company.id],
    }),
    requiredSkills: many(internshipOfferSkill),
    applications: many(application),
  }),
)

export const internshipOfferSkillRelations = relations(
  internshipOfferSkill,
  ({ one }) => ({
    offer: one(internshipOffer, {
      fields: [internshipOfferSkill.offerId],
      references: [internshipOffer.id],
    }),
    skill: one(skillTag, {
      fields: [internshipOfferSkill.skillTagId],
      references: [skillTag.id],
    }),
  }),
)

// ── Applications ──────────────────────────────────────

export const applicationRelations = relations(application, ({ one }) => ({
  offer: one(internshipOffer, {
    fields: [application.offerId],
    references: [internshipOffer.id],
  }),
  student: one(user, {
    fields: [application.studentUserId],
    references: [user.id],
  }),
  placement: one(placement),
}))

// ── Placements ────────────────────────────────────────

export const placementRelations = relations(placement, ({ one, many }) => ({
  application: one(application, {
    fields: [placement.applicationId],
    references: [application.id],
  }),
  validatedBy: one(user, {
    fields: [placement.validatedByUserId],
    references: [user.id],
  }),
  documents: many(placementDocument),
}))

export const placementDocumentRelations = relations(
  placementDocument,
  ({ one }) => ({
    placement: one(placement, {
      fields: [placementDocument.placementId],
      references: [placement.id],
    }),
  }),
)

// ── Notifications ─────────────────────────────────────

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}))
