CREATE TABLE "department_skill" (
	"department_id" text NOT NULL,
	"skill_tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_skill_department_id_skill_tag_id_pk" PRIMARY KEY("department_id","skill_tag_id")
);
--> statement-breakpoint
ALTER TABLE "department_skill" ADD CONSTRAINT "department_skill_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_skill" ADD CONSTRAINT "department_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."skill_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "department_skill_skillTagId_idx" ON "department_skill" USING btree ("skill_tag_id");