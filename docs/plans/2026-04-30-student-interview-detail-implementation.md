# Student Interview Detail Page + Dashboard Widget Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dedicated student interview detail page (`/dashboard/interviews/[interviewId]`) with slot confirmation + message-based change requests, and a pending-interview widget on the student dashboard.

**Architecture:** Next.js App Router RSC page fetches via oRPC; client-side feature-folder handles slot confirmation and message sending. Reuses existing messaging system for change requests. Dashboard widget fetched server-side in parallel with other dashboard data.

**Tech Stack:** Next.js 16, React 19, TypeScript, oRPC, TanStack Query, Drizzle ORM, Tailwind CSS 4, shadcn/ui, motion, next-intl, Bun test

---

## Prerequisites

Read these files before starting:
- `src/server/services/interviews/list-for-student.ts` — pattern for joined queries
- `src/server/services/interviews/confirm.ts` — transaction + notification pattern
- `src/server/orpc/routes/interviews.ts` — existing oRPC procedures + error mapping
- `src/server/orpc/routes/messages.ts` — existing `sendByStudent` procedure
- `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/StudentInterviewsSection.tsx` — design patterns for editorial cards
- `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.ts` — TanStack Query + mutation pattern
- `src/app/[locale]/(authenticated)/dashboard/_components/DashboardContent.tsx` — dashboard data fetching pattern
- `AGENTS.md` — project conventions

---

### Task 1: Add i18n Keys (en)

**Files:**
- Modify: `src/messages/en.json`

**Step 1: Add detail page keys under `dashboard.interviews.detail`**

Insert after line 2302 (after `disabled` block, before closing `}` of `interviews`):

```json
      "detail": {
        "title": "Interview Invitation",
        "subtitle": "Review the details and pick a time that works for you.",
        "companyLabel": "Company",
        "offerLabel": "Position",
        "noteTitle": "From the company",
        "chooseSlotTitle": "Choose a time slot",
        "noSlotsAvailable": "No time slots are currently available for this interview.",
        "slotExpired": "Expired",
        "confirmButton": "Confirm this slot",
        "confirmedLabel": "Confirmed",
        "requestChangeTitle": "None of these work?",
        "requestChangeDescription": "Send a message to {companyName} to request different times.",
        "requestChangePlaceholder": "Let them know what times work better for you...",
        "requestChangeSubmit": "Send request",
        "requestChangeSuccess": "Message sent to {companyName}.",
        "backToInterviews": "Back to interviews"
      }
```

**Step 2: Add dashboard widget keys under `dashboard.student`**

Find the `student` object in `en.json` and add:

```json
      "pendingInterviewCard": {
        "title": "Interview Invitation",
        "description": "You have a pending interview invitation from {companyName} for {offerTitle}.",
        "action": "Respond now"
      }
```

---

### Task 2: Add i18n Keys (fr)

**Files:**
- Modify: `src/messages/fr.json`

**Step 1: Add detail page keys under `dashboard.interviews.detail`**

```json
      "detail": {
        "title": "Invitation a l'entretien",
        "subtitle": "Examinez les details et choisissez un creneau qui vous convient.",
        "companyLabel": "Entreprise",
        "offerLabel": "Poste",
        "noteTitle": "De l'entreprise",
        "chooseSlotTitle": "Choisissez un creneau",
        "noSlotsAvailable": "Aucun creneau disponible pour cet entretien.",
        "slotExpired": "Expire",
        "confirmButton": "Confirmer ce creneau",
        "confirmedLabel": "Confirme",
        "requestChangeTitle": "Aucun creneau ne convient?",
        "requestChangeDescription": "Envoyez un message a {companyName} pour demander d'autres creneaux.",
        "requestChangePlaceholder": "Indiquez les horaires qui vous conviennent mieux...",
        "requestChangeSubmit": "Envoyer la demande",
        "requestChangeSuccess": "Message envoye a {companyName}.",
        "backToInterviews": "Retour aux entretiens"
      }
```

**Step 2: Add dashboard widget keys under `dashboard.student`**

```json
      "pendingInterviewCard": {
        "title": "Invitation a l'entretien",
        "description": "Vous avez une invitation d'entretien en attente de {companyName} pour {offerTitle}.",
        "action": "Repondre maintenant"
      }
```

---

### Task 3: Add i18n Keys (ar)

**Files:**
- Modify: `src/messages/ar.json`

**Step 1: Add detail page keys under `dashboard.interviews.detail`**

```json
      "detail": {
        "title": "دعوة مقابلة",
        "subtitle": "راجع التفاصيل واختر وقتًا يناسبك.",
        "companyLabel": "الشركة",
        "offerLabel": "المنصب",
        "noteTitle": "من الشركة",
        "chooseSlotTitle": "اختر موعدًا",
        "noSlotsAvailable": "لا توجد مواعيد متاحة لهذه المقابلة حاليًا.",
        "slotExpired": "منتهي الصلاحية",
        "confirmButton": "تأكيد هذا الموعد",
        "confirmedLabel": "مؤكد",
        "requestChangeTitle": "لا يناسبك أي موعد؟",
        "requestChangeDescription": "أرسل رسالة إلى {companyName} لطلب مواعيد أخرى.",
        "requestChangePlaceholder": "أخبرهم بالأوقات التي تناسبك بشكل أفضل...",
        "requestChangeSubmit": "إرسال الطلب",
        "requestChangeSuccess": "تم إرسال الرسالة إلى {companyName}.",
        "backToInterviews": "العودة إلى المقابلات"
      }
```

**Step 2: Add dashboard widget keys under `dashboard.student`**

```json
      "pendingInterviewCard": {
        "title": "دعوة مقابلة",
        "description": "لديك دعوة مقابلة معلقة من {companyName} لـ {offerTitle}.",
        "action": "رد الآن"
      }
```

**Step 3: Commit**

```bash
git add src/messages/en.json src/messages/fr.json src/messages/ar.json
git commit -m "i18n: add interview detail and pending card keys"
```

---

### Task 4: Create `getInterviewById` Service

**Files:**
- Create: `src/server/services/interviews/get-by-id.ts`
- Test: `src/server/services/interviews/get-by-id.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { db } from "@/server/db"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { application } from "@/server/db/schema/applications"
import { internshipOffer } from "@/server/db/schema/internships"
import { company } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"
import { InterviewServiceError } from "@/server/services/interviews/errors"
import { getInterviewById } from "@/server/services/interviews/get-by-id"

describe("src/server/services/interviews/get-by-id", () => {
  const studentId = crypto.randomUUID()
  const otherStudentId = crypto.randomUUID()
  const companyId = crypto.randomUUID()
  const offerId = crypto.randomUUID()
  const appId = crypto.randomUUID()
  const interviewId = crypto.randomUUID()

  beforeAll(async () => {
    await db.insert(user).values([
      { id: studentId, name: "Student", email: "student@test.com" },
      { id: otherStudentId, name: "Other", email: "other@test.com" },
    ])
    await db.insert(company).values({
      id: companyId,
      name: "TestCo",
      slug: "testco",
      status: "approved",
    })
    await db.insert(internshipOffer).values({
      id: offerId,
      companyId,
      title: "Engineer",
      status: "published",
    })
    await db.insert(application).values({
      id: appId,
      offerId,
      studentUserId: studentId,
      status: "applied",
      pipelineStage: "interview",
    })
    await db.insert(interview).values({
      id: interviewId,
      applicationId: appId,
      offerId,
      companyId,
      studentUserId: studentId,
      status: "pending_confirmation",
    })
    await db.insert(interviewSlot).values({
      id: crypto.randomUUID(),
      interviewId,
      startsAt: new Date(Date.now() + 86400000),
      endsAt: new Date(Date.now() + 90000000),
      location: "Room 101",
    })
  })

  afterAll(async () => {
    await db.delete(interviewSlot).where(eq(interviewSlot.interviewId, interviewId))
    await db.delete(interview).where(eq(interview.id, interviewId))
    await db.delete(application).where(eq(application.id, appId))
    await db.delete(internshipOffer).where(eq(internshipOffer.id, offerId))
    await db.delete(company).where(eq(company.id, companyId))
    await db.delete(user).where(inArray(user.id, [studentId, otherStudentId]))
  })

  test("should return interview with slots when student owns it", async () => {
    const result = await getInterviewById(interviewId, studentId)
    expect(result.id).toBe(interviewId)
    expect(result.companyName).toBe("TestCo")
    expect(result.offerTitle).toBe("Engineer")
    expect(result.slots).toHaveLength(1)
    expect(result.slots[0].location).toBe("Room 101")
  })

  test("should throw INTERVIEW_NOT_FOUND for nonexistent interview", async () => {
    await expect(getInterviewById("nonexistent", studentId)).rejects.toThrow(InterviewServiceError)
    await expect(getInterviewById("nonexistent", studentId)).rejects.toThrow("Interview not found")
  })

  test("should throw INTERVIEW_FORBIDDEN when student does not own interview", async () => {
    await expect(getInterviewById(interviewId, otherStudentId)).rejects.toThrow(InterviewServiceError)
    await expect(getInterviewById(interviewId, otherStudentId)).rejects.toThrow("You do not have access")
  })
})
```

Run: `bun test src/server/services/interviews/get-by-id.test.ts`
Expected: FAIL (module not found)

**Step 2: Implement the service**

Create `src/server/services/interviews/get-by-id.ts`:

```typescript
import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { interview, interviewSlot } from "@/server/db/schema/interviews"
import { InterviewServiceError } from "@/server/services/interviews/errors"

export interface InterviewDetailView {
  id: string
  applicationId: string
  offerId: string
  offerTitle: string
  companyId: string
  companyName: string
  companyLogoUrl: string | null
  status: "pending_confirmation" | "confirmed" | "cancelled"
  confirmedSlotId: string | null
  confirmedAt: Date | null
  note: string | null
  createdAt: Date
  updatedAt: Date
  slots: Array<{
    id: string
    interviewId: string
    startsAt: Date
    endsAt: Date
    location: string | null
    meetingUrl: string | null
  }>
}

export async function getInterviewById(
  interviewId: string,
  studentUserId: string,
): Promise<InterviewDetailView> {
  const [interviewRow] = await db
    .select({
      id: interview.id,
      applicationId: interview.applicationId,
      offerId: interview.offerId,
      offerTitle: internshipOffer.title,
      companyId: interview.companyId,
      companyName: company.name,
      companyLogoUrl: company.logoUrl,
      status: interview.status,
      confirmedSlotId: interview.confirmedSlotId,
      confirmedAt: interview.confirmedAt,
      note: interview.note,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    })
    .from(interview)
    .innerJoin(internshipOffer, eq(interview.offerId, internshipOffer.id))
    .innerJoin(company, eq(interview.companyId, company.id))
    .where(eq(interview.id, interviewId))
    .limit(1)

  if (!interviewRow) {
    throw new InterviewServiceError("INTERVIEW_NOT_FOUND", "Interview not found")
  }

  if (interviewRow.studentUserId !== studentUserId) {
    throw new InterviewServiceError(
      "INTERVIEW_FORBIDDEN",
      "You do not have access to this interview",
    )
  }

  const slots = await db
    .select({
      id: interviewSlot.id,
      interviewId: interviewSlot.interviewId,
      startsAt: interviewSlot.startsAt,
      endsAt: interviewSlot.endsAt,
      location: interviewSlot.location,
      meetingUrl: interviewSlot.meetingUrl,
    })
    .from(interviewSlot)
    .where(eq(interviewSlot.interviewId, interviewId))
    .orderBy(asc(interviewSlot.startsAt))

  return {
    ...interviewRow,
    confirmedAt: interviewRow.confirmedAt ?? null,
    note: interviewRow.note ?? null,
    slots,
  }
}
```

**Step 3: Run tests**

Run: `bun test src/server/services/interviews/get-by-id.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/server/services/interviews/get-by-id.ts src/server/services/interviews/get-by-id.test.ts
git commit -m "feat(interviews): add getInterviewById service"
```

---

### Task 5: Add `getById` oRPC Procedure

**Files:**
- Modify: `src/server/orpc/routes/interviews.ts`
- Modify: `src/server/orpc/router.ts`
- Modify: `src/server/orpc/routes/interviews.route.test.ts`

**Step 1: Add import to interviews route**

Add to `src/server/orpc/routes/interviews.ts`:
- Import `getInterviewById`
- Add `export const getInterviewByIdProcedure`

```typescript
import { getInterviewById } from "@/server/services/interviews/get-by-id"
```

Add after `confirmInterviewSlotProcedure` (~line 199):

```typescript
export const getInterviewByIdProcedure = studentProcedureGenerous
  .input(z.object({ interviewId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    assertInterviewsEnabled()
    try {
      return await getInterviewById(input.interviewId, context.user.id)
    } catch (error) {
      if (isInterviewServiceError(error)) {
        createInterviewORPCError(error)
      }
      createServiceORPCError(error, {
        codeMap: {},
        fallbackMessage: "Failed to load interview",
      })
    }
  })
```

**Step 2: Wire into router**

In `src/server/orpc/router.ts`, add `getById` to the `interviews` object:

```typescript
  interviews: {
    listForCompany: listInterviewsForCompanyProcedure,
    listForStudent: listInterviewsForStudentProcedure,
    proposeSlots: proposeInterviewSlotsProcedure,
    confirmSlot: confirmInterviewSlotProcedure,
    getById: getInterviewByIdProcedure,
  },
```

**Step 3: Add oRPC route test**

In `src/server/orpc/routes/interviews.route.test.ts`:
- Mock `getInterviewById`
- Add describe block for `getById`

**Step 4: Run tests**

Run: `bun test src/server/orpc/routes/interviews.route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/server/orpc/routes/interviews.ts src/server/orpc/router.ts src/server/orpc/routes/interviews.route.test.ts
git commit -m "feat(orpc): add interviews.getById procedure"
```

---

### Task 6: Create Interview Detail Route Files

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/page.tsx`
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/loading.tsx`

**Step 1: Create page.tsx**

```tsx
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { InterviewDetailView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { orpcClient } from "@/server/orpc/client"

type Params = Promise<{ interviewId: string }>

async function InterviewDetailPageContent({ interviewId }: { interviewId: string }) {
  const user = await requireRole(["student"])

  if (!isFeatureEnabled("INTERVIEWS")) {
    return localeRedirect("/dashboard/applications")
  }

  try {
    const interview = await orpcClient.interviews.getById({ interviewId })
    return <InterviewDetailView interview={interview} />
  } catch {
    notFound()
  }
}

export default async function InterviewDetailPage({ params }: { params: Params }) {
  const { interviewId } = await params

  return (
    <Suspense fallback={null}>
      <InterviewDetailPageContent interviewId={interviewId} />
    </Suspense>
  )
}
```

**Step 2: Create loading.tsx**

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function InterviewDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-10 w-3/4 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/[locale]/\(authenticated\)/dashboard/interviews/\[interviewId\]/page.tsx src/app/[locale]/\(authenticated\)/dashboard/interviews/\[interviewId\]/loading.tsx
git commit -m "feat(interviews): add interview detail route"
```

---

### Task 7: Create InterviewDetailView Types

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types.ts`

```typescript
export interface InterviewDetailViewProps {
  interview: {
    id: string
    applicationId: string
    offerId: string
    offerTitle: string
    companyId: string
    companyName: string
    companyLogoUrl: string | null
    status: "pending_confirmation" | "confirmed" | "cancelled"
    confirmedSlotId: string | null
    confirmedAt: Date | string | null
    note: string | null
    createdAt: Date | string
    updatedAt: Date | string
    slots: Array<{
      id: string
      interviewId: string
      startsAt: Date | string
      endsAt: Date | string
      location: string | null
      meetingUrl: string | null
    }>
  }
}

export interface ConfirmSlotInput {
  interviewId: string
  slotId: string
}
```

---

### Task 8: Create `useInterviewDetailData` Hook

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/useInterviewDetailData.ts`

```typescript
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import type { ConfirmSlotInput } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

interface UseInterviewDetailDataParams {
  interviewId: string
}

export function useInterviewDetailData({ interviewId }: UseInterviewDetailDataParams) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null)

  const interviewQuery = useQuery(
    orpc.interviews.getById.queryOptions({ input: { interviewId } }),
  )

  const confirmSlotMutation = useMutation(
    orpc.interviews.confirmSlot.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.interviews.getById.queryOptions({ input: { interviewId } }).queryKey,
        })
        await queryClient.invalidateQueries({
          queryKey: orpc.interviews.listForStudent.queryOptions().queryKey,
        })
        toast.success(t("errors.common.interviewSlotConfirmed"))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t,
            fallbackKey: "errors.common.confirmInterviewSlotFailed",
          }),
        )
      },
    }),
  )

  const confirmSlot = async (input: ConfirmSlotInput) => {
    setConfirmingSlotId(input.slotId)
    try {
      await confirmSlotMutation.mutateAsync(input)
    } finally {
      setConfirmingSlotId(null)
    }
  }

  return {
    interview: interviewQuery.data,
    isLoading: interviewQuery.isLoading,
    errorMessage: interviewQuery.error
      ? t("errors.common.interviewsLoadFailed")
      : null,
    confirmingSlotId,
    confirmSlot,
  }
}
```

---

### Task 9: Create `useRequestChangeForm` Hook

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/useRequestChangeForm.ts`

```typescript
"use client"

import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

interface UseRequestChangeFormParams {
  offerId: string
  companyName: string
}

export function useRequestChangeForm({ offerId, companyName }: UseRequestChangeFormParams) {
  const t = useTranslations("dashboard.interviews.detail")
  const [body, setBody] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const sendMessageMutation = useMutation(
    orpc.messages.sendByStudent.mutationOptions({
      onSuccess: () => {
        setBody("")
        setIsExpanded(false)
        toast.success(t("requestChangeSuccess", { companyName }))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t,
            fallbackKey: "errors.common.sendMessageFailed",
          }),
        )
      },
    }),
  )

  const submit = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    sendMessageMutation.mutate({ offerId, body: trimmed })
  }

  return {
    body,
    setBody,
    isExpanded,
    setIsExpanded,
    isSubmitting: sendMessageMutation.isPending,
    submit,
  }
}
```

---

### Task 10: Create `InterviewHeader` Component

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/InterviewHeader.tsx`

```tsx
"use client"

import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { InterviewStatusBadge } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewStatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { InterviewDetailViewProps } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"

export function InterviewHeader({
  interview,
}: {
  interview: InterviewDetailViewProps["interview"]
}) {
  const t = useTranslations("dashboard.interviews.detail")

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            {t("title")}
          </p>
          <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] leading-tight tracking-tight text-heading">
            {interview.offerTitle}
          </h1>
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <span>{t("companyLabel")}:</span>
            <span className="font-medium text-foreground">{interview.companyName}</span>
          </div>
        </div>
        <Avatar size="lg">
          {interview.companyLogoUrl && (
            <AvatarImage src={interview.companyLogoUrl} alt={interview.companyName} />
          )}
          <AvatarFallback>
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
      <InterviewStatusBadge status={interview.status} />
    </div>
  )
}
```

---

### Task 11: Create `SlotSelector` Component

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/SlotSelector.tsx`

```tsx
"use client"

import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  LinkIcon,
  Loader2,
  MapPin,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type {
  ConfirmSlotInput,
  InterviewDetailViewProps,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"
import { Button } from "@/components/ui/button"
import { formatSchedule } from "@/lib/date"
import { cn } from "@/lib/utils"

interface SlotSelectorProps {
  interview: InterviewDetailViewProps["interview"]
  confirmingSlotId: string | null
  onConfirmSlot: (input: ConfirmSlotInput) => Promise<void>
}

export function SlotSelector({ interview, confirmingSlotId, onConfirmSlot }: SlotSelectorProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const isPending = interview.status === "pending_confirmation"

  if (interview.slots.length === 0) {
    return (
      <div className="border border-dashed border-border/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("noSlotsAvailable")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {t("chooseSlotTitle")}
      </h2>
      {interview.slots.map((slot) => {
        const isConfirmed = interview.confirmedSlotId === slot.id
        const isConfirming = confirmingSlotId === slot.id
        const isExpired = new Date(slot.endsAt) <= new Date()
        const canConfirm = isPending && !isConfirmed && !isExpired && !isConfirming

        return (
          <div
            key={slot.id}
            className={cn(
              "flex items-center justify-between gap-3 border px-4 py-3 transition-colors",
              isConfirmed
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                : isExpired
                  ? "border-border/30 bg-muted/20 opacity-60"
                  : canConfirm
                    ? "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
                    : "border-border/40",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <CalendarDays
                className={cn(
                  "h-4 w-4 shrink-0",
                  isConfirmed
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              />
              <div className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm",
                    isConfirmed ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {formatSchedule(slot.startsAt, slot.endsAt)}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-3">
                  {slot.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <MapPin className="h-3 w-3" />
                      {slot.location}
                    </span>
                  )}
                  {slot.meetingUrl && (
                    <a
                      href={slot.meetingUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {t("confirmedLabel") === "Confirmed" ? "Join" : "Rejoindre"}
                    </a>
                  )}
                  {isExpired && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-destructive">
                      {t("slotExpired")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {isConfirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("confirmedLabel")}
                </span>
              )}
              {canConfirm && (
                <Button
                  type="button"
                  variant="editorial-outline"
                  size="editorial-sm"
                  disabled={isConfirming}
                  className="gap-1.5"
                  onClick={() => void onConfirmSlot({ interviewId: interview.id, slotId: slot.id })}
                >
                  {isConfirming ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CalendarCheck2 className="h-3 w-3" />
                  )}
                  {isConfirming ? "..." : t("confirmButton")}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

---

### Task 12: Create `RequestChangeForm` Component

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/RequestChangeForm.tsx`

```tsx
"use client"

import { ChevronDown, Send } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useRequestChangeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/useRequestChangeForm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface RequestChangeFormProps {
  offerId: string
  companyName: string
}

export function RequestChangeForm({ offerId, companyName }: RequestChangeFormProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const form = useRequestChangeForm({ offerId, companyName })

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => form.setIsExpanded(!form.isExpanded)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{t("requestChangeTitle")}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", form.isExpanded && "rotate-180")}
        />
      </button>

      {form.isExpanded && (
        <motion.div {...reveal} transition={{ duration: 0.4, ease }} className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("requestChangeDescription", { companyName })}</p>
          <Textarea
            value={form.body}
            onChange={(e) => form.setBody(e.target.value)}
            placeholder={t("requestChangePlaceholder")}
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="editorial"
              size="sm"
              disabled={form.isSubmitting || !form.body.trim()}
              onClick={() => form.submit()}
              className="gap-1.5"
            >
              <Send className="h-3 w-3" />
              {t("requestChangeSubmit")}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
```

---

### Task 13: Create `BackLink` Component

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/BackLink.tsx`

```tsx
"use client"

import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export function BackLink() {
  const t = useTranslations("dashboard.interviews.detail")

  return (
    <Link
      href="/dashboard/interviews"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t("backToInterviews")}
    </Link>
  )
}
```

---

### Task 14: Create `InterviewDetailView` Orchestrator

**Files:**
- Create: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/index.tsx`

```tsx
"use client"

import { Loader2, MessageSquare } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { BackLink } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/BackLink"
import { InterviewHeader } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/components/InterviewHeader"
import { RequestChangeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewDetailView/components/RequestChangeForm"
import { SlotSelector } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewDetailView/components/SlotSelector"
import { useInterviewDetailData } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/useInterviewDetailData"
import type { InterviewDetailViewProps } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"

export function InterviewDetailView({ interview: initialInterview }: InterviewDetailViewProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const data = useInterviewDetailData({ interviewId: initialInterview.id })

  const interview = data.interview ?? initialInterview

  if (data.isLoading && !data.interview) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("loadErrorTitle")}
        </span>
      </div>
    )
  }

  if (data.errorMessage) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-2 border border-destructive/30 bg-destructive/5 p-6"
      >
        <p className="text-sm font-medium text-destructive">{t("loadErrorTitle")}</p>
        <p className="text-xs text-muted-foreground">{data.errorMessage}</p>
      </motion.div>
    )
  }

  const isPending = interview.status === "pending_confirmation"

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <motion.div {...reveal} transition={revealWithDelay(0)}>
        <BackLink />
      </motion.div>

      <motion.div {...reveal} transition={revealWithDelay(0.05)}>
        <InterviewHeader interview={interview} />
      </motion.div>

      {interview.note && (
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex items-start gap-3 border border-border/40 bg-muted/20 p-4 dark:bg-muted/10"
        >
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {t("noteTitle")}
            </p>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {interview.note}
            </p>
          </div>
        </motion.div>
      )}

      <motion.div {...reveal} transition={revealWithDelay(0.15)}>
        <SlotSelector
          interview={interview}
          confirmingSlotId={data.confirmingSlotId}
          onConfirmSlot={data.confirmSlot}
        />
      </motion.div>

      {isPending && (
        <motion.div {...reveal} transition={revealWithDelay(0.2)}>
          <RequestChangeForm offerId={interview.offerId} companyName={interview.companyName} />
        </motion.div>
      )}
    </div>
  )
}
```

**Step: Commit all InterviewDetailView files**

```bash
git add src/app/[locale]/\(authenticated\)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/
git commit -m "feat(interviews): add InterviewDetailView feature folder"
```

---

### Task 15: Link Interview List Cards to Detail Page

**Files:**
- Modify: `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/StudentInterviewsSection.tsx`

**Step 1: Wrap each `InterviewCard` in a link to the detail page**

Import `Link` from `@/i18n/routing`.

Change the `InterviewCard` wrapper from `<motion.article>` to a link wrapper around the inner content, keeping the animation:

```tsx
<Link href={`/dashboard/interviews/${interview.id}`} className="block">
  <motion.article ...>
    {/* existing card content */}
  </motion.article>
</Link>
```

**Important:** Do not wrap the Confirm button in the link — the Confirm button's `onClick` must call `event.stopPropagation()` or use a button that doesn't trigger navigation.

Alternative: Make the card body a link, but keep the Confirm button as a separate clickable element.

Simpler approach: Wrap only non-interactive parts (header, note, slot list without confirm button) in the link. Or add a "View details" text link at the top-right of each card.

Recommended minimal change: Add a small "View details" link next to the status badge in `InterviewCard`.

**Step 2: Run lint + typecheck**

```bash
bun run lint
bun run typecheck
```

**Step 3: Commit**

```bash
git add src/app/[locale]/\(authenticated\)/dashboard/interviews/_components/InterviewsView/components/StudentInterviewsSection.tsx
git commit -m "feat(interviews): link interview cards to detail page"
```

---

### Task 16: Add Dashboard Pending Interview Widget

**Files:**
- Create: `src/app/[locale]/(authenticated)/_components/StudentDashboard/components/PendingInterviewCard.tsx`
- Modify: `src/app/[locale]/(authenticated)/_components/StudentDashboard/types.ts`
- Modify: `src/app/[locale]/(authenticated)/_components/StudentDashboard/index.tsx`
- Modify: `src/app/[locale]/(authenticated)/dashboard/_components/DashboardContent.tsx`

**Step 1: Update types**

Add to `StudentDashboardData` in `types.ts`:

```typescript
export interface PendingInterview {
  id: string
  offerTitle: string
  companyName: string
  companyLogoUrl: string | null
}
```

And add `pendingInterview: PendingInterview | null` to `StudentDashboardData`.

**Step 2: Fetch pending interview in DashboardContent**

In `DashboardContent.tsx`'s `StudentDashboardContent`, add to the parallel fetch:

```typescript
import { listInterviewsForStudent } from "@/server/services/interviews/list-for-student"

// In the Promise.all block:
const [pendingInterviews] = await Promise.all([
  // ...existing fetches...
  listInterviewsForStudent(user.id, { status: "pending_confirmation", limit: 1 }),
])

// In studentData:
pendingInterview: pendingInterviews.length > 0
  ? {
      id: pendingInterviews[0].id,
      offerTitle: pendingInterviews[0].offerTitle,
      companyName: pendingInterviews[0].companyName,
      companyLogoUrl: pendingInterviews[0].companyLogoUrl,
    }
  : null,
```

**Step 3: Create PendingInterviewCard**

```tsx
"use client"

import { Building2, Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { PendingInterview } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import * as motion from "motion/react-client"
import { reveal, revealWithDelay } from "@/lib/animations"

interface PendingInterviewCardProps {
  interview: PendingInterview
}

export function PendingInterviewCard({ interview }: PendingInterviewCardProps) {
  const t = useTranslations("dashboard.student.pendingInterviewCard")

  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(0.05)}
      className="border border-amber-500/20 bg-amber-500/[0.03] p-5 dark:bg-amber-500/[0.04]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500/10">
          <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
            {t("title")}
          </p>
          <p className="text-sm text-foreground">
            {t("description", {
              companyName: interview.companyName,
              offerTitle: interview.offerTitle,
            })}
          </p>
          <Link
            href={`/dashboard/interviews/${interview.id}`}
            className="inline-block text-xs font-medium text-primary hover:underline"
          >
            {t("action")} →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
```

**Step 4: Add to StudentDashboard**

In `StudentDashboard/index.tsx`, add `PendingInterviewCard` above `ApplicationsFeed` when `data.pendingInterview` exists:

```tsx
{data.pendingInterview && (
  <PendingInterviewCard interview={data.pendingInterview} />
)}
```

**Step 5: Update stats** (Optional — `interviewsCount` already exists in stats)

**Step 6: Run lint + typecheck**

```bash
bun run lint
bun run typecheck
```

**Step 7: Commit**

```bash
git add src/app/[locale]/\(authenticated\)/_components/StudentDashboard/
src/app/[locale]/\(authenticated\)/dashboard/_components/DashboardContent.tsx
git commit -m "feat(dashboard): add pending interview widget to student dashboard"
```

---

### Task 17: Final Verification

**Step 1: Run full test suite**

```bash
bun test
```
Expected: All tests pass (including new `get-by-id.test.ts` and `interviews.route.test.ts` additions)

**Step 2: Run full checks**

```bash
bun run check:all
```
Expected: No lint or type errors

**Step 3: Verify RTL logical properties**

Ensure no `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left`, `right`, `text-left`, `text-right` are used in new files.

**Step 4: Commit any fixes**

```bash
git commit -m "fix: address lint and typecheck issues"
```

---

## Summary of New Files

| File | Description |
|------|-------------|
| `src/server/services/interviews/get-by-id.ts` | Get single interview with slots |
| `src/server/services/interviews/get-by-id.test.ts` | Service tests |
| `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/page.tsx` | Detail page RSC |
| `src/app/[locale]/(authenticated)/dashboard/interviews/[interviewId]/loading.tsx` | Loading skeleton |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/` | Feature folder with types, hooks, components |
| `src/app/[locale]/(authenticated)/_components/StudentDashboard/components/PendingInterviewCard.tsx` | Dashboard widget |

## Modified Files

| File | Change |
|------|--------|
| `src/server/orpc/routes/interviews.ts` | Add `getById` procedure |
| `src/server/orpc/router.ts` | Wire `getById` |
| `src/server/orpc/routes/interviews.route.test.ts` | Add `getById` tests |
| `src/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/StudentInterviewsSection.tsx` | Link to detail page |
| `src/app/[locale]/(authenticated)/_components/StudentDashboard/index.tsx` | Add widget |
| `src/app/[locale]/(authenticated)/_components/StudentDashboard/types.ts` | Add pendingInterview |
| `src/app/[locale]/(authenticated)/dashboard/_components/DashboardContent.tsx` | Fetch pending interview |
| `src/messages/en.json`, `fr.json`, `ar.json` | i18n keys |
