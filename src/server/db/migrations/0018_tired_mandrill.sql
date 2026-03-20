CREATE TYPE "public"."interview_status" AS ENUM('pending_confirmation', 'confirmed', 'cancelled');--> statement-breakpoint
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
CREATE TABLE "saved_offer" (
	"user_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_offer_user_id_offer_id_pk" PRIMARY KEY("user_id","offer_id")
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
ALTER TABLE "company" ADD COLUMN "verification_document_key" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "verification_document_name" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "verification_document_mime_type" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "verification_document_size_bytes" integer;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "verification_document_uploaded_at" timestamp;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "snapshot_data" jsonb;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_student_user_id_user_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_proposed_by_user_id_user_id_fk" FOREIGN KEY ("proposed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_confirmed_by_user_id_user_id_fk" FOREIGN KEY ("confirmed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_confirmed_slot_id_interview_slot_id_fk" FOREIGN KEY ("confirmed_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD CONSTRAINT "interview_slot_interview_id_interview_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interview"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "saved_offer" ADD CONSTRAINT "saved_offer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_offer" ADD CONSTRAINT "saved_offer_offer_id_internship_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."internship_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_experience" ADD CONSTRAINT "student_experience_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_project" ADD CONSTRAINT "student_project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_resume" ADD CONSTRAINT "student_resume_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "interview_applicationId_uidx" ON "interview" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interview_offerId_idx" ON "interview" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "interview_companyId_idx" ON "interview" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "interview_studentUserId_idx" ON "interview" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "interview_status_idx" ON "interview" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interview_proposedByUserId_idx" ON "interview" USING btree ("proposed_by_user_id");--> statement-breakpoint
CREATE INDEX "interview_confirmedByUserId_idx" ON "interview" USING btree ("confirmed_by_user_id");--> statement-breakpoint
CREATE INDEX "interview_slot_interviewId_idx" ON "interview_slot" USING btree ("interview_id");--> statement-breakpoint
CREATE INDEX "interview_slot_startsAt_idx" ON "interview_slot" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "offer_message_threadId_createdAt_idx" ON "offer_message" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "offer_message_offerId_idx" ON "offer_message" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "offer_message_senderUserId_idx" ON "offer_message" USING btree ("sender_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offer_message_read_state_thread_user_uidx" ON "offer_message_read_state" USING btree ("thread_id","user_id");--> statement-breakpoint
CREATE INDEX "offer_message_read_state_userId_idx" ON "offer_message_read_state" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offer_message_thread_offer_student_uidx" ON "offer_message_thread" USING btree ("offer_id","student_user_id");--> statement-breakpoint
CREATE INDEX "offer_message_thread_companyId_idx" ON "offer_message_thread" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "offer_message_thread_studentUserId_idx" ON "offer_message_thread" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "offer_message_thread_lastMessageAt_idx" ON "offer_message_thread" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "saved_offer_offerId_idx" ON "saved_offer" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "saved_offer_userId_createdAt_idx" ON "saved_offer" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "student_experience_userId_idx" ON "student_experience" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_experience_userId_startDate_idx" ON "student_experience" USING btree ("user_id","start_date");--> statement-breakpoint
CREATE INDEX "student_project_userId_idx" ON "student_project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_project_userId_createdAt_idx" ON "student_project" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "student_resume_uploadedAt_idx" ON "student_resume" USING btree ("uploaded_at");--> statement-breakpoint
ALTER TABLE "university" ADD CONSTRAINT "university_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_companyActionByUserId_idx" ON "application" USING btree ("company_action_by_user_id");--> statement-breakpoint
CREATE INDEX "application_adminActionByUserId_idx" ON "application" USING btree ("admin_action_by_user_id");--> statement-breakpoint
CREATE INDEX "application_timeline_event_applicationId_createdAt_idx" ON "application_timeline_event" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "company_approvedByUserId_idx" ON "company" USING btree ("approved_by_user_id");--> statement-breakpoint
CREATE INDEX "company_report_resolvedByUserId_idx" ON "company_report" USING btree ("resolved_by_user_id");--> statement-breakpoint
CREATE INDEX "notification_userId_createdAt_idx" ON "notification" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "placement_validatedByUserId_idx" ON "placement" USING btree ("validated_by_user_id");--> statement-breakpoint
CREATE INDEX "document_storageKey_idx" ON "document" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "university_approvedByUserId_idx" ON "university" USING btree ("approved_by_user_id");--> statement-breakpoint
CREATE INDEX "user_departmentId_idx" ON "user" USING btree ("department_id");--> statement-breakpoint
ALTER TABLE "department" DROP COLUMN "head_name";