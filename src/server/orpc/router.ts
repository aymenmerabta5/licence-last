import { getMeProcedure, promoteUserProcedure } from "./routes/users"
import {
  listCompaniesProcedure,
  getCompanyByIdProcedure,
  createCompanyProcedure,
  approveCompanyProcedure,
  rejectCompanyProcedure,
} from "./routes/companies"

export const appRouter = {
  users: {
    getMe: getMeProcedure,
    promote: promoteUserProcedure,
  },
  companies: {
    list: listCompaniesProcedure,
    getById: getCompanyByIdProcedure,
    create: createCompanyProcedure,
    approve: approveCompanyProcedure,
    reject: rejectCompanyProcedure,
  },
}

export type AppRouter = typeof appRouter
