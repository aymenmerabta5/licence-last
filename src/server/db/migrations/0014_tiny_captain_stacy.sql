CREATE INDEX "student_profile_departmentId_idx" ON "student_profile" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "user_universityId_idx" ON "user" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "user_role_universityId_idx" ON "user" USING btree ("role","university_id");
