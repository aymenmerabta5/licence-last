import { randomBytes, randomUUID, scryptSync } from "node:crypto"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { skillCategory, skillTag } from "@/server/db/schema"

const logger = console
const DEFAULT_SEED_UNIVERSITY_ADMIN_NAME = "Seed University Admin"
const DEFAULT_SEED_UNIVERSITY_ADMIN_UNIVERSITY_NAME =
  "University Of Constantine 2"
const DEFAULT_SEED_ADMIN_NAME = "Seed Super Admin"
const BETTER_AUTH_SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

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

type SeedDb = ReturnType<typeof postgres>
type SeedUniversity = { name: string; domains: string[] }

const SEED_UNIVERSITIES: SeedUniversity[] = [
  {
    name: "University Of Constantine 2",
    domains: ["univ-constantine2.dz"],
  },
]

async function seedUniversity(db: SeedDb, entry: SeedUniversity) {
  const universityRows = await db<{ id: string }[]>`
    select id
    from "university"
    where "name" = ${entry.name}
    limit 1
  `

  const universityId = universityRows[0]?.id ?? randomUUID()

  if (!universityRows[0]) {
    await db`
      insert into "university" ("id", "name")
      values (${universityId}, ${entry.name})
    `
    logger.info({ event: "university_seeded", name: entry.name })
  }

  for (const domain of entry.domains) {
    const domainRows = await db<{ id: string; status: string }[]>`
      select id, status
      from "university_domain"
      where "domain" = ${domain}
      limit 1
    `

    const existingDomain = domainRows[0]

    if (!existingDomain) {
      await db`
        insert into "university_domain" ("id", "university_id", "domain", "status")
        values (${randomUUID()}, ${universityId}, ${domain}, ${"approved"})
      `
      logger.info({ event: "domain_approved", domain })
      continue
    }

    if (existingDomain.status !== "approved") {
      await db`
        update "university_domain"
        set
          "status" = ${"approved"},
          "university_id" = ${universityId}
        where "id" = ${existingDomain.id}
      `
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

async function seedSkillCategories(db: SeedDb) {
  const drizzleDb = drizzle(db, { schema: { skillCategory, skillTag } })

  const uniqueCategories = Array.from(
    new Set(SEED_SKILL_TAGS.map((entry) => entry.category)),
  )

  const categoryValues = uniqueCategories.map((name) => ({
    name,
    slug: toSlug(name),
  }))

  if (categoryValues.length > 0) {
    await drizzleDb
      .insert(skillCategory)
      .values(categoryValues)
      .onConflictDoNothing({ target: skillCategory.slug })

    logger.info({
      event: "skill_categories_seeded",
      count: categoryValues.length,
    })
  }
}

async function seedSkillTags(db: SeedDb) {
  const drizzleDb = drizzle(db, { schema: { skillCategory, skillTag } })

  const categories = await drizzleDb.select().from(skillCategory)
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  const values = SEED_SKILL_TAGS.map((entry) => {
    const slug = toSlug(entry.name)
    const categorySlug = toSlug(entry.category)
    const categoryId = categoryIdBySlug.get(categorySlug)

    if (!categoryId) {
      logger.warn({
        event: "skill_tag_skip",
        name: entry.name,
        reason: `category not found for slug: ${categorySlug}`,
      })
      return null
    }

    return {
      id: randomUUID(),
      name: entry.name,
      slug,
      category: entry.category,
      categoryId,
    }
  }).filter((v): v is NonNullable<typeof v> => v !== null)

  if (values.length > 0) {
    const result = await drizzleDb
      .insert(skillTag)
      .values(values)
      .onConflictDoNothing({ target: skillTag.slug })
      .returning()

    for (const row of result) {
      logger.info({ event: "skill_tag_seeded", name: row.name })
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

async function seedDepartments(db: SeedDb) {
  const universityRows = await db<{ id: string }[]>`
    select id
    from "university"
    where "name" = ${"University Of Constantine 2"}
    limit 1
  `

  const seededUniversity = universityRows[0]

  if (!seededUniversity) {
    logger.warn({
      event: "department_seed_skipped",
      reason: "university not found",
    })
    return
  }

  for (const name of Object.keys(SEED_DEPARTMENTS)) {
    const departmentRows = await db<{ id: string }[]>`
      select id
      from "department"
      where "name" = ${name}
        and "university_id" = ${seededUniversity.id}
      limit 1
    `

    if (!departmentRows[0]) {
      await db`
        insert into "department" ("id", "university_id", "name")
        values (${randomUUID()}, ${seededUniversity.id}, ${name})
      `
      logger.info({ event: "department_seeded", name })
    }
  }
}

async function seedDepartmentSkills(db: SeedDb) {
  const allSkills = await db<{ id: string; name: string; slug: string }[]>`
    select id, name, slug
    from "skill_tag"
  `
  const skillByName = new Map(allSkills.map((skill) => [skill.name, skill.id]))

  const allDepartments = await db<{ id: string; name: string }[]>`
    select id, name
    from "department"
  `
  const departmentByName = new Map(
    allDepartments.map((department) => [department.name, department.id]),
  )

  for (const [departmentName, skillNames] of Object.entries(SEED_DEPARTMENTS)) {
    const departmentId = departmentByName.get(departmentName)
    if (!departmentId) continue

    const uniqueSkillNames = [...new Set(skillNames)]
    let seeded = 0

    for (const skillName of uniqueSkillNames) {
      const skillId = skillByName.get(skillName)

      if (!skillId) {
        logger.warn({
          event: "department_skill_skip",
          deptName: departmentName,
          skillName,
          reason: "skill not found",
        })
        continue
      }

      await db`
        insert into "department_skill" ("department_id", "skill_tag_id")
        values (${departmentId}, ${skillId})
        on conflict ("department_id", "skill_tag_id") do nothing
      `

      seeded++
    }

    if (seeded > 0) {
      logger.info({
        event: "department_skills_seeded",
        department: departmentName,
        count: seeded,
      })
    }
  }
}

interface SeedAdminCredentials {
  email: string
  password: string
  name: string
}

function getSeedAdminCredentials(): SeedAdminCredentials | null {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD?.trim()

  if (!email || !password) {
    logger.warn(
      [
        "",
        "╔══════════════════════════════════════════════════════════════════╗",
        "║  WARNING: Super admin seed skipped                               ║",
        "╠══════════════════════════════════════════════════════════════════╣",
        "║  Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env            ║",
        "║  to create a super admin account on fresh databases.             ║",
        "╚══════════════════════════════════════════════════════════════════╝",
      ].join("\n"),
    )
    return null
  }

  return {
    email,
    password,
    name: DEFAULT_SEED_ADMIN_NAME,
  }
}

function getSeedUniversityAdminCredentials(): SeedAdminCredentials | null {
  const email = process.env.SEED_UNIVERSITY_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_UNIVERSITY_ADMIN_PASSWORD?.trim()

  if (!email || !password) {
    logger.warn({
      event: "university_admin_seed_skipped",
      reason: "incomplete seed university admin credentials",
      hasEmail: Boolean(email),
      hasPassword: Boolean(password),
    })
    return null
  }

  return {
    email,
    password,
    name: DEFAULT_SEED_UNIVERSITY_ADMIN_NAME,
  }
}

function hashSeedPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const key = scryptSync(
    password.normalize("NFKC"),
    salt,
    BETTER_AUTH_SCRYPT_CONFIG.dkLen,
    {
      N: BETTER_AUTH_SCRYPT_CONFIG.N,
      r: BETTER_AUTH_SCRYPT_CONFIG.r,
      p: BETTER_AUTH_SCRYPT_CONFIG.p,
      maxmem:
        128 * BETTER_AUTH_SCRYPT_CONFIG.N * BETTER_AUTH_SCRYPT_CONFIG.r * 2,
    },
  )

  return `${salt}:${key.toString("hex")}`
}

async function ensureCredentialAccount(
  db: SeedDb,
  userId: string,
  email: string,
  password: string,
  events: {
    linked: string
    repaired: string
  },
) {
  const credentialAccountRows = await db<
    { id: string; password: string | null }[]
  >`
    select id, password
    from "account"
    where "user_id" = ${userId}
      and "provider_id" = ${"credential"}
    limit 1
  `

  const credentialAccount = credentialAccountRows[0]

  if (!credentialAccount) {
    await db`
      insert into "account" (
        "id",
        "account_id",
        "provider_id",
        "user_id",
        "password",
        "updated_at"
      )
      values (
        ${randomUUID()},
        ${userId},
        ${"credential"},
        ${userId},
        ${hashSeedPassword(password)},
        ${new Date().toISOString()}
      )
    `
    logger.info({
      event: events.linked,
      email,
    })
    return
  }

  if (!credentialAccount.password) {
    await db`
      update "account"
      set
        "password" = ${hashSeedPassword(password)},
        "updated_at" = ${new Date().toISOString()}
      where "id" = ${credentialAccount.id}
    `
    logger.info({
      event: events.repaired,
      email,
    })
  }
}

async function seedLinkedUniversityAdmin(db: SeedDb) {
  const credentials = getSeedUniversityAdminCredentials()
  if (!credentials) {
    return
  }

  const targetUniversityName =
    process.env.SEED_UNIVERSITY_ADMIN_UNIVERSITY_NAME?.trim() ||
    DEFAULT_SEED_UNIVERSITY_ADMIN_UNIVERSITY_NAME

  const universityRows = await db<{ id: string }[]>`
    select id
    from "university"
    where "name" = ${targetUniversityName}
    limit 1
  `

  const universityId = universityRows[0]?.id

  if (!universityId) {
    logger.warn({
      event: "university_admin_seed_skipped",
      reason: "target university not found",
      email: credentials.email,
      universityName: targetUniversityName,
    })
    return
  }

  const userRows = await db<{ id: string }[]>`
    select id
    from "user"
    where "email" = ${credentials.email}
    limit 1
  `

  const existingUserId = userRows[0]?.id
  const userId = existingUserId ?? randomUUID()

  if (!existingUserId) {
    await db`
      insert into "user" (
        "id",
        "email",
        "email_verified",
        "role",
        "university_id",
        "department_id",
        "onboarding_completed",
        "name"
      )
      values (
        ${userId},
        ${credentials.email},
        ${true},
        ${"university_admin"},
        ${universityId},
        ${null},
        ${true},
        ${credentials.name}
      )
    `
    logger.info({
      event: "university_admin_seeded",
      email: credentials.email,
      role: "university_admin",
      universityName: targetUniversityName,
    })
  } else {
    await db`
      update "user"
      set
        "role" = ${"university_admin"},
        "university_id" = ${universityId},
        "department_id" = ${null},
        "email_verified" = ${true},
        "onboarding_completed" = ${true}
      where "id" = ${userId}
    `
    logger.info({
      event: "university_admin_ensured",
      email: credentials.email,
      role: "university_admin",
      universityName: targetUniversityName,
    })
  }

  await ensureCredentialAccount(
    db,
    userId,
    credentials.email,
    credentials.password,
    {
      linked: "university_admin_credential_linked",
      repaired: "university_admin_credential_repaired",
    },
  )
}

async function seedSuperAdmin(db: SeedDb) {
  const credentials = getSeedAdminCredentials()
  if (!credentials) {
    return
  }

  const userRows = await db<{ id: string }[]>`
    select id
    from "user"
    where "email" = ${credentials.email}
    limit 1
  `

  const existingUserId = userRows[0]?.id
  const userId = existingUserId ?? randomUUID()

  if (!existingUserId) {
    await db`
      insert into "user" (
        "id",
        "email",
        "email_verified",
        "role",
        "onboarding_completed",
        "name"
      )
      values (
        ${userId},
        ${credentials.email},
        ${true},
        ${"super_admin"},
        ${true},
        ${credentials.name}
      )
    `
    logger.info({
      event: "admin_seeded",
      email: credentials.email,
      role: "super_admin",
    })
  } else {
    await db`
      update "user"
      set
        "role" = ${"super_admin"},
        "email_verified" = ${true},
        "onboarding_completed" = ${true}
      where "id" = ${userId}
    `
    logger.info({
      event: "admin_ensured",
      email: credentials.email,
      role: "super_admin",
    })
  }

  await ensureCredentialAccount(
    db,
    userId,
    credentials.email,
    credentials.password,
    {
      linked: "admin_credential_linked",
      repaired: "admin_credential_repaired",
    },
  )
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  const db = postgres(databaseUrl, {
    max: 1,
    prepare: false,
  })

  try {
    logger.info("[seed] Starting base seed...")

    for (const entry of SEED_UNIVERSITIES) {
      await seedUniversity(db, entry)
    }

    const envDomains = parseDomains(process.env.SEED_UNIVERSITY_DOMAINS)
    if (envDomains.length > 0) {
      const envName =
        process.env.SEED_UNIVERSITY_NAME?.trim() || "Example University"
      await seedUniversity(db, { name: envName, domains: envDomains })
    }

    await seedDepartments(db)
    await seedSkillCategories(db)
    await seedSkillTags(db)
    await seedDepartmentSkills(db)
    await seedLinkedUniversityAdmin(db)
    await seedSuperAdmin(db)

    // Summary
    const uniCount = await db<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM university`
    const deptCount = await db<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM department`
    const skillCount = await db<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM skill_tag`
    const userCount = await db<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM "user"`

    logger.info(
      [
        "",
        "╔══════════════════════════════════════════════════════════════════╗",
        "║  BASE SEED COMPLETE                                              ║",
        "╠══════════════════════════════════════════════════════════════════╣",
        `║  Universities: ${String(uniCount[0]?.count ?? 0).padEnd(47)}║`,
        `║  Departments:  ${String(deptCount[0]?.count ?? 0).padEnd(47)}║`,
        `║  Skill tags:   ${String(skillCount[0]?.count ?? 0).padEnd(47)}║`,
        `║  Users:        ${String(userCount[0]?.count ?? 0).padEnd(47)}║`,
        "╚══════════════════════════════════════════════════════════════════╝",
      ].join("\n"),
    )
  } finally {
    await db.end({ timeout: 5 })
  }
}

if (import.meta.main) {
  main()
    .then(() => {
      logger.info({ event: "seed_complete" }, "[seed] Done")
    })
    .catch((err) => {
      logger.error({ err, event: "seed_failed" }, "[seed] Database seeding failed")
      process.exitCode = 1
    })
}
