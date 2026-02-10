import "server-only"

import {
  getStudentProfileForViewer,
  type ViewerIdentity,
} from "@/server/services/students/get-profile-for-viewer"

/**
 * Public-safe student profile accessor for non-owner viewers (e.g. company admins).
 * Delegates privacy rules to getStudentProfileForViewer().
 */
export async function getPublicStudentProfile(
  viewer: ViewerIdentity,
  studentUserId: string,
) {
  return getStudentProfileForViewer({
    viewer,
    targetUserId: studentUserId,
  })
}
