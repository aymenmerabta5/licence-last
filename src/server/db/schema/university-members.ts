import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { universityMemberRoleEnum } from "@/server/db/schema/enums"
import { university } from "@/server/db/schema/universities"

export const universityMember = pgTable(
  "university_member",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    role: universityMemberRoleEnum("role").notNull(),
    departmentId: text("department_id").references(() => department.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("university_member_departmentId_uidx").on(table.departmentId),
    index("university_member_universityId_idx").on(table.universityId),
  ],
)
