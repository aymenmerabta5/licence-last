CREATE TYPE "public"."application_pipeline_stage" AS ENUM('applied', 'screening', 'interview', 'offer', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."company_report_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."company_report_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native');--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "pipeline_stage" "application_pipeline_stage" DEFAULT 'applied' NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "pipeline_stage_updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE TABLE "application_timeline_event" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"actor_user_id" text,
	"event_type" text NOT NULL,
	"from_stage" "application_pipeline_stage",
	"to_stage" "application_pipeline_stage",
	"from_status" "application_status",
	"to_status" "application_status",
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_language" (
	"user_id" text NOT NULL,
	"language_code" text NOT NULL,
	"proficiency" "proficiency_level" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_language_user_id_language_code_pk" PRIMARY KEY("user_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "internship_offer_language_requirement" (
	"offer_id" text NOT NULL,
	"language_code" text NOT NULL,
	"minimum_proficiency" "proficiency_level" NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internship_offer_language_requirement_offer_id_language_code_pk" PRIMARY KEY("offer_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "student_offer_readiness_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"student_user_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"ready_percent" integer NOT NULL,
	"missing_skills_count" integer NOT NULL,
	"source" text DEFAULT 'offer_view' NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_quality_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"placement_id" text NOT NULL,
	"company_id" text NOT NULL,
	"student_user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"would_recommend" boolean DEFAULT false NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_report" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"reporter_user_id" text NOT NULL,
	"category" text NOT NULL,
	"severity" "company_report_severity" DEFAULT 'medium' NOT NULL,
	"description" text NOT NULL,
	"status" "company_report_status" DEFAULT 'open' NOT NULL,
	"resolution_note" text,
	"resolved_by_user_id" text,
	"resolved_at" timestamp,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_timeline_event" ADD CONSTRAINT "application_timeline_event_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_timeline_event" ADD CONSTRAINT "application_timeline_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_language" ADD CONSTRAINT "student_language_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer_language_requirement" ADD CONSTRAINT "internship_offer_language_requirement_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_offer_readiness_snapshot" ADD CONSTRAINT "student_offer_readiness_snapshot_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_offer_readiness_snapshot" ADD CONSTRAINT "student_offer_readiness_snapshot_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_quality_feedback" ADD CONSTRAINT "company_quality_feedback_placement_id_placement_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_quality_feedback" ADD CONSTRAINT "company_quality_feedback_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_quality_feedback" ADD CONSTRAINT "company_quality_feedback_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_report" ADD CONSTRAINT "company_report_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_report" ADD CONSTRAINT "company_report_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_report" ADD CONSTRAINT "company_report_resolved_by_user_id_user_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_pipelineStage_idx" ON "application" USING btree ("pipeline_stage");--> statement-breakpoint
CREATE INDEX "application_timeline_event_applicationId_idx" ON "application_timeline_event" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_timeline_event_actorUserId_idx" ON "application_timeline_event" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "application_timeline_event_eventType_idx" ON "application_timeline_event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "application_timeline_event_createdAt_idx" ON "application_timeline_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "student_language_languageCode_idx" ON "student_language" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "internship_offer_language_requirement_languageCode_idx" ON "internship_offer_language_requirement" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "student_offer_readiness_snapshot_student_offer_idx" ON "student_offer_readiness_snapshot" USING btree ("student_user_id","offer_id");--> statement-breakpoint
CREATE INDEX "student_offer_readiness_snapshot_capturedAt_idx" ON "student_offer_readiness_snapshot" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "student_offer_readiness_snapshot_offerId_idx" ON "student_offer_readiness_snapshot" USING btree ("offer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_quality_feedback_placement_uidx" ON "company_quality_feedback" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX "company_quality_feedback_company_idx" ON "company_quality_feedback" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_quality_feedback_student_idx" ON "company_quality_feedback" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "company_report_company_idx" ON "company_report" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_report_status_idx" ON "company_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_report_severity_idx" ON "company_report" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "company_report_reporter_idx" ON "company_report" USING btree ("reporter_user_id");--> statement-breakpoint

UPDATE "application"
SET "pipeline_stage" = CASE
  WHEN "status" = 'applied' THEN 'applied'::application_pipeline_stage
  WHEN "status" = 'company_accepted' THEN 'offer'::application_pipeline_stage
  WHEN "status" = 'admin_validated' THEN 'accepted'::application_pipeline_stage
  ELSE 'rejected'::application_pipeline_stage
END;
