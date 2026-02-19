import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { user } from "@/server/db/schema/auth"
import { proficiencyLevelEnum } from "@/server/db/schema/enums"
import { internshipOffer } from "@/server/db/schema/internships"

export const studentLanguage = pgTable(
  "student_language",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(),
    proficiency: proficiencyLevelEnum("proficiency").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.languageCode] }),
    index("student_language_languageCode_idx").on(table.languageCode),
  ],
)

export const internshipOfferLanguageRequirement = pgTable(
  "internship_offer_language_requirement",
  {
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(),
    minimumProficiency: proficiencyLevelEnum("minimum_proficiency").notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    weight: integer("weight").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.offerId, table.languageCode] }),
    index("internship_offer_language_requirement_languageCode_idx").on(
      table.languageCode,
    ),
  ],
)
