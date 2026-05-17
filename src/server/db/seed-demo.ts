import { randomBytes, randomUUID, scryptSync } from "node:crypto"
import { faker } from "@faker-js/faker"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { skillCategory, skillTag } from "@/server/db/schema"

const logger = console
const DEMO_PASSWORD = "DemoPass123!"
const BETTER_AUTH_SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
}

/* ──────────────────────────── Types ──────────────────────────── */

type SeedDb = ReturnType<typeof postgres>

interface UniversityDef {
  name: string
  abbreviation: string
  city: string
  wilayaCode: number
  domain: string
  departments: string[]
}

interface CreatedUser {
  id: string
  email: string
  name: string
  role: string
}

interface SeedState {
  universities: { id: string; def: UniversityDef }[]
  departments: { id: string; name: string; universityId: string }[]
  fields: { id: string; name: string }[]
  skillCategories: { id: number; name: string; slug: string }[]
  skillTags: { id: string; name: string; slug: string; category: string }[]
  users: CreatedUser[]
  companies: { id: string; name: string; slug: string }[]
  offers: { id: string; companyId: string; title: string }[]
  applications: {
    id: string
    studentUserId: string
    offerId: string
    pipelineStage: string
  }[]
}

/* ──────────────────────────── Demo Data ──────────────────────────── */

const DEMO_UNIVERSITIES: UniversityDef[] = [
  {
    name: "University Of Constantine 2",
    abbreviation: "UC2",
    city: "Constantine",
    wilayaCode: 25,
    domain: "univ-constantine2.dz",
    departments: ["Computer Science", "Mathematics", "Physics"],
  },
  {
    name: "University Of Algiers 1",
    abbreviation: "UA1",
    city: "Algiers",
    wilayaCode: 16,
    domain: "univ-algiers.dz",
    departments: ["Chemistry", "Biology", "Law"],
  },
  {
    name: "University Of Oran 1",
    abbreviation: "UO1",
    city: "Oran",
    wilayaCode: 31,
    domain: "univ-oran.dz",
    departments: ["Economics", "Literature", "Foreign Languages"],
  },
  {
    name: "ESI Algiers",
    abbreviation: "ESI",
    city: "Algiers",
    wilayaCode: 16,
    domain: "esi.dz",
    departments: ["Computer Science", "Electronics", "Political Science"],
  },
  {
    name: "University Of Annaba",
    abbreviation: "UAN",
    city: "Annaba",
    wilayaCode: 23,
    domain: "univ-annaba.dz",
    departments: [
      "Civil Engineering",
      "Mechanical Engineering",
      "Architecture",
    ],
  },
]

const DEMO_COMPANIES = [
  { name: "Sonelgaz", slug: "sonelgaz", wilayaCode: 16, type: "pfe" as const },
  {
    name: "Ooredoo Algeria",
    slug: "ooredoo-algeria",
    wilayaCode: 31,
    type: "pfe" as const,
  },
  {
    name: "Djezzy",
    slug: "djezzy",
    wilayaCode: 16,
    type: "immersion" as const,
  },
  {
    name: "Condor Electronics",
    slug: "condor-electronics",
    wilayaCode: 25,
    type: "pfe" as const,
  },
  { name: "Cevital", slug: "cevital", wilayaCode: 31, type: "summer" as const },
  {
    name: "Atos Algeria",
    slug: "atos-algeria",
    wilayaCode: 16,
    type: "pfe" as const,
  },
  {
    name: "Emploitic",
    slug: "emploitic",
    wilayaCode: 16,
    type: "practical" as const,
  },
  { name: "SaaS DZ", slug: "saas-dz", wilayaCode: 25, type: "pfe" as const },
  {
    name: "DevTeam Oran",
    slug: "devteam-oran",
    wilayaCode: 31,
    type: "immersion" as const,
  },
  {
    name: "TechStart Annaba",
    slug: "techstart-annaba",
    wilayaCode: 23,
    type: "pfe" as const,
  },
]

const DEMO_FIELDS = [
  { name: "Software Engineering", slug: "software-engineering" },
  { name: "Data Science", slug: "data-science" },
  { name: "Embedded Systems", slug: "embedded-systems" },
  { name: "Civil Engineering", slug: "civil-engineering" },
  { name: "Business Administration", slug: "business-administration" },
  { name: "Law & Policy", slug: "law-policy" },
  { name: "Natural Sciences", slug: "natural-sciences" },
  { name: "Architecture", slug: "architecture" },
]

const SEED_SKILL_TAGS: { name: string; category: string }[] = [
  { name: "React", category: "frontend" },
  { name: "Angular", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "HTML/CSS", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "Flask", category: "backend" },
  { name: "Spring Boot", category: "backend" },
  { name: "Laravel", category: "backend" },
  { name: "FastAPI", category: "backend" },
  { name: "Python", category: "languages" },
  { name: "Java", category: "languages" },
  { name: "C/C++", category: "languages" },
  { name: "PHP", category: "languages" },
  { name: "Go", category: "languages" },
  { name: "Rust", category: "languages" },
  { name: "C#", category: "languages" },
  { name: "PostgreSQL", category: "database" },
  { name: "MySQL", category: "database" },
  { name: "MongoDB", category: "database" },
  { name: "Redis", category: "database" },
  { name: "SQLite", category: "database" },
  { name: "Docker", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "Git", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Linux", category: "devops" },
  { name: "AWS", category: "devops" },
  { name: "React Native", category: "mobile" },
  { name: "Flutter", category: "mobile" },
  { name: "Swift", category: "mobile" },
  { name: "Kotlin", category: "mobile" },
  { name: "Machine Learning", category: "data_ai" },
  { name: "Data Science", category: "data_ai" },
  { name: "TensorFlow", category: "data_ai" },
  { name: "PyTorch", category: "data_ai" },
  { name: "REST API", category: "software_engineering" },
  { name: "GraphQL", category: "software_engineering" },
  { name: "Microservices", category: "software_engineering" },
  { name: "Agile/Scrum", category: "software_engineering" },
  { name: "R", category: "math_stats" },
  { name: "MATLAB", category: "math_stats" },
  { name: "Statistical Analysis", category: "math_stats" },
  { name: "LaTeX", category: "math_stats" },
  { name: "Numerical Methods", category: "math_stats" },
  { name: "Lab Techniques", category: "science" },
  { name: "Scientific Writing", category: "science" },
  { name: "Research Methods", category: "science" },
  { name: "Data Visualization", category: "science" },
  { name: "Arduino", category: "electronics" },
  { name: "Embedded Systems", category: "electronics" },
  { name: "VHDL/Verilog", category: "electronics" },
  { name: "PCB Design", category: "electronics" },
  { name: "Signal Processing", category: "electronics" },
  { name: "IoT", category: "electronics" },
  { name: "AutoCAD", category: "engineering" },
  { name: "SolidWorks", category: "engineering" },
  { name: "Structural Analysis", category: "engineering" },
  { name: "BIM/Revit", category: "engineering" },
  { name: "GIS", category: "engineering" },
  { name: "3D Modeling", category: "engineering" },
  { name: "FEA/CFD Simulation", category: "engineering" },
  { name: "Thermodynamics", category: "engineering" },
  { name: "SketchUp", category: "architecture" },
  { name: "Adobe Creative Suite", category: "architecture" },
  { name: "Architectural Design", category: "architecture" },
  { name: "Urban Planning", category: "architecture" },
  { name: "Legal Research", category: "law" },
  { name: "Contract Drafting", category: "law" },
  { name: "Compliance", category: "law" },
  { name: "Legal Writing", category: "law" },
  { name: "Financial Analysis", category: "economics" },
  { name: "Econometrics", category: "economics" },
  { name: "Accounting", category: "economics" },
  { name: "Business Intelligence", category: "economics" },
  { name: "Excel/VBA", category: "economics" },
  { name: "Tableau", category: "economics" },
  { name: "Content Writing", category: "humanities" },
  { name: "Translation", category: "humanities" },
  { name: "Editing", category: "humanities" },
  { name: "Localization", category: "humanities" },
  { name: "Publishing", category: "humanities" },
  { name: "Digital Humanities", category: "humanities" },
  { name: "Project Management", category: "general" },
  { name: "Technical Writing", category: "general" },
  { name: "Microsoft Office", category: "general" },
  { name: "Communication", category: "general" },
  { name: "Critical Thinking", category: "general" },
]

const DEPARTMENT_SKILL_MAP: Record<string, string[]> = {
  "Computer Science": [
    "React",
    "Angular",
    "Vue.js",
    "HTML/CSS",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring Boot",
    "Laravel",
    "FastAPI",
    "Python",
    "Java",
    "C/C++",
    "PHP",
    "Go",
    "Rust",
    "C#",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Docker",
    "Kubernetes",
    "Git",
    "CI/CD",
    "Linux",
    "AWS",
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "Machine Learning",
    "Data Science",
    "TensorFlow",
    "PyTorch",
    "REST API",
    "GraphQL",
    "Microservices",
    "Agile/Scrum",
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

const OFFER_TITLE_PREFIXES = [
  "Software Engineering",
  "Full Stack",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Data Science",
  "Machine Learning",
  "QA/Testing",
  "Cloud",
  "Cybersecurity",
  "Embedded Systems",
  "UI/UX Design",
  "Product Management",
  "Network Engineering",
  "Database Administration",
  "Business Intelligence",
  "Technical Writing",
  "System Administration",
  "Research",
]

const OFFER_TITLE_SUFFIXES = [
  "Intern",
  "Internship",
  "End-of-Study Internship",
  "PFE Internship",
  "Summer Intern",
  "Immersion Program",
  "Practical Training",
]

const ALGERIAN_WILAYA_CODES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48,
]

const _PIPELINE_STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "accepted",
  "validated",
  "rejected",
] as const
const _APPLICATION_STATUSES = [
  "applied",
  "company_accepted",
  "company_refused",
  "admin_validated",
  "admin_rejected",
  "withdrawn",
] as const
const INTERNSHIP_TYPES = ["pfe", "immersion", "summer", "practical"] as const
const WORK_MODES = ["on_site", "hybrid", "remote"] as const
const _LANGUAGE_CODES = ["ar", "fr", "en", "es", "de"] as const
const _PROFICIENCY_LEVELS = [
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
  "native",
] as const

/* ──────────────────────────── Helpers ──────────────────────────── */

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function hashPassword(password: string): string {
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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function formatDateISO(d: Date): string {
  return d.toISOString()
}

async function batchInsert(
  db: SeedDb,
  table: string,
  rows: Record<string, unknown>[],
) {
  if (rows.length === 0) return
  const columns = Object.keys(rows[0])
  let paramIdx = 1
  const placeholders: string[] = []
  const values: unknown[] = []

  for (const row of rows) {
    const rowPlaceholders: string[] = []
    for (const col of columns) {
      rowPlaceholders.push(`$${paramIdx++}`)
      values.push(row[col])
    }
    placeholders.push(`(${rowPlaceholders.join(", ")})`)
  }

  const sql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING`
  await db.unsafe(sql, values as never[])
}

/* ──────────────────────────── Seed Phases ──────────────────────────── */

async function seedUniversities(db: SeedDb, state: SeedState) {
  const rows = DEMO_UNIVERSITIES.map((u) => ({
    id: randomUUID(),
    name: u.name,
    abbreviation: u.abbreviation,
    address: `${u.city}, Algeria`,
    city: u.city,
    wilaya_code: u.wilayaCode,
    phone: `+213 ${randomInt(21, 38)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
    logo_url: null,
    department_name: null,
    status: "approved",
    approved_at: formatDateISO(new Date()),
    approved_by_user_id: null,
    rejection_reason: null,
    created_at: formatDateISO(new Date()),
    updated_at: formatDateISO(new Date()),
  }))

  await batchInsert(db, "university", rows)

  // Fetch inserted IDs
  const all = await db<
    { id: string; name: string }[]
  >`SELECT id, name FROM university`
  for (const u of DEMO_UNIVERSITIES) {
    const found = all.find((a) => a.name === u.name)
    if (found) {
      state.universities.push({ id: found.id, def: u })
    }
  }

  // Insert domains for approved universities
  const domainRows = state.universities.map((u) => ({
    id: randomUUID(),
    university_id: u.id,
    domain: u.def.domain,
    status: "approved",
    created_at: formatDateISO(new Date()),
    updated_at: formatDateISO(new Date()),
  }))
  await batchInsert(db, "university_domain", domainRows)

  // ── Incomplete universities (onboarding not finished) ──
  const incompleteUnis = [
    {
      name: "University Of Batna 2",
      abbreviation: "UB2",
      city: "Batna",
      wilayaCode: 5,
      domain: "univ-batna2.dz",
    },
    {
      name: "University Of Tlemcen",
      abbreviation: "UT",
      city: "Tlemcen",
      wilayaCode: 13,
      domain: "univ-tlemcen.dz",
    },
  ]

  for (const u of incompleteUnis) {
    const id = randomUUID()
    await db`INSERT INTO "university" ("id", "name", "abbreviation", "address", "city", "wilaya_code", "phone", "logo_url", "department_name", "status", "approved_at", "approved_by_user_id", "rejection_reason", "created_at", "updated_at")
      VALUES (${id}, ${u.name}, ${u.abbreviation}, ${`${u.city}, Algeria`}, ${u.city}, ${u.wilayaCode}, ${`+213 ${randomInt(21, 38)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`}, null, null, ${"pending"}, null, null, null, ${formatDateISO(new Date())}, ${formatDateISO(new Date())})
      ON CONFLICT DO NOTHING`
  }

  // ── Pending universities (submitted, waiting for super admin approval) ──
  const pendingUniDefs: UniversityDef[] = [
    {
      name: "University Of Setif 1",
      abbreviation: "US1",
      city: "Setif",
      wilayaCode: 19,
      domain: "univ-setif.dz",
      departments: ["Physics", "Mathematics", "Computer Science"],
    },
    {
      name: "University Of Ouargla",
      abbreviation: "UO",
      city: "Ouargla",
      wilayaCode: 30,
      domain: "univ-ouargla.dz",
      departments: ["Chemistry", "Biology", "Economics"],
    },
  ]

  for (const u of pendingUniDefs) {
    const id = randomUUID()
    await db`INSERT INTO "university" ("id", "name", "abbreviation", "address", "city", "wilaya_code", "phone", "logo_url", "department_name", "status", "approved_at", "approved_by_user_id", "rejection_reason", "created_at", "updated_at")
      VALUES (${id}, ${u.name}, ${u.abbreviation}, ${`${u.city}, Algeria`}, ${u.city}, ${u.wilayaCode}, ${`+213 ${randomInt(21, 38)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`}, null, null, ${"pending"}, null, null, null, ${formatDateISO(new Date())}, ${formatDateISO(new Date())})
      ON CONFLICT DO NOTHING`

    await db`INSERT INTO "university_domain" ("id", "university_id", "domain", "status", "created_at", "updated_at")
      VALUES (${randomUUID()}, ${id}, ${u.domain}, ${"pending"}, ${formatDateISO(new Date())}, ${formatDateISO(new Date())})
      ON CONFLICT DO NOTHING`

    state.universities.push({ id, def: u })
  }

  logger.info({
    event: "universities_seeded",
    approved: DEMO_UNIVERSITIES.length,
    pending: pendingUniDefs.length,
    incomplete: incompleteUnis.length,
  })
}

async function seedFields(db: SeedDb, state: SeedState) {
  const rows = DEMO_FIELDS.map((f) => ({
    id: randomUUID(),
    name: f.name,
    slug: f.slug,
    description: faker.lorem.sentence(),
    created_at: formatDateISO(new Date()),
    updated_at: formatDateISO(new Date()),
  }))
  await batchInsert(db, "field", rows)

  const all = await db<
    { id: string; name: string }[]
  >`SELECT id, name FROM field`
  state.fields = all
  logger.info({ event: "fields_seeded", count: all.length })
}

async function seedDepartments(db: SeedDb, state: SeedState) {
  const fieldMap = new Map(state.fields.map((f) => [f.name, f.id]))

  for (const uni of state.universities) {
    for (const deptName of uni.def.departments) {
      const fieldName =
        deptName === "Computer Science"
          ? "Software Engineering"
          : deptName === "Electronics"
            ? "Embedded Systems"
            : deptName === "Civil Engineering" ||
                deptName === "Mechanical Engineering"
              ? "Civil Engineering"
              : deptName === "Architecture"
                ? "Architecture"
                : deptName === "Law"
                  ? "Law & Policy"
                  : deptName === "Economics" ||
                      deptName === "Business Administration"
                    ? "Business Administration"
                    : deptName === "Chemistry" ||
                        deptName === "Biology" ||
                        deptName === "Physics" ||
                        deptName === "Mathematics"
                      ? "Natural Sciences"
                      : "Software Engineering"

      const fieldId = fieldMap.get(fieldName) ?? null

      const id = randomUUID()
      await db`INSERT INTO "department" ("id", "university_id", "name", "field_id", "created_at", "updated_at")
        VALUES (${id}, ${uni.id}, ${deptName}, ${fieldId}, ${new Date().toISOString()}, ${new Date().toISOString()})
        ON CONFLICT DO NOTHING`

      state.departments.push({ id, name: deptName, universityId: uni.id })
    }
  }

  logger.info({ event: "departments_seeded", count: state.departments.length })
}

async function seedSkillCategoriesAndTags(db: SeedDb, state: SeedState) {
  const drizzleDb = drizzle(db, { schema: { skillCategory, skillTag } })

  const uniqueCategories = Array.from(
    new Set(SEED_SKILL_TAGS.map((e) => e.category)),
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
  }

  const categories = await drizzleDb.select().from(skillCategory)
  state.skillCategories = categories

  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]))
  type TagValue = {
    id: string
    name: string
    slug: string
    category: string
    categoryId: number
  }
  const tagValues = SEED_SKILL_TAGS.map((entry): TagValue | null => {
    const slug = toSlug(entry.name)
    const categorySlug = toSlug(entry.category)
    const categoryId = categoryIdBySlug.get(categorySlug)
    if (!categoryId) return null
    return {
      id: randomUUID(),
      name: entry.name,
      slug,
      category: entry.category,
      categoryId,
    }
  }).filter((v): v is TagValue => v !== null)

  if (tagValues.length > 0) {
    await drizzleDb
      .insert(skillTag)
      .values(tagValues)
      .onConflictDoNothing({ target: skillTag.slug })
  }

  const tags = await drizzleDb.select().from(skillTag)
  state.skillTags = tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    category: t.category ?? "",
  }))

  logger.info({
    event: "skills_seeded",
    categories: categories.length,
    tags: tags.length,
  })
}

async function seedDepartmentSkills(db: SeedDb, state: SeedState) {
  const skillByName = new Map(state.skillTags.map((s) => [s.name, s.id]))
  const _deptByKey = new Map(
    state.departments.map((d) => [`${d.universityId}:${d.name}`, d.id]),
  )
  void _deptByKey

  const rows: {
    department_id: string
    skill_tag_id: string
    action: string
  }[] = []

  for (const dept of state.departments) {
    const skillNames = DEPARTMENT_SKILL_MAP[dept.name] ?? []
    for (const skillName of skillNames) {
      const skillId = skillByName.get(skillName)
      if (!skillId) continue
      rows.push({
        department_id: dept.id,
        skill_tag_id: skillId,
        action: "add",
      })
    }
  }

  if (rows.length > 0) {
    await batchInsert(db, "department_skill", rows)
  }

  // Department categories
  const catRows: { department_id: string; category_id: number }[] = []
  const categoryIdBySlug = new Map(
    state.skillCategories.map((c) => [c.slug, c.id]),
  )

  for (const dept of state.departments) {
    const skillNames = DEPARTMENT_SKILL_MAP[dept.name] ?? []
    const cats = new Set<string>()
    for (const skillName of skillNames) {
      const tag = state.skillTags.find((t) => t.name === skillName)
      if (tag) cats.add(tag.category)
    }
    for (const cat of cats) {
      const catId = categoryIdBySlug.get(toSlug(cat))
      if (catId) {
        catRows.push({ department_id: dept.id, category_id: catId })
      }
    }
  }

  if (catRows.length > 0) {
    await batchInsert(db, "department_category", catRows)
  }

  logger.info({
    event: "department_skills_seeded",
    skills: rows.length,
    categories: catRows.length,
  })
}

function createUserRow(opts: {
  email: string
  name: string
  role: string
  universityId?: string | null
  departmentId?: string | null
  onboardingCompleted?: boolean
}) {
  const id = randomUUID()
  return {
    user: {
      id,
      email: opts.email,
      email_verified: true,
      role: opts.role,
      university_id: opts.universityId ?? null,
      department_id: opts.departmentId ?? null,
      onboarding_completed: opts.onboardingCompleted ?? true,
      name: opts.name,
      image: null,
      two_factor_enabled: false,
      banned: false,
      ban_reason: null,
      ban_expires: null,
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    },
    account: {
      id: randomUUID(),
      account_id: id,
      provider_id: "credential",
      user_id: id,
      access_token: null,
      refresh_token: null,
      id_token: null,
      access_token_expires_at: null,
      refresh_token_expires_at: null,
      scope: null,
      password: hashPassword(DEMO_PASSWORD),
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    },
  }
}

async function seedAdminUsers(db: SeedDb, state: SeedState) {
  const superAdmin = createUserRow({
    email: "admin@stag.io",
    name: "Super Admin",
    role: "super_admin",
  })

  const uniAdmins = state.universities.map((uni, i) =>
    createUserRow({
      email: `uni-admin-${i + 1}@stag.io`,
      name: `${uni.def.abbreviation} Admin`,
      role: "university_admin",
      universityId: uni.id,
    }),
  )

  const allUsers = [superAdmin, ...uniAdmins]
  await batchInsert(
    db,
    "user",
    allUsers.map((u) => u.user),
  )
  await batchInsert(
    db,
    "account",
    allUsers.map((u) => u.account),
  )

  state.users.push(
    ...allUsers.map((u) => ({
      id: u.user.id,
      email: u.user.email,
      name: u.user.name,
      role: u.user.role,
    })),
  )

  logger.info({ event: "admins_seeded", count: allUsers.length })
}

async function seedDepartmentHeads(db: SeedDb, state: SeedState) {
  const rows = state.departments.map((dept, i) =>
    createUserRow({
      email: `dept-head-${toSlug(dept.name)}-${i + 1}@stag.io`,
      name: `Dr. ${faker.person.fullName()}`,
      role: "university_admin",
      universityId: dept.universityId,
      departmentId: dept.id,
    }),
  )

  await batchInsert(
    db,
    "user",
    rows.map((r) => r.user),
  )
  await batchInsert(
    db,
    "account",
    rows.map((r) => r.account),
  )

  const created = rows.map((r) => ({
    id: r.user.id,
    email: r.user.email,
    name: r.user.name,
    role: r.user.role,
  }))
  state.users.push(...created)

  // Link as university members
  const memberRows = state.departments.map((dept, i) => ({
    user_id: rows[i].user.id,
    university_id: dept.universityId,
    role: "department_head",
    department_id: dept.id,
    created_at: formatDateISO(new Date()),
    updated_at: formatDateISO(new Date()),
  }))
  await batchInsert(db, "university_member", memberRows)

  logger.info({ event: "department_heads_seeded", count: rows.length })
}

async function seedCompanyStaff(db: SeedDb, state: SeedState) {
  const owners = DEMO_COMPANIES.map((_c, i) =>
    createUserRow({
      email: `owner-${i + 1}@stag.io`,
      name: faker.person.fullName(),
      role: "company_admin",
    }),
  )

  const recruiters = Array.from({ length: 15 }, (_, i) =>
    createUserRow({
      email: `recruiter-${i + 1}@stag.io`,
      name: faker.person.fullName(),
      role: "company_admin",
    }),
  )

  const all = [...owners, ...recruiters]
  await batchInsert(
    db,
    "user",
    all.map((u) => u.user),
  )
  await batchInsert(
    db,
    "account",
    all.map((u) => u.account),
  )

  state.users.push(
    ...all.map((u) => ({
      id: u.user.id,
      email: u.user.email,
      name: u.user.name,
      role: u.user.role,
    })),
  )

  logger.info({
    event: "company_staff_seeded",
    owners: owners.length,
    recruiters: recruiters.length,
  })

  return { owners, recruiters }
}

async function seedCompanies(
  db: SeedDb,
  state: SeedState,
  owners: ReturnType<typeof createUserRow>[],
) {
  const now = new Date()
  const rows = DEMO_COMPANIES.map((c, i) => ({
    id: randomUUID(),
    name: c.name,
    slug: c.slug,
    description: faker.lorem.paragraphs(2),
    logo_url: `https://picsum.photos/seed/${c.slug}/200/200`,
    website_url: `https://${c.slug}.com`,
    phone: `+213 ${randomInt(21, 38)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
    contact_email: `contact@${c.slug}.com`,
    representative_name: owners[i].user.name,
    wilaya_code: c.wilayaCode,
    address: faker.location.streetAddress(),
    verification_document_key: null,
    verification_document_name: null,
    verification_document_mime_type: null,
    verification_document_size_bytes: null,
    verification_document_uploaded_at: null,
    status: "approved",
    approved_at: formatDateISO(now),
    approved_by_user_id:
      state.users.find((u) => u.role === "super_admin")?.id ?? null,
    rejection_reason: null,
    created_at: formatDateISO(now),
    updated_at: formatDateISO(now),
  }))

  await batchInsert(db, "company", rows)

  state.companies = rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug }))

  // ── Incomplete companies (onboarding not finished) ──
  const incompleteCompanies = [
    {
      name: "Startup DZ Incomplete",
      slug: "startup-dz-incomplete",
      wilayaCode: 16,
    },
    {
      name: "BioTech Algeria Draft",
      slug: "biotech-algeria-draft",
      wilayaCode: 31,
    },
  ]

  for (const c of incompleteCompanies) {
    await db`INSERT INTO "company" ("id", "name", "slug", "description", "logo_url", "website_url", "phone", "contact_email", "representative_name", "wilaya_code", "address", "verification_document_key", "verification_document_name", "verification_document_mime_type", "verification_document_size_bytes", "verification_document_uploaded_at", "status", "approved_at", "approved_by_user_id", "rejection_reason", "created_at", "updated_at")
      VALUES (${randomUUID()}, ${c.name}, ${c.slug}, null, null, null, null, null, null, ${c.wilayaCode}, null, null, null, null, null, null, ${"pending"}, null, null, null, ${formatDateISO(now)}, ${formatDateISO(now)})
      ON CONFLICT DO NOTHING`
  }

  // ── Pending companies (submitted, waiting for super admin approval) ──
  const pendingCompanyDefs = [
    { name: "DataViz Algeria", slug: "dataviz-algeria", wilayaCode: 16 },
    { name: "GreenEnergy DZ", slug: "greenenergy-dz", wilayaCode: 25 },
  ]
  const pendingOwners = Array.from({ length: 2 }, () =>
    createUserRow({
      email: `pending-owner-${Math.floor(Math.random() * 10000)}@stag.io`,
      name: faker.person.fullName(),
      role: "company_admin",
    }),
  )
  await batchInsert(
    db,
    "user",
    pendingOwners.map((u) => u.user),
  )
  await batchInsert(
    db,
    "account",
    pendingOwners.map((u) => u.account),
  )
  state.users.push(
    ...pendingOwners.map((u) => ({
      id: u.user.id,
      email: u.user.email,
      name: u.user.name,
      role: u.user.role,
    })),
  )

  for (let i = 0; i < pendingCompanyDefs.length; i++) {
    const c = pendingCompanyDefs[i]
    const companyId = randomUUID()
    await db`INSERT INTO "company" ("id", "name", "slug", "description", "logo_url", "website_url", "phone", "contact_email", "representative_name", "wilaya_code", "address", "verification_document_key", "verification_document_name", "verification_document_mime_type", "verification_document_size_bytes", "verification_document_uploaded_at", "status", "approved_at", "approved_by_user_id", "rejection_reason", "created_at", "updated_at")
      VALUES (${companyId}, ${c.name}, ${c.slug}, ${faker.lorem.paragraph()}, ${`https://picsum.photos/seed/${c.slug}/200/200`}, ${`https://${c.slug}.com`}, ${`+213 ${randomInt(21, 38)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`}, ${`contact@${c.slug}.com`}, ${pendingOwners[i].user.name}, ${c.wilayaCode}, ${faker.location.streetAddress()}, null, null, null, null, null, ${"pending"}, null, null, null, ${formatDateISO(now)}, ${formatDateISO(now)})
      ON CONFLICT DO NOTHING`

    // Link owner as company member
    await db`INSERT INTO "company_member" ("company_id", "user_id", "role", "created_at")
      VALUES (${companyId}, ${pendingOwners[i].user.id}, ${"owner"}, ${formatDateISO(now)})
      ON CONFLICT DO NOTHING`
  }

  logger.info({
    event: "companies_seeded",
    approved: rows.length,
    pending: pendingCompanyDefs.length,
    incomplete: incompleteCompanies.length,
  })

  return rows
}

async function seedCompanyMembers(
  db: SeedDb,
  state: SeedState,
  owners: ReturnType<typeof createUserRow>[],
  recruiters: ReturnType<typeof createUserRow>[],
) {
  const rows: {
    company_id: string
    user_id: string
    role: string
    created_at: string
  }[] = []

  // Owners
  for (let i = 0; i < DEMO_COMPANIES.length; i++) {
    rows.push({
      company_id: state.companies[i].id,
      user_id: owners[i].user.id,
      role: "owner",
      created_at: formatDateISO(new Date()),
    })
  }

  // Recruiters distributed across companies
  for (let i = 0; i < recruiters.length; i++) {
    const companyIdx = i % DEMO_COMPANIES.length
    rows.push({
      company_id: state.companies[companyIdx].id,
      user_id: recruiters[i].user.id,
      role: "recruiter",
      created_at: formatDateISO(new Date()),
    })
  }

  await batchInsert(db, "company_member", rows)
  logger.info({ event: "company_members_seeded", count: rows.length })
}

async function seedStudents(db: SeedDb, state: SeedState) {
  const studentsPerUni = 8
  const allDepartments = state.departments
  const skillByName = new Map(state.skillTags.map((s) => [s.name, s.id]))

  const userRows: Record<string, unknown>[] = []
  const accountRows: Record<string, unknown>[] = []
  const profileRows: Record<string, unknown>[] = []
  const studentSkillRows: {
    user_id: string
    skill_tag_id: string
    created_at: string
  }[] = []
  const languageRows: {
    user_id: string
    language_code: string
    proficiency: string
    created_at: string
  }[] = []
  const experienceRows: Record<string, unknown>[] = []
  const projectRows: Record<string, unknown>[] = []
  const resumeRows: Record<string, unknown>[] = []

  let studentIdx = 0
  for (const uni of state.universities) {
    // Only create students for approved universities (the first 5)
    if (!DEMO_UNIVERSITIES.some((du) => du.name === uni.def.name)) continue

    const uniDepartments = allDepartments.filter(
      (d) => d.universityId === uni.id,
    )

    for (let i = 0; i < studentsPerUni; i++) {
      const dept = randomElement(uniDepartments)
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const email = `student.${toSlug(firstName)}.${toSlug(lastName)}${studentIdx + 1}@${uni.def.domain}`
      const userId = randomUUID()

      // User
      userRows.push({
        id: userId,
        email,
        email_verified: true,
        role: "student",
        university_id: uni.id,
        department_id: dept.id,
        onboarding_completed: true,
        name: `${firstName} ${lastName}`,
        image: null,
        two_factor_enabled: false,
        banned: false,
        ban_reason: null,
        ban_expires: null,
        created_at: formatDateISO(new Date()),
        updated_at: formatDateISO(new Date()),
      })

      // Account
      accountRows.push({
        id: randomUUID(),
        account_id: userId,
        provider_id: "credential",
        user_id: userId,
        access_token: null,
        refresh_token: null,
        id_token: null,
        access_token_expires_at: null,
        refresh_token_expires_at: null,
        scope: null,
        password: hashPassword(DEMO_PASSWORD),
        created_at: formatDateISO(new Date()),
        updated_at: formatDateISO(new Date()),
      })

      // Profile
      profileRows.push({
        user_id: userId,
        wilaya_code: randomElement(ALGERIAN_WILAYA_CODES),
        bio: faker.lorem.paragraph(2),
        phone: `+213 ${randomInt(5, 7)}${randomInt(0, 9)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        github_url:
          Math.random() > 0.3
            ? `https://github.com/${toSlug(firstName)}${toSlug(lastName)}`
            : null,
        portfolio_url:
          Math.random() > 0.6
            ? `https://${toSlug(firstName)}${toSlug(lastName)}.dev`
            : null,
        student_number: `20${randomInt(18, 25)}${randomInt(10000, 99999)}`,
        department: dept.name,
        department_id: dept.id,
        level: randomElement(["L1", "L2", "L3", "M1", "M2"]),
        address: faker.location.streetAddress(),
        created_at: formatDateISO(new Date()),
        updated_at: formatDateISO(new Date()),
      })

      // Skills (from department skill map)
      const deptSkillNames = DEPARTMENT_SKILL_MAP[dept.name] ?? []
      const chosenSkills = randomPick(
        deptSkillNames,
        randomInt(3, Math.min(8, deptSkillNames.length)),
      )
      for (const skillName of chosenSkills) {
        const skillId = skillByName.get(skillName)
        if (skillId) {
          studentSkillRows.push({
            user_id: userId,
            skill_tag_id: skillId,
            created_at: formatDateISO(new Date()),
          })
        }
      }

      // Languages
      const nativeLang = { code: "ar", proficiency: "native" }
      const otherLangs = randomPick(
        [
          { code: "fr", proficiency: randomElement(["b1", "b2", "c1", "c2"]) },
          { code: "en", proficiency: randomElement(["b1", "b2", "c1", "c2"]) },
          { code: "es", proficiency: randomElement(["a1", "a2", "b1"]) },
          { code: "de", proficiency: randomElement(["a1", "a2", "b1"]) },
        ],
        randomInt(1, 3),
      )
      const langs = [nativeLang, ...otherLangs]
      for (const l of langs) {
        languageRows.push({
          user_id: userId,
          language_code: l.code,
          proficiency: l.proficiency,
          created_at: formatDateISO(new Date()),
        })
      }

      // Experiences
      const expCount = randomInt(0, 3)
      for (let e = 0; e < expCount; e++) {
        const startDate = randomDate(daysAgo(900), daysAgo(180))
        const isCurrent = e === 0 && Math.random() > 0.5
        const endDate = isCurrent ? null : randomDate(startDate, daysAgo(30))
        experienceRows.push({
          id: randomUUID(),
          user_id: userId,
          title: randomElement([
            "Software Engineering Intern",
            "Teaching Assistant",
            "Research Assistant",
            "Freelance Developer",
            "Junior Developer",
            "Data Analyst Intern",
            "Lab Assistant",
            "Technical Support",
            "Web Developer Intern",
          ]),
          organization: randomElement([
            uni.def.name,
            ...DEMO_COMPANIES.map((c) => c.name),
            faker.company.name(),
          ]),
          description: faker.lorem.paragraph(),
          start_date: formatDateISO(startDate),
          end_date: endDate ? formatDateISO(endDate) : null,
          is_current: isCurrent,
          created_at: formatDateISO(new Date()),
          updated_at: formatDateISO(new Date()),
        })
      }

      // Projects
      const projCount = randomInt(0, 3)
      for (let p = 0; p < projCount; p++) {
        projectRows.push({
          id: randomUUID(),
          user_id: userId,
          name: `${randomElement(["Smart", "Auto", "Quick", "Eco", "Secure", "Cloud", "AI", "Mobile"])} ${randomElement(["System", "App", "Platform", "Tool", "Analyzer", "Manager", "Hub"])}`,
          summary: faker.lorem.sentence(),
          project_url:
            Math.random() > 0.4
              ? `https://${toSlug(faker.word.noun())}.vercel.app`
              : null,
          repository_url:
            Math.random() > 0.3
              ? `https://github.com/${toSlug(firstName)}${toSlug(lastName)}/${toSlug(faker.word.noun())}`
              : null,
          start_date: formatDateISO(randomDate(daysAgo(730), daysAgo(90))),
          end_date:
            Math.random() > 0.5
              ? formatDateISO(randomDate(daysAgo(89), daysAgo(1)))
              : null,
          created_at: formatDateISO(new Date()),
          updated_at: formatDateISO(new Date()),
        })
      }

      // Resume (70% have one)
      if (Math.random() > 0.3) {
        const resumeKey = `resumes/${userId}/cv.pdf`
        resumeRows.push({
          user_id: userId,
          file_key: resumeKey,
          file_name: `${toSlug(firstName)}_${toSlug(lastName)}_CV.pdf`,
          file_url: `https://cdn.azeldin.de/${resumeKey}`,
          file_size_bytes: randomInt(50000, 500000),
          mime_type: "application/pdf",
          uploaded_at: formatDateISO(randomDate(daysAgo(60), daysAgo(1))),
          updated_at: formatDateISO(new Date()),
        })
      }

      state.users.push({
        id: userId,
        email,
        name: `${firstName} ${lastName}`,
        role: "student",
      })
      studentIdx++
    }
  }

  await batchInsert(db, "user", userRows)
  await batchInsert(db, "account", accountRows)
  await batchInsert(db, "student_profile", profileRows)

  if (studentSkillRows.length > 0) {
    await batchInsert(db, "student_skill", studentSkillRows)
  }
  if (languageRows.length > 0) {
    await batchInsert(db, "student_language", languageRows)
  }
  if (experienceRows.length > 0) {
    await batchInsert(db, "student_experience", experienceRows)
  }
  if (projectRows.length > 0) {
    await batchInsert(db, "student_project", projectRows)
  }
  if (resumeRows.length > 0) {
    await batchInsert(db, "student_resume", resumeRows)
  }

  logger.info({
    event: "students_seeded",
    count: userRows.length,
    skills: studentSkillRows.length,
    languages: languageRows.length,
    experiences: experienceRows.length,
    projects: projectRows.length,
    resumes: resumeRows.length,
  })
}

async function seedOffers(db: SeedDb, state: SeedState) {
  const offerRows: Record<string, unknown>[] = []
  const offerSkillRows: {
    offer_id: string
    skill_tag_id: string
    created_at: string
  }[] = []
  const offerLangRows: Record<string, unknown>[] = []

  for (let i = 0; i < 100; i++) {
    const company = randomElement(state.companies)
    const prefix = randomElement(OFFER_TITLE_PREFIXES)
    const suffix = randomElement(OFFER_TITLE_SUFFIXES)
    const title = `${prefix} ${suffix}`
    const type = randomElement(INTERNSHIP_TYPES)
    const status =
      Math.random() < 0.85
        ? "published"
        : Math.random() < 0.67
          ? "draft"
          : "closed"
    const publishedAt =
      status === "published" || status === "closed"
        ? formatDateISO(randomDate(daysAgo(60), daysAgo(1)))
        : null
    const deadline =
      status !== "draft" ? formatDateISO(daysFromNow(randomInt(7, 90))) : null

    const offerId = randomUUID()
    offerRows.push({
      id: offerId,
      company_id: company.id,
      title,
      description: `${faker.lorem.paragraphs(3)}\n\n**Responsibilities:**\n${Array.from({ length: randomInt(3, 6) }, () => `- ${faker.lorem.sentence()}`).join("\n")}\n\n**Requirements:**\n${Array.from({ length: randomInt(3, 5) }, () => `- ${faker.lorem.sentence()}`).join("\n")}`,
      internship_type: type,
      work_mode: randomElement(WORK_MODES),
      wilaya_code: randomElement(ALGERIAN_WILAYA_CODES),
      duration_weeks: randomInt(4, 24),
      max_positions: randomInt(1, 5),
      status,
      published_at: publishedAt,
      application_deadline_at: deadline,
      expected_start_date: formatDateISO(daysFromNow(randomInt(14, 60))),
      expected_end_date: formatDateISO(daysFromNow(randomInt(90, 180))),
      closes_at:
        status === "closed" ? formatDateISO(daysAgo(randomInt(1, 30))) : null,
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    })

    // Skills for offer
    const skillCount = randomInt(2, 6)
    const chosenSkills = randomPick(state.skillTags, skillCount)
    for (const skill of chosenSkills) {
      offerSkillRows.push({
        offer_id: offerId,
        skill_tag_id: skill.id,
        created_at: formatDateISO(new Date()),
      })
    }

    // Language requirements (40% of offers)
    if (Math.random() < 0.4) {
      const lang = randomElement([
        { code: "fr", minProf: randomElement(["b1", "b2", "c1"]) },
        { code: "en", minProf: randomElement(["b1", "b2", "c1"]) },
      ])
      offerLangRows.push({
        offer_id: offerId,
        language_code: lang.code,
        minimum_proficiency: lang.minProf,
        is_required: true,
        weight: 1,
        created_at: formatDateISO(new Date()),
      })
    }
  }

  await batchInsert(db, "internship_offer", offerRows)
  await batchInsert(db, "internship_offer_skill", offerSkillRows)
  await batchInsert(db, "internship_offer_language_requirement", offerLangRows)

  // Fetch back to get IDs
  const allOffers = await db<
    { id: string; company_id: string; title: string }[]
  >`SELECT id, company_id, title FROM internship_offer`
  state.offers = allOffers.map((o) => ({
    id: o.id,
    companyId: o.company_id,
    title: o.title,
  }))

  logger.info({
    event: "offers_seeded",
    count: offerRows.length,
    skills: offerSkillRows.length,
    langReqs: offerLangRows.length,
  })
}

async function seedSavedOffers(db: SeedDb, state: SeedState) {
  const students = state.users.filter((u) => u.role === "student")
  const rows: { user_id: string; offer_id: string; created_at: string }[] = []
  const seen = new Set<string>()

  for (const student of students) {
    const count = randomInt(0, 5)
    const offers = randomPick(state.offers, count)
    for (const offer of offers) {
      const key = `${student.id}:${offer.id}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push({
        user_id: student.id,
        offer_id: offer.id,
        created_at: formatDateISO(randomDate(daysAgo(30), daysAgo(1))),
      })
    }
  }

  await batchInsert(db, "saved_offer", rows)
  logger.info({ event: "saved_offers_seeded", count: rows.length })
}

function getApplicationConfig(stage: string): {
  status: string
  pipelineStage: string
  hasInterview: boolean
} {
  switch (stage) {
    case "applied":
      return {
        status: "applied",
        pipelineStage: "applied",
        hasInterview: false,
      }
    case "screening":
      return {
        status: "company_accepted",
        pipelineStage: "screening",
        hasInterview: false,
      }
    case "interview":
      return {
        status: "company_accepted",
        pipelineStage: "interview",
        hasInterview: true,
      }
    case "offer":
      return {
        status: "company_accepted",
        pipelineStage: "offer",
        hasInterview: true,
      }
    case "accepted":
      return {
        status: "company_accepted",
        pipelineStage: "accepted",
        hasInterview: true,
      }
    case "validated":
      return {
        status: "admin_validated",
        pipelineStage: "validated",
        hasInterview: true,
      }
    case "rejected":
      return {
        status: Math.random() > 0.5 ? "company_refused" : "admin_rejected",
        pipelineStage: "rejected",
        hasInterview: Math.random() > 0.4,
      }
    default:
      return {
        status: "applied",
        pipelineStage: "applied",
        hasInterview: false,
      }
  }
}

async function seedApplications(db: SeedDb, state: SeedState) {
  const students = state.users.filter((u) => u.role === "student")
  const publishedOffers = state.offers // All offers for variety

  // Pipeline distribution out of ~160 applications
  const stageDistribution = [
    ...Array(20).fill("applied"),
    ...Array(20).fill("screening"),
    ...Array(25).fill("interview"),
    ...Array(15).fill("offer"),
    ...Array(10).fill("accepted"),
    ...Array(20).fill("validated"),
    ...Array(50).fill("rejected"),
  ]

  const appRows: Record<string, unknown>[] = []
  const timelineRows: Record<string, unknown>[] = []

  const recruiterIds = state.users
    .filter((u) => u.email.startsWith("recruiter-"))
    .map((u) => u.id)
  const superAdminId = state.users.find((u) => u.role === "super_admin")?.id

  const seenPairs = new Set<string>()

  for (const stage of stageDistribution) {
    const student = randomElement(students)
    const offer = randomElement(publishedOffers)
    const pairKey = `${student.id}:${offer.id}`
    if (seenPairs.has(pairKey)) continue
    seenPairs.add(pairKey)

    const config = getApplicationConfig(stage)
    const appId = randomUUID()
    const createdAt = randomDate(daysAgo(90), daysAgo(1))

    appRows.push({
      id: appId,
      offer_id: offer.id,
      student_user_id: student.id,
      status: config.status,
      pipeline_stage: config.pipelineStage,
      cover_letter: Math.random() > 0.3 ? faker.lorem.paragraphs(2) : null,
      company_action_by_user_id:
        config.status !== "applied" && config.status !== "withdrawn"
          ? randomElement(recruiterIds)
          : null,
      company_action_at:
        config.status !== "applied" && config.status !== "withdrawn"
          ? formatDateISO(randomDate(createdAt, daysAgo(1)))
          : null,
      company_note:
        config.status === "company_refused" ? faker.lorem.sentence() : null,
      admin_action_by_user_id:
        config.status === "admin_validated" ||
        config.status === "admin_rejected"
          ? superAdminId
          : null,
      admin_action_at:
        config.status === "admin_validated" ||
        config.status === "admin_rejected"
          ? formatDateISO(randomDate(createdAt, daysAgo(1)))
          : null,
      admin_note:
        config.status === "admin_rejected" ? faker.lorem.sentence() : null,
      created_at: formatDateISO(createdAt),
      pipeline_stage_updated_at: formatDateISO(
        randomDate(createdAt, daysAgo(1)),
      ),
      updated_at: formatDateISO(new Date()),
    })

    // Timeline events
    const events: {
      type: string
      fromStage?: string
      toStage?: string
      fromStatus?: string
      toStatus?: string
      createdAt: Date
    }[] = []
    events.push({
      type: "applied",
      fromStage: undefined,
      toStage: "applied",
      fromStatus: undefined,
      toStatus: "applied",
      createdAt,
    })

    if (config.pipelineStage !== "applied") {
      events.push({
        type: "screening",
        fromStage: "applied",
        toStage: "screening",
        fromStatus: "applied",
        toStatus: "company_accepted",
        createdAt: randomDate(
          new Date(createdAt.getTime() + 86400000),
          daysAgo(1),
        ),
      })
    }

    if (
      ["interview", "offer", "accepted", "validated"].includes(
        config.pipelineStage,
      ) ||
      (config.pipelineStage === "rejected" && config.hasInterview)
    ) {
      events.push({
        type: "interview",
        fromStage: "screening",
        toStage: "interview",
        fromStatus: "company_accepted",
        toStatus: "company_accepted",
        createdAt: randomDate(
          new Date(createdAt.getTime() + 172800000),
          daysAgo(1),
        ),
      })
    }

    if (["offer", "accepted", "validated"].includes(config.pipelineStage)) {
      events.push({
        type: "offer",
        fromStage: "interview",
        toStage: "offer",
        fromStatus: "company_accepted",
        toStatus: "company_accepted",
        createdAt: randomDate(
          new Date(createdAt.getTime() + 259200000),
          daysAgo(1),
        ),
      })
    }

    if (["accepted", "validated"].includes(config.pipelineStage)) {
      events.push({
        type: "accepted",
        fromStage: "offer",
        toStage: "accepted",
        fromStatus: "company_accepted",
        toStatus: "company_accepted",
        createdAt: randomDate(
          new Date(createdAt.getTime() + 345600000),
          daysAgo(1),
        ),
      })
    }

    if (config.pipelineStage === "validated") {
      events.push({
        type: "validated",
        fromStage: "accepted",
        toStage: "validated",
        fromStatus: "company_accepted",
        toStatus: "admin_validated",
        createdAt: randomDate(
          new Date(createdAt.getTime() + 432000000),
          daysAgo(1),
        ),
      })
    }

    if (config.pipelineStage === "rejected") {
      const rejectStage = config.hasInterview
        ? randomElement(["screening", "interview", "offer"])
        : randomElement(["applied", "screening"])
      const fromStatus =
        rejectStage === "applied" ? "applied" : "company_accepted"
      const toStatus = config.status
      events.push({
        type: "rejected",
        fromStage: rejectStage,
        toStage: "rejected",
        fromStatus,
        toStatus,
        createdAt: randomDate(
          new Date(createdAt.getTime() + 86400000 * randomInt(2, 10)),
          daysAgo(1),
        ),
      })
    }

    for (const ev of events) {
      timelineRows.push({
        id: randomUUID(),
        application_id: appId,
        actor_user_id:
          ev.type === "applied" ? student.id : randomElement(recruiterIds),
        event_type: ev.type,
        from_stage: ev.fromStage ?? null,
        to_stage: ev.toStage ?? null,
        from_status: ev.fromStatus ?? null,
        to_status: ev.toStatus ?? null,
        payload: JSON.stringify(
          ev.type === "rejected" ? { reason: faker.lorem.sentence() } : {},
        ),
        created_at: formatDateISO(ev.createdAt),
      })
    }

    state.applications.push({
      id: appId,
      studentUserId: student.id,
      offerId: offer.id,
      pipelineStage: config.pipelineStage,
    })
  }

  await batchInsert(db, "application", appRows)
  await batchInsert(db, "application_timeline_event", timelineRows)

  logger.info({
    event: "applications_seeded",
    count: appRows.length,
    timelineEvents: timelineRows.length,
  })
}

async function seedInterviews(db: SeedDb, state: SeedState) {
  const interviewRows: Record<string, unknown>[] = []
  const slotRows: Record<string, unknown>[] = []

  const recruiterIds = state.users
    .filter((u) => u.email.startsWith("recruiter-"))
    .map((u) => u.id)

  const appsWithInterviews = state.applications.filter((a) => {
    const cfg = getApplicationConfig(a.pipelineStage)
    return cfg.hasInterview
  })

  for (const app of appsWithInterviews) {
    const offer = state.offers.find((o) => o.id === app.offerId)
    const company = state.companies.find((c) => c.id === offer?.companyId)
    if (!offer || !company) continue

    const isPast = ["rejected", "validated", "accepted"].includes(
      app.pipelineStage,
    )
    const isFuture = app.pipelineStage === "interview"

    const status = isPast
      ? randomElement(["completed", "cancelled"])
      : isFuture
        ? randomElement(["pending_confirmation", "confirmed"])
        : randomElement(["completed", "confirmed"])

    const interviewId = randomUUID()
    const createdAt = randomDate(daysAgo(60), daysAgo(1))
    const confirmedAt =
      status === "confirmed" || status === "completed"
        ? formatDateISO(randomDate(createdAt, daysAgo(1)))
        : null

    interviewRows.push({
      id: interviewId,
      application_id: app.id,
      offer_id: app.offerId,
      company_id: company.id,
      student_user_id: app.studentUserId,
      proposed_by_user_id: randomElement(recruiterIds),
      confirmed_by_user_id:
        status !== "pending_confirmation" ? app.studentUserId : null,
      confirmed_slot_id: null,
      status,
      note: faker.lorem.sentence(),
      reschedule_note: null,
      reschedule_requested_at: null,
      reschedule_requested_by_user_id: null,
      confirmed_at: confirmedAt,
      created_at: formatDateISO(createdAt),
      updated_at: formatDateISO(new Date()),
    })

    // Interview slots
    const slotCount = randomInt(1, 3)
    for (let s = 0; s < slotCount; s++) {
      const isConfirmedSlot = s === 0 && status !== "pending_confirmation"
      const slotId = randomUUID()
      const startsAt = isFuture
        ? daysFromNow(randomInt(1, 14))
        : randomDate(daysAgo(30), daysAgo(1))
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000)

      slotRows.push({
        id: slotId,
        interview_id: interviewId,
        starts_at: formatDateISO(startsAt),
        ends_at: formatDateISO(endsAt),
        location: randomElement([
          "Main Office",
          "Online (Zoom)",
          "Campus Building",
          "Conference Room A",
          "Remote",
        ]),
        meeting_url: randomElement([
          null,
          null,
          `https://meet.example.com/${randomUUID().slice(0, 8)}`,
        ]),
        created_at: formatDateISO(new Date()),
        updated_at: formatDateISO(new Date()),
      })

      // Update interview with confirmed slot if needed
      if (isConfirmedSlot) {
        await db`UPDATE "interview" SET "confirmed_slot_id" = ${slotId} WHERE "id" = ${interviewId}`
      }
    }
  }

  await batchInsert(db, "interview", interviewRows)
  await batchInsert(db, "interview_slot", slotRows)

  logger.info({
    event: "interviews_seeded",
    interviews: interviewRows.length,
    slots: slotRows.length,
  })
}

async function seedMessages(db: SeedDb, state: SeedState) {
  const threadRows: Record<string, unknown>[] = []
  const messageRows: Record<string, unknown>[] = []
  const readStateRows: Record<string, unknown>[] = []

  const recruiterUsers = state.users.filter((u) =>
    u.email.startsWith("recruiter-"),
  )
  const activeApps = state.applications.filter((a) =>
    ["screening", "interview", "offer", "accepted", "validated"].includes(
      a.pipelineStage,
    ),
  )

  const chosenApps = randomPick(activeApps, Math.min(35, activeApps.length))

  for (const app of chosenApps) {
    const offer = state.offers.find((o) => o.id === app.offerId)
    const company = state.companies.find((c) => c.id === offer?.companyId)
    const recruiter = randomElement(recruiterUsers)
    if (!offer || !company || !recruiter) continue

    const threadId = randomUUID()
    const threadCreated = randomDate(daysAgo(60), daysAgo(5))

    threadRows.push({
      id: threadId,
      offer_id: app.offerId,
      company_id: company.id,
      student_user_id: app.studentUserId,
      created_by_user_id: app.studentUserId,
      last_message_at: formatDateISO(randomDate(threadCreated, daysAgo(1))),
      created_at: formatDateISO(threadCreated),
      updated_at: formatDateISO(new Date()),
    })

    const msgCount = randomInt(3, 10)
    let lastMsgId = ""
    for (let m = 0; m < msgCount; m++) {
      const isStudent = m % 2 === 0
      const msgId = randomUUID()
      lastMsgId = msgId
      const msgCreated = new Date(
        threadCreated.getTime() + m * 3600000 * randomInt(2, 48),
      )

      const bodies = isStudent
        ? [
            "Hello, I am very interested in this internship opportunity. Could you please provide more details about the project?",
            "Thank you for considering my application. I have experience with the technologies mentioned.",
            "Is there any possibility to work remotely for part of the internship?",
            "I have attached my updated resume for your review.",
            "Could you let me know the expected timeline for the interview process?",
            "I am available for an interview anytime next week.",
            "Thank you for the offer. I would like to discuss the start date.",
          ]
        : [
            "Thank you for your interest. We would like to invite you for an interview.",
            "Your profile looks promising. Could you share some of your previous projects?",
            "We are impressed with your background. When are you available for a technical interview?",
            "The position requires strong skills in this area. Can you tell us about your experience?",
            "We would like to extend an offer for the internship position.",
            "Please confirm your acceptance and we will proceed with the paperwork.",
            "Congratulations! Your application has been approved by the administration.",
          ]

      messageRows.push({
        id: msgId,
        thread_id: threadId,
        offer_id: app.offerId,
        sender_user_id: isStudent ? app.studentUserId : recruiter.id,
        body: randomElement(bodies),
        created_at: formatDateISO(msgCreated),
      })
    }

    // Read states
    readStateRows.push({
      thread_id: threadId,
      user_id: app.studentUserId,
      last_read_message_id: lastMsgId,
      last_read_at: formatDateISO(new Date()),
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    })
    readStateRows.push({
      thread_id: threadId,
      user_id: recruiter.id,
      last_read_message_id: lastMsgId,
      last_read_at: formatDateISO(new Date()),
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    })
  }

  await batchInsert(db, "offer_message_thread", threadRows)
  await batchInsert(db, "offer_message", messageRows)
  await batchInsert(db, "offer_message_read_state", readStateRows)

  logger.info({
    event: "messages_seeded",
    threads: threadRows.length,
    messages: messageRows.length,
  })
}

async function seedPlacementsAndDocuments(db: SeedDb, state: SeedState) {
  const placementRows: Record<string, unknown>[] = []
  const documentRows: Record<string, unknown>[] = []

  const validatedApps = state.applications.filter(
    (a) => a.pipelineStage === "validated",
  )
  const superAdminId = state.users.find((u) => u.role === "super_admin")?.id

  for (const app of validatedApps) {
    const placementId = randomUUID()
    const startDate = randomDate(daysAgo(90), daysAgo(30))
    const endDate = new Date(
      startDate.getTime() + randomInt(60, 180) * 86400000,
    )

    placementRows.push({
      id: placementId,
      application_id: app.id,
      validated_by_user_id: superAdminId,
      validated_at: formatDateISO(new Date()),
      start_date: formatDateISO(startDate),
      end_date: formatDateISO(endDate),
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    })

    // Agreement document
    const agreementKey = `documents/${placementId}/agreement-en-classic.pdf`
    documentRows.push({
      id: randomUUID(),
      placement_id: placementId,
      type: "agreement",
      locale: "en",
      border_style: "classic",
      status: "generated",
      storage_key: agreementKey,
      url: `https://cdn.azeldin.de/${agreementKey}`,
      verification_code: randomBytes(8).toString("hex").toUpperCase(),
      snapshot_data: JSON.stringify({ generatedAt: formatDateISO(new Date()) }),
      meta: JSON.stringify({
        studentName: state.users.find((u) => u.id === app.studentUserId)?.name,
      }),
      created_at: formatDateISO(new Date()),
    })

    // Certificate document (only for placements ending in the past or soon)
    if (endDate < daysFromNow(30)) {
      const certKey = `documents/${placementId}/certificate-en-classic.pdf`
      documentRows.push({
        id: randomUUID(),
        placement_id: placementId,
        type: "certificate",
        locale: "en",
        border_style: "classic",
        status: "generated",
        storage_key: certKey,
        url: `https://cdn.azeldin.de/${certKey}`,
        verification_code: randomBytes(8).toString("hex").toUpperCase(),
        snapshot_data: JSON.stringify({
          generatedAt: formatDateISO(new Date()),
        }),
        meta: JSON.stringify({
          studentName: state.users.find((u) => u.id === app.studentUserId)
            ?.name,
        }),
        created_at: formatDateISO(new Date()),
      })
    }
  }

  await batchInsert(db, "placement", placementRows)
  await batchInsert(db, "document", documentRows)

  logger.info({
    event: "placements_seeded",
    placements: placementRows.length,
    documents: documentRows.length,
  })
}

async function seedNotifications(db: SeedDb, state: SeedState) {
  const notificationRows: Record<string, unknown>[] = []
  const preferenceRows: Record<string, unknown>[] = []

  const students = state.users.filter((u) => u.role === "student")
  const recruiters = state.users.filter((u) => u.email.startsWith("recruiter-"))

  const allUsers = [...students, ...recruiters]

  // Notification preferences for everyone
  for (const user of allUsers) {
    preferenceRows.push({
      user_id: user.id,
      in_app_enabled: true,
      email_enabled: Math.random() > 0.3,
      created_at: formatDateISO(new Date()),
      updated_at: formatDateISO(new Date()),
    })
  }

  // Random notifications
  const notificationTypes = [
    "application_received",
    "application_status_changed",
    "interview_scheduled",
    "interview_reminder",
    "offer_received",
    "message_received",
    "placement_validated",
  ]

  for (const user of randomPick(allUsers, 50)) {
    const count = randomInt(1, 5)
    for (let i = 0; i < count; i++) {
      notificationRows.push({
        id: randomUUID(),
        user_id: user.id,
        type: randomElement(notificationTypes),
        payload: JSON.stringify({ message: faker.lorem.sentence() }),
        read_at:
          Math.random() > 0.4
            ? formatDateISO(randomDate(daysAgo(7), daysAgo(1)))
            : null,
        created_at: formatDateISO(randomDate(daysAgo(30), daysAgo(1))),
      })
    }
  }

  await batchInsert(db, "notification_preference", preferenceRows)
  await batchInsert(db, "notification", notificationRows)

  logger.info({
    event: "notifications_seeded",
    preferences: preferenceRows.length,
    notifications: notificationRows.length,
  })
}

async function seedSiteSettings(db: SeedDb) {
  await db`INSERT INTO "site_settings" ("id", "maintenance_mode", "updated_at")
    VALUES ('singleton', false, ${new Date().toISOString()})
    ON CONFLICT DO NOTHING`
  logger.info({ event: "site_settings_seeded" })
}

function printDemoCredentials(state: SeedState) {
  const lines = [
    "",
    "╔══════════════════════════════════════════════════════════════════╗",
    "║                    DEMO SEED COMPLETE                            ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  All accounts use password: DemoPass123!                         ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  SUPER ADMIN                                                     ║",
    "║    admin@stag.io                                                 ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  UNIVERSITY ADMINS                                               ║",
  ]

  for (let i = 0; i < state.universities.length; i++) {
    lines.push(
      `║    uni-admin-${i + 1}@stag.io  (${state.universities[i].def.name})`,
    )
  }

  lines.push(
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  ONBOARDING FLOW DEMONSTRATION                                   ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  INCOMPLETE UNIVERSITIES (onboarding not finished)               ║",
    "║    University Of Batna 2, University Of Tlemcen                  ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  PENDING UNIVERSITIES (awaiting super admin approval)            ║",
    "║    University Of Setif 1, University Of Ouargla                  ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  INCOMPLETE COMPANIES (onboarding not finished)                  ║",
    "║    Startup DZ Incomplete, BioTech Algeria Draft                  ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  PENDING COMPANIES (awaiting super admin approval)               ║",
    "║    DataViz Algeria, GreenEnergy DZ                               ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  UNIVERSITIES: " + state.universities.length.toString().padEnd(45) + "║",
    "║  DEPARTMENTS:  " + state.departments.length.toString().padEnd(45) + "║",
    "║  COMPANIES:    " +
      (state.companies.length + 4).toString().padEnd(45) +
      "║",
    "║  STUDENTS:     " +
      state.users
        .filter((u) => u.role === "student")
        .length.toString()
        .padEnd(45) +
      "║",
    "║  OFFERS:       " + state.offers.length.toString().padEnd(45) + "║",
    "║  APPLICATIONS: " + state.applications.length.toString().padEnd(45) + "║",
    "╚══════════════════════════════════════════════════════════════════╝",
  )
  state.departments.forEach((d, i) => {
    lines.push(`║    dept-head-${toSlug(d.name)}-${i + 1}@stag.io  (${d.name})`)
  })

  lines.push(
    "╠════════════════──────────────────────────────────────────────────╣",
    "║  COMPANY OWNERS                                                  ║",
  )
  DEMO_COMPANIES.forEach((c, i) => {
    lines.push(`║    owner-${i + 1}@stag.io  (${c.name})`)
  })

  lines.push(
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  RECRUITERS                                                      ║",
    "║    recruiter-1@stag.io  through  recruiter-15@stag.io            ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  STUDENTS (sample — 40 total)                                    ║",
    "║    student.john.doe1@univ-constantine2.dz                        ║",
    "║    student.jane.smith2@univ-algiers.dz                           ║",
    "║    ... (use university domain emails)                            ║",
    "╠══════════════════════════════════════════════════════════════════╣",
    "║  UNIVERSITIES: " + state.universities.length.toString().padEnd(45) + "║",
    "║  DEPARTMENTS:  " + state.departments.length.toString().padEnd(45) + "║",
    "║  COMPANIES:    " + state.companies.length.toString().padEnd(45) + "║",
    "║  STUDENTS:     " +
      state.users
        .filter((u) => u.role === "student")
        .length.toString()
        .padEnd(45) +
      "║",
    "║  OFFERS:       " + state.offers.length.toString().padEnd(45) + "║",
    "║  APPLICATIONS: " + state.applications.length.toString().padEnd(45) + "║",
    "╚══════════════════════════════════════════════════════════════════╝",
  )

  logger.info(lines.join("\n"))
}

/* ──────────────────────────── Main ──────────────────────────── */

async function isAlreadySeeded(db: SeedDb): Promise<boolean> {
  try {
    const result = await db<
      { count: number }[]
    >`SELECT COUNT(*)::int AS count FROM "internship_offer"`
    const offerCount = result[0]?.count ?? 0
    if (offerCount >= 50) {
      logger.info({
        event: "demo_seed_skipped",
        reason: "database_already_contains_demo_data",
        offerCount,
      })
      return true
    }
    return false
  } catch {
    // Table might not exist yet (migrations not run), so proceed with seeding
    return false
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  const db = postgres(databaseUrl, { max: 1, prepare: false })

  if (await isAlreadySeeded(db)) {
    logger.info(
      { event: "demo_seed_already_done" },
      "Demo data already exists in database. Skipping.",
    )
    await db.end({ timeout: 5 })
    return
  }

  const state: SeedState = {
    universities: [],
    departments: [],
    fields: [],
    skillCategories: [],
    skillTags: [],
    users: [],
    companies: [],
    offers: [],
    applications: [],
  }

  try {
    logger.info(
      { event: "demo_seed_start" },
      "Starting comprehensive demo seed...",
    )

    await seedUniversities(db, state)
    await seedFields(db, state)
    await seedDepartments(db, state)
    await seedSkillCategoriesAndTags(db, state)
    await seedDepartmentSkills(db, state)
    await seedAdminUsers(db, state)
    await seedDepartmentHeads(db, state)
    const { owners, recruiters } = await seedCompanyStaff(db, state)
    await seedCompanies(db, state, owners)
    await seedCompanyMembers(db, state, owners, recruiters)
    await seedStudents(db, state)
    await seedOffers(db, state)
    await seedSavedOffers(db, state)
    await seedApplications(db, state)
    await seedInterviews(db, state)
    await seedMessages(db, state)
    await seedPlacementsAndDocuments(db, state)
    await seedNotifications(db, state)
    await seedSiteSettings(db)

    printDemoCredentials(state)
    logger.info(
      { event: "demo_seed_complete" },
      "Demo seed completed successfully!",
    )
  } catch (error) {
    logger.error(
      { err: error, event: "demo_seed_failed" },
      "Demo seeding failed",
    )
    throw error
  } finally {
    await db.end({ timeout: 5 })
  }
}

if (import.meta.main) {
  main().catch((err) => {
    logger.error({ err, event: "demo_seed_failed" }, "Demo seeding failed")
    process.exitCode = 1
  })
}
