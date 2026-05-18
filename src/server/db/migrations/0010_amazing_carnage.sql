ALTER TYPE "public"."interview_status" ADD VALUE 'reschedule_requested';--> statement-breakpoint
CREATE TABLE "department_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_category" (
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
--> statement-breakpoint
ALTER TABLE "interview" ADD COLUMN "reschedule_note" text;--> statement-breakpoint
ALTER TABLE "interview" ADD COLUMN "reschedule_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "interview" ADD COLUMN "reschedule_requested_by_user_id" text;--> statement-breakpoint
ALTER TABLE "skill_tag" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "skill_tag" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "skill_tag" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "skill_tag" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "department_category" ADD CONSTRAINT "department_category_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_category" ADD CONSTRAINT "department_category_category_id_skill_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "department_category_department_category_uidx" ON "department_category" USING btree ("department_id","category_id");--> statement-breakpoint
CREATE INDEX "department_category_department_id_idx" ON "department_category" USING btree ("department_id");--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_reschedule_requested_by_user_id_user_id_fk" FOREIGN KEY ("reschedule_requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_tag" ADD CONSTRAINT "skill_tag_category_id_skill_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interview_rescheduleRequestedByUserId_idx" ON "interview" USING btree ("reschedule_requested_by_user_id");--> statement-breakpoint
CREATE INDEX "skill_tag_category_id_idx" ON "skill_tag" USING btree ("category_id");