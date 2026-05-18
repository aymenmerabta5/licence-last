DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'reschedule_requested'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'interview_status')
  ) THEN
    ALTER TYPE "public"."interview_status" ADD VALUE 'reschedule_requested';
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS "department_category" (
    "id" serial PRIMARY KEY NOT NULL,
    "department_id" text NOT NULL,
    "category_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS "skill_category" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "description" text,
    "icon" text,
    "status" text DEFAULT 'active' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "skill_category_name_unique" UNIQUE("name"),
    CONSTRAINT "skill_category_slug_unique" UNIQUE("slug")
  );
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview' AND column_name = 'reschedule_note'
  ) THEN
    ALTER TABLE "interview" ADD COLUMN "reschedule_note" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview' AND column_name = 'reschedule_requested_at'
  ) THEN
    ALTER TABLE "interview" ADD COLUMN "reschedule_requested_at" timestamp;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview' AND column_name = 'reschedule_requested_by_user_id'
  ) THEN
    ALTER TABLE "interview" ADD COLUMN "reschedule_requested_by_user_id" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_tag' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE "skill_tag" ADD COLUMN "category_id" integer NOT NULL DEFAULT 1;
    ALTER TABLE "skill_tag" ALTER COLUMN "category_id" DROP DEFAULT;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_tag' AND column_name = 'description'
  ) THEN
    ALTER TABLE "skill_tag" ADD COLUMN "description" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_tag' AND column_name = 'status'
  ) THEN
    ALTER TABLE "skill_tag" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_tag' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE "skill_tag" ADD COLUMN "created_by" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'department_category_department_id_department_id_fk'
  ) THEN
    ALTER TABLE "department_category" ADD CONSTRAINT "department_category_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'department_category_category_id_skill_category_id_fk'
  ) THEN
    ALTER TABLE "department_category" ADD CONSTRAINT "department_category_category_id_skill_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_category"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "department_category_department_category_uidx" ON "department_category" USING btree ("department_id","category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "department_category_department_id_idx" ON "department_category" USING btree ("department_id");
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'interview_reschedule_requested_by_user_id_user_id_fk'
  ) THEN
    ALTER TABLE "interview" ADD CONSTRAINT "interview_reschedule_requested_by_user_id_user_id_fk" FOREIGN KEY ("reschedule_requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'skill_tag_category_id_skill_category_id_fk'
  ) THEN
    ALTER TABLE "skill_tag" ADD CONSTRAINT "skill_tag_category_id_skill_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_category"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_rescheduleRequestedByUserId_idx" ON "interview" USING btree ("reschedule_requested_by_user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_tag_category_id_idx" ON "skill_tag" USING btree ("category_id");
