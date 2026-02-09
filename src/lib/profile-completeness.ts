/**
 * Calculate how complete a student's profile is (0–100).
 * Pure function — usable on both client and server.
 *
 * Weights:
 *   bio (15%), phone (10%), wilayaCode (15%),
 *   githubUrl OR portfolioUrl (20%), skills >= 3 (20%),
 *   studentNumber (10%), department (10%)
 */
export function calculateProfileCompleteness(profile: {
  bio?: string | null
  phone?: string | null
  wilayaCode?: number | null
  githubUrl?: string | null
  portfolioUrl?: string | null
  studentNumber?: string | null
  department?: string | null
  skillsCount: number
}): number {
  let score = 0

  if (profile.bio && profile.bio.trim().length > 0) score += 15
  if (profile.phone && profile.phone.trim().length > 0) score += 10
  if (profile.wilayaCode != null && profile.wilayaCode > 0) score += 15
  if (
    (profile.githubUrl && profile.githubUrl.trim().length > 0) ||
    (profile.portfolioUrl && profile.portfolioUrl.trim().length > 0)
  )
    score += 20
  if (profile.skillsCount >= 3) score += 20
  if (profile.studentNumber && profile.studentNumber.trim().length > 0) score += 10
  if (profile.department && profile.department.trim().length > 0) score += 10

  return score
}
