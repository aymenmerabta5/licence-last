import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { auth } from "@/lib/auth"
import * as schema from "@/server/db/schema"
import { user } from "@/server/db/schema/auth"
import { department, departmentSkill } from "@/server/db/schema/departments"
import { skillTag } from "@/server/db/schema/skills"
import { university, universityDomain } from "@/server/db/schema/universities"
import { logger } from "@/server/logging/logger"

/**
 * Parse a comma-separated string of domains into an array of normalized domains.
 * Trims whitespace and converts to lowercase.
 */
export function parseDomains(input: string | undefined): string[] {
  if (!input) return []
  return input
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
}

type SeedUniversity = { name: string; domains: string[] }

const SEED_UNIVERSITIES: SeedUniversity[] = [
  {
    name: "University Of Constantine 2",
    domains: ["univ-constantine2.dz"],
  },
]

async function seedUniversity(
  db: ReturnType<typeof drizzle>,
  entry: SeedUniversity,
) {
  const [existing] = await db
    .select({ id: university.id })
    .from(university)
    .where(eq(university.name, entry.name))
    .limit(1)

  const universityId = existing?.id ?? randomUUID()

  if (!existing) {
    await db.insert(university).values({ id: universityId, name: entry.name })
    logger.info({ event: "university_seeded", name: entry.name })
  }

  for (const domain of entry.domains) {
    const [existingDomain] = await db
      .select({ id: universityDomain.id, status: universityDomain.status })
      .from(universityDomain)
      .where(eq(universityDomain.domain, domain))
      .limit(1)

    if (!existingDomain) {
      await db.insert(universityDomain).values({
        id: randomUUID(),
        universityId,
        domain,
        status: "approved",
      })
      logger.info({ event: "domain_approved", domain })
      continue
    }

    if (existingDomain.status !== "approved") {
      await db
        .update(universityDomain)
        .set({
          status: "approved",
          universityId,
        })
        .where(eq(universityDomain.id, existingDomain.id))
      logger.info({ event: "domain_updated", domain, status: "approved" })
    }
  }
}

/* ── Skill tag data ── */

const SEED_SKILL_TAGS: { name: string; category: string }[] = [
  // Frontend
  { name: "React", category: "frontend" },
  { name: "Angular", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "HTML/CSS", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },

  // Backend
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "Flask", category: "backend" },
  { name: "Spring Boot", category: "backend" },
  { name: "Laravel", category: "backend" },
  { name: "FastAPI", category: "backend" },

  // Languages
  { name: "Python", category: "languages" },
  { name: "Java", category: "languages" },
  { name: "C/C++", category: "languages" },
  { name: "PHP", category: "languages" },
  { name: "Go", category: "languages" },
  { name: "Rust", category: "languages" },
  { name: "C#", category: "languages" },

  // Database
  { name: "PostgreSQL", category: "database" },
  { name: "MySQL", category: "database" },
  { name: "MongoDB", category: "database" },
  { name: "Redis", category: "database" },
  { name: "SQLite", category: "database" },

  // DevOps
  { name: "Docker", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "Git", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Linux", category: "devops" },
  { name: "AWS", category: "devops" },

  // Mobile
  { name: "React Native", category: "mobile" },
  { name: "Flutter", category: "mobile" },
  { name: "Swift", category: "mobile" },
  { name: "Kotlin", category: "mobile" },

  // Data & AI
  { name: "Machine Learning", category: "data_ai" },
  { name: "Data Science", category: "data_ai" },
  { name: "TensorFlow", category: "data_ai" },
  { name: "PyTorch", category: "data_ai" },

  // Software Engineering
  { name: "REST API", category: "software_engineering" },
  { name: "GraphQL", category: "software_engineering" },
  { name: "Microservices", category: "software_engineering" },
  { name: "Agile/Scrum", category: "software_engineering" },

  // Math & Statistics
  { name: "R", category: "math_stats" },
  { name: "MATLAB", category: "math_stats" },
  { name: "Statistical Analysis", category: "math_stats" },
  { name: "LaTeX", category: "math_stats" },
  { name: "Numerical Methods", category: "math_stats" },

  // Science & Research
  { name: "Lab Techniques", category: "science" },
  { name: "Scientific Writing", category: "science" },
  { name: "Research Methods", category: "science" },
  { name: "Data Visualization", category: "science" },

  // Electronics & Embedded
  { name: "Arduino", category: "electronics" },
  { name: "Embedded Systems", category: "electronics" },
  { name: "VHDL/Verilog", category: "electronics" },
  { name: "PCB Design", category: "electronics" },
  { name: "Signal Processing", category: "electronics" },
  { name: "IoT", category: "electronics" },

  // Engineering
  { name: "AutoCAD", category: "engineering" },
  { name: "SolidWorks", category: "engineering" },
  { name: "Structural Analysis", category: "engineering" },
  { name: "BIM/Revit", category: "engineering" },
  { name: "GIS", category: "engineering" },
  { name: "3D Modeling", category: "engineering" },
  { name: "FEA/CFD Simulation", category: "engineering" },
  { name: "Thermodynamics", category: "engineering" },

  // Architecture & Design
  { name: "SketchUp", category: "architecture" },
  { name: "Adobe Creative Suite", category: "architecture" },
  { name: "Architectural Design", category: "architecture" },
  { name: "Urban Planning", category: "architecture" },

  // Law
  { name: "Legal Research", category: "law" },
  { name: "Contract Drafting", category: "law" },
  { name: "Compliance", category: "law" },
  { name: "Legal Writing", category: "law" },

  // Economics & Business
  { name: "Financial Analysis", category: "economics" },
  { name: "Econometrics", category: "economics" },
  { name: "Accounting", category: "economics" },
  { name: "Business Intelligence", category: "economics" },
  { name: "Excel/VBA", category: "economics" },
  { name: "Tableau", category: "economics" },

  // Humanities & Languages
  { name: "Content Writing", category: "humanities" },
  { name: "Translation", category: "humanities" },
  { name: "Editing", category: "humanities" },
  { name: "Localization", category: "humanities" },
  { name: "Publishing", category: "humanities" },
  { name: "Digital Humanities", category: "humanities" },

  // General / Soft Skills
  { name: "Project Management", category: "general" },
  { name: "Technical Writing", category: "general" },
  { name: "Microsoft Office", category: "general" },
  { name: "Communication", category: "general" },
  { name: "Critical Thinking", category: "general" },
]

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function seedSkillTags(db: ReturnType<typeof drizzle>) {
  for (const entry of SEED_SKILL_TAGS) {
    const slug = toSlug(entry.name)
    const [existing] = await db
      .select({ id: skillTag.id })
      .from(skillTag)
      .where(eq(skillTag.slug, slug))
      .limit(1)

    if (!existing) {
      await db.insert(skillTag).values({
        id: randomUUID(),
        name: entry.name,
        slug,
        category: entry.category,
      })
      logger.info({ event: "skill_tag_seeded", name: entry.name })
    }
  }
}

/* ── Department data with skill mappings ── */

/**
 * Each department maps to the skill names (from SEED_SKILL_TAGS) that are
 * relevant for students in that department. Students see these skills when
 * selecting their competencies during onboarding.
 */
const SEED_DEPARTMENTS: Record<string, string[]> = {
  "Computer Science": [
    // Frontend
    "React",
    "Angular",
    "Vue.js",
    "HTML/CSS",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    // Backend
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
    "FastAPI",
    // Languages
    "Python",
    "Java",
    "C/C++",
    "PHP",
    "Go",
    "Rust",
    "C#",
    // Database
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQLite",
    // DevOps
    "Docker",
    "Kubernetes",
    "Git",
    "CI/CD",
    "Linux",
    "AWS",
    // Mobile
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    // Data & AI
    "Machine Learning",
    "Data Science",
    "TensorFlow",
    "PyTorch",
    // Software Engineering
    "REST API",
    "GraphQL",
    "Microservices",
    "Agile/Scrum",
    // General
    "Project Management",
    "Technical Writing",
    "Git",
  ],
  Mathematics: [
    "Python",
    "R",
    "MATLAB",
    "Statistical Analysis",
    "LaTeX",
    "Numerical Methods",
    "Machine Learning",
    "Data Science",
    "TensorFlow",
    "PyTorch",
    "PostgreSQL",
    "SQLite",
    "Data Visualization",
    "Research Methods",
    "Scientific Writing",
    "Technical Writing",
  ],
  Physics: [
    "Python",
    "C/C++",
    "MATLAB",
    "LaTeX",
    "Numerical Methods",
    "Data Science",
    "Data Visualization",
    "Statistical Analysis",
    "Lab Techniques",
    "Research Methods",
    "Scientific Writing",
    "Signal Processing",
    "Linux",
  ],
  Chemistry: [
    "Python",
    "R",
    "MATLAB",
    "LaTeX",
    "Lab Techniques",
    "Research Methods",
    "Scientific Writing",
    "Data Visualization",
    "Statistical Analysis",
    "Microsoft Office",
    "Technical Writing",
  ],
  Biology: [
    "Python",
    "R",
    "MATLAB",
    "LaTeX",
    "Lab Techniques",
    "Research Methods",
    "Scientific Writing",
    "Data Science",
    "Data Visualization",
    "Statistical Analysis",
    "Microsoft Office",
    "Technical Writing",
  ],
  Electronics: [
    "C/C++",
    "Python",
    "MATLAB",
    "Arduino",
    "Embedded Systems",
    "VHDL/Verilog",
    "PCB Design",
    "Signal Processing",
    "IoT",
    "Linux",
    "Git",
    "Lab Techniques",
    "Research Methods",
    "Technical Writing",
    "AutoCAD",
    "3D Modeling",
  ],
  Law: [
    "Legal Research",
    "Contract Drafting",
    "Compliance",
    "Legal Writing",
    "Research Methods",
    "Critical Thinking",
    "Microsoft Office",
    "Communication",
    "Project Management",
    "Content Writing",
    "Editing",
  ],
  Economics: [
    "Python",
    "R",
    "Excel/VBA",
    "Financial Analysis",
    "Econometrics",
    "Accounting",
    "Business Intelligence",
    "Tableau",
    "Statistical Analysis",
    "Data Visualization",
    "Data Science",
    "Microsoft Office",
    "Project Management",
    "Communication",
  ],
  Literature: [
    "Content Writing",
    "Editing",
    "Publishing",
    "Translation",
    "Digital Humanities",
    "Research Methods",
    "Microsoft Office",
    "Communication",
    "Critical Thinking",
    "LaTeX",
  ],
  "Foreign Languages": [
    "Translation",
    "Localization",
    "Content Writing",
    "Editing",
    "Communication",
    "Digital Humanities",
    "Microsoft Office",
    "Publishing",
    "Critical Thinking",
    "Research Methods",
  ],
  History: [
    "Research Methods",
    "Digital Humanities",
    "Scientific Writing",
    "Data Visualization",
    "Content Writing",
    "Editing",
    "Microsoft Office",
    "Communication",
    "Critical Thinking",
    "LaTeX",
  ],
  "Political Science": [
    "Research Methods",
    "Data Visualization",
    "Statistical Analysis",
    "Content Writing",
    "Critical Thinking",
    "Communication",
    "Microsoft Office",
    "Project Management",
    "Python",
    "R",
    "Excel/VBA",
  ],
  "Civil Engineering": [
    "AutoCAD",
    "BIM/Revit",
    "Structural Analysis",
    "GIS",
    "3D Modeling",
    "MATLAB",
    "Python",
    "C/C++",
    "FEA/CFD Simulation",
    "Project Management",
    "Microsoft Office",
    "Technical Writing",
    "LaTeX",
  ],
  "Mechanical Engineering": [
    "SolidWorks",
    "AutoCAD",
    "3D Modeling",
    "FEA/CFD Simulation",
    "Thermodynamics",
    "MATLAB",
    "Python",
    "C/C++",
    "Embedded Systems",
    "Arduino",
    "Project Management",
    "Technical Writing",
    "LaTeX",
  ],
  Architecture: [
    "AutoCAD",
    "SketchUp",
    "BIM/Revit",
    "3D Modeling",
    "Adobe Creative Suite",
    "Architectural Design",
    "Urban Planning",
    "GIS",
    "Project Management",
    "Microsoft Office",
    "Communication",
  ],
}

async function seedDepartments(db: ReturnType<typeof drizzle>) {
  const [uni] = await db
    .select({ id: university.id })
    .from(university)
    .where(eq(university.name, "University Of Constantine 2"))
    .limit(1)

  if (!uni) {
    logger.warn({
      event: "department_seed_skipped",
      reason: "university not found",
    })
    return
  }

  for (const name of Object.keys(SEED_DEPARTMENTS)) {
    const [existing] = await db
      .select({ id: department.id })
      .from(department)
      .where(eq(department.name, name))
      .limit(1)

    if (!existing) {
      await db.insert(department).values({
        id: randomUUID(),
        universityId: uni.id,
        name,
      })
      logger.info({ event: "department_seeded", name })
    }
  }
}

async function seedDepartmentSkills(db: ReturnType<typeof drizzle>) {
  // Build a slug→id lookup for all skill tags
  const allSkills = await db
    .select({ id: skillTag.id, slug: skillTag.slug, name: skillTag.name })
    .from(skillTag)
  const skillByName = new Map(allSkills.map((s) => [s.name, s.id]))

  // Build a name→id lookup for all departments
  const allDepts = await db
    .select({ id: department.id, name: department.name })
    .from(department)
  const deptByName = new Map(allDepts.map((d) => [d.name, d.id]))

  for (const [deptName, skillNames] of Object.entries(SEED_DEPARTMENTS)) {
    const deptId = deptByName.get(deptName)
    if (!deptId) continue

    const uniqueSkillNames = [...new Set(skillNames)]
    let seeded = 0

    for (const skillName of uniqueSkillNames) {
      const skillId = skillByName.get(skillName)
      if (!skillId) {
        logger.warn({
          event: "department_skill_skip",
          deptName,
          skillName,
          reason: "skill not found",
        })
        continue
      }

      // onConflictDoNothing skips if the (departmentId, skillTagId) pair already exists
      await db
        .insert(departmentSkill)
        .values({ departmentId: deptId, skillTagId: skillId })
        .onConflictDoNothing()

      seeded++
    }

    if (seeded > 0) {
      logger.info({
        event: "department_skills_seeded",
        department: deptName,
        count: seeded,
      })
    }
  }
}

const DEFAULT_SEED_ADMIN_NAME = "Seed Super Admin"

interface SeedAdminCredentials {
  email: string
  password: string
  name: string
}

function getSeedAdminCredentials(): SeedAdminCredentials | null {
  const email =
    process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || "admin@stag.dz"
  const password = process.env.SEED_ADMIN_PASSWORD?.trim() || "password123"

  if (!email || !password) {
    logger.warn({
      event: "admin_seed_skipped",
      reason: "incomplete seed admin credentials",
      hasEmail: Boolean(email),
      hasPassword: Boolean(password),
    })
    return null
  }

  return {
    email,
    password,
    name: DEFAULT_SEED_ADMIN_NAME,
  }
}

async function seedSuperAdmin(db: ReturnType<typeof drizzle>) {
  const credentials = getSeedAdminCredentials()
  if (!credentials) {
    return
  }

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, credentials.email))
    .limit(1)

  if (existing) {
    logger.info({ event: "admin_exists", email: credentials.email })
    return
  }

  const created = await auth.api.createUser({
    body: {
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
      role: "super_admin",
      data: {
        emailVerified: true,
      },
    },
  })

  await db
    .update(user)
    .set({ onboardingCompleted: true })
    .where(eq(user.id, created.user.id))

  logger.info({
    event: "admin_seeded",
    email: credentials.email,
    role: "super_admin",
  })
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client, { schema })

  // ── Seed built-in universities ──
  for (const entry of SEED_UNIVERSITIES) {
    await seedUniversity(db, entry)
  }

  // ── Seed env-based university (optional extra) ──
  const envDomains = parseDomains(process.env.SEED_UNIVERSITY_DOMAINS)
  if (envDomains.length > 0) {
    const envName =
      process.env.SEED_UNIVERSITY_NAME?.trim() || "Example University"
    await seedUniversity(db, { name: envName, domains: envDomains })
  }

  // ── Seed departments ──
  await seedDepartments(db)

  // ── Seed skill tags ──
  await seedSkillTags(db)

  // ── Seed department ↔ skill links ──
  await seedDepartmentSkills(db)

  // ── Seed super_admin user ──
  await seedSuperAdmin(db)

  await client.end({ timeout: 5 })
}

// Only run main if this file is executed directly (not imported)
if (import.meta.main) {
  main()
    .then(() => {
      logger.info({ event: "seed_complete" })
    })
    .catch((err) => {
      logger.error({ err, event: "seed_failed" }, "Database seeding failed")
      process.exitCode = 1
    })
}
