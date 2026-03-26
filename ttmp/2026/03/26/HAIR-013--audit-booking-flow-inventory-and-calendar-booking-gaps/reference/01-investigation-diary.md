---
Title: Investigation Diary
Ticket: HAIR-013
Status: active
Topics:
    - frontend
    - backend
    - booking
    - postgres
DocType: reference
Intent: working
Owners: []
RelatedFiles:
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/web/src/stylist/pages/ConsultCalendarPage.tsx
      Note: First likely defect source found during investigation.
    - Path: /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_public.go
      Note: Public booking handlers used to map frontend state to backend persistence.
Summary: Step-by-step diary of the audit of the booking funnel, intake persistence, and current calendar-booking defect candidates.
LastUpdated: 2026-03-26T10:35:00-04:00
WhatFor: Preserve the actual command path and reasoning used to build the HAIR-013 inventory.
WhenToUse: Use when continuing the audit or implementing the first booking/calendar fix.
---

# Investigation Diary

## 2026-03-26

The user reported that booking an appointment and selecting something in the
calendar did not seem to work. They also asked for a full inventory of the
frontend/backend and where the intake flow is codified and stored.

I started by treating this as both a defect and a mapping exercise. The first
goal was not to patch anything. It was to locate the real runtime code paths.

The first search targeted the booking pages, booking API hooks, and public
server handlers:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
rg --files web/src/stylist | rg 'Consult|Calendar|Photo|Booking|store/api|consultation|PhotoBox|CalendarGrid|main.tsx|ClientBookingApp.tsx'
rg --files pkg | rg 'appointments|intake|services|availability|server|db/migrations|storage|auth'
rg -n "handle.*appointments|/api/appointments|/api/intake|availability|slot-unavailable|start_time|ConsultCalendarPage|CalendarGrid|selectedTime|selectedDate" web/src/stylist pkg/server pkg/appointments pkg/intake
```

That immediately narrowed the important files to:

- `web/src/stylist/ClientBookingApp.tsx`
- `web/src/stylist/pages/ConsultEstimatePage.tsx`
- `web/src/stylist/pages/ConsultCalendarPage.tsx`
- `web/src/stylist/pages/PhotosPage.tsx`
- `web/src/stylist/components/CalendarGrid.tsx`
- `web/src/stylist/store/consultationSlice.ts`
- `web/src/stylist/store/api/bookingApi.ts`
- `web/src/stylist/store/api/mappers.ts`
- `pkg/server/handlers_public.go`
- `pkg/intake/service.go`
- `pkg/intake/postgres.go`
- `pkg/appointments/service.go`
- `pkg/appointments/postgres.go`
- `pkg/db/migrations/0001_init.sql`

Then I read the booking UI files in detail. The most important immediate finding
was in `ConsultCalendarPage.tsx`:

```ts
const [calendarMonth, setCalendarMonth] = useState(2);
const year = 2026;
```

and in `CalendarGrid.tsx`:

```ts
onClick={() => avail && onSelectDate(dateStr)}
```

with navigation bounded by:

```ts
if (month > 2) ...
if (month < 5) ...
```

That means the calendar is still hard-coded to a March-June 2026 window. This
is the strongest current explanation for a “selection does not work” report,
because the backend availability map must match the exact month/year keys the UI
generates before the day becomes clickable.

I then traced the intake persistence path instead of guessing from the original
schema notes. The flow is codified in three main places:

1. `consultationSlice.ts`
   - step ordering and in-browser booking state
2. `mappers.ts`
   - transformation from `ConsultationData` to the intake API DTO
3. `pkg/intake/service.go` and `pkg/intake/postgres.go`
   - backend validation, estimate calculation, and persistence

The booking flow itself is split across three persistence moments:

1. create intake submission
2. upload intake photos
3. create appointment

This turned out to be more mature than a pure mock frontend, but still less
cohesive than a fully stabilized production flow. The frontend orchestration in
`ConsultEstimatePage.tsx` is real and intentionally retry-safe:

- it creates an intake only once
- it retries only unfinished photo uploads
- it carries the existing `intakeId` forward to the calendar page

Then I verified where those results actually land in Postgres by reading
`0001_init.sql`, `intake/postgres.go`, and `appointments/postgres.go`.

The concrete storage map is:

- intake answers -> `intake_submissions`
- intake photos -> `intake_photos`
- appointment booking -> `appointments`
- appointment references intake through `appointments.intake_id`

The architectural conclusion from this pass is:

- the booking flow is real
- the intake flow is real
- the storage model is coherent
- the current booking/calendar defect is most likely frontend date logic, not
  the absence of a booking backend

That is why the ticket write-up focuses on two things at once:

- the immediate calendar defect candidate
- the broader inventory of what is complete versus still prototype-shaped
