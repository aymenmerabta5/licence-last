# Inline Pipeline Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow companies to schedule interviews and reject candidates directly from the pipeline Kanban, keeping pipeline stages and interview records in sync.

**Architecture:** Add an "Interview" modal (reusing the slot editor) and a "Refuse" dialog to every candidate card while `status === "applied"`. Interview proposals atomically create slots and move the card to the Interview column. Refusal is available from any stage. Slot metadata appears on Interview-stage cards. The separate `/dashboard/interviews` "Schedule" tab is removed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, oRPC, Drizzle ORM, Bun test runner.

---

## Task 1: Server — Block Direct Interview Stage Without Existing Interview

**Files:**
- Modify: `src/server/services/applications/pipeline.ts`
- Test: `src/server/services/applications/pipeline.update.test.ts`

**Step 1: Read the current server check in pipeline.ts**

Current code at lines 122-127 blocks `accepted` and `rejected`. We add a block for `interview` when no interview exists.

**Step 2: Add query for existing interview in `updateApplicationPipelineStage`**

Insert after the ownership check (line 113) and before the terminal stage check:

```typescript
import { interview } from "@/server/db/schema/interviews"
```

Then inside `updateApplicationPipelineStage`, after line 113:

```typescript
  if (input.toStage === "interview") {
    const [existingInterview] = await db
      .select({ id: interview.id })
      .from(interview)
      .where(eq(interview.applicationId, input.applicationId))
      .limit(1)

    if (!existingInterview) {
      throw new ApplicationServiceError(
        "APPLICATION_INVALID_STATE",
        "Schedule interview slots first before moving to interview stage",
      )
    }
  }
```

**Step 3: Update test — add failing test for interview stage without slots**

In `pipeline.update.test.ts`, add after the "rejects terminal pipeline targets" test:

```typescript
  test("rejects interview stage when no interview exists", async () => {
    queueApplicationRow({ pipelineStage: "screening" })

    // Mock no interview found
    const emptySelectMock = mock(async () => [])
    mock.module("@/server/db/schema/interviews", () => ({
      interview: {},
    }))

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-1",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "interview",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_INVALID_STATE",
      message: "Schedule interview slots first before moving to interview stage",
    })
  })
```

**Step 4: Run test to verify it fails**

Run: `bun test src/server/services/applications/pipeline.update.test.ts`

Expected: FAIL with the new test failing because the check doesn't exist yet.

**Step 5: Implement the server check and run tests again**

Run: `bun test src/server/services/applications/pipeline.update.test.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add src/server/services/applications/pipeline.ts src/server/services/applications/pipeline.update.test.ts
git commit -m "feat(server): require existing interview before moving to interview stage"
```

---

## Task 2: Server — Add Interview Preview to List-By-Offer Response

**Files:**
- Modify: `src/server/services/applications/list-by-offer.ts`
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types.ts`

**Step 1: Add interview fields to `ApplicationWithStudent`**

In `list-by-offer.ts`, add to the interface:

```typescript
  interviewPreview: {
    id: string
    status: string
    nextSlotStartsAt: Date | null
    nextSlotEndsAt: Date | null
    slotCount: number
  } | null
```

**Step 2: Query interview + slot data when listing applications**

After the main application query (around line 193), add:

```typescript
  const applicationIds = applications.map((a) => a.id)

  const interviewsByApp =
    applicationIds.length > 0
      ? await db
          .select({
            applicationId: interview.applicationId,
            interviewId: interview.id,
            interviewStatus: interview.status,
            slotStartsAt: interviewSlot.startsAt,
            slotEndsAt: interviewSlot.endsAt,
          })
          .from(interview)
          .leftJoin(interviewSlot, eq(interviewSlot.interviewId, interview.id))
          .where(inArray(interview.applicationId, applicationIds))
          .orderBy(asc(interviewSlot.startsAt))
      : []
```

Import `interview`, `interviewSlot` from `@/server/db/schema/interviews` and `asc` from `drizzle-orm`.

**Step 3: Aggregate interview data per application**

After the query:

```typescript
  const interviewAgg = new Map<
    string,
    {
      id: string
      status: string
      nextSlotStartsAt: Date | null
      nextSlotEndsAt: Date | null
      slotCount: number
    }
  >()

  for (const row of interviewsByApp) {
    const existing = interviewAgg.get(row.applicationId)
    if (!existing) {
      interviewAgg.set(row.applicationId, {
        id: row.interviewId,
        status: row.interviewStatus,
        nextSlotStartsAt: row.slotStartsAt,
        nextSlotEndsAt: row.slotEndsAt,
        slotCount: row.slotStartsAt ? 1 : 0,
      })
    } else {
      existing.slotCount += row.slotStartsAt ? 1 : 0
    }
  }
```

**Step 4: Attach `interviewPreview` to each result object**

In the `result.map`, add:

```typescript
      interviewPreview: interviewAgg.get(app.id) ?? null,
```

**Step 5: Update `CandidateApp` type**

In `types.ts`, add:

```typescript
  interviewPreview: {
    id: string
    status: string
    nextSlotStartsAt: string | Date | null
    nextSlotEndsAt: string | Date | null
    slotCount: number
  } | null
```

**Step 6: Run typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 7: Commit**

```bash
git add src/server/services/applications/list-by-offer.ts src/app/.../CandidatesView/types.ts
git commit -m "feat(server): include interview preview in list-by-offer response"
```

---

## Task 3: Component — Create InterviewProposalModal

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/InterviewProposalModal.tsx`
- Reuse: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanySlotsEditor.tsx`

**Step 1: Inspect `CompanySlotsEditor` to understand its props**

Read the file. It takes:
- `slots: ProposedSlotDraft[]`
- `onSlotChange: (slotId, field, value) => void`
- `onAddSlot: () => void`
- `onRemoveSlot: (slotId) => void`

Props type is in `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types.ts`.

**Step 2: Write the modal component**

```tsx
"use client"

import { CalendarPlus, Loader2, Send, X } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { CompanySlotsEditor } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanySlotsEditor"
import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { normalizeLocalDateTimeInput } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.helpers"

interface InterviewProposalModalProps {
  applicationId: string
  studentName: string
  offerTitle: string
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: {
    applicationId: string
    note?: string
    slots: Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }>
  }) => Promise<void>
}

function createEmptySlot(): ProposedSlotDraft {
  return {
    id: crypto.randomUUID(),
    startsAt: "",
    endsAt: "",
    location: "",
    meetingUrl: "",
  }
}

export function InterviewProposalModal({
  applicationId,
  studentName,
  offerTitle,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: InterviewProposalModalProps) {
  const t = useTranslations("dashboard.company.candidates")
  const [slots, setSlots] = useState<ProposedSlotDraft[]>([createEmptySlot()])
  const [note, setNote] = useState("")

  if (!isOpen) return null

  const handleSlotChange = (
    slotId: string,
    field: keyof ProposedSlotDraft,
    value: string,
  ) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, [field]: value } : slot,
      ),
    )
  }

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, createEmptySlot()])
  }

  const handleRemoveSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== slotId))
  }

  const handleSubmit = async () => {
    const cleanedSlots = slots
      .map((slot) => ({
        startsAt: slot.startsAt.trim(),
        endsAt: slot.endsAt.trim(),
        location: slot.location.trim(),
        meetingUrl: slot.meetingUrl.trim(),
      }))
      .filter((slot) => slot.startsAt && slot.endsAt)

    if (cleanedSlots.length === 0) {
      // validation handled by parent toast or error
      return
    }

    const normalizedSlots = cleanedSlots
      .map((slot) => {
        const startsAt = normalizeLocalDateTimeInput(slot.startsAt)
        const endsAt = normalizeLocalDateTimeInput(slot.endsAt)
        if (!startsAt || !endsAt) return null
        return {
          startsAt,
          endsAt,
          location: slot.location || undefined,
          meetingUrl: slot.meetingUrl || undefined,
        }
      })
      .filter(Boolean) as Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }>

    if (normalizedSlots.length === 0) return

    await onSubmit({
      applicationId,
      note: note.trim() || undefined,
      slots: normalizedSlots,
    })

    // Reset on success
    setSlots([createEmptySlot()])
    setNote("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.3, ease }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-primary/30 bg-primary/10">
              <CalendarPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-heading">
                {t("interviewModal.title")}
              </h2>
              <p className="text-xs font-light text-muted-foreground">
                {studentName} — {offerTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-heading"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <CompanySlotsEditor
            slots={slots}
            onSlotChange={handleSlotChange}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
          />

          <div className="h-px bg-border/50" />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("interviewModal.note")}
            </label>
            <Textarea
              value={note}
              maxLength={1000}
              placeholder={t("interviewModal.notePlaceholder")}
              className="min-h-[80px] resize-y"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("interviewModal.cancel")}
            </Button>
            <Button
              variant="editorial"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {t("interviewModal.submit")}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

**Step 3: Add translation keys**

In all three locale files (`src/messages/en.json`, `fr.json`, `ar.json`), under `dashboard.company.candidates`, add:

```json
    "interviewModal": {
      "title": "Propose Interview",
      "note": "Note for candidate",
      "notePlaceholder": "Add context about the interview...",
      "cancel": "Cancel",
      "submit": "Send Proposal"
    }
```

**Step 4: Run typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/.../InterviewProposalModal.tsx src/messages/en.json src/messages/fr.json src/messages/ar.json
git commit -m "feat: add InterviewProposalModal for inline interview scheduling"
```

---

## Task 4: Component — Add Slot Preview to CandidateCard

**Files:**
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCard.tsx`
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCardActions.tsx`

**Step 1: Render slot preview when in interview stage**

In `CandidateCard.tsx`, before the `isExpanded` block (around line 145), add a small slot preview block:

```tsx
      {app.pipelineStage === "interview" && app.interviewPreview && (
        <div className="rounded-sm border border-violet-500/20 bg-violet-500/[0.03] p-2.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-violet-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              {app.interviewPreview.status === "pending_confirmation"
                ? t("interviewPending")
                : t("interviewConfirmed")}
            </span>
          </div>
          {app.interviewPreview.nextSlotStartsAt && (
            <p className="text-[10px] text-muted-foreground">
              {formatSchedule(
                app.interviewPreview.nextSlotStartsAt,
                app.interviewPreview.nextSlotEndsAt ?? app.interviewPreview.nextSlotStartsAt,
              )}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/60">
            {t("slotCount", { count: app.interviewPreview.slotCount })}
          </p>
        </div>
      )}
```

Import `Calendar` from `lucide-react` and `formatSchedule` from `@/lib/date`.

Add translation keys:
- `interviewPending`: "Pending Confirmation"
- `interviewConfirmed`: "Confirmed"
- `slotCount_one`: "1 slot proposed"
- `slotCount_other": "{{count}} slots proposed"

**Step 2: Update `CandidateCardActions` to show Interview button and make Refuse available from any stage**

Replace the existing conditional rendering in `CandidateCardActions.tsx`:

Current (lines 59-85):
```tsx
{app.status === "applied" && app.pipelineStage === "offer" ? (
```

New logic:
```tsx
{app.status === "applied" && (
  <div className="flex flex-col gap-2">
    {(app.pipelineStage === "applied" || app.pipelineStage === "screening") && (
      <Button
        size="sm"
        variant="outline"
        className="h-7 gap-1.5 border-violet-500/30 text-[10px] font-bold uppercase tracking-wider text-violet-600 hover:bg-violet-500/5 hover:text-violet-700"
        onClick={onInterview}
      >
        <CalendarPlus className="h-3 w-3" />
        {t("interview")}
      </Button>
    )}

    {app.pipelineStage === "offer" && (
      <Button
        size="sm"
        className="h-7 flex-1 gap-1.5 bg-emerald-600 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700"
        onClick={onAccept}
        disabled={actionLoading === app.id}
      >
        {actionLoading === app.id ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        {t("accept")}
      </Button>
    )}

    <Button
      variant="outline"
      size="sm"
      className="h-7 flex-1 gap-1.5 border-destructive/20 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/5"
      onClick={onRefuse}
    >
      <X className="h-3 w-3" />
      {t("refuse")}
    </Button>
  </div>
)}
```

Update the component interface to add `onInterview`:

```typescript
interface CandidateCardActionsProps {
  app: CandidateApp
  actionLoading: string | null
  isStagePending: boolean
  onAccept: () => void
  onRefuse: () => void
  onInterview: () => void
  onStageChange: (toStage: PipelineStage) => void
  onViewTimeline: () => void
}
```

Import `CalendarPlus` from `lucide-react`.

**Step 3: Update `CandidateCard` props to pass `onInterview`**

Add `onInterview` to `CandidateCardProps` and pass it down to `CandidateCardActions`.

**Step 4: Run typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/.../CandidateCard.tsx src/app/.../CandidateCardActions.tsx src/messages/*.json
git commit -m "feat: add Interview button, Refuse everywhere, slot preview on cards"
```

---

## Task 5: Hook — Wire Interview Proposal Mutation Into useCandidates

**Files:**
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/hooks/useCandidates.ts`

**Step 1: Add state for interview modal**

Add after `refuseModal` state (around line 41):

```typescript
  const [interviewModal, setInterviewModal] = useState<{
    applicationId: string
    studentName: string
    offerTitle: string
  } | null>(null)
  const [isProposingInterview, setIsProposingInterview] = useState(false)
```

**Step 2: Add interview proposal mutation**

After `refuseMutation`:

```typescript
  const proposeSlotsMutation = useMutation(
    orpc.interviews.proposeSlots.mutationOptions(),
  )
```

**Step 3: Add `handleProposeInterview` function**

After `handleRefuse`:

```typescript
  const handleProposeInterview = async (payload: {
    applicationId: string
    note?: string
    slots: Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }>
  }) => {
    setIsProposingInterview(true)
    setActionLoading(payload.applicationId)
    try {
      // 1. Create interview slots
      await proposeSlotsMutation.mutateAsync({
        applicationId: payload.applicationId,
        slots: payload.slots,
        note: payload.note,
      })

      // 2. Move to interview stage
      await orpcClient.applications.updatePipelineStage({
        applicationId: payload.applicationId,
        toStage: "interview",
      })

      await queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
      await refreshTimelineForApplication(payload.applicationId)
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
      queryClient.invalidateQueries({
        queryKey: orpc.interviews.listForCompany.queryOptions().queryKey,
      })

      setInterviewModal(null)
      toast.success(t("interviewProposeSuccess"))
    } catch {
      toast.error(t("interviewProposeError"))
    } finally {
      setIsProposingInterview(false)
      setActionLoading(null)
    }
  }
```

**Step 4: Expose new state and handlers in return object**

Add to the return:

```typescript
    interviewModal,
    setInterviewModal,
    isProposingInterview,
    handleProposeInterview,
```

**Step 5: Run typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 6: Commit**

```bash
git add src/app/.../useCandidates.ts
git commit -m "feat: wire proposeInterview mutation into useCandidates hook"
```

---

## Task 6: Orchestrator — Wire Modal Into CandidatesView

**Files:**
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/index.tsx`
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/PipelineGrid.tsx`
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/PipelineStageColumn.tsx`

**Step 1: Update `CandidatesView` to destructure new hook values**

```typescript
  const {
    // ... existing
    interviewModal,
    setInterviewModal,
    isProposingInterview,
    handleProposeInterview,
  } = useCandidates(offerId)
```

**Step 2: Add `InterviewProposalModal` to the JSX**

After `<CandidatesDialogs>`:

```tsx
      <InterviewProposalModal
        applicationId={interviewModal?.applicationId ?? ""}
        studentName={interviewModal?.studentName ?? ""}
        offerTitle={interviewModal?.offerTitle ?? ""}
        isOpen={!!interviewModal}
        isSubmitting={isProposingInterview}
        onClose={() => setInterviewModal(null)}
        onSubmit={handleProposeInterview}
      />
```

**Step 3: Pass `onInterview` through `PipelineGrid` and `PipelineStageColumn`**

Add `onInterview` prop to both components and to `CandidateCard` inside `PipelineStageColumn`.

In `PipelineGrid`:
```tsx
interface PipelineGridProps {
  // ... existing
  onInterview: (app: CandidateApp) => void
}
```

Pass down to every `PipelineStageColumn`.

In `PipelineStageColumn`, pass to every `CandidateCard`:
```tsx
onInterview={() => onInterview(app)}
```

In `CandidatesView`, add handler:
```tsx
        onInterview={(app) =>
          setInterviewModal({
            applicationId: app.id,
            studentName: app.student.name || "Student",
            offerTitle: offer?.title || "",
          })
        }
```

**Step 4: Run typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/.../CandidatesView/index.tsx src/app/.../PipelineGrid.tsx src/app/.../PipelineStageColumn.tsx
git commit -m "feat: wire InterviewProposalModal through pipeline grid"
```

---

## Task 7: Remove "Schedule" Tab From `/dashboard/interviews`

**Files:**
- Modify: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/index.tsx`
- Modify: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.ts`

**Step 1: Remove Schedule tab and CompanyProposeForm from `InterviewsView/index.tsx`**

Current code has a `Tabs` with "schedule" and "all" (or similar). Remove the "schedule" tab entirely.

Delete:
- `CompanyProposeForm` import
- `state` and `dispatch` for slot editing
- The Schedule `TabsContent`

Keep only the "All Interviews" view.

**Step 2: Remove slot-editing state and proposeSlots from `useInterviewsData.ts`**

Delete:
- `proposeSlots` function
- `proposeSlotsMutation`
- `isSubmittingProposal`

Keep:
- `companyInterviewsQuery`
- `studentInterviewsQuery`
- `confirmSlot`

**Step 3: Run typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 4: Commit**

```bash
git add src/app/.../InterviewsView/index.tsx src/app/.../useInterviewsData.ts
git commit -m "feat: remove Schedule tab from interviews page"
```

---

## Task 8: Update Stage Dropdown Disable Logic

**Files:**
- Modify: `src/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/CandidateCardActions.tsx`

**Step 1: Disable "interview" option when no existing interview**

In the `SelectField` options mapping, for the `interview` option specifically:

```tsx
options={STAGE_COLUMNS.map((option) => ({
  value: option,
  label: STAGE_LABELS[option],
  disabled:
    option !== app.pipelineStage &&
    (!canTransitionStage(app.pipelineStage, option) ||
      (option === "interview" && !app.interviewPreview)),
}))}
```

This is a UX hint — the server still enforces the rule.

**Step 2: Commit**

```bash
git add src/app/.../CandidateCardActions.tsx
git commit -m "feat: disable interview stage dropdown when no interview exists"
```

---

## Task 9: Tests — Update Existing Candidate Flow Tests

**Files:**
- Test coverage: any existing component tests for `CandidateCardActions`, `useCandidates`

**Step 1: Update `CandidateCardActions` tests if they exist**

Check for: `src/app/.../CandidateCardActions.test.tsx`

If it exists, add tests for:
- "shows Interview button when stage is applied"
- "shows Interview button when stage is screening"
- "shows Refuse button when stage is interview"
- "hides Accept button when stage is not offer"

**Step 2: Update `useCandidates` tests if they exist**

Check for: `src/app/.../useCandidates.test.ts`

Add tests for:
- "handleProposeInterview calls proposeSlots then updatePipelineStage"
- "handleProposeInterview invalidates interview list query"

**Step 3: Run all related tests**

Run: `bun test src/app/.../CandidateCardActions.test.tsx src/app/.../useCandidates.test.ts`

Expected: PASS

**Step 4: Commit**

```bash
git add src/app/.../CandidateCardActions.test.tsx src/app/.../useCandidates.test.ts
git commit -m "test: update candidate action tests for inline interview and refuse"
```

---

## Task 10: Final Verification

**Step 1: Run full typecheck**

Run: `bun run typecheck`

Expected: PASS

**Step 2: Run full lint**

Run: `bun run lint`

Expected: PASS

**Step 3: Run server-side tests**

Run: `bun test src/server/services/applications/pipeline.update.test.ts`

Expected: PASS

**Step 4: Manual check**

Open `/dashboard/company/offers/[offerId]/candidates` and verify:
- [ ] Applied cards show Interview + Refuse buttons
- [ ] Screening cards show Interview + Refuse buttons
- [ ] Interview cards show Refuse button + slot preview
- [ ] Offer cards show Accept + Refuse buttons
- [ ] Clicking Interview opens modal with pre-filled candidate name
- [ ] Submitting modal creates slots and moves card to Interview column
- [ ] Clicking Refuse from any stage opens note dialog and moves card to Rejected
- [ ] Student receives notifications for each action

**Step 5: Commit any final fixes**

```bash
git commit -m "fix: final adjustments after manual verification"
```

---

## Rollback Plan

If anything breaks in production:
1. The server change in Task 1 is safe to keep — it only adds validation, doesn't remove existing behavior.
2. The removed "Schedule" tab can be restored by reverting Tasks 7.
3. The new Interview button can be hidden by reverting Tasks 4 and 6.

## Future Enhancements (Out of Scope)

- Interview reschedule / cancellation from the pipeline card
- Bulk interview proposals (select multiple candidates)
- Interview feedback notes after confirmation
