import { relations } from "drizzle-orm"
import {
  application,
  applicationTimelineEvent,
} from "@/server/db/schema/applications"
import {
  assistantConversation,
  assistantMessage,
} from "@/server/db/schema/assistant"
import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import { department, departmentSkill } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-members"
import {
  internshipOffer,
  internshipOfferSkill,
  savedOffer,
} from "@/server/db/schema/internships"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import {
  internshipOfferLanguageRequirement,
  studentLanguage,
} from "@/server/db/schema/languages"
import { studentOfferReadinessSnapshot } from "@/server/db/schema/matching"
import {
  offerMessage,
  offerMessageReadState,
  offerMessageThread,
} from "@/server/db/schema/messages"
import {
  notification,
  notificationPreference,
} from "@/server/db/schema/notifications"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { skillTag } from "@/server/db/schema/skills"
import {
  studentExperience,
  studentProject,
  studentResume,
} from "@/server/db/schema/student-cv"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { companyQualityFeedback, companyReport } from "@/server/db/schema/trust"
import { university, universityDomain } from "@/server/db/schema/universities"

// ── Auth ──────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  university: one(university, {
    fields: [user.universityId],
    references: [university.id],
  }),
  department: one(department, {
    fields: [user.departmentId],
    references: [department.id],
  }),
  studentProfile: one(studentProfile, {
    fields: [user.id],
    references: [studentProfile.userId],
  }),
  studentSkills: many(studentSkill),
  companyMemberships: many(companyMember),
  universityMembership: one(universityMember, {
    fields: [user.id],
    references: [universityMember.userId],
  }),
  applications: many(application),
  notifications: many(notification),
  notificationPreference: one(notificationPreference, {
    fields: [user.id],
    references: [notificationPreference.userId],
  }),
  savedOffers: many(savedOffer),
  languages: many(studentLanguage),
  readinessSnapshots: many(studentOfferReadinessSnapshot),
  qualityFeedback: many(companyQualityFeedback),
  reports: many(companyReport),
  experiences: many(studentExperience),
  projects: many(studentProject),
  resume: one(studentResume, {
    fields: [user.id],
    references: [studentResume.userId],
  }),
  interviews: many(interview, { relationName: "interviewStudent" }),
  proposedInterviews: many(interview, { relationName: "interviewProposedBy" }),
  confirmedInterviews: many(interview, {
    relationName: "interviewConfirmedBy",
  }),
  messageThreads: many(offerMessageThread, {
    relationName: "offerMessageThreadStudent",
  }),
  sentOfferMessages: many(offerMessage, { relationName: "offerMessageSender" }),
  offerMessageReadStates: many(offerMessageReadState),
}))

// ── Universities ──────────────────────────────────────

export const universityRelations = relations(university, ({ one, many }) => ({
  domains: many(universityDomain),
  departments: many(department),
  students: many(user),
  memberships: many(universityMember),
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

// ── Departments ──────────────────────────────────────

export const departmentRelations = relations(department, ({ one, many }) => ({
  university: one(university, {
    fields: [department.universityId],
    references: [university.id],
  }),
  students: many(studentProfile),
  memberships: many(universityMember),
  skills: many(departmentSkill),
}))

export const departmentSkillRelations = relations(
  departmentSkill,
  ({ one }) => ({
    department: one(department, {
      fields: [departmentSkill.departmentId],
      references: [department.id],
    }),
    skill: one(skillTag, {
      fields: [departmentSkill.skillTagId],
      references: [skillTag.id],
    }),
  }),
)

// ── Students ──────────────────────────────────────────

export const studentProfileRelations = relations(studentProfile, ({ one }) => ({
  user: one(user, {
    fields: [studentProfile.userId],
    references: [user.id],
  }),
  department: one(department, {
    fields: [studentProfile.departmentId],
    references: [department.id],
  }),
}))

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

export const studentLanguageRelations = relations(
  studentLanguage,
  ({ one }) => ({
    user: one(user, {
      fields: [studentLanguage.userId],
      references: [user.id],
    }),
  }),
)

export const studentExperienceRelations = relations(
  studentExperience,
  ({ one }) => ({
    user: one(user, {
      fields: [studentExperience.userId],
      references: [user.id],
    }),
  }),
)

export const studentProjectRelations = relations(studentProject, ({ one }) => ({
  user: one(user, {
    fields: [studentProject.userId],
    references: [user.id],
  }),
}))

export const studentResumeRelations = relations(studentResume, ({ one }) => ({
  user: one(user, {
    fields: [studentResume.userId],
    references: [user.id],
  }),
}))

// ── Skills ────────────────────────────────────────────

export const skillTagRelations = relations(skillTag, ({ many }) => ({
  studentSkills: many(studentSkill),
  offerSkills: many(internshipOfferSkill),
  departmentSkills: many(departmentSkill),
}))

// ── Companies ─────────────────────────────────────────

export const companyRelations = relations(company, ({ many }) => ({
  members: many(companyMember),
  offers: many(internshipOffer),
  assistantConversations: many(assistantConversation),
  qualityFeedback: many(companyQualityFeedback),
  reports: many(companyReport),
  interviews: many(interview),
  messageThreads: many(offerMessageThread),
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

export const universityMemberRelations = relations(universityMember, ({ one }) => ({
  university: one(university, {
    fields: [universityMember.universityId],
    references: [university.id],
  }),
  user: one(user, {
    fields: [universityMember.userId],
    references: [user.id],
  }),
  department: one(department, {
    fields: [universityMember.departmentId],
    references: [department.id],
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

export const assistantMessageRelations = relations(
  assistantMessage,
  ({ one }) => ({
    conversation: one(assistantConversation, {
      fields: [assistantMessage.conversationId],
      references: [assistantConversation.id],
    }),
  }),
)

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
    savedByStudents: many(savedOffer),
    readinessSnapshots: many(studentOfferReadinessSnapshot),
    interviews: many(interview),
    messageThreads: many(offerMessageThread),
    messages: many(offerMessage),
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
  interview: one(interview),
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

export const interviewRelations = relations(interview, ({ one, many }) => ({
  application: one(application, {
    fields: [interview.applicationId],
    references: [application.id],
  }),
  offer: one(internshipOffer, {
    fields: [interview.offerId],
    references: [internshipOffer.id],
  }),
  company: one(company, {
    fields: [interview.companyId],
    references: [company.id],
  }),
  student: one(user, {
    fields: [interview.studentUserId],
    references: [user.id],
    relationName: "interviewStudent",
  }),
  proposedBy: one(user, {
    fields: [interview.proposedByUserId],
    references: [user.id],
    relationName: "interviewProposedBy",
  }),
  confirmedBy: one(user, {
    fields: [interview.confirmedByUserId],
    references: [user.id],
    relationName: "interviewConfirmedBy",
  }),
  slots: many(interviewSlot),
}))

export const interviewSlotRelations = relations(interviewSlot, ({ one }) => ({
  interview: one(interview, {
    fields: [interviewSlot.interviewId],
    references: [interview.id],
  }),
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

export const notificationPreferenceRelations = relations(
  notificationPreference,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationPreference.userId],
      references: [user.id],
    }),
  }),
)

export const savedOfferRelations = relations(savedOffer, ({ one }) => ({
  user: one(user, {
    fields: [savedOffer.userId],
    references: [user.id],
  }),
  offer: one(internshipOffer, {
    fields: [savedOffer.offerId],
    references: [internshipOffer.id],
  }),
}))

export const offerMessageThreadRelations = relations(
  offerMessageThread,
  ({ one, many }) => ({
    offer: one(internshipOffer, {
      fields: [offerMessageThread.offerId],
      references: [internshipOffer.id],
    }),
    company: one(company, {
      fields: [offerMessageThread.companyId],
      references: [company.id],
    }),
    student: one(user, {
      fields: [offerMessageThread.studentUserId],
      references: [user.id],
      relationName: "offerMessageThreadStudent",
    }),
    createdBy: one(user, {
      fields: [offerMessageThread.createdByUserId],
      references: [user.id],
      relationName: "offerMessageThreadCreatedBy",
    }),
    messages: many(offerMessage),
    readStates: many(offerMessageReadState),
  }),
)

export const offerMessageRelations = relations(offerMessage, ({ one }) => ({
  thread: one(offerMessageThread, {
    fields: [offerMessage.threadId],
    references: [offerMessageThread.id],
  }),
  offer: one(internshipOffer, {
    fields: [offerMessage.offerId],
    references: [internshipOffer.id],
  }),
  sender: one(user, {
    fields: [offerMessage.senderUserId],
    references: [user.id],
    relationName: "offerMessageSender",
  }),
}))

export const offerMessageReadStateRelations = relations(
  offerMessageReadState,
  ({ one }) => ({
    thread: one(offerMessageThread, {
      fields: [offerMessageReadState.threadId],
      references: [offerMessageThread.id],
    }),
    user: one(user, {
      fields: [offerMessageReadState.userId],
      references: [user.id],
    }),
    lastReadMessage: one(offerMessage, {
      fields: [offerMessageReadState.lastReadMessageId],
      references: [offerMessage.id],
    }),
  }),
)

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
