import {
  getMeProcedure,
  updateMeProcedure,
  uploadAvatarProcedure,
  deleteAvatarProcedure,
} from "./routes/users"
import {
  listCompaniesProcedure,
  getCompanyByIdProcedure,
  createCompanyProcedure,
  updateCompanyProcedure,
  approveCompanyProcedure,
  rejectCompanyProcedure,
  uploadCompanyLogoProcedure,
  getCompanyTrustIndexProcedure,
  listCompanyTrustIndicesProcedure,
  submitCompanyQualityFeedbackProcedure,
  submitCompanyReportProcedure,
  listCompanyReportsProcedure,
  resolveCompanyReportProcedure,
} from "./routes/companies"
import { listSkillTagsProcedure } from "./routes/skills"
import {
  getStudentProfileProcedure,
  getPublicStudentProfileProcedure,
  upsertStudentProfileProcedure,
  upsertStudentProfileDetailsProcedure,
} from "./routes/students"
import {
  getOfferByIdProcedure,
  listOffersByCompanyProcedure,
  createOfferProcedure,
  updateOfferProcedure,
  deleteOfferProcedure,
  updateOfferStatusProcedure,
} from "./routes/offers"
import {
  searchOffersProcedure,
  checkApplicationProcedure,
  applyToOfferProcedure,
  listStudentApplicationsProcedure,
  withdrawApplicationProcedure,
  listByOfferProcedure,
  companyAcceptProcedure,
  companyRefuseProcedure,
  updatePipelineStageProcedure,
  getTimelineProcedure,
} from "./routes/applications"
import {
  listPendingProcedure,
  validateProcedure,
  rejectProcedure,
} from "./routes/placements"
import { generateAgreementProcedure } from "./routes/documents"
import {
  listNotificationsProcedure,
  markAllNotificationsReadProcedure,
  markNotificationReadProcedure,
} from "./routes/notifications"
import { getAdminStatsProcedure } from "./routes/stats"
import {
  appendAssistantMessageProcedure,
  createAssistantConversationProcedure,
  deleteAssistantConversationProcedure,
  getAssistantConversationProcedure,
  listAssistantModelsProcedure,
  listAssistantConversationsProcedure,
  listAssistantMessagesProcedure,
  updateAssistantConversationModelProcedure,
  updateAssistantConversationTitleProcedure,
} from "./routes/assistant"
import {
  captureReadinessSnapshotProcedure,
  getReadinessHistoryProcedure,
  getScoreProcedure,
  getSkillGapProcedure,
} from "./routes/matching"
import {
  listUsersProcedure,
  createUserProcedure,
  setRoleProcedure,
  banUserProcedure,
  unbanUserProcedure,
  removeUserProcedure,
  setPasswordProcedure,
  updateUserProcedure,
  listUserSessionsProcedure,
  revokeSessionProcedure,
  revokeAllSessionsProcedure,
} from "./routes/admin-users"

export const appRouter = {
  users: {
    getMe: getMeProcedure,
    updateMe: updateMeProcedure,
    uploadAvatar: uploadAvatarProcedure,
    deleteAvatar: deleteAvatarProcedure,
  },
  companies: {
    list: listCompaniesProcedure,
    getById: getCompanyByIdProcedure,
    create: createCompanyProcedure,
    update: updateCompanyProcedure,
    approve: approveCompanyProcedure,
    reject: rejectCompanyProcedure,
    uploadLogo: uploadCompanyLogoProcedure,
    getTrustIndex: getCompanyTrustIndexProcedure,
    listTrustIndices: listCompanyTrustIndicesProcedure,
    submitQualityFeedback: submitCompanyQualityFeedbackProcedure,
    submitReport: submitCompanyReportProcedure,
    listReports: listCompanyReportsProcedure,
    resolveReport: resolveCompanyReportProcedure,
  },
  skills: {
    list: listSkillTagsProcedure,
  },
  students: {
    getProfile: getStudentProfileProcedure,
    getPublicProfile: getPublicStudentProfileProcedure,
    upsertProfile: upsertStudentProfileProcedure,
    upsertProfileDetails: upsertStudentProfileDetailsProcedure,
  },
  offers: {
    getById: getOfferByIdProcedure,
    listByCompany: listOffersByCompanyProcedure,
    create: createOfferProcedure,
    update: updateOfferProcedure,
    delete: deleteOfferProcedure,
    updateStatus: updateOfferStatusProcedure,
    search: searchOffersProcedure,
  },
  applications: {
    checkApplication: checkApplicationProcedure,
    apply: applyToOfferProcedure,
    listByStudent: listStudentApplicationsProcedure,
    withdraw: withdrawApplicationProcedure,
    listByOffer: listByOfferProcedure,
    companyAccept: companyAcceptProcedure,
    companyRefuse: companyRefuseProcedure,
    updatePipelineStage: updatePipelineStageProcedure,
    getTimeline: getTimelineProcedure,
  },
  matching: {
    getScore: getScoreProcedure,
    getSkillGap: getSkillGapProcedure,
    getReadinessHistory: getReadinessHistoryProcedure,
    captureReadinessSnapshot: captureReadinessSnapshotProcedure,
  },
  placements: {
    listPending: listPendingProcedure,
    validate: validateProcedure,
    reject: rejectProcedure,
  },
  documents: {
    generateAgreement: generateAgreementProcedure,
  },
  notifications: {
    list: listNotificationsProcedure,
    markRead: markNotificationReadProcedure,
    markAllRead: markAllNotificationsReadProcedure,
  },
  stats: {
    getAdminStats: getAdminStatsProcedure,
  },
  adminUsers: {
    list: listUsersProcedure,
    create: createUserProcedure,
    setRole: setRoleProcedure,
    ban: banUserProcedure,
    unban: unbanUserProcedure,
    remove: removeUserProcedure,
    setPassword: setPasswordProcedure,
    update: updateUserProcedure,
    listSessions: listUserSessionsProcedure,
    revokeSession: revokeSessionProcedure,
    revokeAllSessions: revokeAllSessionsProcedure,
  },
  assistant: {
    listModels: listAssistantModelsProcedure,
    listConversations: listAssistantConversationsProcedure,
    createConversation: createAssistantConversationProcedure,
    deleteConversation: deleteAssistantConversationProcedure,
    getConversation: getAssistantConversationProcedure,
    listMessages: listAssistantMessagesProcedure,
    updateConversationModel: updateAssistantConversationModelProcedure,
    updateConversationTitle: updateAssistantConversationTitleProcedure,
    appendMessage: appendAssistantMessageProcedure,
  },
}

export type AppRouter = typeof appRouter
