import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { createModuleLogger } from "@/server/logging"
import { getExplainableMatchScore } from "@/server/services/matching/score"
import { getExplainableMatchScoresBatch } from "@/server/services/matching/score-batch"
import { searchOffers } from "@/server/services/offers/search"

const log = createModuleLogger("services/offers/recommend")

interface RecommendOffersInput {
  studentUserId: string
  limit?: number
  candidateLimit?: number
}

interface RankedOffer {
  id: string
  companyId: string
  title: string
  description: string
  internshipType: "pfe" | "immersion" | "summer" | "practical"
  workMode: "on_site" | "hybrid" | "remote" | null
  wilayaCode: number | null
  durationWeeks: number | null
  maxPositions: number
  status: "draft" | "published" | "closed"
  applicationDeadlineAt: Date | null
  expectedStartDate: Date | null
  expectedEndDate: Date | null
  closesAt: Date | null
  createdAt: Date
  companyName: string
  companySlug: string
  companyLogoUrl: string | null
  companyWilayaCode: number | null
  skills: {
    id: string
    name: string
    slug: string
    category: string | null
  }[]
  languageRequirements: {
    languageCode: string
    minimumProficiency: "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "native"
    isRequired: boolean
    weight: number
  }[]
  matchScore: number
}

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  mapper: (item: TInput) => Promise<TOutput>,
) {
  const results: TOutput[] = []
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const currentIndex = cursor
      cursor += 1
      results[currentIndex] = await mapper(items[currentIndex] as TInput)
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, items.length)) },
      () => worker(),
    ),
  )

  return results
}

/**
 * Rank top recent offers by personalized matching score.
 */
interface RecommendOffersDependencies {
  searchOffers?: (params: {
    limit: number
  }) => Promise<Awaited<ReturnType<typeof searchOffers>>>
}

export async function recommendOffersForStudent(
  input: RecommendOffersInput,
  dependencies: RecommendOffersDependencies = {},
): Promise<{ offers: RankedOffer[] }> {
  const limit = Math.max(1, Math.min(input.limit ?? 3, 12))
  const candidateLimit = Math.max(
    20,
    Math.min(input.candidateLimit ?? 100, 200),
  )
  const searchFn = dependencies.searchOffers ?? searchOffers

  const [searchResult, appliedRows] = await Promise.all([
    searchFn({ limit: candidateLimit }),
    db
      .select({ offerId: application.offerId })
      .from(application)
      .where(eq(application.studentUserId, input.studentUserId)),
  ])

  const appliedOfferIds = new Set(appliedRows.map((row) => row.offerId))
  const candidates = searchResult.offers.filter(
    (offer) => !appliedOfferIds.has(offer.id),
  )

  let scored: Array<RankedOffer & { matchScore: number }>

  try {
    const candidateIds = candidates.map((c) => c.id)
    const batchScores =
      candidateIds.length > 0
        ? await getExplainableMatchScoresBatch(
            input.studentUserId,
            candidateIds,
          )
        : new Map()

    scored = candidates.map((offer) => {
      const match = batchScores.get(offer.id)
      if (!match) {
        log.warn(
          { studentUserId: input.studentUserId, offerId: offer.id },
          "Match score missing for candidate offer; defaulting to 0",
        )
      }
      return {
        ...offer,
        matchScore: match?.score ?? 0,
      }
    })
  } catch (error) {
    log.warn(
      { err: error, studentUserId: input.studentUserId },
      "Batch scoring failed; falling back to individual score calls",
    )

    scored = await mapWithConcurrency(candidates, 10, async (offer) => {
      let score = 0
      try {
        const match = await getExplainableMatchScore(
          input.studentUserId,
          offer.id,
        )
        score = match.score
      } catch (err) {
        log.error(
          { err, studentUserId: input.studentUserId, offerId: offer.id },
          "Failed to compute match score for offer",
        )
        score = 0
      }

      return {
        ...offer,
        matchScore: score,
      }
    })
  }

  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore
    }
    if (b.createdAt.getTime() !== a.createdAt.getTime()) {
      return b.createdAt.getTime() - a.createdAt.getTime()
    }
    return b.id.localeCompare(a.id)
  })

  return {
    offers: scored.slice(0, limit),
  }
}
