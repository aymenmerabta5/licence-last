# Stag.io — Manual Testing Checklist
## Live Jury Demo Edition

---

## Pre-Demo Environment

- [ ] Clear browser cache and cookies
- [ ] Test on exact demo resolution (prefer 1920x1080, avoid 1280x720 if possible)
- [ ] Keep DevTools closed
- [ ] Prepare 4 accounts: Student, Company Admin, University Admin, Super Admin (simple passwords, NO 2FA)
- [ ] Seed database: 6-8 offers, 4+ candidates, 3+ applications, 2+ placements with generated docs, 10+ users, 3+ pending validations, 2-3 open reports
- [ ] Pre-warm all pages in incognito windows 5 minutes before demo
- [ ] Confirm Turnstile CAPTCHA disabled or working on demo network
- [ ] Have small files ready: company PDF (<1MB), square logo (<500KB), student resume PDF
- [ ] Pre-test AI Copilot query, pre-generate AI validation summary, pre-open assistant chat
- [ ] Test RTL (Arabic) toggle on `/login` and `/`
- [ ] Test dark mode toggle on `/login` and dashboard
- [ ] Present in the same browser used for testing

---

## 1. Public Pages & Authentication

### 1.1 Landing Page (`/`)
- [ ] Open in incognito window
- [ ] Navbar renders: logo, nav links, language switcher, theme toggle, login/signup
- [ ] Mobile hamburger menu opens Sheet with nav links
- [ ] MarqueeRibbon animates at top
- [ ] HeroSection renders headline, subtitle, CTAs
- [ ] StatsBar shows platform stats
- [ ] HowItWorksSection renders step-by-step
- [ ] Footer newsletter: empty validation, invalid regex, success toast
- [ ] Toggle dark mode — smooth 500ms transition
- [ ] Switch to French — content translates
- [ ] Switch to Arabic — RTL flips correctly (`ms`/`me`, `start`/`end`)

### 1.2 Login (`/login`)
- [ ] Editorial split-panel layout renders
- [ ] Empty fields submission shows inline validation errors
- [ ] Invalid email format shows error
- [ ] Wrong password shows generic server error (no credential leak)
- [ ] Password visibility toggle works
- [ ] "Remember me" checkbox renders
- [ ] "Forgot password?" navigates to `/reset-password`
- [ ] Unverified email account shows VerificationAlert with resend button
- [ ] 2FA-enabled account shows ThreeFactorStep with 3 tabs (skip demoing live)
- [ ] Successful login redirects to role-appropriate destination

### 1.3 Signup (`/signup`)
- [ ] RoleSelector shows 3 animated cards (Student, Company, University)
- [ ] Click each role, verify entry animation and back-navigation works
- [ ] Student signup: validation on name, email, password, confirm, terms
- [ ] Password mismatch shows error
- [ ] Terms links open `/terms` and `/privacy`
- [ ] Success state shows "Verify your email" with back-to-login link
- [ ] Company/University signup shows role-specific copy

### 1.4 Reset Password (`/reset-password`)
- [ ] Empty email shows validation error
- [ ] Non-existent email shows generic success (security)
- [ ] Real email shows success message
- [ ] Valid token page: new password fields, mismatch validation, success message
- [ ] Invalid token shows `invalidOrExpired` error

### 1.5 Onboarding Flows
- [ ] **Student**: redirect to `/onboarding/student`, fill bio, phone, student number, department, level, wilaya, GitHub, portfolio, languages, skills (max 10 dot indicator), submit → `/dashboard`
- [ ] **Company**: redirect to `/onboarding/company`, fill name, description, website, upload verification PDF, wilaya, address, submit → `/status/company/pending`
- [ ] **University**: redirect to `/onboarding/university`, fill name, abbreviation, phone, location, domains array, departments array, submit → `/status/university/pending`
- [ ] Re-accessing onboarding after completion redirects to dashboard

### 1.6 Public Marketing Pages
- [ ] `/about` — content renders, metadata populated
- [ ] `/discover` — public offer cards load, search/filter interactive
- [ ] `/for-students` — CTA leads to signup
- [ ] `/for-companies` — CTA leads to signup
- [ ] `/terms`, `/privacy`, `/cookies` — `LegalPageFrame` consistent, translated, dark mode readable

### 1.7 Public Profiles
- [ ] `/company/[slug]` — standalone page (no navbar/footer), logo/initial, name, location, description, open offers
- [ ] `/profile/[userId]` — standalone page, background animation, skeleton-to-content, name, avatar, skills, languages, experiences
- [ ] Non-existent slug/user shows custom 404 page (animated 404 typography)

### 1.8 Status Pages
- [ ] `/status/company/pending` — explains pending status, no dead-end confusion
- [ ] `/status/company/rejected` — red kicker, rejection reason card, contact support mailto
- [ ] `/status/company/suspended` — orange kicker, suspension reason
- [ ] `/status/university/rejected` — red kicker, reapply mailto, redirect guards work

---

## 2. Student Experience

### 2.1 Student Dashboard (`/dashboard`)
- [ ] Editorial masthead with "Student Dashboard" badge, first name greeting, date block
- [ ] Profile strength gauge animates from 0 to actual percentage
- [ ] Editorial Stats Bar: 5 metrics with hover inversion animation
- [ ] Applications Feed: 5 recent apps with index numbers, company, title, status badge, relative time
- [ ] Hover on app card shows `bg-primary/10` slide-in + arrow animation
- [ ] "View All" navigates to `/dashboard/applications`
- [ ] Empty state: `FileText` icon, noise texture, "Explore Internships" CTA
- [ ] Recommended Offers section renders (vanishes if empty — ensure seeded)
- [ ] Skills Sidebar: uppercase tags, dramatic hover inversion (`bg-foreground` ↔ `bg-background`)

### 2.2 CV Builder (`/dashboard/student/cv`)
- [ ] Page loads without redirect (requireOnboardedStudent gate)
- [ ] Resume upload: PDF only, filename/size/date display, Open in new tab, Delete
- [ ] Experience CRUD: Add editor, validation, `isCurrent` checkbox nullifies end date, Edit pre-populates, Delete with loading state
- [ ] Projects CRUD: Add with URLs (optional + validation), Edit, Delete
- [ ] Empty states for each section look intentional

### 2.3 Applications (`/dashboard/student/applications`)
- [ ] Pipeline board: 6 columns render with headers and counts
- [ ] Horizontal scroll works (min-width 1120px — test on projector!)
- [ ] Application cards: offer title, company, wilaya, status badge, date
- [ ] Withdraw button shows `window.confirm()` dialog
- [ ] Timeline modal opens with vertical history
- [ ] Empty state: dashed border, "No applications", "Explore Offers" CTA

### 2.4 Saved Offers (`/dashboard/student/saved-offers`)
- [ ] Feature flag `SAVED_OFFERS` is enabled (otherwise silent redirect)
- [ ] Offer cards: logo/initial, title, company, description clamp, wilaya, duration, skills
- [ ] BookmarkMinus icon unsaves with toast, card disappears
- [ ] "View details" routes to offer
- [ ] "Load more" pagination works if multi-page

### 2.5 Company Directory (`/dashboard/student/companies`)
- [ ] Editorial header with kicker, title, subtitle
- [ ] Keyword search filters in real-time
- [ ] Wilaya dropdown populates with 58 options
- [ ] Clear button resets both filters
- [ ] Company cards grid with infinite scroll
- [ ] Card hover and click routes to `/company/[slug]`

### 2.6 Offer Search (`/dashboard/explore`)
- [ ] Search bar with `start-4` icon, 300ms debounce
- [ ] Desktop sticky sidebar filters: wilaya, type, work mode, languages, skills
- [ ] Mobile filter sheet opens with `SlidersHorizontal` badge count
- [ ] Active filter count badge appears, Clear resets all
- [ ] AI Copilot: type natural language, loading state, filters auto-apply (pre-test query)
- [ ] Offers grid: staggered `motion.div` reveal, hover effect (`bg-foreground` + translate)
- [ ] Match score badge appears if applicable
- [ ] Infinite scroll triggers via sentinel
- [ ] Empty state: `Newspaper` icon, serif heading

### 2.7 Offer Detail & Application
- [ ] Save toggle (`Heart` icon) works
- [ ] Offer body, DetailsSidebar metadata, MatchingPanel (score + skill gap)
- [ ] CompanyCard trust score + report button
- [ ] Already applied shows `ApplicationStatusCard`
- [ ] Open offer shows "Apply Now" → form with cover letter
- [ ] AI draft cover letter button: loading spinner, draft appears, one-click apply (pre-test)
- [ ] Submit application → success toast, status card replaces form

### 2.8 Documents (`/dashboard/student/documents`)
- [ ] Placement cards: company name, type badge, dates, feedback callout
- [ ] Document rows: title, status, verification code, download button
- [ ] Generated status enables download; pending disables it
- [ ] Download triggers browser PDF download, success toast
- [ ] Quality Feedback Dialog: star rating (1-5), recommend checkbox, comment, validation, submit

### 2.9 Profile Editing (`/dashboard/settings`)
- [ ] Settings tabs: Profile, Account, Notifications with `AnimatePresence`
- [ ] Avatar upload: hidden input, loading spinner, immediate update
- [ ] Avatar delete reverts to initials
- [ ] Profile form: name, bio, phone, student number, department, level, wilaya, GitHub, portfolio
- [ ] Validation errors per field, save button disables during `isBusy`, success toast

---

## 3. Company / Recruiter Experience

### 3.1 Company Dashboard (`/dashboard`)
- [ ] Editorial masthead: "Company Dashboard" badge, greeting, date block
- [ ] Trust Gauge: dark card, dotted grid, large serif score, tier badge, progress bar, factor breakdown
- [ ] Offers Pulse: 4-column grid, hover circle scaling, primary pulse on Active Offers
- [ ] Recent Offers: index numbers, title, status badge, type, candidate count, underline hover
- [ ] Quick Actions: hover inversion, "Post Offer" navigates to `/dashboard/company/offers/new`
- [ ] AI Assistant action appears only if `COMPANY_ASSISTANT` flag enabled

### 3.2 Offers Management (`/dashboard/company/offers`)
- [ ] Editorial header, trust banner, "Create Offer" button
- [ ] Search filters client-side, status tabs (Draft/Published/Closed/All)
- [ ] Offer cards: border accent per status (amber/emerald/zinc), skills, languages, candidate count
- [ ] Draft: publish (rocket icon) → toast + emerald accent
- [ ] Published: close (XCircle) → AlertDialog → zinc accent
- [ ] Draft: delete (trash) → destructive AlertDialog → card removes
- [ ] Edit (pencil) → navigate to edit page with pre-populated fields
- [ ] Non-owner sees no action icons

### 3.3 Create/Edit Offer Form
- [ ] Validation: empty title, invalid dates, mismatched timeline
- [ ] Basic Info: title, description with icons
- [ ] Details: type, work mode, wilaya, duration, max positions, deadline, start/end dates
- [ ] Language Requirements: dynamic rows, proficiency dropdown, required checkbox, weight slider, add/remove, max languages
- [ ] Skills: search filtering, select/deselect, max 20 warning, selected skills top bar
- [ ] Submit → spinner → redirect → toast success

### 3.4 AI Copilot Panel (High Risk)
- [ ] Panel renders with primary left border, status dot
- [ ] Generate Draft: loading skeleton, result preview (title, description, badges, skill chips)
- [ ] "Apply to Form" instant population
- [ ] Improve Description: input text → result updates only description
- [ ] Suggest Skills: chips appear, Apply adds to SkillsSection
- [ ] Error state shows red message
- [ ] **Pre-test exact prompt. Have fallback content ready. If >3s, abort and speak over it.**

### 3.5 Candidates Pipeline (`/dashboard/company/offers/[offerId]/candidates`)
- [ ] Back arrow to offers, editorial header with offer title, candidate count badge
- [ ] Kanban grid: 6 columns with theme colors (blue/amber/violet/teal/emerald/rose)
- [ ] Drag hint (`GripVertical` icon) visible
- [ ] Drag Applied → Screening: drop zone highlights, card moves with optimistic update
- [ ] Drag to same column: no highlight
- [ ] Accepted/Rejected cards: no grab cursor
- [ ] Candidate cards: initials, name, university, status badge, date, match score %, top 3 skills, top 3 languages, `+N` overflow
- [ ] Hover grab cursor and shadow ring on drag
- [ ] Match Preview: color coding (emerald/blue/amber/rose), mini progress bar, top 3 reasons
- [ ] **Use mouse (not trackpad). Practice Applied → Screening drag.**

### 3.6 Accept / Refuse Modals
- [ ] Candidate in "Offer" stage shows Accept/Refuse buttons
- [ ] Accept: overlay, scale animation, emerald accent, CheckCircle2, confirmation, spinner, toast, moves to Accepted
- [ ] Refuse: destructive accent, AlertTriangle, textarea for note, confirm → moves to Rejected
- [ ] Cancel closes modal, refuse note clears

### 3.7 Candidate Filters
- [ ] Skill tags toggle on/off, language tags toggle on/off
- [ ] Pipeline re-renders with matching candidates
- [ ] "Clear Filters" appears when active, works instantly
- [ ] Empty filtered state: "No candidates match your filters"

### 3.8 Team Management (`/dashboard/company/team`)
- [ ] Members list: name, role badge (owner/recruiter), "You" label, email, joined date
- [ ] Owner cannot see Remove on own row
- [ ] Non-owner sees "Only owner can manage team members"
- [ ] Invite: email + optional name, loading state, toast distinguishes "Invitation sent" vs "Member added"
- [ ] New member appears in list immediately
- [ ] Duplicate email shows localized error toast

### 3.9 Company Profile (`/dashboard/company/profile`)
- [ ] Editorial masthead, dark mode glow effect
- [ ] About, Contact, Location sections with validation
- [ ] Logo upload: hover overlay, Camera icon, spinner, immediate update
- [ ] Invalid file type / oversized file shows error toast
- [ ] Save form → success message + toast
- [ ] Delete Company danger zone: name confirmation dialog, wrong name disables confirm

### 3.10 Documents (`/dashboard/company/documents`)
- [ ] Editorial header, placement count
- [ ] Placement cards: student name/email, offer title, dates, type badge
- [ ] Document rows: Agreement and Certificate with status
- [ ] Owner: Generate button for `notGenerated` → loading → download
- [ ] Generated: Download button triggers browser PDF download
- [ ] Non-owner: "Owner can generate" disabled state

---

## 4. Admin & University Portal

### 4.1 Admin Dashboard (`/dashboard` as super_admin)
- [ ] "System" badge, "Global Operations" subtitle
- [ ] Platform Bulletin: 5 KPI cards (Students, Placement Rate, Companies, Offers, Applications)
- [ ] KPI hover inversion animation
- [ ] Status Breakdown: proportional bar chart, color-coded legend
- [ ] Trust Leaderboard: top 5 companies with tier badges, score bars
- [ ] "View All Analytics" routes to `/dashboard/admin/stats`
- [ ] **Note: `/dashboard/admin` redirects to `/dashboard`. Bookmark `/dashboard`.**

### 4.2 University Admin Dashboard (`/dashboard` as university_admin)
- [ ] "University" badge, "Institutional Oversight" subtitle
- [ ] 7 KPI cards with trend badges
- [ ] "Needs review" animates if pending validations > 0

### 4.3 User Management (`/dashboard/admin/users`)
- [ ] Editorial header with user count
- [ ] Search by name/email works
- [ ] Role filter (student, company_admin, university_admin, super_admin)
- [ ] Pagination: "Showing X to Y of Z", prev/next disable at bounds
- [ ] Mobile (<768px): table replaced by `MobileUserCard` stack
- [ ] Actions menu: View, Set Role, Set Password, Ban/Unban, Delete
- [ ] Ban dialog with reason input, banned badge appears
- [ ] **Only perform actions as `super_admin`. Do NOT delete real demo users.**

### 4.4 User Detail (`/dashboard/admin/users/[userId]`)
- [ ] User info card: avatar, role badge, affiliation, banned status, metadata grid
- [ ] Actions panel: Impersonate, Ban/Unban, Revoke All Sessions
- [ ] Sessions table lists active sessions with revoke buttons

### 4.5 Company Validations (`/dashboard/admin/companies`)
- [ ] Status filters: pending, approved, rejected, suspended, all
- [ ] Real-time search
- [ ] Infinite scroll pagination
- [ ] Approve pending → toast + card update
- [ ] Reject pending → dialog with reason → card update
- [ ] Suspend approved → status change
- [ ] Reactivate suspended → status returns to approved
- [ ] Download verification document (if uploaded)
- [ ] Delete dialog with destructive styling

### 4.6 University Validations (`/dashboard/admin/universities`)
- [ ] Status filters, search
- [ ] Approve/Reject pending
- [ ] Edit dialog: name, abbreviation, phone, wilaya, city, address → Save
- [ ] Delete dialog
- [ ] **Do NOT edit wilaya code live (risk of NaN).**

### 4.7 Departments (`/dashboard/admin/departments`)
- [ ] Create department form (name)
- [ ] Bulk create form (paste multiple names)
- [ ] Assign head by email → card updates with head badge
- [ ] Remove head → badge disappears
- [ ] Edit department → rename, save
- [ ] Manage skills modal opens
- [ ] Delete department → card removes
- [ ] **Log in as `university_admin` to skip university selector confusion.**

### 4.8 Placement Validations (`/dashboard/admin/validations`)
- [ ] **CRITICAL: Only `university_admin` can access. `super_admin` is redirected.**
- [ ] Validation list: student, company, offer, type, skills
- [ ] Infinite scroll
- [ ] Detail page: `StudentInfoCard`, `CompanyOfferCard`, cover letter
- [ ] AI Summary Panel: click Generate → loading → bullets/checklist/inconsistencies
- [ ] **Pre-generate AI summary before demo.**
- [ ] Validation Form: start date, end date, expected period hint, amber warning if dates outside expected range
- [ ] "Validate and Generate" → loading spinner, PDF generation
- [ ] Reject → dialog with reason → confirm
- [ ] **Pick future dates to avoid amber warning. Do NOT generate PDF live unless pre-warmed.**

### 4.9 Stats (`/dashboard/admin/stats`)
- [ ] **CRITICAL: `super_admin` only.**
- [ ] 5 stat cards, applications breakdown, company trust leaderboard
- [ ] Open reports card with severity badges (critical/high/medium/low)
- [ ] Resolve report dialog: toggle status, add note, confirm

### 4.10 University Profile (`/dashboard/university/profile`)
- [ ] Editorial masthead with university name
- [ ] Profile form: name, abbreviation, phone, wilaya (1-58), city, address
- [ ] Save → spinner + persistence
- [ ] Domain manager: add domain (press Enter or click Add), list with status badge, trash to remove
- [ ] **Pre-add 2-3 domains. Only update abbreviation live.**

---

## 5. Cross-Cutting Platform Features

### 5.1 Internationalization (EN / FR / AR)
- [ ] Language switcher dropdown works on all pages
- [ ] URL changes: `/en` → `/fr` → `/ar`
- [ ] RTL layout flips: sidebar, search icon (`start-4`), filters align right
- [ ] Arabic font loads (Noto Sans Arabic), `dir="rtl"` and `lang="ar"` on `<html>`
- [ ] Mobile sheet slides from left in Arabic (`sheetSide = locale === "ar" ? "left" : "right"`)
- [ ] No raw translation keys visible in UI (especially toasts, validation errors, footer)
- [ ] **Do not rapid-fire switch languages — let each transition finish.**

### 5.2 Dark Mode
- [ ] Theme toggle animates with spring (`stiffness: 300, damping: 20`)
- [ ] Persists across navigation and refresh (no FOUC)
- [ ] All surfaces respect tokens: sidebar, cards, borders, charts, dialogs, toasts
- [ ] Admin stats charts use `chart-1` to `chart-5` tuned for Night Edition
- [ ] Mobile menu Sheet uses `bg-background/95 backdrop-blur-xl`
- [ ] **Start light, toggle once, navigate, toggle back. Max 2 toggles.**

### 5.3 Navigation & Layout
- [ ] Dashboard navbar: role-aware title, breadcrumb path (`[DASHBOARD] [ADMIN] [COMPANIES]`), user dropdown with avatar + role badge
- [ ] Sidebar collapse: 260px ↔ 80px animation, active border persists, tooltips on collapsed icons
- [ ] Mobile hamburger: opens overlay, backdrop blur, closes on outside tap or item click
- [ ] Keyboard: `Tab` shows focus rings on navbar controls
- [ ] **Skip `Ctrl+B` — conflicts with browser bookmarks.**

### 5.4 Notifications & Toasts
- [ ] Notification bell shows red badge with unread count
- [ ] Dropdown auto-calls `markAllRead` on open
- [ ] Relative time formatting ("2m", "1h", "3d")
- [ ] "Mark all as read" removes badge
- [ ] Empty state shows localized message
- [ ] Sonner toasts: success (`CircleCheckIcon`), error (`OctagonXIcon`), stacks, dark mode colors

### 5.5 Messages (`/dashboard/messages`)
- [ ] Thread list auto-selects first thread
- [ ] Conversation pane renders
- [ ] Send message → appears in thread
- [ ] Mobile: thread list full-width, conversation replaces on tap
- [ ] Mark thread read on load
- [ ] **No real-time — polling only. Pre-send messages. Do not claim real-time.**

### 5.6 AI Assistant (`/dashboard/assistant`)
- [ ] Feature flag `COMPANY_ASSISTANT` enabled
- [ ] Conversation sidebar lists threads
- [ ] Streaming response renders markdown
- [ ] Tool invocation cards appear
- [ ] Model switcher updates and persists
- [ ] **Pre-open with existing conversation. Do not create new thread live.**

### 5.7 Uploads
- [ ] Company logo: JPG/PNG/WebP, hover overlay, spinner, immediate preview
- [ ] Verification document: PDF/JPG/PNG, <10MB enforced
- [ ] Student resume: PDF only, open/delete
- [ ] Avatar upload: image, spinner, initials fallback

### 5.8 Performance & Animations
- [ ] Loading skeletons render on slow 3G: `DashboardShellSkeleton`, `AssistantPageFallback`
- [ ] `motion.div` stagger reveal on `/login`, `/discover`
- [ ] Skeletons vanish cleanly without FOUC
- [ ] No layout shift on stat cards when values change

---

## 6. CRITICAL — Do Not Demo Live

- [ ] ❌ **2FA Login** — codes expire in 30s
- [ ] ❌ **Account Deletion** — irreversible (Goodbye page is fine to show as a static slide)
- [ ] ❌ **Email Verification Loop** — relies on external email delivery
- [ ] ❌ **AI from Cold Start** — 1-10s latency; pre-generate everything
- [ ] ❌ **Real-Time Chat** — no websockets; receiver must refresh
- [ ] ❌ **Delete Company / Delete User** — destructive and irreversible
- [ ] ❌ **Ctrl+B Sidebar Toggle** — conflicts with browser bookmark bar
- [ ] ❌ **Deep UUID Breadcrumbs** — shows raw slugs like `DEPT VALIDATIONS`
- [ ] ❌ **Account Switcher** — exists as dead code, not wired into UI
- [ ] ❌ **Withdraw Application** — `window.confirm()` may appear on wrong monitor

---

## 7. Recommended Demo Flow (15-20 min)

1. [ ] **Landing Page** (EN, Light) — editorial aesthetic, stats bar, marquee
2. [ ] **Theme Toggle** — "Night Edition" reveal
3. [ ] **Switch to French** — Discover page, translated content
4. [ ] **Switch to Arabic** — RTL mirror effect (10 seconds max)
5. [ ] **Incognito → Student Login** — dashboard skeleton → loaded state
6. [ ] **Student Dashboard** — profile strength gauge, stats bar hover, applications feed
7. [ ] **CV Builder** — resume, experience, projects (pre-seeded, edit only)
8. [ ] **Explore Offers** — search keyword, apply one filter, scroll infinite list
9. [ ] **Offer Detail** — match score, save toggle, pre-existing application status
10. [ ] **Logout → Company Admin Login**
11. [ ] **Company Dashboard** — trust gauge, offers pulse, recent offers
12. [ ] **Candidates Pipeline** — drag Applied → Screening, match preview
13. [ ] **Accept Candidate** — pre-positioned in Offer stage, Accept modal
14. [ ] **AI Copilot** — show pre-generated draft or "Improve Description"
15. [ ] **Logout → University Admin Login**
16. [ ] **Placement Validations** — list, detail with pre-generated AI summary
17. [ ] **Validate Placement** — future dates, Validate (skip PDF generation unless pre-warmed)
18. [ ] **Logout → Super Admin Login**
19. [ ] **Admin Dashboard** — platform bulletin, status breakdown, trust leaderboard
20. [ ] **User Management** — search, ban/unban test account
21. [ ] **Dark Mode on Admin** — chart token consistency
22. [ ] **Closing** — mention i18n depth, dark mode polish, editorial design, accessibility focus

---

## Rescue Protocol

If something breaks during demo:
1. Say: *"Our staging environment is rate-limiting — this is secure error handling in action."*
2. Switch to a pre-warmed tab with the same page.
3. Have backup accounts ready for each role.
4. Never panic-refresh — it looks worse than a brief pause.
