/**
 * Cache configuration for Next.js 16 cacheComponents (PPR)
 *
 * Cache profiles define TTL (time-to-live) for different data types:
 * - "max": No expiration (for truly static data like universities)
 * - "days": Long-lived data (reference data like skills)
 * - "hours": Medium-lived data (company profiles, student profiles)
 * - "minutes": Short-lived data (search results, stats, applications)
 * - "seconds": Very short-lived data (rarely cached)
 */

import { cacheLife } from "next/cache"

/**
 * Cache tags for cache invalidation via revalidateTag
 * Use these tags with revalidateTag(tag, "max") in Route Handlers/Server Actions after mutations
 */
export const CACHE_TAGS = {
  // Reference data
  SKILLS: "skills",
  UNIVERSITIES: "universities",

  // Student data
  STUDENT_PROFILE: (userId: string) => `student-profile-${userId}`,
  STUDENT_STATS: (userId: string) => `student-stats-${userId}`,
  STUDENT_APPLICATIONS: (userId: string) => `student-apps-${userId}`,

  // Company data
  COMPANY_PROFILE: (companyId: string) => `company-${companyId}`,
  COMPANY_OFFERS: (companyId: string) => `company-offers-${companyId}`,
  COMPANY_CANDIDATES: (companyId: string) => `company-candidates-${companyId}`,
  COMPANIES_DIRECTORY: "companies-directory",

  // Admin / University
  ADMIN_STATS: "admin-stats",
  UNIVERSITY_STATS: (universityId: string) =>
    `university-stats-${universityId}`,

  // Offers
  OFFER_SEARCH: "offer-search",
  OFFER_DETAIL: (offerId: string) => `offer-${offerId}`,
  OFFERS_PUBLIC: "offers-public",

  // Public profiles
  PUBLIC_PROFILE: (userId: string) => `public-profile-${userId}`,
} as const

/**
 * Cache profile configurations
 * These are used with cacheLife() from 'next/cache'
 */
export const CACHE_PROFILES = {
  /** Static reference data - never expires (universities) */
  STATIC: () => cacheLife("max"),

  /** Reference data - 24 hours (skills list) */
  REFERENCE: () => cacheLife("hours"),

  /** User profiles - 15 minutes */
  PROFILE: () => cacheLife("minutes"),

  /** Dashboard stats - 5 minutes */
  STATS: () => cacheLife("minutes"),

  /** Search results - 2 minutes */
  SEARCH: () => cacheLife("minutes"),

  /** Public listings - 1 minute */
  LISTINGS: () => cacheLife("minutes"),
} as const
