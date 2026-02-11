import type { userRoleEnum } from "@/server/db/schema/enums"

export type UserRole = (typeof userRoleEnum.enumValues)[number]

export type ScenarioName =
  | "student_discovery"
  | "company_hiring_funnel"
  | "admin_validation_queue"

export type CleanupMode = "batch_only" | "all_mcpdev_data"

export interface SeedBatchEntities {
  universityIds: string[]
  userIds: string[]
  companyIds: string[]
  offerIds: string[]
  applicationIds: string[]
  placementIds: string[]
  documentIds: string[]
  notificationIds: string[]
  skillTagIds: string[]
}

export interface SeedBatchRecord {
  batchId: string
  scenario: ScenarioName
  scale: number
  createdAt: string
  entities: SeedBatchEntities
}

export interface SeedRunResult {
  batchId: string
  scenario: ScenarioName
  scale: number
  createdAt: string
  counts: Record<keyof SeedBatchEntities, number>
  entities: SeedBatchEntities
}

export interface CleanupPlan {
  mode: CleanupMode
  batchId: string | null
  batchCount: number
  counts: Record<keyof SeedBatchEntities, number>
  token: string
  expiresAt: string
}

export interface HealthReport {
  server: {
    name: string
    version: string
  }
  environment: {
    nodeEnv: string | null
    mcpDevMode: boolean
    argvFlag: boolean
  }
  database: {
    configured: boolean
    protocol: string | null
    host: string | null
    database: string | null
  }
  safe: boolean
  reasons: string[]
}
