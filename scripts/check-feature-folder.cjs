#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path")

const APP_ROOT = path.join(process.cwd(), "src", "app")
const MAX_STANDALONE_LINES = 150
const MAX_ORCHESTRATOR_LINES = 120
const MAX_SECTION_LINES = 200

// Temporary carve-out for pre-existing files that violate strict limits.
// Keep this list shrinking over time.
const LEGACY_EXEMPTIONS = new Set([
  "src/app/[locale]/(auth)/login/_components/LoginForm/components/TwoFactorStep.tsx",
  "src/app/[locale]/(auth)/reset-password/verify/_components/ResetPasswordVerifyForm/index.tsx",
  "src/app/[locale]/(auth)/signup/_components/SignupForm/index.tsx",
  "src/app/[locale]/(authenticated)/_components/DeptHeadDashboard/index.tsx",
  "src/app/[locale]/(authenticated)/_components/RecruiterDashboard/index.tsx",
  "src/app/[locale]/(authenticated)/_components/StudentDashboard/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/admin/departments/_components/DepartmentsView/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/components/OpenReportsCard.tsx",
  "src/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/admin/users/_components/UserManagementView/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ToolInvocationView.tsx",
  "src/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/components/PlacementCertificateCard.tsx",
  "src/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/components/OfferCard.tsx",
  "src/app/[locale]/(authenticated)/dashboard/company/offers/_components/CompanyOffersView/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/DetailsSection.tsx",
  "src/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/LanguageRequirementsSection.tsx",
  "src/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/components/ApplicationPanel.tsx",
  "src/app/[locale]/(authenticated)/dashboard/explore/_components/OfferCard.tsx",
  "src/app/[locale]/(authenticated)/dashboard/explore/_components/SearchFilters/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/settings/_components/AccountSettingsTab.tsx",
  "src/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/settings/_components/SessionManagement/index.tsx",
  "src/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager/index.tsx",
  "src/app/[locale]/_components/HeroSection.tsx",
  "src/app/[locale]/onboarding/_components/DecorativePanel.tsx",
  "src/app/[locale]/onboarding/student/_components/StudentOnboarding/components/StudentOnboardingFormContent.tsx",
  "src/app/[locale]/verify/[code]/_components/VerificationResult.tsx",
])

function listTsxFiles(dirPath, files = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      listTsxFiles(fullPath, files)
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith(".tsx")) {
      continue
    }

    if (entry.name.endsWith(".test.tsx")) {
      continue
    }

    files.push(fullPath)
  }

  return files
}

function relativePath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/")
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  return content.split(/\r?\n/).length
}

function isClientComponent(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }
    if (trimmed.startsWith("//")) {
      continue
    }
    return trimmed === '"use client"' || trimmed === "'use client'"
  }

  return false
}

function getPolicy(filePath) {
  const normalized = relativePath(filePath)

  if (!normalized.includes("/_components/")) {
    return null
  }

  if (!isClientComponent(filePath)) {
    return null
  }

  if (/\/_components\/[^/]+\/index\.tsx$/.test(normalized)) {
    return {
      max: MAX_ORCHESTRATOR_LINES,
      kind: "feature orchestrator",
    }
  }

  if (normalized.includes("/components/")) {
    return {
      max: MAX_SECTION_LINES,
      kind: "feature section",
    }
  }

  return {
    max: MAX_STANDALONE_LINES,
    kind: "standalone _components file",
  }
}

function main() {
  if (!fs.existsSync(APP_ROOT)) {
    console.error(`Missing app root: ${APP_ROOT}`)
    process.exit(1)
  }

  const files = listTsxFiles(APP_ROOT)
  const violations = []

  for (const filePath of files) {
    const policy = getPolicy(filePath)
    if (!policy) {
      continue
    }

    const normalizedPath = relativePath(filePath)
    if (LEGACY_EXEMPTIONS.has(normalizedPath)) {
      continue
    }

    const lines = countLines(filePath)
    if (lines <= policy.max) {
      continue
    }

    violations.push({
      file: normalizedPath,
      lines,
      max: policy.max,
      kind: policy.kind,
    })
  }

  if (violations.length === 0) {
    console.log("Feature-folder architecture check passed.")
    return
  }

  console.error("Feature-folder architecture violations found:")
  for (const violation of violations) {
    console.error(
      `${violation.file} (${violation.lines} lines) exceeds ${violation.max} lines for ${violation.kind}.`,
    )
  }
  process.exit(1)
}

main()
