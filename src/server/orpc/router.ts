import { getMeProcedure, promoteUserProcedure, updateMeProcedure } from "./routes/users"
import {
  listCompaniesProcedure,
  getCompanyByIdProcedure,
  createCompanyProcedure,
  updateCompanyProcedure,
  approveCompanyProcedure,
  rejectCompanyProcedure,
  uploadCompanyLogoProcedure,
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

export const appRouter = {
  users: {
    getMe: getMeProcedure,
    updateMe: updateMeProcedure,
    promote: promoteUserProcedure,
  },
  companies: {
    list: listCompaniesProcedure,
    getById: getCompanyByIdProcedure,
    create: createCompanyProcedure,
    update: updateCompanyProcedure,
    approve: approveCompanyProcedure,
    reject: rejectCompanyProcedure,
    uploadLogo: uploadCompanyLogoProcedure,
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
}

export type AppRouter = typeof appRouter
