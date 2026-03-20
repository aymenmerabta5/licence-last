CREATE TYPE "public"."application_pipeline_stage" AS ENUM('applied', 'screening', 'interview', 'offer', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('applied', 'company_accepted', 'company_refused', 'admin_validated', 'admin_rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."assistant_message_role" AS ENUM('system', 'user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."company_member_role" AS ENUM('owner', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."company_report_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."company_report_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'generated', 'failed');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('agreement', 'certificate');--> statement-breakpoint
CREATE TYPE "public"."internship_type" AS ENUM('pfe', 'immersion', 'summer', 'practical');--> statement-breakpoint
CREATE TYPE "public"."interview_status" AS ENUM('pending_confirmation', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native');--> statement-breakpoint
CREATE TYPE "public"."university_domain_status" AS ENUM('pending', 'approved', 'rejected', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."university_member_role" AS ENUM('department_head');--> statement-breakpoint
CREATE TYPE "public"."university_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'company_admin', 'dept_head', 'university_admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('on_site', 'hybrid', 'remote');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"student_user_id" text NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"pipeline_stage" "application_pipeline_stage" DEFAULT 'applied' NOT NULL,
	"cover_letter" text,
	"company_action_by_user_id" text,
	"company_action_at" timestamp,
	"company_note" text,
	"admin_action_by_user_id" text,
	"admin_action_at" timestamp,
	"admin_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"pipeline_stage_updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "assistant_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"title" text,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" "assistant_message_role" NOT NULL,
	"text" text,
	"parts" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"website_url" text,
	"phone" text,
	"contact_email" text,
	"representative_name" text,
	"wilaya_code" integer,
	"address" text,
	"verification_document_key" text,
	"verification_document_name" text,
	"verification_document_mime_type" text,
	"verification_document_size_bytes" integer,
	"verification_document_uploaded_at" timestamp,
	"status" "company_status" DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp,
	"approved_by_user_id" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_member" (
	"company_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "company_member_role" DEFAULT 'recruiter' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_member_company_id_user_id_pk" PRIMARY KEY("company_id","user_id")
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
CREATE TABLE "department" (
	"id" text PRIMARY KEY NOT NULL,
	"university_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department_skill" (
	"department_id" text NOT NULL,
	"skill_tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_skill_department_id_skill_tag_id_pk" PRIMARY KEY("department_id","skill_tag_id")
);
--> statement-breakpoint
CREATE TABLE "internship_offer" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"internship_type" "internship_type" NOT NULL,
	"work_mode" "work_mode",
	"wilaya_code" integer,
	"duration_weeks" integer,
	"max_positions" integer DEFAULT 1 NOT NULL,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"application_deadline_at" timestamp,
	"expected_start_date" timestamp,
	"expected_end_date" timestamp,
	"closes_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "internship_offer_skill" (
	"offer_id" text NOT NULL,
	"skill_tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internship_offer_skill_offer_id_skill_tag_id_pk" PRIMARY KEY("offer_id","skill_tag_id")
);
--> statement-breakpoint
CREATE TABLE "interview" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"company_id" text NOT NULL,
	"student_user_id" text NOT NULL,
	"proposed_by_user_id" text,
	"confirmed_by_user_id" text,
	"confirmed_slot_id" text,
	"status" "interview_status" DEFAULT 'pending_confirmation' NOT NULL,
	"note" text,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_slot" (
	"id" text PRIMARY KEY NOT NULL,
	"interview_id" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"location" text,
	"meeting_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preference" (
	"user_id" text PRIMARY KEY NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_message" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_message_read_state" (
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL,
	"last_read_message_id" text,
	"last_read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_message_thread" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"company_id" text NOT NULL,
	"student_user_id" text NOT NULL,
	"created_by_user_id" text,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"validated_by_user_id" text,
	"validated_at" timestamp DEFAULT now() NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"placement_id" text NOT NULL,
	"type" "document_type" NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"storage_key" text,
	"url" text,
	"verification_code" text,
	"snapshot_data" jsonb,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_bucket" (
	"bucket_key" text NOT NULL,
	"window_ms" integer NOT NULL,
	"window_start" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limit_bucket_pk" PRIMARY KEY("bucket_key","window_ms","window_start")
);
--> statement-breakpoint
CREATE TABLE "saved_offer" (
	"user_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_offer_user_id_offer_id_pk" PRIMARY KEY("user_id","offer_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "skill_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skill_tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "student_experience" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"organization" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "student_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"wilaya_code" integer,
	"bio" text,
	"phone" text,
	"github_url" text,
	"portfolio_url" text,
	"student_number" text,
	"department" text,
	"department_id" text,
	"level" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_project" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"project_url" text,
	"repository_url" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_resume" (
	"user_id" text PRIMARY KEY NOT NULL,
	"file_key" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_skill" (
	"user_id" text NOT NULL,
	"skill_tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_skill_user_id_skill_tag_id_pk" PRIMARY KEY("user_id","skill_tag_id")
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
CREATE TABLE "university" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"abbreviation" text,
	"address" text,
	"city" text,
	"wilaya_code" integer,
	"phone" text,
	"logo_url" text,
	"department_name" text,
	"status" "university_status" DEFAULT 'approved' NOT NULL,
	"approved_at" timestamp,
	"approved_by_user_id" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "university_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "university_domain" (
	"id" text PRIMARY KEY NOT NULL,
	"university_id" text NOT NULL,
	"domain" text NOT NULL,
	"status" "university_domain_status" DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "university_domain_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "university_member" (
	"user_id" text PRIMARY KEY NOT NULL,
	"university_id" text NOT NULL,
	"role" "university_member_role" NOT NULL,
	"department_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"university_id" text,
	"department_id" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"two_factor_enabled" boolean DEFAULT false,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_company_action_by_user_id_user_id_fk" FOREIGN KEY ("company_action_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_admin_action_by_user_id_user_id_fk" FOREIGN KEY ("admin_action_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_timeline_event" ADD CONSTRAINT "application_timeline_event_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_timeline_event" ADD CONSTRAINT "application_timeline_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_conversation" ADD CONSTRAINT "assistant_conversation_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_conversation" ADD CONSTRAINT "assistant_conversation_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_message" ADD CONSTRAINT "assistant_message_conversation_id_assistant_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."assistant_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_quality_feedback" ADD CONSTRAINT "company_quality_feedback_placement_id_placement_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_quality_feedback" ADD CONSTRAINT "company_quality_feedback_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_quality_feedback" ADD CONSTRAINT "company_quality_feedback_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_report" ADD CONSTRAINT "company_report_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_report" ADD CONSTRAINT "company_report_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_report" ADD CONSTRAINT "company_report_resolved_by_user_id_user_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_skill" ADD CONSTRAINT "department_skill_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_skill" ADD CONSTRAINT "department_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."skill_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer" ADD CONSTRAINT "internship_offer_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer_language_requirement" ADD CONSTRAINT "internship_offer_language_requirement_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer_skill" ADD CONSTRAINT "internship_offer_skill_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer_skill" ADD CONSTRAINT "internship_offer_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."skill_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_proposed_by_user_id_user_id_fk" FOREIGN KEY ("proposed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_confirmed_by_user_id_user_id_fk" FOREIGN KEY ("confirmed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_confirmed_slot_id_interview_slot_id_fk" FOREIGN KEY ("confirmed_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD CONSTRAINT "interview_slot_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message" ADD CONSTRAINT "offer_message_thread_id_offer_message_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."offer_message_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message" ADD CONSTRAINT "offer_message_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message" ADD CONSTRAINT "offer_message_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_read_state" ADD CONSTRAINT "offer_message_read_state_thread_id_offer_message_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."offer_message_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_read_state" ADD CONSTRAINT "offer_message_read_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_read_state" ADD CONSTRAINT "offer_message_read_state_last_read_message_id_offer_message_id_fk" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."offer_message"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_thread" ADD CONSTRAINT "offer_message_thread_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_thread" ADD CONSTRAINT "offer_message_thread_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_thread" ADD CONSTRAINT "offer_message_thread_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_message_thread" ADD CONSTRAINT "offer_message_thread_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement" ADD CONSTRAINT "placement_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement" ADD CONSTRAINT "placement_validated_by_user_id_user_id_fk" FOREIGN KEY ("validated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_placement_id_placement_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_offer" ADD CONSTRAINT "saved_offer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_offer" ADD CONSTRAINT "saved_offer_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_experience" ADD CONSTRAINT "student_experience_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_language" ADD CONSTRAINT "student_language_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_offer_readiness_snapshot" ADD CONSTRAINT "student_offer_readiness_snapshot_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_offer_readiness_snapshot" ADD CONSTRAINT "student_offer_readiness_snapshot_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_project" ADD CONSTRAINT "student_project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_resume" ADD CONSTRAINT "student_resume_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skill" ADD CONSTRAINT "student_skill_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skill" ADD CONSTRAINT "student_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."skill_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university" ADD CONSTRAINT "university_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_domain" ADD CONSTRAINT "university_domain_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_member" ADD CONSTRAINT "university_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_member" ADD CONSTRAINT "university_member_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_member" ADD CONSTRAINT "university_member_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "application_offer_student_uidx" ON "application" USING btree ("offer_id","student_user_id");--> statement-breakpoint
CREATE INDEX "application_offerId_idx" ON "application" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "application_studentUserId_idx" ON "application" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "application_status_idx" ON "application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "application_pipelineStage_idx" ON "application" USING btree ("pipeline_stage");--> statement-breakpoint
CREATE INDEX "application_createdAt_idx" ON "application" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "application_offerId_status_idx" ON "application" USING btree ("offer_id","status");--> statement-breakpoint
CREATE INDEX "application_studentUserId_status_idx" ON "application" USING btree ("student_user_id","status");--> statement-breakpoint
CREATE INDEX "application_companyActionByUserId_idx" ON "application" USING btree ("company_action_by_user_id");--> statement-breakpoint
CREATE INDEX "application_adminActionByUserId_idx" ON "application" USING btree ("admin_action_by_user_id");--> statement-breakpoint
CREATE INDEX "application_timeline_event_applicationId_idx" ON "application_timeline_event" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_timeline_event_actorUserId_idx" ON "application_timeline_event" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "application_timeline_event_eventType_idx" ON "application_timeline_event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "application_timeline_event_createdAt_idx" ON "application_timeline_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "application_timeline_event_applicationId_createdAt_idx" ON "application_timeline_event" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "assistant_conversation_companyId_idx" ON "assistant_conversation" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "assistant_conversation_createdByUserId_idx" ON "assistant_conversation" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "assistant_conversation_updatedAt_idx" ON "assistant_conversation" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "assistant_message_conversationId_createdAt_idx" ON "assistant_message" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "company" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "company_wilayaCode_idx" ON "company" USING btree ("wilaya_code");--> statement-breakpoint
CREATE INDEX "company_status_idx" ON "company" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_approvedByUserId_idx" ON "company" USING btree ("approved_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_member_userId_uidx" ON "company_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "company_member_companyId_idx" ON "company_member" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "company_quality_feedback_placement_uidx" ON "company_quality_feedback" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX "company_quality_feedback_company_idx" ON "company_quality_feedback" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_quality_feedback_student_idx" ON "company_quality_feedback" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "company_report_company_idx" ON "company_report" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_report_status_idx" ON "company_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_report_severity_idx" ON "company_report" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "company_report_reporter_idx" ON "company_report" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE INDEX "company_report_resolvedByUserId_idx" ON "company_report" USING btree ("resolved_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "department_name_university_uidx" ON "department" USING btree ("name","university_id");--> statement-breakpoint
CREATE INDEX "department_universityId_idx" ON "department" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "department_skill_skillTagId_idx" ON "department_skill" USING btree ("skill_tag_id");--> statement-breakpoint
CREATE INDEX "internship_offer_companyId_idx" ON "internship_offer" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "internship_offer_status_idx" ON "internship_offer" USING btree ("status");--> statement-breakpoint
CREATE INDEX "internship_offer_wilayaCode_idx" ON "internship_offer" USING btree ("wilaya_code");--> statement-breakpoint
CREATE INDEX "internship_offer_createdAt_idx" ON "internship_offer" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "internship_offer_language_requirement_languageCode_idx" ON "internship_offer_language_requirement" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "internship_offer_skill_skillTagId_idx" ON "internship_offer_skill" USING btree ("skill_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "interview_applicationId_uidx" ON "interview" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interview_offerId_idx" ON "interview" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "interview_companyId_idx" ON "interview" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "interview_studentUserId_idx" ON "interview" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "interview_status_idx" ON "interview" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interview_proposedByUserId_idx" ON "interview" USING btree ("proposed_by_user_id");--> statement-breakpoint
CREATE INDEX "interview_confirmedByUserId_idx" ON "interview" USING btree ("confirmed_by_user_id");--> statement-breakpoint
CREATE INDEX "interview_slot_interviewId_idx" ON "interview_slot" USING btree ("interview_id");--> statement-breakpoint
CREATE INDEX "interview_slot_startsAt_idx" ON "interview_slot" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_userId_readAt_idx" ON "notification" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notification_userId_createdAt_idx" ON "notification" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "offer_message_threadId_createdAt_idx" ON "offer_message" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "offer_message_offerId_idx" ON "offer_message" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "offer_message_senderUserId_idx" ON "offer_message" USING btree ("sender_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offer_message_read_state_thread_user_uidx" ON "offer_message_read_state" USING btree ("thread_id","user_id");--> statement-breakpoint
CREATE INDEX "offer_message_read_state_userId_idx" ON "offer_message_read_state" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offer_message_thread_offer_student_uidx" ON "offer_message_thread" USING btree ("offer_id","student_user_id");--> statement-breakpoint
CREATE INDEX "offer_message_thread_companyId_idx" ON "offer_message_thread" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "offer_message_thread_studentUserId_idx" ON "offer_message_thread" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "offer_message_thread_lastMessageAt_idx" ON "offer_message_thread" USING btree ("last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX "placement_applicationId_uidx" ON "placement" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "placement_validatedAt_idx" ON "placement" USING btree ("validated_at");--> statement-breakpoint
CREATE INDEX "placement_validatedByUserId_idx" ON "placement" USING btree ("validated_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_placement_type_uidx" ON "document" USING btree ("placement_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "document_verification_code_uidx" ON "document" USING btree ("verification_code");--> statement-breakpoint
CREATE INDEX "document_placementId_idx" ON "document" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX "document_type_idx" ON "document" USING btree ("type");--> statement-breakpoint
CREATE INDEX "document_status_idx" ON "document" USING btree ("status");--> statement-breakpoint
CREATE INDEX "document_storageKey_idx" ON "document" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "rate_limit_bucket_updated_at_idx" ON "rate_limit_bucket" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "saved_offer_offerId_idx" ON "saved_offer" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "saved_offer_userId_createdAt_idx" ON "saved_offer" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "skill_tag_slug_idx" ON "skill_tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "skill_tag_name_idx" ON "skill_tag" USING btree ("name");--> statement-breakpoint
CREATE INDEX "student_experience_userId_idx" ON "student_experience" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_experience_userId_startDate_idx" ON "student_experience" USING btree ("user_id","start_date");--> statement-breakpoint
CREATE INDEX "student_language_languageCode_idx" ON "student_language" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "student_offer_readiness_snapshot_student_offer_idx" ON "student_offer_readiness_snapshot" USING btree ("student_user_id","offer_id");--> statement-breakpoint
CREATE INDEX "student_offer_readiness_snapshot_capturedAt_idx" ON "student_offer_readiness_snapshot" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "student_offer_readiness_snapshot_offerId_idx" ON "student_offer_readiness_snapshot" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "student_profile_wilayaCode_idx" ON "student_profile" USING btree ("wilaya_code");--> statement-breakpoint
CREATE INDEX "student_profile_departmentId_idx" ON "student_profile" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "student_project_userId_idx" ON "student_project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_project_userId_createdAt_idx" ON "student_project" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "student_resume_uploadedAt_idx" ON "student_resume" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "student_skill_skillTagId_idx" ON "student_skill" USING btree ("skill_tag_id");--> statement-breakpoint
CREATE INDEX "university_name_idx" ON "university" USING btree ("name");--> statement-breakpoint
CREATE INDEX "university_status_idx" ON "university" USING btree ("status");--> statement-breakpoint
CREATE INDEX "university_approvedByUserId_idx" ON "university" USING btree ("approved_by_user_id");--> statement-breakpoint
CREATE INDEX "university_domain_domain_idx" ON "university_domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "university_domain_status_idx" ON "university_domain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "university_domain_universityId_idx" ON "university_domain" USING btree ("university_id");--> statement-breakpoint
CREATE UNIQUE INDEX "university_member_departmentId_uidx" ON "university_member" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "university_member_universityId_idx" ON "university_member" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "user_universityId_idx" ON "user" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "user_role_universityId_idx" ON "user" USING btree ("role","university_id");--> statement-breakpoint
CREATE INDEX "user_departmentId_idx" ON "user" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");