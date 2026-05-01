# Stag.io — Manual Testing Checklist

> **Purpose:** This document contains every use case that must be manually verified before the jury presentation.  
> **How to use:** Test each item. If it passes, mark `[X]`. If it fails, note the bug and fix it. Re-test until everything is checked.  
> **Legend:**
> - `[ ]` = Untested
> - `[X]` = Tested and passed
> - `⚠️` = Tested but has issues (describe in notes)

---

## Table of Contents

1. [Authentication & Onboarding](#1-authentication--onboarding)
2. [Student Profile & CV Management](#2-student-profile--cv-management)
3. [Company Management & Trust System](#3-company-management--trust-system)
4. [University & Department Management](#4-university--department-management)
5. [Offer Management (Company Side)](#5-offer-management-company-side)
6. [Offer Discovery & Search (Student / Public)](#6-offer-discovery--search-student--public)
7. [Application & Pipeline Flow](#7-application--pipeline-flow)
8. [Interview Scheduling](#8-interview-scheduling)
9. [Matching, Recommendations & AI Assistant](#9-matching-recommendations--ai-assistant)
10. [Messaging System](#10-messaging-system)
11. [Documents, Uploads & Verification](#11-documents-uploads--verification)
12. [Notifications & Preferences](#12-notifications--preferences)
13. [Admin Dashboard, Stats & Moderation](#13-admin-dashboard-stats--moderation)
14. [UI/UX, i18n, RTL & Theme](#14-uiux-i18n-rtl--theme)
15. [Security, Rate Limiting & Edge Cases](#15-security-rate-limiting--edge-cases)
16. [Known Gaps & Not Implemented](#16-known-gaps--not-implemented)

---

## 1. Authentication & Onboarding

### 1.1 Login

- [ ] **Test:** Login with valid credentials and verified email  
  **Role:** Any registered user (Student, Company Admin, University Admin, Super Admin)  
  **Steps:**
  1. Navigate to `/login`.
  2. Enter valid email and password.
  3. Submit form.
  **Expected:** User is authenticated and redirected based on onboarding/status (dashboard if complete, onboarding if incomplete, status page if pending/rejected/suspended).  
  **Edge cases:** Test for each role separately.

- [ ] **Test:** Login with invalid email format  
  **Role:** Guest  
  **Steps:** Enter `not-an-email` in email field and submit.  
  **Expected:** Client-side validation error displays below the email field; form is not submitted.

- [ ] **Test:** Login with empty password  
  **Role:** Guest  
  **Steps:** Enter valid email, leave password empty, submit.  
  **Expected:** Client-side validation error displays below password field.

- [ ] **Test:** Login with wrong password  
  **Role:** Guest  
  **Steps:** Enter valid email and incorrect password, submit.  
  **Expected:** Server error alert displayed; Turnstile resets; password field remains editable.

- [ ] **Test:** Login with unverified email address  
  **Role:** Guest (unverified account)  
  **Steps:** Enter email and password for an unverified account, submit.  
  **Expected:** Server error "email not verified" shown; a "Resend verification" button appears below the error.

- [ ] **Test:** Resend verification email from login page  
  **Role:** Guest (unverified account)  
  **Steps:** Trigger unverified error, then click "Resend verification".  
  **Expected:** Toast success confirming email sent; no duplicate server error.

- [ ] **Test:** Login with "Remember me" enabled vs disabled  
  **Role:** Any user  
  **Steps:** Check/uncheck "Remember me" and submit valid credentials.  
  **Expected:** With checked, session cookie persists across browser restarts. With unchecked, session expires when browser closes.

- [ ] **Test:** Login with Turnstile CAPTCHA missing or expired  
  **Role:** Guest  
  **Steps:** Submit login without completing CAPTCHA, or wait for expiration then submit.  
  **Expected:** Client-side error "captcha required" or Turnstile resets with localized error.

- [ ] **Test:** Login with Two-Factor Authentication (TOTP / OTP / Backup code)  
  **Role:** User with 2FA enabled  
  **Steps:** Enter valid email/password, then on 2FA step enter valid TOTP, OTP from email, or backup code.  
  **Expected:** User is logged in and redirected appropriately. Backup code is consumed.

- [ ] **Test:** Login with invalid 2FA code  
  **Role:** User with 2FA enabled  
  **Steps:** Enter wrong TOTP/OTP/backup code.  
  **Expected:** Localized "invalid code" error; user remains on 2FA step.

- [ ] **Test:** Login with 2FA and "Trust device" enabled  
  **Role:** User with 2FA enabled  
  **Steps:** Complete login + 2FA with "Trust device" checked.  
  **Expected:** Subsequent logins from same device may skip 2FA prompt.

- [ ] **Test:** Navigate back from 2FA step to credential form  
  **Role:** User with 2FA enabled  
  **Steps:** Reach the 2FA step, click "Back to login".  
  **Expected:** Returns to email/password form; 2FA code field is cleared; no server error persists.

- [ ] **Test:** Password visibility toggle on login  
  **Role:** Guest  
  **Steps:** Type password, click eye icon, click again.  
  **Expected:** Password toggles between plaintext and masked.

- [ ] **Test:** Login footer link navigation  
  **Role:** Guest  
  **Steps:** Click "Forgot password?" and "Create one" links.  
  **Expected:** Navigate to `/reset-password` and `/signup` respectively.

- [ ] **Test:** Loading state during login submission  
  **Role:** Guest  
  **Steps:** Submit valid credentials.  
  **Expected:** Submit button shows spinner and is disabled while submitting.

- [ ] **Test:** RTL layout on login page (Arabic locale)  
  **Role:** Guest  
  **Steps:** Switch locale to Arabic (`/ar/login`). Inspect form layout and back arrows.  
  **Expected:** Arrow icons rotate 180deg; logical CSS properties (`ms-*`, `me-*`) are used; text alignment respects RTL.

### 1.2 Signup

- [ ] **Test:** Student signup with approved university email domain  
  **Role:** Guest  
  **Steps:** Select "Student", fill name, valid university email matching an approved domain, matching passwords, check terms, submit.  
  **Expected:** Account created; success screen shows "check your email"; verification email sent.

- [ ] **Test:** Student signup with non-university email domain  
  **Role:** Guest  
  **Steps:** Select "Student", use `@gmail.com` or any non-approved domain, submit.  
  **Expected:** Server error: "University email domain is not approved yet."

- [ ] **Test:** Company admin signup  
  **Role:** Guest  
  **Steps:** Select "Company", fill name, any valid email, matching passwords, check terms, submit.  
  **Expected:** Account created with role `company_admin`; success screen shows company-specific verification description.

- [ ] **Test:** University admin signup  
  **Role:** Guest  
  **Steps:** Select "University", fill name, any valid email, matching passwords, check terms, submit.  
  **Expected:** Account created with role `university_admin`; success screen shows university-specific verification description.

- [ ] **Test:** Signup role selector back navigation  
  **Role:** Guest  
  **Steps:** Click any role, then click back arrow.  
  **Expected:** Returns to role selection screen.

- [ ] **Test:** Signup with duplicate email  
  **Role:** Guest  
  **Steps:** Submit signup with an email already in database.  
  **Expected:** Server error: localized "email already exists"; Turnstile resets.

- [ ] **Test:** Signup with invalid email format  
  **Role:** Guest  
  **Steps:** Enter malformed email and submit.  
  **Expected:** Client-side validation error below email field.

- [ ] **Test:** Signup with password shorter than 8 characters or mismatched passwords  
  **Role:** Guest  
  **Steps:** Enter 5-character password or different values in password/confirm.  
  **Expected:** Client-side validation errors.

- [ ] **Test:** Signup without accepting terms  
  **Role:** Guest  
  **Steps:** Fill all fields, leave terms checkbox unchecked, submit.  
  **Expected:** Client-side validation error on terms checkbox.

- [ ] **Test:** Signup with Turnstile CAPTCHA missing  
  **Role:** Guest  
  **Steps:** In CAPTCHA-enabled environment, submit without token.  
  **Expected:** Server error "captcha required".

- [ ] **Test:** Signup loading state  
  **Role:** Guest  
  **Steps:** Submit valid signup data.  
  **Expected:** Submit button shows spinner and is disabled during submission.

### 1.3 Reset Password

- [ ] **Test:** Request password reset for existing vs non-existing email  
  **Role:** Guest  
  **Steps:** Enter existing email and non-existing email, submit each.  
  **Expected:** Same success message displayed regardless of email existence (no user enumeration).

- [ ] **Test:** Reset password verify page with valid token  
  **Role:** Guest (link from email)  
  **Steps:** Click reset link with valid `?token=...`, enter new password and confirmation, submit.  
  **Expected:** Password updated; success message shown; link back to login appears.

- [ ] **Test:** Reset password verify page with invalid/expired token  
  **Role:** Guest  
  **Steps:** Visit `/reset-password/verify?token=invalid` or with `?error=INVALID_TOKEN`.  
  **Expected:** Server error "invalid or expired" shown immediately; submit button is disabled.

- [ ] **Test:** Reset password with mismatched or weak new password  
  **Role:** Guest (with valid token)  
  **Steps:** Enter different values in "New password" and "Confirm", or a password < 8 chars.  
  **Expected:** Client-side errors on confirm field and password field.

- [ ] **Test:** Back to login from reset password pages  
  **Role:** Guest  
  **Steps:** Click "Back to login" on `/reset-password` and `/reset-password/verify`.  
  **Expected:** Navigates to `/login`.

### 1.4 Logout & Session Management

- [ ] **Test:** Logout clears session and cache  
  **Role:** Authenticated user  
  **Steps:** Click logout button.  
  **Expected:** Session cleared; TanStack Query cache cleared; user redirected to `/`.

- [ ] **Test:** List own active sessions  
  **Role:** Authenticated user  
  **Steps:** Navigate to session management UI or call `listMySessions`.  
  **Expected:** Sessions returned with `tokenPrefix`, `ipAddress`, `userAgent`, `createdAt`, `expiresAt`, and `isCurrent` flag.

- [ ] **Test:** Revoke another session  
  **Role:** Authenticated user  
  **Steps:** List sessions, revoke a non-current session.  
  **Expected:** Session is revoked; revoked session can no longer be used.

- [ ] **Test:** Cannot revoke current session via self-service  
  **Role:** Authenticated user  
  **Steps:** Attempt to revoke the session marked `isCurrent: true`.  
  **Expected:** API returns `BAD_REQUEST` with message "Cannot revoke your current session. Use logout instead."

- [ ] **Test:** Revoke all other sessions  
  **Role:** Authenticated user  
  **Steps:** Click "Sign out all other devices".  
  **Expected:** Success; count of revoked sessions returned; current session remains valid.

### 1.5 Onboarding

- [ ] **Test:** Redirect guards & access control for onboarding pages  
  **Role:** All roles  
  **Steps:**
  - Student with incomplete onboarding: verify redirect to `/onboarding/student`.
  - Student already onboarded: verify blocked from `/onboarding/student` and redirected to `/dashboard`.
  - Company admin with incomplete onboarding: verify redirect to `/onboarding/company`.
  - Company admin with pending status: verify redirect from onboarding to `/status/company/pending`.
  - University admin with incomplete onboarding: verify redirect to `/onboarding/university`.
  - University admin with pending status: verify redirect to `/status/university/pending`.
  - Wrong role visiting another role's onboarding: verify redirect to correct onboarding or dashboard.
  - Unauthenticated/banned user visiting onboarding: verify redirect to login or home.
  **Expected:** All redirects behave as specified.

- [ ] **Test:** Complete student onboarding with all required fields  
  **Role:** Student  
  **Steps:** Fill bio, phone, student number, department, level, wilaya, address, links. Select skills. Submit.  
  **Expected:** Profile upserted; session cache refreshed; redirected to `/dashboard`.

- [ ] **Test:** Student onboarding clears skills when department changes  
  **Role:** Student  
  **Steps:** Select Department A and pick some skills. Change to Department B.  
  **Expected:** Skill selection is cleared because old skills may not exist in new department.

- [ ] **Test:** Student onboarding with languages feature flag enabled/disabled  
  **Role:** Student  
  **Steps:** Toggle `isLanguageRequirementsEnabledOnClient()` environment setting.  
  **Expected:** When enabled, Languages section appears (default language row pre-filled). When disabled, Languages section is hidden; languages array is empty in submission.

- [ ] **Test:** Server error display during student onboarding  
  **Role:** Student  
  **Steps:** Submit form that triggers server error (e.g., network failure).  
  **Expected:** `ServerError` component displays localized error; form values remain intact.

- [ ] **Test:** Loading state on student onboarding submit  
  **Role:** Student  
  **Steps:** Submit form.  
  **Expected:** Submit button shows spinner and is disabled while `isSubmitting`.

- [ ] **Test:** Complete company onboarding with verification document  
  **Role:** Company admin  
  **Steps:** Fill name, description, website URL, wilaya, address. Upload PDF/PNG/JPG verification document. Submit.  
  **Expected:** Company created; session refreshed; redirected to `/status/company/pending`.

- [ ] **Test:** Company onboarding without verification document or with invalid file type  
  **Role:** Company admin  
  **Steps:** Fill all text fields, leave file upload empty, or upload `.txt`/`.exe`.  
  **Expected:** Server error: "verification document required" or file type rejection.

- [ ] **Test:** Complete university onboarding with departments and domains  
  **Role:** University admin  
  **Steps:** Fill name, abbreviation, phone, wilaya, city, address. Add 2+ domains. Add 2+ departments. Submit.  
  **Expected:** University created; empty domain/department rows filtered out; redirected to `/status/university/pending`.

- [ ] **Test:** University onboarding with empty domains/departments filtered  
  **Role:** University admin  
  **Steps:** Add domains but leave some blank; add departments but leave some names blank. Submit.  
  **Expected:** Blank entries are filtered out before API call; only non-empty values sent.

- [ ] **Test:** Server error display during university onboarding  
  **Role:** University admin  
  **Steps:** Trigger server error (e.g., duplicate university name).  
  **Expected:** `ServerError` component shows localized error.

### 1.6 Admin & Role Management

- [ ] **Test:** Super admin creates a new user  
  **Role:** Super admin  
  **Steps:** Call `createUserProcedure` with email, password, name, role.  
  **Expected:** User created with `emailVerified: true`; for student/university_admin roles, `universityId` is assigned.

- [ ] **Test:** Super admin creates user without university for student role  
  **Role:** Super admin  
  **Steps:** Attempt to create a student without `universityId`.  
  **Expected:** Validation error: "University is required for this role".

- [ ] **Test:** Super admin sets user role and password  
  **Role:** Super admin  
  **Steps:** Call `setRoleProcedure` and `setPasswordProcedure`.  
  **Expected:** User role and password updated successfully.

- [ ] **Test:** Super admin bans and unbans a user  
  **Role:** Super admin  
  **Steps:** Call `banUserProcedure` with reason and optional expiry, then `unbanUserProcedure`.  
  **Expected:** User banned/unbanned accordingly; ban reason and expiry stored.

- [ ] **Test:** Super admin removes a user  
  **Role:** Super admin  
  **Steps:** Call `removeUserProcedure` with `userId`.  
  **Expected:** User deleted from auth system; if avatar existed, S3 cleanup attempted (best-effort).

- [ ] **Test:** University admin listing users is restricted to own university  
  **Role:** University admin  
  **Steps:** Call `listUsersProcedure`.  
  **Expected:** Only users affiliated with the admin's university are returned.

- [ ] **Test:** Non-super-admin cannot perform admin mutations  
  **Role:** University admin / others  
  **Steps:** Attempt to call `banUserProcedure`, `removeUserProcedure`, etc.  
  **Expected:** `FORBIDDEN` error: "Super admin access required".

- [ ] **Test:** Admin session management  
  **Role:** Super admin  
  **Steps:** List another user's sessions, revoke a specific session, revoke all sessions.  
  **Expected:** Sessions returned correctly; revocation works as expected.

### 1.7 Edge Cases & UI Behaviors

- [ ] **Test:** Auth layout decorative panel hidden on mobile  
  **Role:** Guest  
  **Steps:** Visit `/login` on mobile viewport.  
  **Expected:** Left editorial panel is hidden; mobile brand logo and back button visible.

- [ ] **Test:** Auth page language switcher and theme toggle functional  
  **Role:** Guest  
  **Steps:** On any auth page, switch languages and toggle dark mode.  
  **Expected:** Page reloads in selected locale with translated content and correct metadata; theme transitions to dark "Night Edition".

- [ ] **Test:** Onboarding error boundary recovery  
  **Role:** Authenticated user  
  **Steps:** Trigger an error on an onboarding page (e.g., kill network).  
  **Expected:** `OnboardingError` boundary displays error title, description, and "Try again" button.

- [ ] **Test:** Banned user cannot access onboarding  
  **Role:** Banned user  
  **Steps:** Ban a user. Attempt to visit `/onboarding/student`.  
  **Expected:** Redirected to `/` (home).

- [ ] **Test:** Post-login redirect for companies/universities with various statuses  
  **Role:** Company admin / University admin  
  **Steps:** Log in with pending, rejected, suspended, or approved entity status.  
  **Expected:** Approved -> `/dashboard`; Rejected -> `/status/.../rejected`; Suspended -> `/status/.../suspended`.

- [ ] **Test:** Onboarding form preserves values on validation error  
  **Role:** Student / Company / University  
  **Steps:** Partially fill form. Submit missing required field.  
  **Expected:** Filled values remain in inputs; only missing fields show errors.

- [ ] **Test:** Password reset revokes existing sessions  
  **Role:** Any user  
  **Steps:** Log in on multiple devices. Reset password. Check sessions.  
  **Expected:** `revokeSessionsOnPasswordReset: true` in auth config means all existing sessions are invalidated after reset.


---

## 2. Student Profile & CV Management

### 2.1 Profile Editing & Settings

- [ ] **Test:** Update full name, bio, contact info, academic details, location  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/settings`. Change each field. Click Save.  
  **Expected:** Each update persists, success message appears, new values reflected in dashboard header and profile page.

- [ ] **Test:** Update web presence URLs (GitHub and Portfolio)  
  **Role:** Student  
  **Steps:** Enter valid GitHub URL and Portfolio URL. Save.  
  **Expected:** URLs are validated, persisted, and displayed as clickable links on public profile. Invalid URLs show validation error.

- [ ] **Test:** Profile form reset functionality  
  **Role:** Student  
  **Steps:** Modify several fields. Click Reset.  
  **Expected:** All fields revert to their original saved values.

- [ ] **Test:** Upload and delete profile avatar image  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/settings`. Click avatar upload. Select an image. Confirm upload. Then delete it.  
  **Expected:** Avatar appears in profile header, dashboard, and navbar. Success toast shown. Deletion replaces avatar with initials placeholder.

### 2.2 Skills & Languages Management

- [ ] **Test:** Add skills up to the maximum limit (10)  
  **Role:** Student  
  **Steps:** In Skills Manager, search and select skills. Save.  
  **Expected:** Selected skills appear on profile page grouped by category. Attempting an 11th skill is blocked.

- [ ] **Test:** Remove skills from profile  
  **Role:** Student  
  **Steps:** Click on an already-selected skill to deselect it. Save.  
  **Expected:** Skill disappears from profile and stats update. Attempting to save with zero skills shows "minimum 1 required" error.

- [ ] **Test:** Search for skills in Skills Manager  
  **Role:** Student  
  **Steps:** Type in the skill search box.  
  **Expected:** Skill list filters in real time. Search for non-existent skill shows empty results.

- [ ] **Test:** Department-prioritized skills display  
  **Role:** Student  
  **Steps:** Ensure student has a department assigned. Navigate to Skills Manager.  
  **Expected:** Department-relevant skills are shown in a prioritized/grouped section separate from general skills. No department falls back to flat list.

- [ ] **Test:** Add and remove languages with proficiency levels  
  **Role:** Student  
  **Steps:** In Languages Manager, click Add Language. Select language and proficiency (A1-C2 or Native). Save. Then remove a language.  
  **Expected:** Languages appear on public profile with correct proficiency badges. Duplicate language code rejected.

### 2.3 CV Builder (Resume, Experience, Projects)

- [ ] **Test:** Upload, view, and delete resume PDF  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/student/cv`. Click "Upload PDF". Select a valid PDF under 10MB. Open it. Then delete it.  
  **Expected:** File uploaded, metadata displays, opens in new tab, deletion removes it. Non-PDF or oversized file rejected.

- [ ] **Test:** Add, edit, and delete work experience entry  
  **Role:** Student  
  **Steps:** In Experience section, click "Add". Fill title, organization, start date. Save. Edit it. Delete it.  
  **Expected:** Experience appears sorted by start date (descending). End date before start date rejected. "Current position" hides end date.

- [ ] **Test:** Add, edit, and delete project entry  
  **Role:** Student  
  **Steps:** In Projects section, click "Add". Fill name and summary. Save. Edit. Delete.  
  **Expected:** Project appears sorted by start date. Empty name/summary disables save. Start date after end date rejected.

### 2.4 Public Profile Visibility & Privacy

- [ ] **Test:** Student views their own public profile  
  **Role:** Student  
  **Steps:** Navigate to `/profile/[ownUserId]`.  
  **Expected:** Full profile visible including private fields (email, phone, address, student number). "Edit" button shown. Dashboard stats displayed.

- [ ] **Test:** Company admin views student profile with existing application relationship  
  **Role:** Company Admin  
  **Steps:** Log in as company admin whose company has an offer the student applied to. Navigate to `/profile/[studentUserId]`.  
  **Expected:** Profile loads. Public fields visible. Private fields hidden unless special access granted.

- [ ] **Test:** University admin views student in same department/university  
  **Role:** University Admin  
  **Steps:** Log in as university admin. Navigate to `/profile/[studentUserId]` within scope.  
  **Expected:** Profile loads successfully. Private fields may be visible based on scope rules.

- [ ] **Test:** Super admin views any student profile  
  **Role:** Super Admin  
  **Steps:** Log in as super admin. Navigate to any `/profile/[studentUserId]`.  
  **Expected:** Profile loads with all private fields visible regardless of relationship.

- [ ] **Test:** Another student or anonymous user attempts to view a peer's profile  
  **Role:** Student / Anonymous  
  **Steps:** Log in as Student A. Attempt to navigate to `/profile/[StudentBUserId]`. Or visit without logging in.  
  **Expected:** Another student gets 403. Anonymous user redirected to login.

### 2.5 Profile Completeness & Dashboard Stats

- [ ] **Test:** Profile completeness calculation accuracy  
  **Role:** Student  
  **Steps:** Fill in profile fields one by one. Check dashboard WelcomeHero after each change.  
  **Expected:** Completeness percentage updates correctly (bio 15%, phone 10%, wilaya 15%, URL 20%, 3+ skills 20%, studentNumber 10%, department 10%). Total maxes at 100%.

- [ ] **Test:** Dashboard stats bar accuracy  
  **Role:** Student  
  **Steps:** Submit applications, save offers, and add skills. View `/dashboard`.  
  **Expected:** EditorialStatsBar shows correct counts for Total Applications, Pending, Accepted, Skills, Saved Offers, Interviews.

- [ ] **Test:** Profile stats cards on public profile (owner view)  
  **Role:** Student (owner)  
  **Steps:** Navigate to own `/profile/[userId]`.  
  **Expected:** Three cards show total applications, skills count, and profile completeness percentage with animated progress bar.

### 2.6 Navigation & Routing

- [ ] **Test:** Legacy student dashboard routes redirect correctly  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/student`, `/dashboard/student/profile`, `/dashboard/student/applications`, `/dashboard/student/search`, `/dashboard/student/offers/[offerId]`.  
  **Expected:** All redirect to their canonical paths (`/dashboard`, `/profile/[id]`, `/dashboard/applications`, `/dashboard/explore`, `/dashboard/explore/[id]`).

- [ ] **Test:** Saved offers feature flag behavior  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/student/saved-offers` when `SAVED_OFFERS` feature is disabled vs enabled.  
  **Expected:** Disabled -> redirect to `/dashboard/explore`. Enabled -> SavedOffersView loads correctly.

- [ ] **Test:** Onboarding guard for CV and documents pages  
  **Role:** Student (incomplete onboarding)  
  **Steps:** Attempt to access `/dashboard/student/cv` or `/dashboard/student/documents`.  
  **Expected:** Redirected to `/onboarding/student`.

### 2.7 Documents & Placement

- [ ] **Test:** View placement documents  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/student/documents`. View the documents list.  
  **Expected:** Placement documents listed with company info, status, and download options. No placements shows empty state.

- [ ] **Test:** Download placement document and submit quality feedback  
  **Role:** Student  
  **Steps:** Click download on a document. Then click feedback on a placement, fill and submit feedback form.  
  **Expected:** File downloads successfully. Feedback dialog opens, form submits, success feedback recorded.

### 2.8 Validation & Edge Cases

- [ ] **Test:** Empty string trimming behavior  
  **Role:** Student  
  **Steps:** Enter only spaces into bio, phone, department fields. Save.  
  **Expected:** Fields are saved as null/empty and do not appear on public profile. They do not count toward profile completeness.

- [ ] **Test:** Wilaya code 0 treated as unset  
  **Role:** Student  
  **Steps:** Select "--" / placeholder for wilaya (value 0). Save.  
  **Expected:** Saved as null. Does not count toward profile completeness (15%).

- [ ] **Test:** Experience end date cleared when set to "current"  
  **Role:** Student  
  **Steps:** Edit an experience. Check "Current position". Update.  
  **Expected:** End date is stored as null and displays as "Present" on profile timeline.

- [ ] **Test:** Profile copy-to-clipboard functionality  
  **Role:** Student (owner)  
  **Steps:** Navigate to `/profile/[ownUserId]`. Click "Copy Profile".  
  **Expected:** Profile text copied to clipboard. Toast confirms success. Button temporarily shows checkmark.

- [ ] **Test:** Profile fallback skeleton loading  
  **Role:** Any authenticated viewer  
  **Steps:** Navigate to `/profile/[userId]` with slow network.  
  **Expected:** Elegant skeleton loader appears and disappears cleanly once real data loads.

- [ ] **Test:** Invalid skill tagIDs rejected  
  **Role:** Student  
  **Steps:** Attempt to upsert profile with non-existent skill IDs (via API manipulation or edge case).  
  **Expected:** Server returns BAD_REQUEST with "Invalid skill tag IDs" message.

- [ ] **Test:** Language duplicate prevention  
  **Role:** Student  
  **Steps:** Attempt to add the same language code twice with different proficiencies. Save.  
  **Expected:** Server rejects with "Duplicate languages are not allowed" error.

- [ ] **Test:** Unauthorized CV mutation attempts  
  **Role:** Student  
  **Steps:** Attempt to update/delete an experience or project belonging to another student (via ID manipulation).  
  **Expected:** Server returns FORBIDDEN/NOT_FOUND. Changes are not applied.


---

## 3. Company Management & Trust System

### 3.1 Company Registration & Onboarding

- [ ] **Test:** Successful company creation with verification document  
  **Role:** Company Admin  
  **Steps:** Fill Company Name (min 2 chars), Description, Website URL, Wilaya (1-58), Address. Upload PDF/PNG/JPG verification document (max 10MB). Submit.  
  **Expected:** Company created with status `pending`. User redirected to `/status/company/pending`. `companyMember` record created with role `owner`.

- [ ] **Test:** Duplicate company membership prevention  
  **Role:** Company Admin  
  **Steps:** Attempt to create a second company while already being an owner/member.  
  **Expected:** oRPC returns `CONFLICT` / `COMPANY_MEMBERSHIP_ALREADY_EXISTS`. No new company created. S3 cleanup if document was uploaded.

- [ ] **Test:** Onboarding page access guards for company  
  **Role:** Company Admin  
  **Steps:** Access `/onboarding/company` when company status is `approved`, `rejected`, `suspended`, or `pending`.  
  **Expected:** Redirects to `/dashboard` (approved), `/status/company/rejected` (rejected), `/status/company/suspended` (suspended), `/status/company/pending` (pending).

### 3.2 Admin Approval / Rejection / Suspension / Reactivation

- [ ] **Test:** Approve, reject, suspend, and reactivate a company  
  **Role:** Super Admin  
  **Steps:**
  - Approve a pending company.
  - Reject a pending company with a reason.
  - Suspend an approved company.
  - Reactivate a suspended company.
  **Expected:** Status transitions correctly. Notifications and emails sent. Cache revalidated. Invalid transitions return `COMPANY_INVALID_STATUS_TRANSITION`.

- [ ] **Test:** Admin list companies with filters and pagination  
  **Role:** Super Admin / Admin  
  **Steps:** Call `listCompanies` with no filters, with each status filter, with search, and with pagination (limit/offset).  
  **Expected:** Super admin sees full company objects. Non-admin authenticated users see only public fields and approved status. Offset > 10000 or limit > 200 returns validation error.

### 3.3 Company Profile Editing

- [ ] **Test:** Update company profile fields and upload logo  
  **Role:** Company Owner  
  **Steps:** Navigate to `/dashboard/company/profile`. Edit Description, Website URL, Phone, Contact Email, Representative Name, Wilaya, Address. Save. Upload a valid image as logo.  
  **Expected:** Profile updated. Success toast shown. Cache invalidated. Logo uploaded to S3 and UI updates immediately.

- [ ] **Test:** Delete own company  
  **Role:** Company Owner  
  **Steps:** On profile page, click "Delete Company". Confirm by typing the exact company name.  
  **Expected:** Company hard-deleted. All members have `onboardingCompleted` reset to `false`. S3 verification document cleaned up. User redirected to `/onboarding/company`.

- [ ] **Test:** Profile page access control  
  **Role:** Company Owner / Company Recruiter  
  **Steps:** Access `/dashboard/company/profile` as a recruiter (non-owner).  
  **Expected:** Redirected to `/dashboard` because `requireCompanyOwner` guards the page.

### 3.4 Team Invites & Membership Management

- [ ] **Test:** Invite new user by email (account creation)  
  **Role:** Company Owner  
  **Steps:** Navigate to `/dashboard/company/team`. Enter email of a non-existent user. Optionally enter display name. Submit.  
  **Expected:** New user created with role `company_admin`, `emailVerified: true`, random password. Added as `recruiter`. Password reset email sent.

- [ ] **Test:** Invite existing eligible user, re-invite existing member, and self-invite prevention  
  **Role:** Company Owner  
  **Steps:**
  - Invite an existing `company_admin` user not assigned to any company.
  - Invite an email already belonging to a member of the same company.
  - Owner attempts to invite their own email address.
  **Expected:** Existing user attached as recruiter; re-invite returns `alreadyMember: true`; self-invite returns `COMPANY_MEMBER_CANNOT_INVITE_SELF`.

- [ ] **Test:** Remove team member  
  **Role:** Company Owner  
  **Steps:** Click "Remove" on a recruiter member. Confirm in dialog.  
  **Expected:** Member deleted from `companyMember`. Member receives notification. UI updates. Attempting to remove self or owner returns `BAD_REQUEST`.

- [ ] **Test:** Team page access control  
  **Role:** Company Recruiter  
  **Steps:** Access `/dashboard/company/team` as a recruiter.  
  **Expected:** Page loads but invite form is hidden. "Owner only notice" banner shown. Remove buttons not visible.

### 3.5 Trust Index Scoring & Reports

- [ ] **Test:** View company trust index  
  **Role:** Any Authenticated User  
  **Steps:** Call `getCompanyTrustIndex` for an approved company.  
  **Expected:** Returns `trustScore` (0-100), `tier` (low/watch/good/excellent), factor breakdown, and `alerts` array. Score cached for 60 seconds.

- [ ] **Test:** Trust score computation correctness  
  **Role:** System / Tester  
  **Steps:** Verify formula behavior based on responseRate, completionRate, feedbackScore, reportPenalty.  
  **Expected:** Tiers map correctly: >=80 excellent, >=65 good, >=45 watch, <45 low.

- [ ] **Test:** Submit quality feedback  
  **Role:** Student  
  **Steps:** Student with a validated placement submits feedback (rating 1-5, wouldRecommend boolean, optional comment).  
  **Expected:** Feedback upserted by `placementId`. Cache revalidated.

- [ ] **Test:** Submit and resolve company reports  
  **Role:** Student / Company Admin / Super Admin  
  **Steps:**
  - Submit report for category `professional_conduct` (requires relationship) after having applied to/placed at the company.
  - Submit report with category `misleading_offer` without relationship.
  - Super admin lists and resolves reports.
  **Expected:** Reports created/resolved correctly. Relationship checks enforced.

### 3.6 Public Company Directory & Detail Pages

- [ ] **Test:** Public company profile page  
  **Role:** Public Visitor / Student / Any User  
  **Steps:** Navigate to `/company/{slug}` for an approved company.  
  **Expected:** Page renders with name, logo, location, description, website link, and list of active published offers. Cached for 60 seconds.

- [ ] **Test:** Public company directory listing  
  **Role:** Student (via oRPC) / Public (if server-called)  
  **Steps:** Call `listPublicDirectoryCompanies` with keyword, wilaya filter, and cursor pagination.  
  **Expected:** Only approved companies with at least one active published offer are returned. Pagination uses cursor.

### 3.7 Status Pages UX

- [ ] **Test:** Pending, rejected, and suspended status pages  
  **Role:** Company Admin  
  **Steps:** Navigate to `/status/company/pending`, `/status/company/rejected`, `/status/company/suspended`.  
  **Expected:** Each page shows correct status messaging, company name, submission date, and support contact. Redirects enforce correct status-to-page mapping.

### 3.8 Rate Limiting & Security

- [ ] **Test:** Rate-limited company procedures  
  **Role:** All  
  **Steps:** Rapidly invoke mutations: `createCompany`, `inviteCompanyMember`, `removeCompanyMember`, `updateCompany`, `uploadCompanyLogo`, `deleteOwnCompany`, `approveCompany`, `rejectCompany`, `suspendCompany`, `reactivateCompany`, `deleteCompany`, `submitCompanyReport`, `submitCompanyQualityFeedback`, `resolveCompanyReport`, `downloadCompanyVerificationDocument`.  
  **Expected:** Rate-limited variants apply configured rate limits. Excessive calls return 429.


---

## 4. University & Department Management

### 4.1 University Onboarding

- [ ] **Test:** Happy-path onboarding submission  
  **Role:** `university_admin` with no university linked  
  **Steps:** Open `/onboarding/university`. Enter name (>=2 chars), select wilaya (1-58), add one domain (>=3 chars). Fill optional fields and one optional department (name >=2). Submit.  
  **Expected:** University record created with `status = pending`. Domains created with `status = pending`. Department created. User `universityId` set, `onboardingCompleted = true`. Redirected to `/status/university/pending`.

- [ ] **Test:** Role-gate & redirect for non-university-admin  
  **Role:** `student`, `company_admin`, or `super_admin`  
  **Steps:** Navigate directly to `/onboarding/university`.  
  **Expected:** `student` -> `/onboarding/student`; `company_admin` -> `/onboarding/company`; others -> `/dashboard`.

- [ ] **Test:** Redirect when university already exists  
  **Role:** `university_admin` already linked to a university  
  **Steps:** Navigate to `/onboarding/university`.  
  **Expected:** Approved -> `/dashboard`; Rejected -> `/status/university/rejected`; Pending -> `/status/university/pending`.

- [ ] **Test:** Department-head role blocked from creating a university  
  **Role:** `university_admin` whose `universityMembershipRole` is `department_head`  
  **Steps:** Attempt to call the create-university procedure or access onboarding.  
  **Expected:** `FORBIDDEN` / redirect.

### 4.2 Status Pages (Pending / Rejected)

- [ ] **Test:** Pending and rejected status page display  
  **Role:** `university_admin` whose university is `pending` or `rejected`  
  **Steps:** Navigate to `/status/university/pending` or `/status/university/rejected`.  
  **Expected:** Page renders status card with correct messaging. No dashboard navigation accessible without approval.

### 4.3 Admin University Validation (Super Admin)

- [ ] **Test:** Access control for university list page  
  **Role:** `super_admin` vs non-super-admin  
  **Steps:** Open `/dashboard/admin/universities`.  
  **Expected:** Super admin sees list. Non-super-admin redirected to `/dashboard` or login.

- [ ] **Test:** Approve and reject a pending university  
  **Role:** `super_admin`  
  **Steps:** Click **Approve** on a pending university. Click **Reject**, enter reason, confirm.  
  **Expected:** University status becomes `approved`/`rejected`. All pending domains become `approved` on university approval. Notification email sent. Invalid transitions return `BAD_REQUEST`.

- [ ] **Test:** Edit and delete university  
  **Role:** `super_admin`  
  **Steps:** Click **Edit** on a university card, change fields, save. Click **Delete**, confirm.  
  **Expected:** DB updated / university removed. Linked users' caches invalidated.

- [ ] **Test:** Search & filter behavior  
  **Role:** `super_admin`  
  **Steps:** Type partial name/abbreviation in search box (debounced 300 ms). Change status filter. Scroll for infinite scroll.  
  **Expected:** List re-filters correctly. Case-insensitive search. Next page loads on scroll.

### 4.4 University Profile & Domain Management

- [ ] **Test:** Access profile page and update fields  
  **Role:** `university_admin` (approved, not dept head)  
  **Steps:** Open `/dashboard/university/profile`. Update name, abbreviation, phone, wilaya, city, address. Save.  
  **Expected:** `updateMyUniversity` called. DB updated. Toast success. Queries invalidated.

- [ ] **Test:** Add, remove, and duplicate domains  
  **Role:** `university_admin`  
  **Steps:** Add `univ.dz` via raw domain and `user@univ.dz` via email string. Add duplicate domain. Remove a domain.  
  **Expected:** Domains normalized to lowercase/trim. Duplicate returns `CONFLICT`. Removal succeeds.

### 4.5 Department CRUD

- [ ] **Test:** Access department management page  
  **Role:** `university_admin` / `super_admin`  
  **Steps:** Open `/dashboard/admin/departments`.  
  **Expected:** Page loads. Super admin sees university selector. University admin sees own university pre-selected.

- [ ] **Test:** Create, update, and delete department  
  **Role:** `university_admin` or `super_admin`  
  **Steps:** Create a department (2-200 chars). Edit its name. Delete it.  
  **Expected:** Department inserted/updated/removed. Duplicate name returns `CONFLICT`. Cross-university scope returns `FORBIDDEN`.

- [ ] **Test:** List departments and cross-university scope protection  
  **Role:** `university_admin` of University A  
  **Steps:** Attempt to create/update/delete/list departments for University B via tampered `universityId` or `departmentId`.  
  **Expected:** `FORBIDDEN` ("UNIVERSITY_SCOPE_FORBIDDEN" / "DEPARTMENT_SCOPE_FORBIDDEN").

### 4.6 Assign / Unassign Department Head

- [ ] **Test:** Assign head by email (existing eligible user and new user auto-created)  
  **Role:** `university_admin` / `super_admin`  
  **Steps:** Click **Assign Head**, enter email of existing eligible `university_admin`, confirm. Then enter email that does not exist, confirm.  
  **Expected:** Existing user assigned as head. New user auto-created with random password, `emailVerified: true`, `onboardingCompleted: true`. Password-reset email sent.

- [ ] **Test:** Assign head from different university or ineligible role  
  **Role:** `university_admin`  
  **Steps:** Try to assign a user whose `universityId` belongs to another university, or a `student`/`company_admin`.  
  **Expected:** `FORBIDDEN` error.

- [ ] **Test:** Re-assign head and unassign head  
  **Role:** `university_admin`  
  **Steps:** Department already has Head A. Assign Head B. Then remove head.  
  **Expected:** Head A's membership `departmentId` set to null. Head B becomes new head. Unassign removes head badge.

### 4.7 Bulk Department Creation

- [ ] **Test:** Happy-path bulk create and partial failure  
  **Role:** `university_admin` / `super_admin`  
  **Steps:** Open bulk create section, add 3 rows (unique names + valid head emails), submit. Then submit a bulk form where row 1 is valid, row 2 uses duplicate name, row 3 uses invalid email.  
  **Expected:** All 3 departments created on happy path. On partial failure, row 1 succeeds; rows 2 and 3 show individual errors.

- [ ] **Test:** Validation limits for bulk create  
  **Role:** `university_admin`  
  **Steps:** Submit with 0 rows. Add 51 rows.  
  **Expected:** Client validation blocks submission (`rows.min(1)` and `rows.max(50)`).

### 4.8 Department Skills Sync

- [ ] **Test:** Open skills modal, sync skills, and create new skill on the fly  
  **Role:** `university_admin` / `super_admin`  
  **Steps:** Click **Manage Skills** on a department card. Toggle 3 skills on, toggle 1 off, save. Search a non-existent skill and create it.  
  **Expected:** Skills sync saved. New skill tag created and selected. Skill limit of 200 enforced (`SKILL_LIMIT_EXCEEDED` if exceeded).

### 4.9 Membership Flows & Role-Based Access

- [ ] **Test:** Duplicate membership conflict and legacy `dept_head` without membership  
  **Role:** Any user  
  **Steps:** Manually insert a second `universityMember` row, then log in. Or log in as `dept_head` without `universityMember` row.  
  **Expected:** Duplicate membership throws `UNIVERSITY_MEMBERSHIP_CONFLICT`. Legacy head without membership is treated as `student` and redirected to student onboarding/dashboard.

- [ ] **Test:** Department head restricted from university-wide pages  
  **Role:** `university_admin` with `universityMembershipRole = department_head`  
  **Steps:** Attempt to access `/dashboard/university/profile`, `/dashboard/admin/departments`.  
  **Expected:** Redirect to `/dashboard`.


---

## 5. Offer Management (Company Side)

### 5.1 Access Control & Permissions

- [ ] **Test:** Access control for company offers pages  
  **Role:** Various  
  **Steps:**
  - Log in as `company_admin` with approved company and onboarding completed. Navigate to `/dashboard/company/offers`. Should load.
  - Log in as `student`, `university_admin`, `company_admin` with pending/rejected/suspended company, or not onboarded. Attempt to access the page.
  **Expected:** Approved company admin sees page. Others redirected to appropriate status/login/dashboard pages.

- [ ] **Test:** Permission gates (publish/close/delete, edit other company's offer)  
  **Role:** Company Admin / Owner / Recruiter  
  **Steps:**
  - As recruiter, attempt to call `updateOfferStatus` with `action: "publish"`.
  - As Company A admin, attempt to edit Company B's offer via direct URL.
  **Expected:** 403 Forbidden. Redirected back to own offers list.

### 5.2 Creating an Offer

- [ ] **Test:** Create offer with all fields valid and with minimal required fields  
  **Role:** Company Admin/Owner  
  **Steps:** Fill title (3+ chars), description (10+ chars), select internship type. Fill all optional fields. Then fill only required fields.  
  **Expected:** Offer created with `status: "draft"`. Optional fields stored as `null`/default. Redirected to offers list.

- [ ] **Test:** Create offer validation errors  
  **Role:** Company Admin/Owner  
  **Steps:** Submit with title too short, description too short, missing internship type, invalid wilaya code (0/59), duration weeks out of range (0/53), max positions out of range (0/101), start without end date, start >= end, deadline after start date, invalid date string, duplicate language requirements, zero language requirements when feature enabled, >20 skills, invalid skill tag IDs.  
  **Expected:** Client-side or server-side validation errors for each case.

- [ ] **Test:** AI features during offer creation  
  **Role:** Company Admin/Owner  
  **Steps:** Open new offer form. Click "Generate draft" AI intent. Enter custom prompt. Click "Improve description". Click "Suggest skills".  
  **Expected:** AI generates/populates fields. Result preview shown. Click apply to populate form. Invalid AI responses filtered out.

### 5.3 Editing an Offer

- [ ] **Test:** Edit draft, published, and closed offers  
  **Role:** Company Admin/Owner  
  **Steps:** Click edit on a draft offer. Change title and description. Submit. Edit a published offer. Attempt to edit a closed offer.  
  **Expected:** Draft and published edits succeed. Closed offer edit blocked with "Cannot update a closed offer". Ownership verified.

- [ ] **Test:** Partial update and clearing optional fields  
  **Role:** Company Admin/Owner  
  **Steps:** Edit offer, change only title, leave everything else as-is. Clear an optional field (e.g., work mode).  
  **Expected:** Only title updated; cleared field saved as `null`.

### 5.4 Changing Offer Status

- [ ] **Test:** Publish draft, close published, and invalid transitions  
  **Role:** Company Owner  
  **Steps:**
  - Publish a draft offer with all required dates filled.
  - Close a published offer.
  - Attempt to close a draft. Attempt to publish a closed offer. Publish an already published offer.
  **Expected:** Valid transitions succeed. Invalid transitions return specific errors.

- [ ] **Test:** Publish validation (missing dates, start >= end, deadline in past, deadline after start)  
  **Role:** Company Owner  
  **Steps:** Attempt to publish a draft missing dates, with invalid date ranges, or with past deadline.  
  **Expected:** Publish blocked with relevant validation errors.

- [ ] **Test:** Close offer with pending/confirmed interviews  
  **Role:** Company Owner  
  **Steps:** Close a published offer that has scheduled interviews with students.  
  **Expected:** Offer closed. All non-cancelled interviews marked `cancelled`. Students receive `interview_cancelled` notifications.

### 5.5 Deleting an Offer

- [ ] **Test:** Delete draft offer  
  **Role:** Company Owner  
  **Steps:** Click delete icon on a draft offer. Confirm in dialog.  
  **Expected:** Offer hard-deleted. Cascade deletes skills. Removed from list.

- [ ] **Test:** Delete published/closed offer blocked  
  **Role:** Company Owner  
  **Steps:** Attempt to delete a published or closed offer.  
  **Expected:** Published -> "Published offers must be closed instead of deleted". Closed -> `{ deleted: false }`.

### 5.6 Viewing Company Offer List

- [ ] **Test:** List loads, empty state, loading state, trust banner  
  **Role:** Company Admin/Owner  
  **Steps:** Navigate to `/dashboard/company/offers` when company has offers and when it has zero offers.  
  **Expected:** Cards displayed with correct status colors. Empty state with CTA. Skeleton shown while loading. Trust banner shows score and stats.

- [ ] **Test:** Search by title/description and filter by status  
  **Role:** Company Admin/Owner  
  **Steps:** Type offer title/description fragment in search box. Click Draft/Published/Closed/All filter buttons.  
  **Expected:** Only matching offers shown. Counter updates. Clear filters restores full list.

- [ ] **Test:** Offer card content and action buttons per status/role  
  **Role:** Company Owner / Recruiter  
  **Steps:** View draft, published, and closed cards as owner and as recruiter.  
  **Expected:** Draft: Edit, Publish, Delete. Published: Edit, Close. Closed: none. Recruiter sees no Publish/Close/Delete buttons.

### 5.7 Viewing Candidates for a Specific Offer

- [ ] **Test:** Candidates page loads with pipeline columns and filters  
  **Role:** Company Admin/Owner  
  **Steps:** Click candidates link on a published offer. Toggle skill and language filters. Click clear filters.  
  **Expected:** Pipeline view loads with correct columns. Filters work. Infinite scroll loads next page when applicable.

- [ ] **Test:** Accept and refuse candidates  
  **Role:** Company Admin/Owner  
  **Steps:** Click accept on a candidate. Confirm. Click refuse on another. Enter optional note. Confirm.  
  **Expected:** Application accepted/refused. Toast success. Timeline invalidated.

- [ ] **Test:** View candidate timeline  
  **Role:** Company Admin/Owner  
  **Steps:** Click "View timeline" on a candidate.  
  **Expected:** Timeline dialog opens showing application history.


---

## 6. Offer Discovery & Search (Student / Public)

### 6.1 Access Control & Navigation

- [ ] **Test:** Public access to `/discover` vs authenticated access to `/dashboard/explore`  
  **Role:** Public Visitor / Student  
  **Steps:** Open `/discover` in incognito. Open `/dashboard/explore` while logged out. Log in as student with incomplete onboarding and visit `/dashboard/explore`.  
  **Expected:** `/discover` loads without auth. `/dashboard/explore` redirects to login or onboarding.

- [ ] **Test:** Legacy redirects  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/student/search`, `/dashboard/student/offers/[offerId]`.  
  **Expected:** Redirected to `/dashboard/explore` and `/dashboard/explore/[offerId]`.

### 6.2 Offer Search & Keyword Filtering

- [ ] **Test:** Basic keyword search, empty search, no matches, rapid changes, max length  
  **Role:** Student  
  **Steps:** Type `react` into search input. Clear it. Type gibberish. Rapidly type/delete. Paste 500 chars.  
  **Expected:** Results update after ~300ms debounce. Empty search shows all. No matches shows empty state. Final stable keyword triggers request. Max 200 chars enforced.

### 6.3 Filter Panel Functionality

- [ ] **Test:** Filter by wilaya, internship type, work mode, skills, languages, and combinations  
  **Role:** Student  
  **Steps:** Open filters. Select filters individually and in combination. Click "Clear Filters".  
  **Expected:** Only offers matching ALL criteria shown. Active filter count badge updates. Clear resets all.

### 6.4 AI Search Copilot

- [ ] **Test:** Parse natural language query and error states  
  **Role:** Student  
  **Steps:** Type "remote react internship in Algiers" in AI Copilot input. Click Parse. Try empty/invalid query. Disconnect network.  
  **Expected:** Structured filters auto-applied. Unknown skill IDs filtered out. Loading and error states handled gracefully.

### 6.5 Pagination & Infinite Scroll

- [ ] **Test:** Initial load, scroll to next page, reach end, rapid scroll  
  **Role:** Student  
  **Steps:** Open `/dashboard/explore` with many offers. Scroll down. Scroll extremely fast.  
  **Expected:** 12 offers load initially. Next page loads on scroll. No duplicate requests. End of results stops fetching.

### 6.6 Offer Card Display

- [ ] **Test:** Card content, overflow, hover, click-through, type accent line  
  **Role:** Student  
  **Steps:** Verify first offer card. Find offers with >4 skills and >2 languages. Hover over card. Click card. Compare type accent colors.  
  **Expected:** All metadata correct. "+N" badges for overflow. Hover effects appear. Click navigates to detail. Distinct accent colors per type.

### 6.7 Offer Detail Page

- [ ] **Test:** View valid published offer and invalid/unpublished offers  
  **Role:** Student  
  **Steps:** Click an offer from explore grid. Manually navigate to unpublished/closed offer ID or unapproved company's offer ID.  
  **Expected:** Valid offer renders with masthead, company byline, save button, details sidebar, application panel, matching panel. Invalid offers return 404.

- [ ] **Test:** Save/unsave offer toggle  
  **Role:** Student  
  **Steps:** On detail page, click "Save" bookmark button. Click again to unsave.  
  **Expected:** Button changes to "Saved" with checkmark. Success toast. Query cache invalidates.

- [ ] **Test:** Apply button states and application form submission  
  **Role:** Student  
  **Steps:**
  - Visit a new offer where student has not applied. Verify "Apply Now" visible.
  - Visit an offer already applied to. Verify application status card shown.
  - Visit a closed offer. Verify "Offer Closed" message.
  - Click Apply Now. Enter cover letter. Submit.
  **Expected:** States correct per condition. Application submits successfully. Form hides, success message appears.

- [ ] **Test:** AI Cover Letter Draft  
  **Role:** Student  
  **Steps:** Click Apply Now. Click "Draft with AI". Wait for generation. Click "Use Draft".  
  **Expected:** AI generates cover letter. Loading state shown. Draft populates textarea.

- [ ] **Test:** Matching panel and company card trust index  
  **Role:** Student  
  **Steps:** Open detail page. Observe matching panel while score loads. Wait for score. View company card.  
  **Expected:** "Computing..." spinner shown. Score /100 displays with animated bar and reasons. Trust score /100 with tier label shown.

- [ ] **Test:** Report company dialog and back link  
  **Role:** Student  
  **Steps:** Click shield/exclamation button on company card. Fill report form. Submit. Click "Back" arrow.  
  **Expected:** Dialog opens. Validation errors for empty fields. Success toast on submit. Returns to `/dashboard/explore`.

### 6.8 Saved Offers List

- [ ] **Test:** View, unsave, pagination, error state, suspended company filter  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/student/saved-offers`. Unsave an offer. Save >12 offers. Block network. Save offer from company that gets suspended.  
  **Expected:** List renders. Unsave removes item. Pagination loads more. Error banner on failure. Suspended company's offer disappears from list.

### 6.9 Public Discover Page

- [ ] **Test:** Discover page renders without auth, animations, CTA, responsive design  
  **Role:** Public Visitor  
  **Steps:** Visit `/discover` as logged-out user. Scroll through page. Click CTA. Resize viewport.  
  **Expected:** Full page loads. Reveal animations fire. CTA links to `/signup`. Grid adapts responsively.

### 6.10 Edge Cases & Error Handling

- [ ] **Test:** No results, invalid search params, server error, network interruption, feature flag mismatch, double-click save, SQL injection-like keyword, cache invalidation  
  **Role:** Student  
  **Steps:** Apply restrictive filters. Send `limit=999` via API. Trigger server error. Disconnect WiFi mid-search. Disable `SAVED_OFFERS` server-side but enable client-side. Double-click save. Type `%'; DROP TABLE--` in search.  
  **Expected:** Empty state. Zod rejects invalid params. Error boundary catches server errors. Feature flag mismatch rejected on server. Button disabled during mutation. SQL wildcards escaped safely.


---

## 7. Application & Pipeline Flow

### 7.1 Student — Apply to an Offer

- [ ] **Test:** Apply without cover letter, with manual cover letter, with AI-generated cover letter  
  **Role:** Student  
  **Steps:**
  - Navigate to published offer. Click Apply. Submit with empty cover letter.
  - Type cover letter (max 5000 chars). Submit.
  - Click "Draft with AI". Wait for generation. Click "Apply Draft". Submit.
  **Expected:** Application created with correct status. AI draft populates textarea.

- [ ] **Test:** Apply to closed/unpublished offer, past deadline, or full offer  
  **Role:** Student  
  **Steps:** Attempt to apply to offer with status != `published`, deadline passed, or `maxPositions` already filled.  
  **Expected:** `OFFER_NOT_OPEN`, `OFFER_DEADLINE_PASSED`, or `OFFER_FULL` error.

- [ ] **Test:** Double apply and cover letter max length  
  **Role:** Student  
  **Steps:** Apply to same offer twice. Enter cover letter > 5000 characters.  
  **Expected:** `ALREADY_APPLIED` error. Schema validation blocks >5000 chars.

### 7.2 Student — Application List & Pipeline Board

- [ ] **Test:** View pipeline board, empty state, infinite scroll, legacy redirect  
  **Role:** Student  
  **Steps:** Navigate to `/dashboard/applications`. Visit with 0 applications. Scroll to bottom. Visit `/dashboard/student/applications`.  
  **Expected:** Pipeline board renders with 6 columns. Empty state with CTA. Next page loads on scroll. Legacy URL redirects.

### 7.3 Student — Withdraw Application

- [ ] **Test:** Withdraw pending application and withdraw non-pending application  
  **Role:** Student  
  **Steps:** Find application with status `applied`. Click Withdraw. Confirm. Attempt to withdraw an application with status `company_accepted`, etc.  
  **Expected:** Status changes to `withdrawn`, pipelineStage to `rejected`. `APPLICATION_INVALID_STATE` error for non-pending withdrawals.

### 7.4 Student — Timeline

- [ ] **Test:** View application timeline and timeline access control  
  **Role:** Student / Company Admin / Dept Head / University Admin / Super Admin  
  **Steps:** Click "Timeline" on any application card. Attempt to fetch timeline for an application not in your scope.  
  **Expected:** Dialog opens showing chronological events. `FORBIDDEN` if viewer lacks access.

### 7.5 Company Admin — View Applications for an Offer

- [ ] **Test:** View candidates list, filter by skills/languages, clear filters, view another company's offer  
  **Role:** Company Admin  
  **Steps:** Navigate to `/dashboard/company/offers/{offerId}/candidates`. Toggle filters. Clear filters. Access another company's offer.  
  **Expected:** Pipeline grid shows applications grouped by stage. Filters apply correctly. `OFFER_FORBIDDEN` for other company's offer.

- [ ] **Test:** Skill match percentage  
  **Role:** Company Admin  
  **Steps:** View candidate card for offer with required skills.  
  **Expected:** Match percentage calculates correctly (`matchedSkills / offerSkills * 100`).

### 7.6 Company Admin — Accept / Refuse Application

- [ ] **Test:** Accept and refuse application with/without note  
  **Role:** Company Admin  
  **Steps:** Move candidate to `offer` stage. Click Accept. Confirm. Click Refuse on another. Enter optional note. Confirm.  
  **Expected:** Status updated. Timeline event created. Notification sent to student.

- [ ] **Test:** Accept/refuse application not belonging to your company or already acted upon  
  **Role:** Company Admin  
  **Steps:** Attempt to accept an application for another company's offer. Accept an already accepted application.  
  **Expected:** `APPLICATION_FORBIDDEN` or `APPLICATION_INVALID_STATE`.

### 7.7 Company Admin — Pipeline Stage Transitions

- [ ] **Test:** Valid and invalid stage transitions  
  **Role:** Company Admin  
  **Steps:** Use stage dropdown on candidate card. Attempt valid transitions (`applied` -> `screening`, etc.). Attempt terminal stages (`applied` -> `accepted`). Attempt invalid transitions (`offer` -> `applied`).  
  **Expected:** Valid transitions succeed with timeline events. Invalid transitions return `APPLICATION_INVALID_STATE`.

### 7.8 University Admin — Validation Flow

- [ ] **Test:** Access validations list and validation detail  
  **Role:** University Admin (not dept head)  
  **Steps:** Navigate to `/dashboard/admin/validations`. Click a validation card.  
  **Expected:** Lists all `company_accepted` applications for students in admin's university. Detail page shows StudentInfoCard, CompanyOfferCard, AI Summary Panel, ValidationForm.

- [ ] **Test:** Validate and reject placement  
  **Role:** University Admin  
  **Steps:** Select start and end dates (start < end). Click "Validate and Generate". Confirm. Click Reject, enter reason, confirm.  
  **Expected:** Validation creates placement, generates agreement PDF, sends notifications. Rejection updates status and sends notifications.  
  **Edge cases:** Out-of-range dates show amber warning but still allow submission. Missing/invalid dates blocked by alert. Already validated returns `PLACEMENT_ALREADY_EXISTS`.

- [ ] **Test:** Cross-university validation and super admin access  
  **Role:** University Admin / Super Admin  
  **Steps:** Attempt to validate application for student not in your university. Super admin attempts to access validation endpoints.  
  **Expected:** `PLACEMENT_SCOPE_FORBIDDEN_UNIVERSITY`. Super admin blocked by `requirePlacementValidationAdmin`.

### 7.9 Department Head — Validation Flow

- [ ] **Test:** Access dept validations and validate/reject department student  
  **Role:** Department Head  
  **Steps:** Navigate to `/dashboard/dept-validations`. Validate/reject a student in your department.  
  **Expected:** Lists only `company_accepted` applications for students in dept_head's department. Validate/reject succeeds.

- [ ] **Test:** Cross-department validation and access control  
  **Role:** Department Head / University Admin / Super Admin  
  **Steps:** Attempt to validate student outside department. University admin visits `/dashboard/dept-validations`. Super admin visits dept-head endpoints.  
  **Expected:** `PLACEMENT_SCOPE_FORBIDDEN_DEPARTMENT`. Redirects or `FORBIDDEN` for unauthorized roles.

### 7.10 Status Colors & Labels Consistency

- [ ] **Test:** Pipeline stage labels and status badge colors  
  **Role:** Any  
  **Steps:** View pipeline board and application cards.  
  **Expected:** Columns match `STAGE_COLUMNS` and `STAGE_LABELS`. Badge CSS classes match `STATUS_COLORS` constant.

### 7.11 Error States & Edge Cases

- [ ] **Test:** Refusing after accepting, accepting after refusing, pipeline stage change after accept, withdraw after company action  
  **Role:** Company Admin / Student  
  **Steps:** Accept application then refuse same one. Refuse then accept. Change stage after accept. Withdraw after company accepted/refused.  
  **Expected:** All blocked with `APPLICATION_INVALID_STATE` or hidden UI.

- [ ] **Test:** Notification failure resilience and E2E cache bypass  
  **Role:** Any  
  **Steps:** Perform accept/validate/reject when notification service is down. Run with `E2E_DISABLE_CACHE=1`.  
  **Expected:** Main action succeeds. Notifications fail silently with logged warning. List bypasses cache and hits DB directly.

### 7.12 Data Integrity & Security

- [ ] **Test:** Unique constraint enforcement and row-level locking  
  **Role:** System / Tester  
  **Steps:** Attempt duplicate application for same offer+student. Concurrent applications near capacity.  
  **Expected:** DB unique index blocks duplicate. `FOR UPDATE` lock ensures `maxPositions` not exceeded.

---

## 8. Interview Scheduling

### 8.1 Feature Access & Role Gating

- [ ] **Test:** Student and company admin access interviews page with feature enabled/disabled  
  **Role:** Student / Company Admin / University Admin  
  **Steps:** Navigate to `/dashboard/interviews` with `INTERVIEWS` feature true and false.  
  **Expected:** Enabled -> page loads in respective mode. Disabled -> redirect to `/dashboard/applications` (student) or `/dashboard/company/offers` (company). Unauthorized role -> access denied.

### 8.2 Company — Propose Interview

- [ ] **Test:** Successful proposal with single/multiple slots, in-person and meeting URL  
  **Role:** Company Admin  
  **Steps:** Select offer and application. Add 1-3 slots with valid future dates. Add location and/or meeting URL. Add optional note. Submit.  
  **Expected:** Proposal saved. Interview status `pending_confirmation`. Slots persisted. Success toast. List refreshes.

- [ ] **Test:** Proposal validation and guards  
  **Role:** Company Admin  
  **Steps:**\n  - Leave required fields empty (submit disabled).\n  - Application dropdown filters by selected offer and eligible stages only.\n  - Add >20 slots.\n  - Enter note >1000 chars.\n  - Remove last slot (trash disabled when only one remains).\n  - Propose for non-existent application, another company's application, already accepted/withdrawn application, application in `offer`/`accepted` stage, closed offer, or duplicate interview (already exists).\n  - Slot start in past or start >= end.\n  - Invalid meeting URL protocol (`ftp://`, `javascript:`).\n  **Expected:** Relevant errors: `APPLICATION_NOT_FOUND`, `APPLICATION_FORBIDDEN`, `INTERVIEW_INVALID_APPLICATION_STATE`, `INTERVIEW_ALREADY_EXISTS`, `INTERVIEW_SLOT_INVALID`, validation errors.

### 8.3 Student — Receive & View Proposal

- [ ] **Test:** Pending interview appears in "Action Required" and confirmed/cancelled in lower section  
  **Role:** Student  
  **Steps:** Receive `interview_proposed` notification. Open `/dashboard/interviews`. Have one confirmed and one cancelled interview.  
  **Expected:** Pending shows amber pulse dot. Confirmed/cancelled appear under "Past and Confirmed". Card displays slot metadata, location, meeting URL, note.

### 8.4 Student — Confirm Slot

- [ ] **Test:** Confirm slot and confirmation guards  
  **Role:** Student  
  **Steps:** For a pending interview with 3 slots, click Confirm on Slot 2. Then attempt to confirm: another student's interview, already confirmed interview, cancelled interview, expired slot (startsAt <= now), slot from different interview, non-existent interview.  
  **Expected:** Slot 2 confirmed with emerald border. Other attempts return `INTERVIEW_FORBIDDEN`, `INTERVIEW_ALREADY_CONFIRMED`, or `INTERVIEW_SLOT_NOT_FOUND`.

### 8.5 Interview Lists (Company & Student)

- [ ] **Test:** List displays correct data, filters, ordering, and pagination  
  **Role:** Company Admin / Student  
  **Steps:** Load `/dashboard/interviews`. Apply status filter. Verify slot order.  
  **Expected:** Company list shows student avatars, offer titles, status badges. Student list ordered by `createdAt DESC`. Slots ordered `startsAt ASC`. Limit of 30 enforced.

### 8.6 Status Indicators & Notifications

- [ ] **Test:** Status badge colors and header counts  
  **Role:** Any  
  **Steps:** View interviews in `pending_confirmation`, `confirmed`, `cancelled`. Propose a new interview.  
  **Expected:** Amber/rose/emerald badges. Header counts update reactively. Tab badges show totals.

- [ ] **Test:** Notifications for interview lifecycle  
  **Role:** Student / Company Admin  
  **Steps:** Propose, confirm, and close offer (cancelling interviews).  
  **Expected:** `interview_proposed`, `interview_confirmed`, `interview_cancelled` notifications created correctly.

### 8.7 Edge Cases, Security & Negative Paths

- [ ] **Test:** Proposing in past via API, confirming expired slot, rapid double-submit, race condition on same application, XSS via note/location, rate limiting, offer closure cascade  
  **Role:** Attacker / Tester  
  **Steps:**\n  - Bypass UI datetime-local with past date.\n  - Confirm slot exactly as it expires.\n  - Double-click submit rapidly.\n  - Two admins propose for same application simultaneously.\n  - Enter `<script>alert(1)</script>` in note/location.\n  - Rapidly fire propose/confirm requests.\n  - Close offer with multiple pending/confirmed interviews.\n  **Expected:** Server rejects past slots and expired confirmations. Unique DB index prevents duplicate interviews. Scripts rendered as plain text. Rate limits return 429. Interviews cascade to `cancelled`.

### 8.8 Missing / Not Implemented Functionality (Known Gaps)

- [ ] **Test:** Confirm these features are NOT present  
  **Role:** Any  
  **Steps:** Look for Decline, Reschedule, Overlap Prevention, Confirmation Deadline, and explicit Manual Cancel buttons/endpoints.  
  **Expected:** No decline/reschedule flow. No overlap validation. No confirmation deadline besides slot start time. No manual cancel besides offer closure cascade.

---

## 9. Matching, Recommendations & AI Assistant

### 9.1 AI Assistant Chat

- [ ] **Test:** Thread creation, selection, manual new conversation, and list limit  
  **Role:** Company Admin  
  **Steps:** Navigate to `/dashboard/assistant` with `COMPANY_ASSISTANT` enabled and zero existing conversations. Click "New Conversation". Create >100 conversations.  
  **Expected:** Auto-creates first conversation on page load. New conversation appears and is selected. List limit returns most recent 100.

- [ ] **Test:** Sending messages, AI response streaming, stop, regenerate, auto-scroll  
  **Role:** Company Admin  
  **Steps:** Type text and press Enter. Press Shift+Enter for newline. Click Stop while streaming. Hover assistant message and click regenerate. Scroll up during streaming, then click scroll-to-bottom.  
  **Expected:** User message appears instantly. AI streams token-by-token. Stop halts stream (not persisted). Regenerate re-streams. Auto-scroll respects user scroll position.

- [ ] **Test:** Message persistence after reload and deduplication  
  **Role:** Company Admin  
  **Steps:** Send messages, wait for stream to finish, reload. Send identical text twice.  
  **Expected:** Prior messages reload from DB. Exact duplicate user messages are not double-stored.

- [ ] **Test:** Thread deletion  
  **Role:** Company Admin  
  **Steps:** Delete active conversation. Delete non-active conversation. Delete while stream is active.  
  **Expected:** Active deletion moves selection to next most recent. Non-active deletion removes item without changing selection. Stream aborts cleanly.

- [ ] **Test:** Empty conversation state and sidebar order  
  **Role:** Company Admin  
  **Steps:** Open brand-new conversation. Send message in older conversation.  
  **Expected:** Empty state message shown. Older conversation jumps to top of sidebar (ordered by `updatedAt` desc).

- [ ] **Test:** Model management  
  **Role:** Company Admin  
  **Steps:** Switch model mid-conversation via ChatHeader dropdown. Attempt invalid model ID. Clear `AI_MODEL` env var.  
  **Expected:** Model label updates optimistically. Invalid model rejected by Zod. Fallback to generic allowed models if env unset.

- [ ] **Test:** Conversation title auto-generation and manual rename  
  **Role:** Company Admin  
  **Steps:** Send first message (auto-title fires). Click rename, enter custom title.  
  **Expected:** Title updates asynchronously after generation. Manual rename updates sidebar and header immediately.

- [ ] **Test:** Save a note  
  **Role:** Company Admin  
  **Steps:** Click note icon, enter text, confirm.  
  **Expected:** Note appended as user message with `{ type: "note-marker" }`. Not sent to AI model.

- [ ] **Test:** AI error handling (rate limit, CSRF, request too large, invalid JSON, unauthorized, banned user, unapproved company, misconfiguration, mid-stream error)  
  **Role:** Various  
  **Steps:** Exhaust rate limit. POST from invalid origin. Send >500k chars or >100 messages. POST malformed JSON. Call without session cookie. Call with banned account. Call as unapproved company. Unset `AI_API_KEY`. Interrupt provider mid-stream.  
  **Expected:** 429 with retry-after. 403 invalid origin. 400 request too large / invalid JSON. 401 unauthorized. 403 banned / unapproved company. Generic error on misconfiguration. Partial stream discarded on network drop.

- [ ] **Test:** Cross-company conversation isolation and secret redaction  
  **Role:** Company Admin (Company A)  
  **Steps:** Attempt to GET/mutate conversation ID belonging to Company B. Send message containing `{"api_key": "secret123"}`.  
  **Expected:** 404 or 0-row result due to `companyId` scoping. Secrets redacted to `[REDACTED]` in DB.

### 9.2 Matching Score Calculation

- [ ] **Test:** Perfect score, zero skill requirements, partial skills match, language penalty, case-insensitive language matching, unknown proficiency handling  
  **Role:** Student  
  **Steps:** View offers with: no requirements; requirements fully met; partial match; required language not met; case-mismatched language codes; unknown proficiency string.  
  **Expected:** Perfect = 100. No skills = 55 for skills component. Partial = proportional. Language penalty applied when required proficiency not met. Case-insensitive match works. Unknown proficiency treated as unmet.

- [ ] **Test:** Remote, on-site, and hybrid location scoring  
  **Role:** Student  
  **Steps:** View offers: remote with different wilayas; on-site with wilaya mismatch; hybrid with wilaya mismatch; missing location data.  
  **Expected:** Remote = full 15. On-site mismatch = ~4. Hybrid mismatch = ~8. Missing data = ~7.

- [ ] **Test:** Profile strength partial and access control  
  **Role:** Student / Company Admin / Super Admin  
  **Steps:** View offer with incomplete profile (missing fields, <3 skills). Call `matching.getScore` for hidden offer, another student, or without application relationship.  
  **Expected:** Profile score proportional to completed signals. `FORBIDDEN` for unauthorized access. Super admin allowed regardless.

- [ ] **Test:** Score color coding and loading state  
  **Role:** Any  
  **Steps:** View candidates with scores 85, 70, 50, 30. Throttle network.  
  **Expected:** >=80 emerald, >=60 blue, >=40 amber, <40 rose. Loader with "computing" text shown until loaded.

### 9.3 Readiness History Tracking

- [ ] **Test:** Automatic snapshot on offer view, daily deduplication, next-day snapshot, history display with delta, empty history  
  **Role:** Student  
  **Steps:** Open offer detail for first time today. Reopen same offer later same day. Reopen next day. View offer with 2+ historical snapshots. View offer never visited before.  
  **Expected:** Snapshot created on first view. `skipped: true` on same-day reopen. New snapshot on next day. Delta shown (+/- N%). Current score only when no history.

- [ ] **Test:** History limit enforcement and snapshot data accuracy  
  **Role:** Student  
  **Steps:** Accumulate >20 snapshots for one offer. View offer, then check DB row.  
  **Expected:** Only most recent 6 shown in UI. DB row contains `readyPercent`, `missingSkillsCount`, source, meta.

### 9.4 Skill Gap Analysis Display

- [ ] **Test:** Missing skills grouped by category, estimated improvement delta, all skills matched, roadmap steps  
  **Role:** Student  
  **Steps:** View offer where student lacks React/Vue (frontend) and Docker (devops). View offer where all skills matched. View offer with incomplete match.  
  **Expected:** Grouped by largest category first. Delta capped at `skillsUnit * 3`. All matched -> "You already match all required skills". Incomplete -> roadmap steps shown.

### 9.5 Candidate Ranking for Company Offer

- [ ] **Test:** Pipeline view, global candidates dashboard, empty state, acceptance/refusal, filters, stage drag/mutation  
  **Role:** Company Admin  
  **Steps:** Navigate to `/dashboard/company/offers/{offerId}/candidates`. Navigate to `/dashboard/candidates`. View with zero applicants. Accept/refuse. Toggle skill/language filters. Change stage via UI.  
  **Expected:** Pipeline columns render. Global dashboard lists offers with candidate counts. Empty state with CTA. Filters re-render grid. Optimistic stage update with revert on error.

### 9.6 AI-Generated Offer Recommendations for Student

- [ ] **Test:** Dashboard recommendations load, exclude already-applied, batch scoring, fallback on failure, sorting and limits  
  **Role:** Student  
  **Steps:** Open `/dashboard`. Verify already-applied offers excluded. Force batch scoring to throw. Call with limit=0/50 and candidateLimit=5/500.  
  **Expected:** Up to 3 offers returned. Batch scoring used by default; falls back to individual concurrency=10 calls. Limit clamped [1,12]. Candidate clamped [20,200].

### 9.7 Empty States & Edge Cases

- [ ] **Test:** No assistant conversations, no matching candidates, no recommendations, no readiness history, no missing skills  
  **Role:** Various  
  **Steps:** Fresh account open assistant. Publish offer with zero applications. New student with empty profile. View offer first time. View offer with full skill match.  
  **Expected:** Appropriate empty states or fallback UI for each scenario.

---

## 10. Messaging System

### 10.1 Access Control & Authentication

- [ ] **Test:** Page access blocked for non-student/non-company and multiple membership edge cases  
  **Role:** Admin / University / Dept Head / Unauthenticated / Company Admin with multiple memberships  
  **Steps:** Navigate to `/dashboard/messages` as various roles. Assign a single user to two `companyMember` rows. Remove user from all companies.  
  **Expected:** Non-student/non-company redirected. Multiple memberships cause INTERNAL_SERVER_ERROR. Zero membership returns FORBIDDEN.

### 10.2 Conversation Starters

- [ ] **Test:** Student and company starters list, selection, and first message creation  
  **Role:** Student / Company Admin  
  **Steps:**\n  - Student: apply to Offer A/B, open messages, see starters, select starter, send first message.\n  - Company: ensure applicants exist with no threads, open messages, see starters, select starter, send first message.\n  **Expected:** Starters show correct offers/applicants. Selecting shows preview pane. First message creates thread. Starter disappears from list.

- [ ] **Test:** No starters shown when all applications already have threads  
  **Role:** Student / Company  
  **Steps:** Message every applied company / applicant.  
  **Expected:** Starters section hidden.

### 10.3 Thread Listing & Sorting

- [ ] **Test:** Threads sorted by most recent, display metadata, fallback names, and limits  
  **Role:** Both  
  **Steps:** Create threads with messages at different times. View list with null names. Generate >50 threads.  
  **Expected:** Ordered by `lastMessageAt DESC`, tie-breaker `id DESC`. Correct avatar, name, offer title, relative time. Fallback text for null names. Capped at 50 client / 30 server.

### 10.4 Unread Indicators

- [ ] **Test:** Unread badges appear/disappear correctly and respect cap/ARIA  
  **Role:** Both  
  **Steps:** Have company send last message (student sees unread). Student replies (badge gone). Modify unreadCount to >99. Inspect ARIA label on badge.  
  **Expected:** Badge shows exact count, capped at `99+`. Badge hidden when student sent last message. `aria-label` includes count.

### 10.5 Reading Thread Messages

- [ ] **Test:** Click thread loads chronologically, empty state, access control, scroll behavior  
  **Role:** Both  
  **Steps:** Click existing thread. Create thread with zero messages. Access another student's thread or another company's thread. Open thread with many messages.  
  **Expected:** Messages sorted `createdAt ASC`. Own messages styled primary, others neutral. Empty state text shown. `THREAD_FORBIDDEN` for unauthorized access. Scrolls to bottom on mount.

### 10.6 Marking Threads as Read

- [ ] **Test:** Auto-mark on select, no call for zero messages, deduplication, access control  
  **Role:** Both  
  **Steps:** Click unread thread. Select thread with zero messages. Click away and back. Call `markThreadRead` on foreign thread.  
  **Expected:** Marked once automatically. `{ marked: false }` for empty thread. Does not fire again on re-select. `THREAD_FORBIDDEN` for unauthorized thread.

### 10.7 Sending Messages

- [ ] **Test:** Send message in existing thread, keyboard shortcuts, empty/whitespace blocking, length limits, trimming, composer disable, error state, relationship requirements, notification dispatch  
  **Role:** Both  
  **Steps:**\n  - Send message.\n  - Press Enter vs Shift+Enter.\n  - Send spaces-only.\n  - Send 5001 chars.\n  - Send exactly 5000 chars.\n  - Send with leading/trailing spaces.\n  - Click Send twice rapidly.\n  - Trigger server error (thread deleted mid-compose).\n  - Student messages offer they did not apply to.\n  - Company messages student who did not apply to their offer.\n  - Send to non-existent offer.\n  **Expected:** Message persists. Enter sends, Shift+Enter newline. Empty blocked. >5000 rejected. 5000 accepted. Trimmed before storage. Composer disabled while sending. Error text appears on failure. `APPLICATION_NOT_FOUND` / `OFFER_FORBIDDEN` for invalid relationships. Notifications dispatched correctly.

### 10.8 Real-Time / Data Freshness

- [ ] **Test:** No automatic polling, sender UI updates via invalidation, thread list reordering  
  **Role:** Both  
  **Steps:** Open thread. From another session, send message. Send message from current session. Send in older thread.  
  **Expected:** New message does NOT appear automatically (no polling/SSE). Sender invalidates queries and UI refreshes. Older thread jumps to top of list.

### 10.9 Offer / Application Contextual Threading

- [ ] **Test:** Thread uniqueness, offer/company deletion cascades, company filter  
  **Role:** Admin / Tester  
  **Steps:** Apply to Offer A and B, send messages. Delete an offer with active threads. Delete a company. Pass `offerId` to company thread list.  
  **Expected:** Two distinct threads. Cascading deletes remove threads/messages. `offerId` filter returns only threads for that offer.

### 10.10 Rate Limiting & Performance

- [ ] **Test:** Send and read operation rate limits  
  **Role:** Both  
  **Steps:** Rapidly send >100 messages in one minute. Rapidly refresh thread list >300 times in one minute.  
  **Expected:** Send throttled at 100/min. Read throttled at 300/min.

### 10.11 Edge Cases: Security, Data Integrity & Suspension

- [ ] **Test:** Messaging a suspended company, deleted application, mark-read race, whitespace-only multiline, long word breaking, empty states, composer placeholder transitions, RTL layout  
  **Role:** Both  
  **Steps:**\n  - Apply to company that gets suspended, then message.\n  - Delete application row after thread exists, then send message.\n  - Open thread exactly as new message arrives.\n  - Send `\n\n   \n`.\n  - Send 500-char unbroken word.\n  - Have zero threads but >=1 starter.\n  - Select nothing, starter, thread and observe placeholder.\n  - Switch to Arabic locale.\n  **Expected:** Suspended company may still receive messages (gap noted). `APPLICATION_NOT_FOUND` for deleted application. Read state may be slightly stale. Whitespace blocked. Word breaks with `break-words`. Empty states correct. Placeholder transitions match selection. RTL uses logical CSS.

---

## 11. Documents, Uploads & Verification

### 11.1 Image Upload (Profile / Company Logo)

- [ ] **Test:** Valid JPEG/PNG/WebP uploads and rejections (GIF, wrong magic bytes, oversized, path traversal, SVG)  
  **Role:** Any authenticated user / Company Admin  
  **Steps:** Upload valid JPEG, PNG, WebP (<=5MB, correct magic bytes). Upload GIF, renamed EXE to JPEG, 6MB file, path traversal in folder param, SVG.  
  **Expected:** Valid uploads succeed with correct S3 key and DB update. Invalid types, mismatched magic bytes, oversized files, and path traversal all rejected.

### 11.2 Company Verification Document Upload

- [ ] **Test:** Valid PDF/JPEG/PNG uploads and rejections (Word doc, oversized, mismatched magic bytes, cleanup on failure)  
  **Role:** Company Admin  
  **Steps:** Upload valid PDF/JPEG/PNG <=10MB. Upload Word doc, 11MB file, JPEG renamed to PDF, trigger DB failure after upload.  
  **Expected:** Valid uploads return key, fileName, mimeType, size. Rejections return type/size/content errors. S3 cleanup occurs on creation failure.

### 11.3 Internship Agreement Generation

- [ ] **Test:** Agreement generation permissions, idempotency, race condition, S3/email failures, localization, QR code  
  **Role:** University Admin / Dept Head / Super Admin  
  **Steps:** Generate agreement for placement in same university/department. Attempt cross-university/cross-department/super-admin generation. Generate for non-existent placement. Generate twice (idempotency). Two admins generate simultaneously (race). Generate with S3 unconfigured. Generate when notification/email fails. Generate with locale `fr` or `ar`. Verify QR code in PDF points to `/{locale}/verify/{code}`.  
  **Expected:** Success for authorized scope. `PLACEMENT_FORBIDDEN` for unauthorized. `PLACEMENT_NOT_FOUND` for missing. `PLACEMENT_ALREADY_EXISTS` for duplicate. Second request returns existing doc. Race handled gracefully. S3 null -> fallback to regeneration. Email failure logged but not thrown. QR code embeds correctly.

### 11.4 Completion Certificate Generation (Company)

- [ ] **Test:** Certificate generation permissions and validations  
  **Role:** Company Owner / Company Admin  
  **Steps:** Generate certificate for validated placement that has ended. Attempt as non-owner, for another company, for non-validated placement, before end date, for non-existent placement, regenerate already generated certificate.  
  **Expected:** Success for owner of validated completed placement. `PLACEMENT_FORBIDDEN` for unauthorized. `PLACEMENT_NOT_VALIDATED` / `INTERNSHIP_NOT_COMPLETED` / `PLACEMENT_NOT_FOUND` as applicable. Re-generation returns existing doc without overwriting issuer metadata.

### 11.5 Document Download (Student)

- [ ] **Test:** Download own documents, forbidden access, missing S3 fallback, locale override  
  **Role:** Student  
  **Steps:** Download own agreement and certificate. Attempt to download another student's document. Download non-existent document. Download `pending` document. Download when S3 file exists, when S3 missing but snapshot exists, when both missing. Download document missing `verificationCode`. Download with locale override.  
  **Expected:** Own documents download successfully. `DOCUMENT_FORBIDDEN` / `DOCUMENT_NOT_FOUND` / `DOCUMENT_NOT_READY` / `DOCUMENT_GENERATION_FAILED` as applicable. Fallback regeneration works when S3 missing.

### 11.6 Document Download (Company)

- [ ] **Test:** Download company documents with scope checks  
  **Role:** Company Admin  
  **Steps:** Download agreement/certificate for own company's placement. Attempt for another company. Download `pending` document. Download with S3 missing.  
  **Expected:** Success for own company. `DOCUMENT_FORBIDDEN` / `DOCUMENT_NOT_READY` for unauthorized/unready. Fallback regeneration works.

### 11.7 Document List Views

- [ ] **Test:** Student and company documents page empty states, listing, button states, error handling  
  **Role:** Student / Company Admin  
  **Steps:** View documents page with zero and multiple placements. Verify download button for pending/failed/generated docs. Verify feedback callout on student page. Verify generate button disabled for non-owner on company page.  
  **Expected:** Empty states with correct copy. Lists ordered by `validatedAt DESC`. Buttons reflect status. Non-owner sees disabled generate button.

### 11.8 QR Code Verification (Public)

- [ ] **Test:** Enter valid/invalid/malformed codes, direct URL access, formatting, skeleton, missing data  
  **Role:** Public Verifier  
  **Steps:** Enter valid code on `/verify`. Enter invalid code. Enter lowercase/spaced code. Enter malformed >20 char code. Access `/verify/{code}` directly with URL-encoded code. Verify generated agreement and signed certificate. Check date formatting in `fr` and `ar`. Observe skeleton. Verify code when DB record deleted but snapshot exists.  
  **Expected:** Valid -> valid card with all metadata. Invalid -> invalid card with "Try Again". Normalization works. `maxLength` enforced. URL-decoded correctly. Status labels correct. Dates localized. Skeleton renders. Snapshot fallback works.

### 11.9 Verification Form UI

- [ ] **Test:** Empty code, typing behavior, submit state, metadata, skeleton  
  **Role:** Public Verifier  
  **Steps:** Submit empty code. Type code and observe auto-uppercase/monospace styling. Press submit. Inspect metadata in `fr`/`ar`. Observe skeleton during load.  
  **Expected:** Empty code blocked (`disabled` button). Input auto-uppercases. `isSubmitting` briefly true. Metadata localized. Skeleton mirrors layout.

### 11.10 Email Notifications

- [ ] **Test:** Agreement and certificate emails sent/skipped/failed  
  **Role:** System  
  **Steps:** Generate agreement/certificate for student with email enabled and disabled. Simulate SMTP failure.  
  **Expected:** Email sent when enabled, skipped with `EMAIL_SKIPPED` when disabled. Generation succeeds even if email fails, with logged error.

### 11.11 QR Code & PDF Rendering

- [ ] **Test:** QR code embedded and scannable  
  **Role:** System  
  **Steps:** Generate any agreement/certificate. Inspect PDF for QR code. Scan QR code with device.  
  **Expected:** QR code embedded as PNG data URL, 120px, error correction M. Scan resolves to correct verification URL.

### 11.12 Persistence & Storage Fallbacks

- [ ] **Test:** S3 unconfigured, upload fail, fetch fail  
  **Role:** System  
  **Steps:** Unset S3 config. Force upload failure during persist. Force fetch failure during download.  
  **Expected:** `persistDocumentBuffer` returns null; generation continues. `fetchDocumentBuffer` returns null; falls back to regeneration.

### 11.13 Rate Limiting & Authorization

- [ ] **Test:** Auth and rate limits on document endpoints  
  **Role:** Various  
  **Steps:** Call `generateAgreement` without university admin session. Call `generateCertificateByCompany` without company owner. Call `listByStudent` without student. Call `downloadByCompany` without company admin. Call `verifyDocument` without auth. Exceed standard/generous limits.  
  **Expected:** 401/403 for unauthorized. Public allowed for `verifyDocument`. 429 for rate limit exceeded.

### 11.14 Conflict Resolution & Concurrency

- [ ] **Test:** Race conditions on agreement and certificate generation  
  **Role:** University Admin / Company Owner  
  **Steps:** Two admins simultaneously generate agreement for same placement. Two owners simultaneously generate certificate for same placement.  
  **Expected:** One wins insert; other resolves via conflict branch and returns existing/generated document. No duplicate records or emails.

---

## 12. Notifications & Preferences

### 12.1 Notification Creation & Delivery

- [ ] **Test:** Application, interview, message, placement, document, and approval notifications  
  **Role:** Various  
  **Steps:** Trigger each event type: student applies (company gets `new_application`); company accepts/refuses; pipeline stage changes; interview proposed/confirmed/cancelled; new message sent; placement validated/rejected; agreement/certificate generated; company/university approved/rejected/suspended/reactivated.  
  **Expected:** Each recipient receives the correct in-app notification with localized title and payload. Missing payload fields fall back to defaults.

### 12.2 Notification Bell (Navbar)

- [ ] **Test:** Badge count, dropdown behavior, auto-mark-as-read, mark all, relative times, view all link  
  **Role:** Any Authenticated User  
  **Steps:** Have unread notifications. Observe bell badge (exact count, hidden at 0, capped at `99+`). Click bell to open dropdown. Click individual item. Click "Mark all as read". Check relative timestamps. Click "View all". Rapidly open/close dropdown.  
  **Expected:** Dropdown shows up to 6 most recent. Opening dropdown auto-marks all as read. Individual click marks item. Badge resets. Relative times correct. Link navigates to `/dashboard/notifications`. Rapid toggles don't duplicate requests.

### 12.3 Notifications List Page

- [ ] **Test:** Page load, infinite scroll, mark read, mark all, empty state, skeleton  
  **Role:** Any Authenticated User  
  **Steps:** Navigate to `/dashboard/notifications`. Scroll to bottom. Click unread card. Click already-read card. Click "Mark all as read". Visit with zero notifications. Hard-refresh page.  
  **Expected:** Page loads with header and unread count. Infinite scroll fetches 20 per page. Unread card marked read on click. Read card click does nothing. "Mark all" updates all cards. Empty state shown when none. Skeleton renders during initial load.

### 12.4 Notification Content & Formatting

- [ ] **Test:** Long content, unknown type, deleted resource reference, 100+ notifications  
  **Role:** Any Authenticated User  
  **Steps:** Receive notifications with very long titles/companies/reasons. Receive unknown type. Receive notification for deleted offer. Generate 100+ notifications.  
  **Expected:** Text clamped/truncated without breaking layout. Unknown type falls back to `humanizeToken`. No crash on deleted resource reference. Badge shows `99+`. List paginates smoothly.

### 12.5 AI Summary Feature

- [ ] **Test:** Summarize button with and without notifications, AI failure fallback  
  **Role:** Any Authenticated User  
  **Steps:** Click "Summarize" on notifications page when notifications exist. Click with zero notifications. Force AI call to fail.  
  **Expected:** AI transport calls `/api/assistant/chat` with intent `notifications_summarize` and up to 50 latest notifications. Button disabled when zero. Fallback summary shows unread count + top 3 type counts on AI failure.

### 12.6 Notification Preferences

- [ ] **Test:** Settings UI toggle behavior and feature flag disabled  
  **Role:** Any Authenticated User  
  **Steps:** Navigate to Settings > Notifications. Toggle "In-app" and "Email" checkboxes. Disable `NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES`.  
  **Expected:** Toggles fire mutation and optimistically update cache. When disabled, UI shows "Soon" badge and fallback text; checkboxes hidden.

- [ ] **Test:** Preference effect on delivery and default behavior  
  **Role:** Any Authenticated User / Newly registered user  
  **Steps:** Disable in-app notifications; trigger an event. Disable email notifications; trigger an event with email. Register a new user with no preference row. Update only `inAppEnabled`.  
  **Expected:** In-app disabled -> `createNotification` returns `{ skipped: true }`. Email disabled -> email skipped. New user defaults to both enabled. Partial update preserves other field.

### 12.7 Mark-As-Read Persistence & Security

- [ ] **Test:** Read state persists across sessions, mark-all with zero, malicious cross-user mark, double-click race  
  **Role:** Any Authenticated User / Malicious User A  
  **Steps:** Mark some read, log out and back in. Click "Mark all as read" when count = 0. Craft request to mark User B's notification. Click same notification twice rapidly.  
  **Expected:** States persist exactly. Button disabled at zero. Server filters by `userId`; 0 rows updated for cross-user. Second update returns `updated: 0` due to `isNull(readAt)` guard.

### 12.8 Real-Time / Live Updates

- [ ] **Test:** No automatic live updates  
  **Role:** Any Authenticated User  
  **Steps:** Receive a notification while already on the dashboard without refreshing.  
  **Expected:** No automatic appearance. Badge count and list do not update until navigation or manual refresh. (No SSE, WebSocket, or polling configured.)

### 12.9 Architecture / Data Integrity

- [ ] **Test:** User deletion cascade, direct insert prevention, limit enforcement, cursor pagination  
  **Role:** Developer / Auditor / Any  
  **Steps:** Delete user account. Verify no direct `db.insert(notification)` outside service. Query with `limit=50` and `limit=51`. Query with cursor.  
  **Expected:** Notifications and preferences cascade deleted. Only `src/server/services/notifications/create.ts` contains direct inserts. `limit>50` rejected by Zod. Cursor pagination uses `createdAt` + `id` composite.

---

## 13. Admin Dashboard, Stats & Moderation

### 13.1 Role-Based Access Control

- [ ] **Test:** Admin page access for all roles  
  **Role:** Dept Head / University Admin / Super Admin / Company Admin / Student  
  **Steps:** Visit every `/dashboard/admin/*` route as each role.  
  **Expected:** Dept Head redirected to `/dashboard`. University Admin sees users/departments/validations scoped to own university only. Super Admin sees all routes globally. Company Admin and Student redirected to `/dashboard`.

### 13.2 Admin Stats Dashboard

- [ ] **Test:** Stats dashboard loading, high-level numbers, breakdown accuracy, trust indices, open reports  
  **Role:** Super Admin  
  **Steps:** Navigate to `/dashboard/admin/stats` with network throttling. Cross-reference displayed numbers against raw DB counts. Verify `placedStudents` distinct count. Verify `unplacedStudents` never negative. Verify breakdown sums to total. Verify trust index cards and open report cards. Click resolve/dismiss on reports.  
  **Expected:** Loading spinner/skeletons shown while in-flight. Numbers exact. Negative clamped at 0. Breakdown sums match. Trust scores visible. Reports resolve/dismiss correctly with toasts.

### 13.3 User Management List

- [ ] **Test:** University admin scoped list, super admin global list, search, filter, pagination, sort, create user  
  **Role:** University Admin / Super Admin  
  **Steps:** Open `/dashboard/admin/users`. Verify scoped vs global results. Search by email fragment (debounced). Filter by role. Navigate pages. Observe default sort (`createdAt desc`). Click "Create User" (super admin only), fill form, submit.  
  **Expected:** Scoped to admin's university. Super admin sees all. Search/filter/pagination work. Most recent first. Create user succeeds with `emailVerified: true`. Student/university roles require `universityId`.

### 13.4 User Actions (Ban, Unban, Set Role, Set Password, Delete)

- [ ] **Test:** Ban with reason/duration, unban, set role, set password, delete user  
  **Role:** Super Admin  
  **Steps:** From actions menu: Ban user with reason and 24h duration. Unban. Set role. Set password (min 8). Delete user.  
  **Expected:** Each action succeeds with toast. Banned status visible. Role/password updated. User removed from table. University Admin sees options but gets 403 on click.

### 13.5 User Detail Page

- [ ] **Test:** View details, not found state, loading, impersonate, ban/unban, revoke sessions  
  **Role:** Super Admin  
  **Steps:** Navigate to valid and non-existent `userId`. Throttle network. Click Impersonate. Click Ban/Unban. Click Revoke All Sessions. Click X on a specific session.  
  **Expected:** Info card and sessions table render. "User not found" empty state. Skeleton on slow network. Impersonation starts with toast and redirect. Ban/unban updates status. All/single sessions revoked. Revoked session no longer appears.

### 13.6 Session Management

- [ ] **Test:** List sessions and revoke flow  
  **Role:** Super Admin  
  **Steps:** Open user detail. Inspect `listSessions` response. Revoke a session. Verify token resolution.  
  **Expected:** Sessions include `tokenPrefix`, `ipAddress`, `userAgent`, dates, `impersonatedBy`. Revoke resolves token via list-then-revoke pattern.

### 13.7 Validations Queue

- [ ] **Test:** University Admin views pending validations, infinite scroll, detail, validate/reject, AI summary, PDF error  
  **Role:** University Admin  
  **Steps:** Navigate to `/dashboard/admin/validations`. Scroll to bottom. Click card. Select valid dates, validate. Reject with/without reason. Click "Generate AI Summary". Validate with simulated PDF failure.  
  **Expected:** Lists `company_accepted` applications for admin's university. Next page on scroll. Detail shows required cards. Validate creates placement and generates PDF. Reject updates status. AI summary appears. PDF failure shows toast but validation still succeeds.

### 13.8 Company Moderation Queue

- [ ] **Test:** Super Admin filters, approves, rejects, suspends, reactivates, deletes, downloads verification doc  
  **Role:** Super Admin  
  **Steps:** Visit `/dashboard/admin/companies`. Toggle status filters. Search (debounced). Approve pending. Reject with reason. Suspend approved. Reactivate suspended. Delete. Click download icon.  
  **Expected:** List filters correctly. Infinite scroll resets on filter change. Actions succeed with toasts. Download returns base64 and auto-downloads.

### 13.9 University Moderation Queue

- [ ] **Test:** Super Admin filters, approves, rejects, edits, deletes universities  
  **Role:** Super Admin  
  **Steps:** Visit `/dashboard/admin/universities`. Toggle filters. Search. Approve. Reject with reason. Edit fields. Delete.  
  **Expected:** Same behavior as company moderation. DB updated/removed correctly. Linked users' caches invalidated.

### 13.10 Departments Management

- [ ] **Test:** University Admin and Super Admin department CRUD  
  **Role:** University Admin / Super Admin  
  **Steps:** Visit `/dashboard/admin/departments`. Create department. Bulk create. Edit name. Assign head by email. Remove head. Delete department. Manage skills.  
  **Expected:** All CRUD operations succeed with toasts. Super admin must select university first. Bulk create handles mixed success/errors. Head assignment creates user if needed. Skills sync updates correctly.

### 13.11 Data Accuracy & Integrity Checks

- [ ] **Test:** Cross-check stats, user affiliations, session data  
  **Role:** Tester / Auditor  
  **Steps:** Run SQL counts and compare to UI numbers. Verify `unplacedStudents` >= 0. Verify affiliation columns match DB. Verify `tokenPrefix` is last 4 chars of token.  
  **Expected:** Exact matches. No negative numbers. Accurate affiliation data.

---

## 14. UI/UX, i18n, RTL & Theme

### 14.1 Language Switching (i18n)

- [ ] **Test:** Switch between EN / FR / AR, preserve pathname, hard-refresh, unsupported locale, dashboard switch, mobile menu switch, metadata  
  **Role:** Public / Authenticated  
  **Steps:** Visit `/en/`, switch to FR, then AR, then EN. Switch on deep links (`/fr/discover`). Hard-refresh `/ar/about`. Visit `/de/` (unsupported). Log in on `/en/dashboard` and switch to FR. Open mobile menu and switch language. Inspect `<title>` and `<meta>` tags.  
  **Expected:** URL updates with locale. Pathname and query params preserved. SSR renders correctly on hard refresh. Unsupported locale shows 404 with fallback. Dashboard labels translate. Mobile menu handles switch gracefully. Metadata localized with alternate language links.

### 14.2 RTL Layout Correctness in Arabic

- [ ] **Test:** HTML dir, mobile sheet side, dashboard sidebar, auth panel, footer hover, 404 page, tracking override, navbar order, dropdown alignment, lint check  
  **Role:** Public / Authenticated  
  **Steps:** Visit `/ar/`. Open mobile navbar. Visit `/ar/dashboard`. Visit `/ar/login`. Inspect Footer underlines. Visit `/ar/404-a-page`. Inspect uppercase labels. Visit `/ar/discover`. Open dashboard user dropdown. Run `bun run lint:rtl-logical`.  
  **Expected:** `dir="rtl"` on html/body. Mobile sheet slides from left. Dashboard sidebar on right. Auth panel on right. Footer underlines animate from right. 404 underline originates from right. Arabic labels use `tracking-normal`. Navbar links mirrored. Dropdown aligns to logical end. Lint passes with zero physical directional properties.

### 14.3 Dark Mode Toggle and Persistence

- [ ] **Test:** Toggle, navigation persistence, locale change persistence, browser restart, skeletons, ambient glow, auth layout, mobile menu, settings dialogs, toast styling  
  **Role:** Public / Authenticated  
  **Steps:** Toggle theme on homepage. Navigate to `/en/login`. Switch locale while dark. Close tab and reopen `/ar/`. Observe skeletons in dark mode. Inspect 404 ambient glow. Toggle on auth layout. Toggle while mobile menu open. Visit `/en/dashboard/settings`. Trigger toast in dark mode.  
  **Expected:** `<html class="dark">` applied. Persists across navigation, locale changes, and restarts. Skeletons use dark palette. Glow orbs visible (`dark:opacity-100`). Auth layout transitions. Mobile menu adapts instantly. Settings dialogs use dark variables. Toasts use `--popover` dark colors.

### 14.4 Responsive Design

- [ ] **Test:** Public pages on mobile/tablet/desktop, dashboard on mobile/tablet/desktop, onboarding/status pages on mobile  
  **Role:** Public / Authenticated  
  **Steps:** Visit `/en/login`, `/en/discover`, `/en/about` on 375px, 768px, 1440px+. Visit `/en/dashboard`, `/en/dashboard/company/offers`, `/en/dashboard/settings` on same viewports. Visit `/en/onboarding/company` and `/en/status/company/pending` on mobile.  
  **Expected:** Login hides decorative panel on mobile, split on desktop. Discover stacks on mobile, multi-column on desktop. Dashboard shows hamburger + overlay on mobile, persistent sidebar on desktop. Onboarding/status pages use single column with `px-6`.

### 14.5 Loading Skeletons / Spinners

- [ ] **Test:** Skeletons on slow connections for all major pages  
  **Role:** Public / Authenticated  
  **Steps:** Throttle to "Slow 3G". Visit `/en/`, `/en/discover`, `/en/dashboard`, `/en/dashboard/assistant`, `/en/dashboard/explore`, `/en/login`, `/en/signup`, `/en/dashboard/company/offers`, `/en/dashboard/settings`. Hard-refresh `/en/dashboard`.  
  **Expected:** Skeletons render immediately (no blank white screen). `aria-busy="true"` on auth skeletons. No CLS between skeleton and real content. Colors match active theme.

### 14.6 Toast / Sonner Notifications

- [ ] **Test:** Toast triggers, dark mode toasts, error toasts, loading toasts, locale persistence  
  **Role:** Public / Authenticated  
  **Steps:** Submit valid email in footer newsletter. Trigger toast in dark mode. Perform unauthorized action. Trigger loading toast if any. Switch locale while toast visible.  
  **Expected:** Success toast with `CircleCheckIcon`, position `bottom-center`, duration 3000ms. Dark toast uses popover colors. Error toast with `OctagonXIcon` and red tint. Multiple toasts stack. Existing toasts don't change text on locale switch.

### 14.7 Empty States

- [ ] **Test:** Empty states across the app  
  **Role:** Various  
  **Steps:** Visit pages with zero data: company offers, validations, saved offers, applications, notifications, messages, search results, admin lists.  
  **Expected:** Each shows appropriate empty state with icon, localized heading, description, and CTA where applicable. Skeletons do not show empty states prematurely.

### 14.8 Error Pages (404, 500, Generic Error Boundary)

- [ ] **Test:** Public 404, root 404, dashboard error boundary, segment error, auth server error, 404 in dark mode, permission error, generic 500  
  **Role:** Public / Authenticated  
  **Steps:** Visit non-existent public page. Visit non-existent root path without locale. Simulate dashboard error. Submit invalid auth credentials. Visit `/ar/404-page` in dark mode. Access dashboard page without permission. Simulate unhandled server error.  
  **Expected:** Localized `not-found.tsx` with editorial design, motion reveals, ambient glow, and CTA. Root 404 resolves locale from headers. Dashboard error boundary shows `AlertCircle`, localized title, description, retry button. Auth `ServerError` animates in. 404 adapts to dark mode and RTL. Unpermitted access redirects appropriately.

### 14.9 Accessibility

- [ ] **Test:** Keyboard navigation, LanguageSwitcher via keyboard, ThemeToggle via keyboard, mobile menu Escape, sidebar nav, auth skeleton ARIA, reduced motion, footer links, user dropdown, axe-core scan  
  **Role:** Public / Authenticated  
  **Steps:** Tab through `/en/login`. Open LanguageSwitcher with Space/Enter. Focus ThemeToggle and press Enter. Open mobile menu and press Escape. Tab through dashboard sidebar. Enable OS "Reduce Motion". Navigate footer links with keyboard. Open user dropdown with keyboard. Run axe-core scan on `/en/login`, `/en/dashboard`, `/ar/`.  
  **Expected:** Focus order logical and visible. Dropdown keyboard-navigable. Theme toggles and label updates. Escape closes mobile menu and returns focus. Sidebar items focusable with visible outline. `MotionConfig reducedMotion="user"` respects preference. External links have correct `rel`. Dropdown items keyboard-navigable. No critical axe violations.

### 14.10 Animation Smoothness

- [ ] **Test:** Page transitions, motion reveals, theme toggle icons, sidebar collapse/expand, mobile sidebar, ServerError/SuccessMessage, skeleton shimmer, FooterLink hover, navbar hover, tab switches  
  **Role:** Public / Authenticated  
  **Steps:** Visit `/en/login` and observe staggered panel load. Visit `/en/nonexistent` and observe 404 reveals. Toggle theme repeatedly. Collapse/expand dashboard sidebar. Open/close mobile sidebar. Trigger `ServerError` or `SuccessMessage`. Scroll through skeletons. Hover footer and navbar links. Switch settings tabs.  
  **Expected:** Smooth staggered animations with `reveal` + `ease`. Theme icons animate with spring physics. Sidebar width animates over 500ms. Mobile sidebar slides smoothly. Error/success animate from `opacity: 0, height: 0`. Skeleton pulse smooth. Hovers transition over 300ms.

### 14.11 Footer and Navbar Links Working Across Locales

- [ ] **Test:** Click all navbar and footer links in each locale, logo link, dashboard sidebar links, auth page links, status page mailto, BackButton, logout  
  **Role:** Public / Authenticated  
  **Steps:** Click Discover, For Students, For Recruiters, About, Sign In, Get Started, Privacy, Terms, Cookies, GitHub. Click logo. Click dashboard sidebar items. Click "Create one", "Forgot password?" on auth pages. Click "Contact Support" on status page. Click BackButton. Click logout.  
  **Expected:** All internal links preserve current locale. External GitHub opens in new tab. Dashboard sidebar highlights active item. Auth links navigate correctly. Mailto opens client. BackButton returns to localized homepage. Logout clears session and redirects to localized home.

---

## 15. Security, Rate Limiting & Edge Cases

### 15.1 Auth Guards & Layout Redirects (Server-Side)

- [ ] **Test:** Access protected pages while logged out, access auth pages while authenticated, role guards, approval gate redirects  
  **Role:** Attacker / Tester  
  **Steps:** Clear cookies and hit `/dashboard`, `/onboarding`, `/profile` (should redirect to login). Log in and hit `/login` or `/signup` (no redirect guard). Log in as student and hit `/dashboard/company/profile` / `/dashboard/admin/users`. Log in as pending/rejected/suspended company or university admin and hit `/dashboard`.  
  **Expected:** Unauthenticated -> login. Auth pages accessible while logged in (intentional or verify). Wrong role -> `/`. Pending -> `/status/.../pending`. Rejected -> `/status/.../rejected`.

### 15.2 oRPC Procedure Auth Guards (API Layer)

- [ ] **Test:** Call authed/admin/university/superAdmin/companyAdmin/companyOwner/student/deptHead procedures without proper role  
  **Role:** Attacker  
  **Steps:** Call `users.getMe` with no cookies. Call `adminUsers.list` as student. Call `departments.assignHead` as company_admin. Call `companies.delete` as university_admin. Call `companies.listMembers` as student. Call `companies.deleteOwn` as recruiter. Call `students.getProfile` as company_admin. Call `deptHead.listPending` without dept assignment.  
  **Expected:** 401 `UNAUTHORIZED` for no session. 403 `FORBIDDEN` with specific codes (`ADMIN_ACCESS_REQUIRED`, `UNIVERSITY_ACCESS_REQUIRED`, `COMPANY_ADMIN_ACCESS_REQUIRED`, `STUDENT_ACCESS_REQUIRED`, etc.).

- [ ] **Test:** Company admin with zero or multiple memberships  
  **Role:** Attacker / Tester  
  **Steps:** Create user with `company_admin` role but no `companyMember` row. Create duplicate `companyMember` rows for one user.  
  **Expected:** Zero -> `FORBIDDEN` / `NO_COMPANY_MEMBERSHIP`. Multiple -> `INTERNAL_SERVER_ERROR` / `COMPANY_MEMBERSHIP_CONFLICT` (no access granted).

- [ ] **Test:** Approval gate on authedProcedure vs bypass on authedSessionProcedure  
  **Role:** Tester  
  **Steps:** Log in as pending company_admin. Call `companies.create` (authedProcedure). Call `users.getMe` (authedSessionProcedure).  
  **Expected:** `companies.create` blocked with `ADMIN_APPROVAL_COMPANY_PENDING`. `users.getMe` succeeds.

### 15.3 Rate Limiting

- [ ] **Test:** Brute-force login, public read abuse, authenticated standard/generous/strict/AI limits, role-specific isolation, E2E bypass attempt  
  **Role:** Attacker / Tester  
  **Steps:** Submit login 6+ times in 60 sec. Hit `skills.list` 101+ times unauthenticated. Call `users.updateMe` 101+ times as authenticated. Call `notifications.list` 301+ times. Call `users.updateMe` (strict) 6+ times. Call `assistant.appendMessage` 21+ times. Exhaust student-standard then try companyadmin-standard. Set `E2E_DISABLE_RATE_LIMIT=1` client-side.  
  **Expected:** 429 after respective thresholds (5 strict, 100 standard, 300 generous, 20 AI). Isolated by role prefix. Server-side env check prevents client bypass.

### 15.4 Turnstile / Captcha

- [ ] **Test:** Missing token, replay used token, expired token, env mismatch  
  **Role:** Attacker / Tester  
  **Steps:** Submit login without `x-captcha-response`. Replay consumed token. Wait for expiry then submit. Set `CAPTCHA_ENABLED=false` server-side but render widget client-side.  
  **Expected:** Request rejected by better-auth plugin. Reused token rejected. Expired token rejected. If server disabled, request succeeds.

### 15.5 Zod Input Validation & Boundary Values

- [ ] **Test:** Signup boundaries, SQL injection / XSS in search, offer creation boundaries, student profile boundaries, application/message boundaries, verification code boundary, pagination/cursor tampering  
  **Role:** Attacker  
  **Steps:** Submit signup with name 1 char, email malformed, password 7/129 chars, accountType injected as `super_admin`. Submit search keyword with `' OR 1=1 --`, `<script>alert(1)</script>`. Create offer with title 2 chars, desc 9 chars, duration 53, maxPositions 101, >20 skills, duplicate languages, invalid dates. Update profile with 11 skills, duplicate languages, wilaya 59, non-URL. Apply with coverLetter 5001 chars. Send message 5001 chars. Submit verification code 21+ chars. Send `limit=0/51/9999` or malformed cursor.  
  **Expected:** Zod rejects all invalid boundaries. SQL/XSS strings treated as literals by parameterized queries. HTML escaped in React.

### 15.6 File Upload Security

- [ ] **Test:** Non-image as avatar, oversized image, path traversal, non-PDF resume, oversized resume, polyglot file, resume S3 key integrity  
  **Role:** Attacker  
  **Steps:** Rename `malware.exe` to `.jpg` and upload as avatar. Upload 6MB JPEG. Attempt `../../../etc` in folder param. Upload `.docx`/`.exe` renamed to `.pdf` as resume. Upload 11MB PDF. Craft polyglot file (valid JPEG magic bytes + PHP code). Inspect resume S3 key format.  
  **Expected:** Rejected by magic bytes, MIME, and size checks. Folder sanitized. Resume key format `resumes/{userId}/{uuid}.pdf` with verified auth context. S3 bucket should not execute scripts.

### 15.7 Session, CSRF & Replay Security

- [ ] **Test:** Session replay after logout, cross-site request, session expiration, multi-session limit, impersonation timeout, 2FA OTP expiry & reuse  
  **Role:** Attacker / Tester  
  **Steps:** Copy cookie, log out (revoke session), replay cookie in `curl`. Host HTML on another origin that POSTs to oRPC mutation. Wait 24h without activity. Log in from 6 browsers. Impersonate and wait 15 min. Enable 2FA, request OTP, wait >5 min, submit old OTP, submit same OTP twice.  
  **Expected:** Replayed cookie returns `UNAUTHORIZED`. CORS + `SameSite` cookies block cross-site. Session expires. 6th session evicts oldest or rejects. Impersonation auto-expires. Old OTP rejected (TOTP non-reusable).

### 15.8 Suspended / Banned Users & Approval Gates

- [ ] **Test:** Banned user login/navigation, unapproved company/university mutations, rejected/suspended entity dashboard access  
  **Role:** Tester  
  **Steps:** Ban user and attempt login + dashboard access with pre-ban session. Sign up as company/university admin without approval. Call mutations. Log in as rejected/suspended company or university admin.  
  **Expected:** Login blocked or `ACCOUNT_SUSPENDED`. Existing sessions invalidated via `getFreshAuthSession`. Mutations return `ADMIN_APPROVAL_*_PENDING/REJECTED/SUSPENDED`. Dashboard redirects to status pages.

### 15.9 Password & Credential Security

- [ ] **Test:** Weak password acceptance, password length extremes, reset flow security, change password rate limit  
  **Role:** Attacker / Tester  
  **Steps:** Sign up with `12345678`. Use 128-char and 129-char passwords. Request reset for valid/non-existent email. Use reset link twice. Wait for expiry. Call password change 6 times in 60 sec.  
  **Expected:** No complexity check by default (confirm if intentional). 128 accepted, 129 rejected. Reset returns ambiguous success for non-existent. Second use of link rejected. Link expiry enforced (usually 1h). Change password rate limited after 5 attempts.

### 15.10 ServiceError Mapping & User Messages

- [ ] **Test:** Every ServiceError code surfaces user-friendly message, unknown errors fallback gracefully  
  **Role:** Tester  
  **Steps:** Trigger each mapped error code path: `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `COMPANY_MEMBERSHIP_CONFLICT`, `EXPERIENCE_NOT_FOUND`, `PLACEMENT_FORBIDDEN`, `ADMIN_MUST_BELONG_TO_UNIVERSITY`, `INTERVIEWS_FEATURE_DISABLED`, `SESSION_NOT_FOUND`, etc. Temporarily introduce new unhandled throw.  
  **Expected:** No raw stack traces leak to client. All mapped through `createServiceORPCError` with clean `message` and `data.code`. Unmapped errors fall back to `INTERNAL_SERVER_ERROR` without internal details.

### 15.11 Public API Exposure & Locale / Routing Edge Cases

- [ ] **Test:** Hit auth-required oRPC without auth, probe better-auth routes, locale-prefixed protected path bypass, open redirect attempt, signup role escalation, domain email rules, resource modification via ID parameter  
  **Role:** Attacker  
  **Steps:** `curl` `companies.list`, `offers.search` without Cookie. Probe `/api/auth/*` admin endpoints. Access `/dashboard` without locale prefix or with `/de/dashboard`. Append `?redirect=https://evil.com` to login. Intercept signup and set `accountType` to `super_admin`. Sign up as student with `gmail.com` and `cs.student.university.edu`. Attempt to update another user's experience or delete their project.  
  **Expected:** 401/403 for auth-required routes. Better-auth ACLs block unauthorized API access. `next-intl` redirects to supported locale. No unvalidated redirect parameters used after auth. `ROLE_IS_NOT_ALLOWED_TO_BE_SET` blocks escalation. Non-university email rejected; subdomain matches parent domain. Ownership verification returns `FORBIDDEN`/`NOT_FOUND`.

### 15.12 Data Integrity & Privilege Escalation

- [ ] **Test:** Cross-company data access, modify another user's resource, university/company admin signup with any email  
  **Role:** Attacker / Tester  
  **Steps:** As Company A admin, call `companies.listMembers` targeting Company B (if param exposed). As studentA, call `updateStudentExperience` with studentB's ID. Sign up as `company_admin` with `gmail.com`.  
  **Expected:** `companyAdminProcedure` injects membership from context; no cross-company access. Service layer verifies ownership; returns `FORBIDDEN`/`NOT_FOUND`. Company/university signups allowed with any email (no domain restriction).

---

## 16. Known Gaps & Not Implemented

> **Jury Note:** The following capabilities were discovered during the audit as **intentionally missing or not yet implemented**. If the jury asks about them, you can reference this list.

### 16.1 Interview Scheduling

- [ ] **Gap:** Student cannot **decline** an interview proposal.  
  **Status:** NOT IMPLEMENTED — only confirm or ignore.

- [ ] **Gap:** No **reschedule** flow for interviews.  
  **Status:** NOT IMPLEMENTED — once confirmed, slot is locked.

- [ ] **Gap:** No **overlap prevention** for interview slots.  
  **Status:** NOT IMPLEMENTED — a company can propose a slot overlapping an existing confirmed interview, and a student can confirm a conflicting slot.

- [ ] **Gap:** No explicit **confirmation deadline** besides the slot start time.  
  **Status:** NOT IMPLEMENTED — confirmation blocked only after `startsAt <= now()`.

- [ ] **Gap:** No **manual cancel** by company or student.  
  **Status:** NOT IMPLEMENTED — interviews only reach `cancelled` status indirectly via offer closure.

### 16.2 Messaging System

- [ ] **Gap:** Suspended/banned company or user can still receive/send messages.  
  **Status:** NOT IMPLEMENTED — messaging services do not check `company.status` or `user.banned` before sending.

### 16.3 Application Flow

- [ ] **Gap:** No file upload during the **apply** flow.  
  **Status:** NOT IMPLEMENTED — `application` schema only supports text `coverLetter`. Documents (`placementDocument`) are created only **after** placement validation.

### 16.4 Notifications

- [ ] **Gap:** No **real-time transport** (SSE / WebSocket / polling).  
  **Status:** NOT IMPLEMENTED — notifications refresh only on page navigation or query invalidation.

### 16.5 UI / Localization

- [ ] **Gap:** `ValidationEmptyState.tsx` uses hardcoded English title `No validations` instead of translation key.  
  **Status:** LOCALIZATION GAP — will not translate to French or Arabic.

- [ ] **Gap:** `DashboardError` uses `defaultMessage` inside `t()` which is non-standard for `next-intl` and may silently show empty strings if unsupported.  
  **Status:** POTENTIAL BUG — verify fallback behavior.

---

> **End of Checklist**  
> Total sections: 16  
> Good luck with the jury presentation! Test systematically, mark `[X]` when verified, and iterate until stable.

