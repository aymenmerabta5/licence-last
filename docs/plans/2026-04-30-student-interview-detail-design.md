# Student Interview Detail Page + Dashboard Widget

## Overview

Add a dedicated interview detail page for students to view and act on a single interview invitation. Also surface pending interview invitations on the main student dashboard.

## Context

- Companies propose interview slots via `/dashboard/interviews`.
- Students currently see all interviews in a list card at `/dashboard/interviews`.
- There is no single-interview detail view and no "request different times" workflow.
- Interview statuses: `pending_confirmation`, `confirmed`, `cancelled`.
- Messaging system exists (threaded by `offerId`) and is reused for change requests.

## Goals

1. Let students view one interview invitation in a focused, editorial layout.
2. Let students confirm a time slot from that focused view.
3. Let students request alternative times by sending a message to the company.
4. Surface pending interview invitations on the student dashboard.

## Non-Goals

- New notification types.
- New database schema.
- Company-facing reschedule UI.
- Interview rejection / decline action (out of scope).

## Backend Changes

### New Service: `getInterviewById`

- **File:** `src/server/services/interviews/get-by-id.ts`
- **Input:** `interviewId: string`, `studentUserId: string`
- **Returns:** Interview row joined with `internshipOffer.title`, `company.name`, `company.logoUrl`, plus all ordered `interviewSlot` rows.
- **Validation:** Interview exists and `studentUserId === interview.studentUserId`.
- **Errors:** `INTERVIEW_NOT_FOUND`, `INTERVIEW_FORBIDDEN`.

### New oRPC Procedure: `interviews.getById`

- **File:** `src/server/orpc/routes/interviews.ts`
- **Auth:** `studentProcedureGenerous`
- **Input:** `z.object({ interviewId: z.string().min(1) })`
- **Handler:** Calls `getInterviewById`, maps errors via existing `createInterviewORPCError`.

## Frontend: Route

### `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/page.tsx`

- Async Server Component.
- Receives `params: Promise<{ interviewId: string }>`.
- Fetches interview via oRPC (called directly from RSC, not query).
- If interview not found or forbidden → `notFound()`.
- Renders `<InterviewDetailView interview={data} />`.

### `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/loading.tsx`

- Skeleton matching the editorial header + slot card layout.

## Frontend: InterviewDetailView Feature Folder

```
src/app/[locale]/(authenticated)/dashboard/interviews/_components/
  InterviewsView/
    components/
      InterviewDetailView/               # NEW
        index.tsx                        # Orchestrator (~100 lines, no queries)
        types.ts                         # Props + form types
        hooks/
          useInterviewDetailData.ts      # useQuery(getById) + confirmSlot mutation
          useRequestChangeForm.ts        # Form state + send message mutation
        components/
          InterviewHeader.tsx            # Company avatar, offer title, status badge
          SlotSelector.tsx               # Proposed slots with confirm buttons
          ConfirmedSlotCard.tsx          # Highlighted confirmed slot
          RequestChangeForm.tsx          # Textarea + submit button
          BackLink.tsx                   # Link back to /dashboard/interviews
```

### Design Details

- **Editorial aesthetic** matching existing `StudentInterviewsSection`.
- **Header:** Serif title for offer name, company name + logo, `InterviewStatusBadge`.
- **Note callout:** If company left a note, shown in styled blockquote-like card.
- **Slot list:**
  - Pending slots: Cards with radio-like selection, Confirm button.
  - Expired slots: Muted, non-interactive.
  - Confirmed slot: Emerald border, checkmark label.
- **"Request different times":** Collapsible section below slots. Textarea with placeholder, Submit button. On success, toast and clear.
- **Back link to interviews list** at top.

## "Request Different Times" Flow

1. Student expands the collapsible section.
2. Writes message explaining what doesn't work.
3. Submits → `orpc.messages.sendByStudent.mutate({ offerId, body })`.
4. On success: `toast.success(t("detail.requestChangeSuccess", { companyName }))`.
5. Company members receive existing `new_message` notification.

## Dashboard Widget: Pending Interview Card

On the main `/dashboard` student view, add a card showing pending interview invitations:

- **If pending interviews exist:** Show company logo, offer title, "You have {count} pending interview invitation(s)", CTA linking to `/dashboard/interviews/{mostRecentId}` (or list if more than one).
- **If none:** Hide the section entirely.

**Implementation:**
- Add `listInterviewsForStudent(user.id, { status: "pending_confirmation", limit: 1 })` to `DashboardContent`'s `StudentDashboardContent` parallel fetch.
- Pass `pendingInterview` to `StudentDashboard` component.
- New component: `PendingInterviewCard` in `StudentDashboard/components/`.

## i18n Keys

Add under `dashboard.interviews.detail`:

- `title`
- `subtitle`
- `companyLabel`
- `offerLabel`
- `noteTitle`
- `chooseSlotTitle`
- `noSlotsAvailable`
- `slotExpired`
- `confirmButton`
- `confirmedLabel`
- `requestChangeTitle`
- `requestChangeDescription`
- `requestChangePlaceholder`
- `requestChangeSubmit`
- `requestChangeSuccess`
- `backToInterviews`
- `loadErrorTitle`

Add under `dashboard.student`:

- `pendingInterviewCard.title`
- `pendingInterviewCard.description`
- `pendingInterviewCard.action`

## Testing

- **Service test:** `get-by-id.test.ts` — ownership check, slot ordering, 404.
- **oRPC test:** Add `getById` to `interviews.route.test.ts`.
- **Component test:** `InterviewDetailView` rendering with mocked mutations.

## Files Changed

| File | Action |
|------|--------|
| `src/server/services/interviews/get-by-id.ts` | Create |
| `src/server/services/interviews/get-by-id.test.ts` | Create |
| `src/server/orpc/routes/interviews.ts` | Add `getById` procedure |
| `src/server/orpc/routes/interviews.route.test.ts` | Add tests for `getById` |
| `src/server/orpc/router.ts` | Wire `getById` into router |
| `src/lib/schemas/enums.ts` or validation schemas | No change needed |
| `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/page.tsx` | Create |
| `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/loading.tsx` | Create |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/` | Create feature folder |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/index.tsx` | Create |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types.ts` | Create |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/*` | Create |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/*` | Create |
| `src/app/[locale]/(authenticated)/_components/StudentDashboard/components/PendingInterviewCard.tsx` | Create |
| `src/app/[locale]/(authenticated)/_components/StudentDashboard/index.tsx` | Add widget |
| `src/app/[locale]/(authenticated)/_components/StudentDashboard/types.ts` | Add pendingInterview type |
| `src/app/[locale]/(authenticated)/dashboard/_components/DashboardContent.tsx` | Fetch pending interviews |
| `src/messages/en.json` | Add i18n keys |
| `src/messages/fr.json` | Add i18n keys |
| `src/messages/ar.json` | Add i18n keys |

## Open Questions

None. Design approved by user.
