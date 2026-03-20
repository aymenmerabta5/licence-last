CREATE TYPE "user_role" AS ENUM ('student', 'company_admin', 'dept_head', 'university_admin', 'super_admin');
--> statement-breakpoint
CREATE TYPE "company_status" AS ENUM ('pending', 'approved', 'rejected', 'suspended');
--> statement-breakpoint
CREATE TYPE "university_domain_status" AS ENUM ('pending', 'approved', 'rejected', 'disabled');
--> statement-breakpoint
CREATE TYPE "company_member_role" AS ENUM ('owner', 'recruiter');
--> statement-breakpoint
CREATE TYPE "university_member_role" AS ENUM ('department_head');
--> statement-breakpoint
CREATE TYPE "offer_status" AS ENUM ('draft', 'published', 'closed');
--> statement-breakpoint
CREATE TYPE "work_mode" AS ENUM ('on_site', 'hybrid', 'remote');
--> statement-breakpoint
CREATE TYPE "application_status" AS ENUM ('applied', 'company_accepted', 'company_refused', 'admin_validated', 'admin_rejected', 'withdrawn');
--> statement-breakpoint
CREATE TYPE "application_pipeline_stage" AS ENUM ('applied', 'screening', 'interview', 'offer', 'accepted', 'rejected');
--> statement-breakpoint
CREATE TYPE "document_type" AS ENUM ('agreement', 'certificate');
--> statement-breakpoint
CREATE TYPE "internship_type" AS ENUM ('pfe', 'immersion', 'summer', 'practical');
--> statement-breakpoint
CREATE TYPE "assistant_message_role" AS ENUM ('system', 'user', 'assistant');
--> statement-breakpoint
CREATE TYPE "document_status" AS ENUM ('pending', 'generated', 'failed');
--> statement-breakpoint
CREATE TYPE "proficiency_level" AS ENUM ('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native');
--> statement-breakpoint
CREATE TYPE "company_report_status" AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
--> statement-breakpoint
CREATE TYPE "company_report_severity" AS ENUM ('low', 'medium', 'high', 'critical');
--> statement-breakpoint
CREATE TYPE "university_status" AS ENUM ('pending', 'approved', 'rejected');
--> statement-breakpoint
CREATE TYPE "interview_status" AS ENUM ('pending_confirmation', 'confirmed', 'cancelled');
--> statement-breakpoint
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
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"university_id" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
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
CREATE TABLE "university" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "university_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "university_domain" (
	"id" text PRIMARY KEY NOT NULL,
	"university_id" text NOT NULL,
	"domain" text NOT NULL,
	"status" "university_domain_status" DEFAULT 'pending' NOT NULL,
	"requested_by_email" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"request_note" text,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp,
	"review_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "university_domain_domain_unique" UNIQUE("domain")
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
CREATE TABLE "student_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"wilaya_code" integer,
	"bio" text,
	"phone" text,
	"github_url" text,
	"portfolio_url" text,
	"student_number" text,
	"department" text,
	"level" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
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
CREATE TABLE "company" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"website_url" text,
	"wilaya_code" integer,
	"address" text,
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
CREATE TABLE "internship_offer" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"internship_type" text NOT NULL,
	"work_mode" "work_mode",
	"wilaya_code" integer,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"closes_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internship_offer_skill" (
	"offer_id" text NOT NULL,
	"skill_tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internship_offer_skill_offer_id_skill_tag_id_pk" PRIMARY KEY("offer_id","skill_tag_id")
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"student_user_id" text NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"cover_letter" text,
	"company_action_by_user_id" text,
	"company_action_at" timestamp,
	"company_note" text,
	"admin_action_by_user_id" text,
	"admin_action_at" timestamp,
	"admin_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"validated_by_user_id" text,
	"validated_at" timestamp DEFAULT now() NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
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
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
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
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_domain" ADD CONSTRAINT "university_domain_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_domain" ADD CONSTRAINT "university_domain_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skill" ADD CONSTRAINT "student_skill_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_skill" ADD CONSTRAINT "student_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."skill_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer" ADD CONSTRAINT "internship_offer_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer_skill" ADD CONSTRAINT "internship_offer_skill_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offer_skill" ADD CONSTRAINT "internship_offer_skill_skill_tag_id_skill_tag_id_fk" FOREIGN KEY ("skill_tag_id") REFERENCES "public"."skill_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_company_action_by_user_id_user_id_fk" FOREIGN KEY ("company_action_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_admin_action_by_user_id_user_id_fk" FOREIGN KEY ("admin_action_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement" ADD CONSTRAINT "placement_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement" ADD CONSTRAINT "placement_validated_by_user_id_user_id_fk" FOREIGN KEY ("validated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_placement_id_placement_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."placement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "university_name_idx" ON "university" USING btree ("name");--> statement-breakpoint
CREATE INDEX "university_domain_domain_idx" ON "university_domain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "university_domain_status_idx" ON "university_domain" USING btree ("status");--> statement-breakpoint
CREATE INDEX "university_domain_universityId_idx" ON "university_domain" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "skill_tag_slug_idx" ON "skill_tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "skill_tag_name_idx" ON "skill_tag" USING btree ("name");--> statement-breakpoint
CREATE INDEX "student_profile_wilayaCode_idx" ON "student_profile" USING btree ("wilaya_code");--> statement-breakpoint
CREATE INDEX "student_skill_skillTagId_idx" ON "student_skill" USING btree ("skill_tag_id");--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "company" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "company_wilayaCode_idx" ON "company" USING btree ("wilaya_code");--> statement-breakpoint
CREATE INDEX "company_status_idx" ON "company" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_member_userId_idx" ON "company_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "company_member_companyId_idx" ON "company_member" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "internship_offer_companyId_idx" ON "internship_offer" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "internship_offer_status_idx" ON "internship_offer" USING btree ("status");--> statement-breakpoint
CREATE INDEX "internship_offer_wilayaCode_idx" ON "internship_offer" USING btree ("wilaya_code");--> statement-breakpoint
CREATE INDEX "internship_offer_skill_skillTagId_idx" ON "internship_offer_skill" USING btree ("skill_tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "application_offer_student_uidx" ON "application" USING btree ("offer_id","student_user_id");--> statement-breakpoint
CREATE INDEX "application_offerId_idx" ON "application" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "application_studentUserId_idx" ON "application" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "application_status_idx" ON "application" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "placement_applicationId_uidx" ON "placement" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "placement_validatedAt_idx" ON "placement" USING btree ("validated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "document_placement_type_uidx" ON "document" USING btree ("placement_id","type");--> statement-breakpoint
CREATE INDEX "document_placementId_idx" ON "document" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX "document_type_idx" ON "document" USING btree ("type");--> statement-breakpoint
CREATE INDEX "document_status_idx" ON "document" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_userId_readAt_idx" ON "notification" USING btree ("user_id","read_at");