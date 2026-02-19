import "server-only"

import { inArray, like, or } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import { notification } from "@/server/db/schema/notifications"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { university, universityDomain } from "@/server/db/schema/universities"
import {
  consumeConfirmationToken,
  issueConfirmationToken,
} from "@/server/mcp/confirmation"
import { DevMcpError } from "@/server/mcp/errors"
import { readSeedLedger, removeSeedBatches } from "@/server/mcp/mock/ledger"
import type {
  CleanupMode,
  CleanupPlan,
  SeedBatchEntities,
  SeedBatchRecord,
} from "@/server/mcp/types"

interface CleanupPlanInput {
  mode: CleanupMode
  batchId?: string
}

interface CleanupExecuteInput extends CleanupPlanInput {
  token: string
}

interface CleanupResolvedSelection {
  mode: CleanupMode
  batchId: string | null
  batchIds: string[]
  entities: SeedBatchEntities
}

function createEntitySets() {
  return {
    universityIds: new Set<string>(),
    userIds: new Set<string>(),
    companyIds: new Set<string>(),
    offerIds: new Set<string>(),
    applicationIds: new Set<string>(),
    placementIds: new Set<string>(),
    documentIds: new Set<string>(),
    notificationIds: new Set<string>(),
    skillTagIds: new Set<string>(),
  }
}

function toEntities(
  sets: ReturnType<typeof createEntitySets>,
): SeedBatchEntities {
  return {
    universityIds: [...sets.universityIds],
    userIds: [...sets.userIds],
    companyIds: [...sets.companyIds],
    offerIds: [...sets.offerIds],
    applicationIds: [...sets.applicationIds],
    placementIds: [...sets.placementIds],
    documentIds: [...sets.documentIds],
    notificationIds: [...sets.notificationIds],
    skillTagIds: [...sets.skillTagIds],
  }
}

function mergeBatchEntities(batches: SeedBatchRecord[]) {
  const sets = createEntitySets()
  for (const batch of batches) {
    batch.entities.universityIds.forEach((id) => sets.universityIds.add(id))
    batch.entities.userIds.forEach((id) => sets.userIds.add(id))
    batch.entities.companyIds.forEach((id) => sets.companyIds.add(id))
    batch.entities.offerIds.forEach((id) => sets.offerIds.add(id))
    batch.entities.applicationIds.forEach((id) => sets.applicationIds.add(id))
    batch.entities.placementIds.forEach((id) => sets.placementIds.add(id))
    batch.entities.documentIds.forEach((id) => sets.documentIds.add(id))
    batch.entities.notificationIds.forEach((id) => sets.notificationIds.add(id))
    batch.entities.skillTagIds.forEach((id) => sets.skillTagIds.add(id))
  }
  return sets
}

function countEntities(
  entities: SeedBatchEntities,
): Record<keyof SeedBatchEntities, number> {
  return {
    universityIds: entities.universityIds.length,
    userIds: entities.userIds.length,
    companyIds: entities.companyIds.length,
    offerIds: entities.offerIds.length,
    applicationIds: entities.applicationIds.length,
    placementIds: entities.placementIds.length,
    documentIds: entities.documentIds.length,
    notificationIds: entities.notificationIds.length,
    skillTagIds: entities.skillTagIds.length,
  }
}

function extractBatchSelection(
  ledgerBatches: SeedBatchRecord[],
  mode: CleanupMode,
  batchId?: string,
) {
  if (mode === "batch_only") {
    if (ledgerBatches.length === 0) {
      throw new DevMcpError("NOTHING_TO_CLEAN", "Seed ledger is empty")
    }

    if (!batchId) {
      const latest = ledgerBatches[0]
      return {
        selectedBatches: [latest],
        resolvedBatchId: latest.batchId,
      }
    }

    const found = ledgerBatches.find((batch) => batch.batchId === batchId)
    if (!found) {
      throw new DevMcpError("BATCH_NOT_FOUND", `Batch not found: ${batchId}`)
    }

    return {
      selectedBatches: [found],
      resolvedBatchId: found.batchId,
    }
  }

  return {
    selectedBatches: ledgerBatches,
    resolvedBatchId: null,
  }
}

async function augmentWithPrefixDiscovery(
  sets: ReturnType<typeof createEntitySets>,
) {
  const strayUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(or(like(user.id, "mcpdev_%"), like(user.email, "%@mcpdev.local")))
  strayUsers.forEach((row) => sets.userIds.add(row.id))

  const strayUniversities = await db
    .select({ id: university.id })
    .from(university)
    .where(like(university.id, "mcpdev_%"))
  strayUniversities.forEach((row) => sets.universityIds.add(row.id))

  const strayCompanies = await db
    .select({ id: company.id })
    .from(company)
    .where(or(like(company.id, "mcpdev_%"), like(company.slug, "mcpdev-%")))
  strayCompanies.forEach((row) => sets.companyIds.add(row.id))

  const strayOffers = await db
    .select({ id: internshipOffer.id })
    .from(internshipOffer)
    .where(
      or(
        like(internshipOffer.id, "mcpdev_%"),
        like(internshipOffer.title, "[mcpdev]%"),
      ),
    )
  strayOffers.forEach((row) => sets.offerIds.add(row.id))

  const strayApplications = await db
    .select({ id: application.id })
    .from(application)
    .where(like(application.id, "mcpdev_%"))
  strayApplications.forEach((row) => sets.applicationIds.add(row.id))

  const strayPlacements = await db
    .select({ id: placement.id })
    .from(placement)
    .where(like(placement.id, "mcpdev_%"))
  strayPlacements.forEach((row) => sets.placementIds.add(row.id))

  const strayDocuments = await db
    .select({ id: placementDocument.id })
    .from(placementDocument)
    .where(like(placementDocument.id, "mcpdev_%"))
  strayDocuments.forEach((row) => sets.documentIds.add(row.id))

  const strayNotifications = await db
    .select({ id: notification.id })
    .from(notification)
    .where(like(notification.id, "mcpdev_%"))
  strayNotifications.forEach((row) => sets.notificationIds.add(row.id))

  const straySkills = await db
    .select({ id: skillTag.id })
    .from(skillTag)
    .where(like(skillTag.id, "mcpdev_%"))
  straySkills.forEach((row) => sets.skillTagIds.add(row.id))
}

async function expandRelatedEntities(
  sets: ReturnType<typeof createEntitySets>,
) {
  if (sets.companyIds.size > 0) {
    const companyOfferRows = await db
      .select({ id: internshipOffer.id })
      .from(internshipOffer)
      .where(inArray(internshipOffer.companyId, [...sets.companyIds]))
    companyOfferRows.forEach((row) => sets.offerIds.add(row.id))
  }

  if (sets.offerIds.size > 0 || sets.userIds.size > 0) {
    const appRows = await db
      .select({ id: application.id })
      .from(application)
      .where(
        sets.offerIds.size > 0 && sets.userIds.size > 0
          ? or(
              inArray(application.offerId, [...sets.offerIds]),
              inArray(application.studentUserId, [...sets.userIds]),
            )
          : sets.offerIds.size > 0
            ? inArray(application.offerId, [...sets.offerIds])
            : inArray(application.studentUserId, [...sets.userIds]),
      )
    appRows.forEach((row) => sets.applicationIds.add(row.id))
  }

  if (sets.applicationIds.size > 0) {
    const placementRows = await db
      .select({ id: placement.id })
      .from(placement)
      .where(inArray(placement.applicationId, [...sets.applicationIds]))
    placementRows.forEach((row) => sets.placementIds.add(row.id))
  }

  if (sets.placementIds.size > 0) {
    const documentRows = await db
      .select({ id: placementDocument.id })
      .from(placementDocument)
      .where(inArray(placementDocument.placementId, [...sets.placementIds]))
    documentRows.forEach((row) => sets.documentIds.add(row.id))
  }

  if (sets.userIds.size > 0) {
    const notificationRows = await db
      .select({ id: notification.id })
      .from(notification)
      .where(inArray(notification.userId, [...sets.userIds]))
    notificationRows.forEach((row) => sets.notificationIds.add(row.id))
  }
}

async function resolveCleanupSelection(
  input: CleanupPlanInput,
): Promise<CleanupResolvedSelection> {
  const ledger = await readSeedLedger()
  const extracted = extractBatchSelection(
    ledger.batches,
    input.mode,
    input.batchId,
  )
  const sets = mergeBatchEntities(extracted.selectedBatches)

  if (input.mode === "all_mcpdev_data") {
    await augmentWithPrefixDiscovery(sets)
  }

  await expandRelatedEntities(sets)

  return {
    mode: input.mode,
    batchId: extracted.resolvedBatchId,
    batchIds: extracted.selectedBatches.map((batch) => batch.batchId),
    entities: toEntities(sets),
  }
}

export async function createCleanupPlan(
  input: CleanupPlanInput,
): Promise<CleanupPlan> {
  const resolved = await resolveCleanupSelection(input)
  const counts = countEntities(resolved.entities)

  const { token, expiresAt } = issueConfirmationToken("seed_cleanup", {
    mode: resolved.mode,
    batchId: resolved.batchId,
    batchIds: resolved.batchIds,
    entities: resolved.entities,
  })

  return {
    mode: resolved.mode,
    batchId: resolved.batchId,
    batchCount: resolved.batchIds.length,
    counts,
    token,
    expiresAt,
  }
}

async function deleteByIds<T extends { id: string }>(
  ids: string[],
  deleter: (ids: string[]) => Promise<T[]>,
) {
  if (ids.length === 0) return 0
  const deleted = await deleter(ids)
  return deleted.length
}

export async function executeCleanup(input: CleanupExecuteInput) {
  const resolved = await resolveCleanupSelection(input)
  const payload = {
    mode: resolved.mode,
    batchId: resolved.batchId,
    batchIds: resolved.batchIds,
    entities: resolved.entities,
  }
  consumeConfirmationToken(input.token, "seed_cleanup", payload)

  const deleted = {
    universityIds: 0,
    userIds: 0,
    companyIds: 0,
    offerIds: 0,
    applicationIds: 0,
    placementIds: 0,
    documentIds: 0,
    notificationIds: 0,
    skillTagIds: 0,
  }

  await db.transaction(async (tx) => {
    deleted.notificationIds += await deleteByIds(
      resolved.entities.notificationIds,
      async (ids) =>
        tx
          .delete(notification)
          .where(inArray(notification.id, ids))
          .returning({ id: notification.id }),
    )

    deleted.documentIds += await deleteByIds(
      resolved.entities.documentIds,
      async (ids) =>
        tx
          .delete(placementDocument)
          .where(inArray(placementDocument.id, ids))
          .returning({ id: placementDocument.id }),
    )

    deleted.placementIds += await deleteByIds(
      resolved.entities.placementIds,
      async (ids) =>
        tx
          .delete(placement)
          .where(inArray(placement.id, ids))
          .returning({ id: placement.id }),
    )

    deleted.applicationIds += await deleteByIds(
      resolved.entities.applicationIds,
      async (ids) =>
        tx
          .delete(application)
          .where(inArray(application.id, ids))
          .returning({ id: application.id }),
    )

    if (resolved.entities.offerIds.length > 0) {
      await tx
        .delete(internshipOfferSkill)
        .where(
          inArray(internshipOfferSkill.offerId, resolved.entities.offerIds),
        )
    }

    deleted.offerIds += await deleteByIds(
      resolved.entities.offerIds,
      async (ids) =>
        tx
          .delete(internshipOffer)
          .where(inArray(internshipOffer.id, ids))
          .returning({ id: internshipOffer.id }),
    )

    if (resolved.entities.companyIds.length > 0) {
      await tx
        .delete(companyMember)
        .where(inArray(companyMember.companyId, resolved.entities.companyIds))
    }
    if (resolved.entities.userIds.length > 0) {
      await tx
        .delete(companyMember)
        .where(inArray(companyMember.userId, resolved.entities.userIds))
    }

    if (resolved.entities.userIds.length > 0) {
      await tx
        .delete(studentSkill)
        .where(inArray(studentSkill.userId, resolved.entities.userIds))
      await tx
        .delete(studentProfile)
        .where(inArray(studentProfile.userId, resolved.entities.userIds))
    }

    deleted.companyIds += await deleteByIds(
      resolved.entities.companyIds,
      async (ids) =>
        tx
          .delete(company)
          .where(inArray(company.id, ids))
          .returning({ id: company.id }),
    )

    deleted.userIds += await deleteByIds(
      resolved.entities.userIds,
      async (ids) =>
        tx.delete(user).where(inArray(user.id, ids)).returning({ id: user.id }),
    )

    if (resolved.entities.universityIds.length > 0) {
      await tx
        .delete(universityDomain)
        .where(
          inArray(
            universityDomain.universityId,
            resolved.entities.universityIds,
          ),
        )
    }

    deleted.universityIds += await deleteByIds(
      resolved.entities.universityIds,
      async (ids) =>
        tx
          .delete(university)
          .where(inArray(university.id, ids))
          .returning({ id: university.id }),
    )

    deleted.skillTagIds += await deleteByIds(
      resolved.entities.skillTagIds,
      async (ids) =>
        tx
          .delete(skillTag)
          .where(inArray(skillTag.id, ids))
          .returning({ id: skillTag.id }),
    )
  })

  if (resolved.batchIds.length > 0) {
    await removeSeedBatches(resolved.batchIds)
  }

  return {
    mode: resolved.mode,
    batchId: resolved.batchId,
    batchCount: resolved.batchIds.length,
    deleted,
  }
}
