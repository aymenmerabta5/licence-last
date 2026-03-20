CREATE TYPE "public"."university_member_role" AS ENUM('department_head');--> statement-breakpoint
CREATE TABLE "university_member" (
	"user_id" text PRIMARY KEY NOT NULL,
	"university_id" text NOT NULL,
	"role" "university_member_role" NOT NULL,
	"department_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "university_member" ADD CONSTRAINT "university_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_member" ADD CONSTRAINT "university_member_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_member" ADD CONSTRAINT "university_member_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "university_member_departmentId_uidx" ON "university_member" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "university_member_universityId_idx" ON "university_member" USING btree ("university_id");--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "user"
		WHERE "role" = 'dept_head'
		  AND "university_id" IS NULL
	) THEN
		RAISE EXCEPTION 'Cannot migrate dept_head users without university_id';
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM (
			SELECT "department_id"
			FROM "user"
			WHERE "role" = 'dept_head'
			  AND "department_id" IS NOT NULL
			GROUP BY "department_id"
			HAVING COUNT(*) > 1
		) AS duplicate_department_heads
	) THEN
		RAISE EXCEPTION 'Cannot migrate duplicate dept_head assignments for the same department';
	END IF;
END
$$;
--> statement-breakpoint
INSERT INTO "university_member" ("user_id", "university_id", "role", "department_id")
SELECT
	"id",
	"university_id",
	'department_head',
	"department_id"
FROM "user"
WHERE "role" = 'dept_head';
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM (
			SELECT "user_id"
			FROM "university_member"
			GROUP BY "user_id"
			HAVING COUNT(*) > 1
		) AS duplicate_memberships
	) THEN
		RAISE EXCEPTION 'University membership backfill produced duplicate user memberships';
	END IF;
END
$$;
--> statement-breakpoint
UPDATE "user"
SET
	"role" = 'university_admin',
	"department_id" = NULL,
	"updated_at" = now()
WHERE "role" = 'dept_head';
