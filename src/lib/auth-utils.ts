/**
 * Pure utility functions for email/domain handling.
 * These can be imported and tested without server-only restrictions.
 */

/**
 * Extract the domain part from an email address.
 * Returns null if no valid domain is found.
 */
export function getEmailDomain(email: string): string | null {
  const at = email.lastIndexOf("@")
  if (at === -1) return null
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
  if (!domain) return null
  return domain
}

/**
 * Generate domain candidates for matching against approved university domains.
 * Excludes single-part TLDs (e.g., ".dz", ".uk") from candidates.
 */
export function domainCandidates(domain: string): string[] {
  const parts = domain
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < 2) return [domain]

  const candidates: string[] = []
  for (let i = 0; i <= parts.length - 2; i += 1) {
    candidates.push(parts.slice(i).join("."))
  }
  return candidates
}
