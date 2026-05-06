CREATE TABLE "field" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "field_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "field_skill" (
	"field_id" text NOT NULL,
	"skill_tag_id" text NOT NULL,
	"is_core" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "field_skill_field_id_skill_tag_id_pk" PRIMARY KEY("field_id","skill_tag_id")
);
--> statement-breakpoint
ALTER TABLE "department" ADD COLUMN "field_id" text;
--> statement-breakpoint
ALTER TABLE "department_skill" ADD COLUMN "action" text DEFAULT 'add' NOT NULL;
--> statement-breakpoint
ALTER TABLE "department_skill" ADD COLUMN "created_by_user_id" text NOT NULL;
--> statement-breakpoint
CREATE INDEX "field_slug_idx" ON "field" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "field_name_idx" ON "field" USING btree ("name");
--> statement-breakpoint
CREATE INDEX "field_skill_skillTagId_idx" ON "field_skill" USING btree ("skill_tag_id");
--> statement-breakpoint
ALTER TABLE "field_skill" ADD CONSTRAINT "field_skill_field_id_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "field"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "field_skill" ADD CONSTRAINT "field_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "skill_tag"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_field_id_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "field"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "department_skill" ADD CONSTRAINT "department_skill_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
