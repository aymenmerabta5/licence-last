CREATE TYPE "public"."university_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'dept_head' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE "department" (
	"id" text PRIMARY KEY NOT NULL,
	"university_id" text NOT NULL,
	"name" text NOT NULL,
	"head_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_profile" ADD COLUMN "department_id" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "status" "university_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "approved_by_user_id" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "department_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "department_name_university_uidx" ON "department" USING btree ("name","university_id");--> statement-breakpoint
CREATE INDEX "department_universityId_idx" ON "department" USING btree ("university_id");--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "university_status_idx" ON "university" USING btree ("status");