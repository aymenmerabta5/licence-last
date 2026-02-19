CREATE TYPE "public"."assistant_message_role" AS ENUM('system', 'user', 'assistant');--> statement-breakpoint
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
ALTER TABLE "assistant_conversation" ADD CONSTRAINT "assistant_conversation_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_conversation" ADD CONSTRAINT "assistant_conversation_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_message" ADD CONSTRAINT "assistant_message_conversation_id_assistant_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."assistant_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistant_conversation_companyId_idx" ON "assistant_conversation" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "assistant_conversation_createdByUserId_idx" ON "assistant_conversation" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "assistant_conversation_updatedAt_idx" ON "assistant_conversation" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "assistant_message_conversationId_createdAt_idx" ON "assistant_message" USING btree ("conversation_id","created_at");