import "server-only"

import { eq, desc } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"

type CompanyStatus = "pending" | "approved" | "rejected" | "suspended"

/** List companies, optionally filtered by status. */
export async function listCompanies(status?: CompanyStatus) {
  const query = db
    .select()
    .from(company)
    .orderBy(desc(company.createdAt))

  if (status) {
    return query.where(eq(company.status, status))
  }

  return query
}
