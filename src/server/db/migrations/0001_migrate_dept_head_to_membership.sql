-- Migrate legacy dept_head users to university_admin + university_member membership rows.
-- The dept_head value stays in the PG enum (removing enum values is destructive) but is never assigned again.

-- Step 1: Ensure every dept_head user has a university_member row
INSERT INTO "university_member" ("user_id", "university_id", "role", "department_id", "created_at", "updated_at")
SELECT u."id", u."university_id", 'department_head', u."department_id", NOW(), NOW()
FROM "user" u
WHERE u."role" = 'dept_head'
  AND u."university_id" IS NOT NULL
ON CONFLICT ("user_id") DO NOTHING;

-- Step 2: Promote all dept_head users to university_admin
UPDATE "user"
SET "role" = 'university_admin'
WHERE "role" = 'dept_head';
