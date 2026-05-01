# Design: Inline Pipeline Actions for Candidate Management

## Problem Statement

The candidate pipeline (`/dashboard/company/offers/[offerId]/candidates`) and the interview scheduling page (`/dashboard/interviews`) are completely disconnected. Moving a candidate to the "Interview" pipeline stage does not create an actual interview record. Conversely, an interview can be proposed while the candidate is still in the `applied` stage.

This causes:
- Confusion for recruiters (stage says Interview, but no slots exist)
- Confusion for students (applications board shows labels, interviews board shows real data)
- Poor UX: recruiters must re-select candidates in a separate page to schedule interviews
- Terminal actions (Accept/Reject) are hidden until `offer` stage, forcing artificial linearity

## Goals

1. Make the pipeline the single source of truth for candidate evaluation
2. Ensure `pipelineStage = "interview"` is always backed by real interview slots
3. Allow rejection from any stage (not just `offer`)
4. Eliminate re-selecting candidates for interviews
5. Keep student notifications in sync with every meaningful change

## Design

### 1. Pipeline Card Actions by Stage

Each candidate card shows contextual actions based on `status === "applied"` and current `pipelineStage`.

| Stage | Actions Available |
|-------|------------------|
| `applied` | Stage dropdown, **Interview** button (opens slot modal), **Refuse** button |
| `screening` | Stage dropdown, **Interview** button, **Refuse** button |
| `interview` | Stage dropdown (backward only), **Refuse** button |
| `offer` | Stage dropdown (backward only), **Accept** button, **Refuse** button |
| `accepted` / `rejected` | Read-only |

- **Interview button** is visible in `applied` and `screening` because a recruiter may skip straight to interview.
- **Refuse button** is visible at every stage while `status === "applied"`.
- **Accept button** remains gated to `offer` stage to preserve intentional workflow.

### 2. Interview Proposal Modal

Clicking **Interview** on a card opens a modal overlaying the pipeline.

**Content:**
- Candidate name and offer title (pre-filled from card context — no dropdowns)
- Slot editor (start/end datetime, location, meeting URL)
- Optional note textarea
- Submit / Cancel

**On success:**
1. `proposeInterviewSlots()` is called with the candidate's `applicationId`
2. On API success, `pipelineStage` updates to `"interview"`
3. Card visually moves to the Interview column
4. Student receives `interview_proposed` notification

**Server validation:**
- `proposeInterviewSlots()` already checks `pipelineStage ∈ {applied, screening, interview}` and `status === "applied"` — no change needed.
- Proposal succeeds, then a follow-up call (or the oRPC route) updates `pipelineStage` to `"interview"`.

### 3. Refuse Flow (Available From Any Stage)

Clicking **Refuse** opens a confirmation dialog:
- Optional note textarea (reason for refusal)
- Confirm / Cancel

**On confirm:**
1. `companyRefuseApplication()` runs (existing service)
2. `status` → `company_refused`
3. `pipelineStage` → `rejected`
4. Card moves to Rejected column
5. Student receives `application_refused` notification with the note

### 4. Accept Flow

Clicking **Accept** is only available when `pipelineStage === "offer"`.

**On click:**
1. `companyAcceptApplication()` runs (existing service)
2. `status` → `company_accepted`
3. `pipelineStage` → `offer` (stays)
4. Card visually moves to Offer column
5. Student receives `application_stage_changed` notification

### 5. Slot Visibility on Interview Cards

When a candidate is in the `interview` stage, their card shows:
- Next upcoming slot date/time
- Number of proposed slots
- Interview status: "Pending confirmation" / "Confirmed for Apr 5"

This ensures recruiters never "forget" what slots exist — they're visible right on the card.

### 6. Student Notifications

Every meaningful action triggers a notification via `createNotification`:

| Action | Type | Payload |
|--------|------|---------|
| Stage changed (applied ↔ screening ↔ interview ↔ offer) | `application_stage_changed` | `{ applicationId, stage, note? }` |
| Interview slots proposed | `interview_proposed` | `{ interviewId, applicationId, slotCount }` |
| Slot confirmed by student | `interview_confirmed` | `{ interviewId, slotId }` |
| Company Accept | `application_stage_changed` | `{ applicationId, stage: "offer", status: "company_accepted" }` |
| Company Refuse | `application_refused` | `{ applicationId, offerTitle, companyName, companyNote? }` |

### 7. Fate of `/dashboard/interviews`

- **"Schedule" tab** — removed. Interview creation now happens inline in the pipeline.
- **"All Interviews" tab** — kept as a read-only calendar/list overview for recruiters.

### 8. Data Synchronization Rules

- **Interview stage is the *only* way** to reach `pipelineStage = "interview"`. Selecting `"interview"` from the stage dropdown without an existing interview record will either prompt the modal or be rejected.
- **Backward moves** (interview → screening, offer → interview) are free and do not delete interview records.
- **Refuse** from any stage immediately terminates the application.
- **Interview slots** can be viewed and confirmed by the student in `/dashboard/interviews` (student view).

## Architecture

```
Candidate Pipeline (Kanban)
├── CandidateCard
│   ├── PipelineStageDropdown (applied, screening, interview, offer)
│   ├── InterviewButton → opens InterviewProposalModal
│   ├── AcceptButton (offer stage only)
│   ├── RefuseButton (applied status only) → opens RefuseDialog
│   └── SlotPreview (interview stage only)
├── InterviewProposalModal
│   └── CompanySlotsEditor (shared component)
└── RefuseDialog

/dashboard/interviews (company view)
└── AllInterviewsList (removed Schedule tab)

/dashboard/interviews (student view)
└── StudentInterviewsSection (unchanged)
```

## Changes Required

### Frontend
1. Extract `CompanySlotsEditor` from `CompanyProposeForm` into a reusable component.
2. Create `InterviewProposalModal` that wraps slots + note + submit.
3. Create `RefuseDialog` for note + confirm.
4. Update `CandidateCardActions` to show Interview, Accept, Refuse conditionally.
5. Update `CandidateCard` to show slot preview when in interview stage.
6. Update `InterviewsView/index.tsx` to remove the "Schedule" tab.
7. Update `useInterviewsData` to remove proposeSlots mutation (moved to pipeline).

### Backend
1. oRPC `applications.updatePipelineStage` — keep for small moves, but reject `toStage: "interview"` unless an interview record exists.
2. oRPC `interviews.proposeSlots` — no change needed.
3. oRPC `applications.companyAccept` / `applications.companyRefuse` — no change needed.
4. Add server-side check: if `toStage === "interview"`, verify an interview exists for the application.

### Notifications
- All notification triggers already exist in the services. Ensure frontend mutations trigger invalidation of notification queries.

## Out of Scope

- Redesigning the student applications board (pipeline label display is acceptable)
- Changing the university placement validation flow (post-company-accept)
- Interview rescheduling / cancellation (future enhancement)
