import "server-only"

import { eq } from "drizzle-orm"
import { hasDuplicateLanguageCodes, normalizeLanguageEntries } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { studentLanguage } from "@/server/db/schema/languages"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/students/upsert-languages")

interface StudentLanguageInput {
  languageCode: string
  proficiency: ProficiencyLevel
}

export async function upsertStudentLanguages(
  languages: StudentLanguageInput[],
  userId: string,
) {
  log.info(
    { userId, languageCount: languages.length },
    "Upserting student languages",
  )

  if (languages.length < 1) {
    throw new ServiceError(
      "LANGUAGE_MIN_REQUIRED",
      "At least one language is required",
    )
  }

  if (hasDuplicateLanguageCodes(languages)) {
    throw new ServiceError(
      "LANGUAGE_DUPLICATE",
      "Duplicate languages are not allowed",
    )
  }

  const normalizedLanguages = normalizeLanguageEntries(languages)

  await db.transaction(async (tx) => {
    await tx.delete(studentLanguage).where(eq(studentLanguage.userId, userId))

    await tx.insert(studentLanguage).values(
      normalizedLanguages.map((entry) => ({
        userId,
        languageCode: entry.languageCode,
        proficiency: entry.proficiency,
      })),
    )
  })

  log.info(
    { userId, event: "student_languages_upserted" },
    "Student languages updated",
  )
  return { userId }
}
