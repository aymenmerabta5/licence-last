import { test as setup } from "@playwright/test"

import {
  assertSafeE2EDatabaseResetTarget,
  resolveE2EDatabaseUrl,
} from "./fixtures/database"
import { TEST_CREDENTIALS } from "./fixtures/credentials"
import {
  resetE2EDatabase,
  seedBaseReferenceData,
  seedTestUsers,
  syncE2EDatabaseSchema,
} from "./fixtures/seed"

setup.setTimeout(5 * 60 * 1000)

setup("setup test database", async () => {
  console.info("Setting up E2E test environment...")

  const databaseUrl = resolveE2EDatabaseUrl()
  const databaseTarget = assertSafeE2EDatabaseResetTarget(databaseUrl)

  console.info(
    `Using E2E database target: ${databaseTarget.host}:${databaseTarget.port}/${databaseTarget.database}`,
  )

  console.info("Resetting database...")
  await resetE2EDatabase(databaseUrl)

  console.info("Syncing database schema...")
  syncE2EDatabaseSchema(databaseUrl)

  console.info("Waiting for Neon connection to stabilize...")
  await new Promise((resolve) => setTimeout(resolve, 3000))

  console.info("Seeding base reference data...")
  const baseReferenceData = await seedBaseReferenceData(databaseUrl)

  console.info("Creating test users...")
  await seedTestUsers({
    databaseUrl,
    universityId: baseReferenceData.universityId,
    departmentId: baseReferenceData.departmentId,
  })

  console.info("E2E test environment setup complete.")
  console.info("Seeded credentials:")
  for (const credential of Object.values(TEST_CREDENTIALS)) {
    console.info(
      `  ${credential.role}: ${credential.email} / ${credential.password}`,
    )
  }
})
