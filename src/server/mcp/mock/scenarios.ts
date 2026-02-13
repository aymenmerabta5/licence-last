import "server-only"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { application } from "@/server/db/schema/applications"
import { company, companyMember } from "@/server/db/schema/companies"
import { internshipOffer, internshipOfferSkill } from "@/server/db/schema/internships"
import { notification } from "@/server/db/schema/notifications"
import { placement, placementDocument } from "@/server/db/schema/placements"
import { skillTag } from "@/server/db/schema/skills"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { university, universityDomain } from "@/server/db/schema/universities"
import { appendSeedBatch } from "@/server/mcp/mock/ledger"
import { createBatchId, createEntityId } from "@/server/mcp/mock/id"
import type {
  ScenarioName,
  SeedBatchEntities,
  SeedRunResult,
  UserRole,
} from "@/server/mcp/types"

interface ScenarioDefinition {
  name: ScenarioName
  description: string
  baseCounts: {
    users: number
    companies: number
    offers: number
    applications: number
  }
}

interface SeederContext {
  batchId: string
  scenario: ScenarioName
  scale: number
  entities: SeedBatchEntities
  nextId: (entity: string) => string
}

const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    name: "student_discovery",
    description:
      "University + approved company + students with profiles and open published offers.",
    baseCounts: { users: 5, companies: 1, offers: 2, applications: 3 },
  },
  {
    name: "company_hiring_funnel",
    description:
      "Company funnel with mixed application statuses across draft/published/closed offers.",
    baseCounts: { users: 14, companies: 1, offers: 3, applications: 12 },
  },
  {
    name: "admin_validation_queue",
    description:
      "Queue of company-accepted applications waiting for admin validation and notifications.",
    baseCounts: { users: 11, companies: 2, offers: 4, applications: 8 },
  },
]

function createEmptyEntities(): SeedBatchEntities {
  return {
    universityIds: [],
    userIds: [],
    companyIds: [],
    offerIds: [],
    applicationIds: [],
    placementIds: [],
    documentIds: [],
    notificationIds: [],
    skillTagIds: [],
  }
}

function addEntityId(list: string[], id: string) {
  if (!list.includes(id)) {
    list.push(id)
  }
}

function countEntities(entities: SeedBatchEntities): Record<keyof SeedBatchEntities, number> {
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

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function ensureSkillTags(requiredCount: number, ctx: SeederContext): Promise<string[]> {
  const existing = await db.select({ id: skillTag.id }).from(skillTag).limit(requiredCount)
  const result = existing.map((row) => row.id)

  const missing = Math.max(0, requiredCount - result.length)
  if (missing === 0) return result

  const createdRows = Array.from({ length: missing }).map((_, index) => {
    const id = ctx.nextId("skill")
    const sequence = index + 1
    const name = `mcpdev Skill ${sequence} ${ctx.batchId.slice(-6)}`
    return {
      id,
      name,
      slug: `mcpdev-skill-${slugify(ctx.batchId)}-${sequence}`,
      category: "other",
    }
  })

  await db.insert(skillTag).values(createdRows)
  for (const row of createdRows) {
    result.push(row.id)
    addEntityId(ctx.entities.skillTagIds, row.id)
  }

  return result
}

async function createUniversitySeed(
  ctx: SeederContext,
  segment: number,
): Promise<{ universityId: string }> {
  const universityId = ctx.nextId("university")
  const batchSuffix = ctx.batchId.slice(-6)
  const name = `mcpdev University ${ctx.scenario} ${segment + 1} ${batchSuffix}`
  const domain = `mcpdev-${ctx.scenario}-${segment + 1}-${batchSuffix}.local`

  await db.insert(university).values({
    id: universityId,
    name,
    abbreviation: "MCPDEV",
    city: "Algiers",
    wilayaCode: 16,
  })

  await db.insert(universityDomain).values({
    id: ctx.nextId("university_domain"),
    universityId,
    domain,
    status: "approved",
  })

  addEntityId(ctx.entities.universityIds, universityId)
  return { universityId }
}

async function createUserSeed(
  ctx: SeederContext,
  input: {
    role: UserRole
    label: string
    universityId?: string | null
    onboardingCompleted?: boolean
  },
) {
  const id = ctx.nextId("user")
  const local = slugify(`${ctx.scenario}-${input.label}-${id.slice(-4)}`)
  const email = `${local}@mcpdev.local`

  await db.insert(user).values({
    id,
    email,
    emailVerified: true,
    role: input.role,
    universityId: input.universityId ?? null,
    onboardingCompleted: input.onboardingCompleted ?? true,
    name: `mcpdev ${input.label}`,
  })

  addEntityId(ctx.entities.userIds, id)

  return { id, email }
}

async function createCompanySeed(
  ctx: SeederContext,
  input: {
    name: string
    ownerUserId: string
    approvedByUserId?: string
    status?: "pending" | "approved" | "rejected" | "suspended"
  },
) {
  const id = ctx.nextId("company")
  const status = input.status ?? "approved"

  await db.insert(company).values({
    id,
    name: input.name,
    slug: `mcpdev-${slugify(input.name)}-${id.slice(-6)}`,
    description: "Generated by local developer MCP",
    websiteUrl: "https://mcpdev.local",
    contactEmail: `contact+${id.slice(-4)}@mcpdev.local`,
    representativeName: "mcpdev Representative",
    wilayaCode: 16,
    address: "mcpdev Address",
    status,
    approvedByUserId: status === "approved" ? (input.approvedByUserId ?? null) : null,
    approvedAt: status === "approved" ? new Date() : null,
  })

  await db.insert(companyMember).values({
    companyId: id,
    userId: input.ownerUserId,
    role: "owner",
  })

  addEntityId(ctx.entities.companyIds, id)
  return { id }
}

async function createOfferSeed(
  ctx: SeederContext,
  input: {
    companyId: string
    title: string
    status: "draft" | "published" | "closed"
    skillTagIds?: string[]
  },
) {
  const id = ctx.nextId("offer")
  const now = new Date()

  await db.insert(internshipOffer).values({
    id,
    companyId: input.companyId,
    title: `[mcpdev] ${input.title}`,
    description: "Generated by local developer MCP.",
    internshipType: "pfe",
    workMode: "hybrid",
    wilayaCode: 16,
    durationWeeks: 16,
    maxPositions: 3,
    status: input.status,
    publishedAt: input.status !== "draft" ? now : null,
    closesAt: input.status === "closed" ? now : null,
  })

  if (input.skillTagIds && input.skillTagIds.length > 0) {
    await db.insert(internshipOfferSkill).values(
      input.skillTagIds.map((skillTagId) => ({
        offerId: id,
        skillTagId,
      })),
    )
  }

  addEntityId(ctx.entities.offerIds, id)
  return { id, companyId: input.companyId }
}

async function createStudentProfileSeed(
  ctx: SeederContext,
  input: {
    userId: string
    skillTagIds: string[]
    index: number
  },
) {
  await db.insert(studentProfile).values({
    userId: input.userId,
    wilayaCode: 16,
    bio: `mcpdev student ${input.index + 1}`,
    phone: "+213555000000",
    studentNumber: `MCP${String(input.index + 1).padStart(4, "0")}`,
    department: "Computer Science",
    level: "M2",
  })

  if (input.skillTagIds.length > 0) {
    await db.insert(studentSkill).values(
      input.skillTagIds.map((skillTagId) => ({
        userId: input.userId,
        skillTagId,
      })),
    )
  }
}

async function createApplicationSeed(
  ctx: SeederContext,
  input: {
    offerId: string
    studentUserId: string
    status:
      | "applied"
      | "company_accepted"
      | "company_refused"
      | "admin_validated"
      | "admin_rejected"
      | "withdrawn"
    companyActionByUserId?: string
    adminActionByUserId?: string
    companyNote?: string | null
    adminNote?: string | null
  },
) {
  const id = ctx.nextId("application")
  const now = new Date()

  await db.insert(application).values({
    id,
    offerId: input.offerId,
    studentUserId: input.studentUserId,
    status: input.status,
    coverLetter: "Generated by local developer MCP",
    companyActionByUserId:
      input.status === "company_accepted" ||
      input.status === "company_refused" ||
      input.status === "admin_validated" ||
      input.status === "admin_rejected"
        ? (input.companyActionByUserId ?? null)
        : null,
    companyActionAt:
      input.status === "company_accepted" ||
      input.status === "company_refused" ||
      input.status === "admin_validated" ||
      input.status === "admin_rejected"
        ? now
        : null,
    companyNote: input.companyNote ?? null,
    adminActionByUserId:
      input.status === "admin_validated" || input.status === "admin_rejected"
        ? (input.adminActionByUserId ?? null)
        : null,
    adminActionAt:
      input.status === "admin_validated" || input.status === "admin_rejected" ? now : null,
    adminNote: input.adminNote ?? null,
  })

  addEntityId(ctx.entities.applicationIds, id)
  return { id }
}

async function createPlacementSeed(
  ctx: SeederContext,
  input: {
    applicationId: string
    validatedByUserId: string
  },
) {
  const placementId = ctx.nextId("placement")

  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 14)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 16 * 7)

  await db.insert(placement).values({
    id: placementId,
    applicationId: input.applicationId,
    validatedByUserId: input.validatedByUserId,
    startDate,
    endDate,
  })

  const documentId = ctx.nextId("document")
  await db.insert(placementDocument).values({
    id: documentId,
    placementId,
    type: "agreement",
    status: "pending",
  })

  addEntityId(ctx.entities.placementIds, placementId)
  addEntityId(ctx.entities.documentIds, documentId)

  return { placementId, documentId }
}

async function createNotificationSeed(
  ctx: SeederContext,
  input: {
    userId: string
    type: string
    payload: Record<string, unknown>
  },
) {
  const id = ctx.nextId("notification")
  await db.insert(notification).values({
    id,
    userId: input.userId,
    type: input.type,
    payload: input.payload,
  })

  addEntityId(ctx.entities.notificationIds, id)
}

async function seedStudentDiscoverySegment(ctx: SeederContext, segment: number) {
  const { universityId } = await createUniversitySeed(ctx, segment)
  const skills = await ensureSkillTags(4, ctx)

  const admin = await createUserSeed(ctx, {
    role: "university_admin",
    label: `admin-${segment + 1}`,
    universityId,
  })

  const companyOwner = await createUserSeed(ctx, {
    role: "company_admin",
    label: `company-admin-${segment + 1}`,
  })

  const createdCompany = await createCompanySeed(ctx, {
    name: `mcpdev Student Discovery Company ${segment + 1}`,
    ownerUserId: companyOwner.id,
    status: "approved",
    approvedByUserId: admin.id,
  })

  const students = await Promise.all(
    Array.from({ length: 3 }).map(async (_, index) => {
      const student = await createUserSeed(ctx, {
        role: "student",
        label: `student-${segment + 1}-${index + 1}`,
        universityId,
      })
      await createStudentProfileSeed(ctx, {
        userId: student.id,
        skillTagIds: [skills[index % skills.length], skills[(index + 1) % skills.length]],
        index,
      })
      return student
    }),
  )

  const offer1 = await createOfferSeed(ctx, {
    companyId: createdCompany.id,
    title: `Frontend Internship ${segment + 1}`,
    status: "published",
    skillTagIds: skills.slice(0, 2),
  })

  const offer2 = await createOfferSeed(ctx, {
    companyId: createdCompany.id,
    title: `Backend Internship ${segment + 1}`,
    status: "published",
    skillTagIds: skills.slice(2, 4),
  })

  await createApplicationSeed(ctx, {
    offerId: offer1.id,
    studentUserId: students[0].id,
    status: "applied",
  })
  await createApplicationSeed(ctx, {
    offerId: offer1.id,
    studentUserId: students[1].id,
    status: "applied",
  })
  await createApplicationSeed(ctx, {
    offerId: offer2.id,
    studentUserId: students[2].id,
    status: "applied",
  })
}

async function seedCompanyHiringFunnelSegment(ctx: SeederContext, segment: number) {
  const { universityId } = await createUniversitySeed(ctx, segment)
  const skills = await ensureSkillTags(6, ctx)

  const admin = await createUserSeed(ctx, {
    role: "university_admin",
    label: `funnel-admin-${segment + 1}`,
    universityId,
  })

  const owner = await createUserSeed(ctx, {
    role: "company_admin",
    label: `funnel-owner-${segment + 1}`,
  })

  const recruiter = await createUserSeed(ctx, {
    role: "company_admin",
    label: `funnel-recruiter-${segment + 1}`,
  })

  const createdCompany = await createCompanySeed(ctx, {
    name: `mcpdev Hiring Funnel Company ${segment + 1}`,
    ownerUserId: owner.id,
    status: "approved",
    approvedByUserId: admin.id,
  })

  await db.insert(companyMember).values({
    companyId: createdCompany.id,
    userId: recruiter.id,
    role: "recruiter",
  })

  const offerDraft = await createOfferSeed(ctx, {
    companyId: createdCompany.id,
    title: `Draft Offer ${segment + 1}`,
    status: "draft",
    skillTagIds: skills.slice(0, 2),
  })
  const offerPublished = await createOfferSeed(ctx, {
    companyId: createdCompany.id,
    title: `Published Offer ${segment + 1}`,
    status: "published",
    skillTagIds: skills.slice(2, 4),
  })
  const offerClosed = await createOfferSeed(ctx, {
    companyId: createdCompany.id,
    title: `Closed Offer ${segment + 1}`,
    status: "closed",
    skillTagIds: skills.slice(4, 6),
  })

  const students = await Promise.all(
    Array.from({ length: 12 }).map(async (_, index) => {
      const student = await createUserSeed(ctx, {
        role: "student",
        label: `funnel-student-${segment + 1}-${index + 1}`,
        universityId,
      })
      await createStudentProfileSeed(ctx, {
        userId: student.id,
        skillTagIds: [skills[index % skills.length]],
        index,
      })
      return student
    }),
  )

  const statuses: Array<
    | "applied"
    | "company_accepted"
    | "company_refused"
    | "admin_validated"
    | "admin_rejected"
    | "withdrawn"
  > = [
    "applied",
    "applied",
    "applied",
    "applied",
    "company_accepted",
    "company_accepted",
    "company_refused",
    "company_refused",
    "admin_validated",
    "admin_validated",
    "admin_rejected",
    "withdrawn",
  ]

  const offers = [offerPublished.id, offerClosed.id, offerDraft.id]

  for (let index = 0; index < students.length; index += 1) {
    const status = statuses[index]
    const app = await createApplicationSeed(ctx, {
      offerId: offers[index % offers.length],
      studentUserId: students[index].id,
      status,
      companyActionByUserId:
        status === "applied" || status === "withdrawn" ? undefined : recruiter.id,
      adminActionByUserId:
        status === "admin_validated" || status === "admin_rejected" ? admin.id : undefined,
      companyNote: status === "company_refused" ? "Rejected for this cycle" : null,
      adminNote: status === "admin_rejected" ? "University criteria mismatch" : null,
    })

    if (status === "admin_validated") {
      await createPlacementSeed(ctx, {
        applicationId: app.id,
        validatedByUserId: admin.id,
      })
    }
  }
}

async function seedAdminValidationQueueSegment(ctx: SeederContext, segment: number) {
  const { universityId } = await createUniversitySeed(ctx, segment)
  const skills = await ensureSkillTags(4, ctx)

  const admin = await createUserSeed(ctx, {
    role: "university_admin",
    label: `queue-admin-${segment + 1}`,
    universityId,
  })

  const companyAOwner = await createUserSeed(ctx, {
    role: "company_admin",
    label: `queue-company-a-owner-${segment + 1}`,
  })
  const companyBOwner = await createUserSeed(ctx, {
    role: "company_admin",
    label: `queue-company-b-owner-${segment + 1}`,
  })

  const companyA = await createCompanySeed(ctx, {
    name: `mcpdev Queue Company A ${segment + 1}`,
    ownerUserId: companyAOwner.id,
    status: "approved",
    approvedByUserId: admin.id,
  })
  const companyB = await createCompanySeed(ctx, {
    name: `mcpdev Queue Company B ${segment + 1}`,
    ownerUserId: companyBOwner.id,
    status: "approved",
    approvedByUserId: admin.id,
  })

  const offers = await Promise.all([
    createOfferSeed(ctx, {
      companyId: companyA.id,
      title: `Queue Offer A1 ${segment + 1}`,
      status: "published",
      skillTagIds: skills.slice(0, 2),
    }),
    createOfferSeed(ctx, {
      companyId: companyA.id,
      title: `Queue Offer A2 ${segment + 1}`,
      status: "published",
      skillTagIds: skills.slice(0, 2),
    }),
    createOfferSeed(ctx, {
      companyId: companyB.id,
      title: `Queue Offer B1 ${segment + 1}`,
      status: "published",
      skillTagIds: skills.slice(2, 4),
    }),
    createOfferSeed(ctx, {
      companyId: companyB.id,
      title: `Queue Offer B2 ${segment + 1}`,
      status: "published",
      skillTagIds: skills.slice(2, 4),
    }),
  ])

  const students = await Promise.all(
    Array.from({ length: 8 }).map(async (_, index) => {
      const student = await createUserSeed(ctx, {
        role: "student",
        label: `queue-student-${segment + 1}-${index + 1}`,
        universityId,
      })
      await createStudentProfileSeed(ctx, {
        userId: student.id,
        skillTagIds: [skills[index % skills.length]],
        index,
      })
      return student
    }),
  )

  for (let index = 0; index < students.length; index += 1) {
    const selectedOffer = offers[index % offers.length]
    const actionByUserId =
      selectedOffer.companyId === companyA.id ? companyAOwner.id : companyBOwner.id

    const seededApplication = await createApplicationSeed(ctx, {
      offerId: selectedOffer.id,
      studentUserId: students[index].id,
      status: "company_accepted",
      companyActionByUserId: actionByUserId,
    })

    await createNotificationSeed(ctx, {
      userId: admin.id,
      type: "placement_pending_validation",
      payload: {
        applicationId: seededApplication.id,
        offerId: selectedOffer.id,
      },
    })
  }
}

export function listSeedScenarios() {
  return SCENARIO_DEFINITIONS
}

export async function runSeedScenario(
  scenario: ScenarioName,
  scale: number,
): Promise<SeedRunResult> {
  const definition = SCENARIO_DEFINITIONS.find((entry) => entry.name === scenario)
  if (!definition) {
    throw new Error(`Unknown scenario: ${scenario}`)
  }

  const batchId = createBatchId(scenario)
  const entities = createEmptyEntities()
  const counters = new Map<string, number>()

  const nextId = (entity: string) => {
    const current = counters.get(entity) ?? 0
    const next = current + 1
    counters.set(entity, next)
    return createEntityId(batchId, entity, next)
  }

  const ctx: SeederContext = {
    batchId,
    scenario,
    scale,
    entities,
    nextId,
  }

  for (let segment = 0; segment < scale; segment += 1) {
    switch (scenario) {
      case "student_discovery":
        await seedStudentDiscoverySegment(ctx, segment)
        break
      case "company_hiring_funnel":
        await seedCompanyHiringFunnelSegment(ctx, segment)
        break
      case "admin_validation_queue":
        await seedAdminValidationQueueSegment(ctx, segment)
        break
      default:
        throw new Error(`Unhandled scenario: ${scenario satisfies never}`)
    }
  }

  const createdAt = new Date().toISOString()
  await appendSeedBatch({
    batchId,
    scenario,
    scale,
    createdAt,
    entities,
  })

  return {
    batchId,
    scenario,
    scale,
    createdAt,
    counts: countEntities(entities),
    entities,
  }
}
