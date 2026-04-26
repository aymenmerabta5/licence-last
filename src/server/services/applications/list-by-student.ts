import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache"
import {
  type ListStudentApplicationsParams,
  listApplicationsByStudentUncached,
} from "@/server/services/applications/list-by-student-base"

function isE2ECacheDisabled(): boolean {
  return process.env.E2E_DISABLE_CACHE === "1"
}

async function listApplicationsByStudentCached(
  studentUserId: string,
  params: ListStudentApplicationsParams,
) {
  "use cache"
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.STUDENT_APPLICATIONS(studentUserId))

  return listApplicationsByStudentUncached(studentUserId, params)
}

/**
 * List a student's applications with offer + company info.
 * Uses cache by default and bypasses it in E2E mode.
 */
export async function listApplicationsByStudent(
  studentUserId: string,
  params: ListStudentApplicationsParams,
) {
  if (isE2ECacheDisabled()) {
    return listApplicationsByStudentUncached(studentUserId, params)
  }

  return listApplicationsByStudentCached(studentUserId, params)
}
