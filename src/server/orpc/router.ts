import { getMeProcedure, promoteUserProcedure } from "./routes/users"
import {
  listCompaniesProcedure,
  getCompanyByIdProcedure,
  createCompanyProcedure,
  updateCompanyProcedure,
  approveCompanyProcedure,
  rejectCompanyProcedure,
} from "./routes/companies"
import { listSkillTagsProcedure } from "./routes/skills"
import {
  getStudentProfileProcedure,
  upsertStudentProfileProcedure,
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
} from "./routes/applications"

export const appRouter = {
  users: {
    getMe: getMeProcedure,
    promote: promoteUserProcedure,
  },
  companies: {
    list: listCompaniesProcedure,
    getById: getCompanyByIdProcedure,
    create: createCompanyProcedure,
    update: updateCompanyProcedure,
    approve: approveCompanyProcedure,
    reject: rejectCompanyProcedure,
  },
  skills: {
    list: listSkillTagsProcedure,
  },
  students: {
    getProfile: getStudentProfileProcedure,
    upsertProfile: upsertStudentProfileProcedure,
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
  },
}

export type AppRouter = typeof appRouter
