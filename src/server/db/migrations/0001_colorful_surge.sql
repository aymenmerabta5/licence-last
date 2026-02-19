CREATE TYPE "public"."application_status" AS ENUM('applied', 'company_accepted', 'company_refused', 'admin_validated', 'admin_rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."company_member_role" AS ENUM('owner', 'recruiter');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'generated', 'failed');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('agreement', 'certificate');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."university_domain_status" AS ENUM('pending', 'approved', 'rejected', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'company_admin', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('on_site', 'hybrid', 'remote');