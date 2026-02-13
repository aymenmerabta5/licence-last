import { relations } from "drizzle-orm"

import { user } from "./auth"
import { university, universityDomain } from "./universities"
import { company, companyMember } from "./companies"
import { assistantConversation, assistantMessage } from "./assistant"
import { studentProfile, studentSkill } from "./students"
import { skillTag } from "./skills"
import {
  internshipOffer,
  internshipOfferSkill,
} from "./internships"
import { application, applicationTimelineEvent } from "./applications"
import { placement, placementDocument } from "./placements"
import { notification } from "./notifications"
import {
  internshipOfferLanguageRequirement,
  studentLanguage,
} from "./languages"
import { studentOfferReadinessSnapshot } from "./matching"
import { companyQualityFeedback, companyReport } from "./trust"

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
  languages: many(studentLanguage),
  readinessSnapshots: many(studentOfferReadinessSnapshot),
  qualityFeedback: many(companyQualityFeedback),
  reports: many(companyReport),
}))

// ── Universities ──────────────────────────────────────

export const universityRelations = relations(university, ({ one, many }) => ({
  domains: many(universityDomain),
  students: many(user),
  approvedBy: one(user, {
    fields: [university.approvedByUserId],
    references: [user.id],
    relationName: "universityApprovedBy",
  }),
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

export const studentLanguageRelations = relations(studentLanguage, ({ one }) => ({
  user: one(user, {
    fields: [studentLanguage.userId],
    references: [user.id],
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
  assistantConversations: many(assistantConversation),
  qualityFeedback: many(companyQualityFeedback),
  reports: many(companyReport),
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

// ── Assistant (Company Copilot) ────────────────────────

export const assistantConversationRelations = relations(
  assistantConversation,
  ({ one, many }) => ({
    company: one(company, {
      fields: [assistantConversation.companyId],
      references: [company.id],
    }),
    createdBy: one(user, {
      fields: [assistantConversation.createdByUserId],
      references: [user.id],
    }),
    messages: many(assistantMessage),
  }),
)

export const assistantMessageRelations = relations(assistantMessage, ({ one }) => ({
  conversation: one(assistantConversation, {
    fields: [assistantMessage.conversationId],
    references: [assistantConversation.id],
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
    languageRequirements: many(internshipOfferLanguageRequirement),
    applications: many(application),
    readinessSnapshots: many(studentOfferReadinessSnapshot),
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

export const internshipOfferLanguageRequirementRelations = relations(
  internshipOfferLanguageRequirement,
  ({ one }) => ({
    offer: one(internshipOffer, {
      fields: [internshipOfferLanguageRequirement.offerId],
      references: [internshipOffer.id],
    }),
  }),
)

// ── Applications ──────────────────────────────────────

export const applicationRelations = relations(application, ({ one, many }) => ({
  offer: one(internshipOffer, {
    fields: [application.offerId],
    references: [internshipOffer.id],
  }),
  student: one(user, {
    fields: [application.studentUserId],
    references: [user.id],
  }),
  placement: one(placement),
  timelineEvents: many(applicationTimelineEvent),
}))

export const applicationTimelineEventRelations = relations(
  applicationTimelineEvent,
  ({ one }) => ({
    application: one(application, {
      fields: [applicationTimelineEvent.applicationId],
      references: [application.id],
    }),
    actor: one(user, {
      fields: [applicationTimelineEvent.actorUserId],
      references: [user.id],
    }),
  }),
)

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
  qualityFeedback: many(companyQualityFeedback),
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

export const studentOfferReadinessSnapshotRelations = relations(
  studentOfferReadinessSnapshot,
  ({ one }) => ({
    student: one(user, {
      fields: [studentOfferReadinessSnapshot.studentUserId],
      references: [user.id],
    }),
    offer: one(internshipOffer, {
      fields: [studentOfferReadinessSnapshot.offerId],
      references: [internshipOffer.id],
    }),
  }),
)

export const companyQualityFeedbackRelations = relations(
  companyQualityFeedback,
  ({ one }) => ({
    company: one(company, {
      fields: [companyQualityFeedback.companyId],
      references: [company.id],
    }),
    student: one(user, {
      fields: [companyQualityFeedback.studentUserId],
      references: [user.id],
    }),
    placement: one(placement, {
      fields: [companyQualityFeedback.placementId],
      references: [placement.id],
    }),
  }),
)

export const companyReportRelations = relations(companyReport, ({ one }) => ({
  company: one(company, {
    fields: [companyReport.companyId],
    references: [company.id],
  }),
  reporter: one(user, {
    fields: [companyReport.reporterUserId],
    references: [user.id],
  }),
  resolvedBy: one(user, {
    fields: [companyReport.resolvedByUserId],
    references: [user.id],
  }),
}))
