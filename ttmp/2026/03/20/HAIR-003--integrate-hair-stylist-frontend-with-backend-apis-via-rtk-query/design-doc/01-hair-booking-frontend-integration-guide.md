---
Title: Hair Booking Frontend Integration Guide
Ticket: HAIR-003
Status: active
Topics:
    - frontend
    - react
    - redux
    - typescript
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: web/package.json
      Note: Frontend package boundary and dependency set
    - Path: web/src/stylist/store/index.ts
      Note: Current Redux store wiring that must absorb RTK Query
    - Path: web/src/stylist/store/consultationSlice.ts
      Note: Current multi-step booking draft state
    - Path: web/src/stylist/store/portalSlice.ts
      Note: Current portal mock hydration and UI state
    - Path: web/src/stylist/store/authSlice.ts
      Note: Current OTP-shaped auth mock state
    - Path: web/src/stylist/pages/SignInPage.tsx
      Note: OTP-style sign-in UI that must be replaced
    - Path: web/src/stylist/pages/VerifyCodePage.tsx
      Note: OTP verification UI that no longer matches product direction
    - Path: web/src/stylist/pages/ConsultCalendarPage.tsx
      Note: Booking calendar still driven by deterministic availability
    - Path: web/src/stylist/pages/PortalHomePage.tsx
      Note: Portal home still reads mock user, appointments, and maintenance data
ExternalSources: []
Summary: Implementation guide for replacing the frontend's mocked booking and portal state with RTK Query calls to the Go backend APIs.
LastUpdated: 2026-03-20T00:12:00-04:00
WhatFor: Use this guide to implement the RTK Query-based frontend integration for the hair-booking web app.
WhenToUse: Use when wiring the React app to the backend, removing OTP mocks, or reviewing the migration sequence.
---

# Hair Booking Frontend Integration Guide

## Executive Summary

The frontend should start integrating now instead of waiting for every backend endpoint to be finished. The backend already supports the highest-value flows: public services, intake, intake photos, availability, appointment creation, authenticated profile reads and writes, appointment history and detail, cancellation, and maintenance-plan reads. That is enough to replace the major booking and portal mocks and begin real browser testing.

The recommended implementation uses RTK Query as the server-state layer while keeping Redux slices only for local UI state and multi-step draft state. In practice, `consultationSlice` should continue to own incomplete form input and screen progression, but API reads and writes should move into an API slice. `portalSlice` should stop owning canonical user, appointment, and maintenance data and shrink down to view state such as active tab and local filter choices.

This guide is written for an intern. It explains what the current system is, which files still own mock behavior, which backend routes map to which screens, what code shape to create, and what order to migrate things so the app stays testable throughout the work.

## Problem Statement

The imported web app currently behaves like a high-fidelity mock. It has polished UI, Redux state, and Storybook coverage, but it does not yet behave like a real application. The gaps are structural.

The biggest issues are:

- The booking flow still uses deterministic calendar data from `web/src/stylist/data/consultation-constants.ts`.
- The portal still hydrates from `web/src/stylist/data/portal-data.ts`.
- The frontend still contains OTP-style sign-in and verify-code pages that no longer match the Keycloak/OIDC direction of the app.
- There is no RTK Query or shared API layer in `web/src/stylist/store/`.
- Redux slices currently mix two responsibilities:
  - local UI state that should stay client-side
  - canonical business data that should come from the backend

If we continue building backend-only features without integration, we delay the moment when the booking and portal widgets can be tested against reality. That increases the chance of contract drift.

## Proposed Solution

The frontend should adopt a single RTK Query API module that owns backend communication, response caching, mutation invalidation, and authenticated browser requests. The API module should live under `web/src/stylist/store/api/` and expose hooks that the existing page and component tree can consume.

The high-level architecture should look like this:

```text
React page/component
        |
        v
RTK Query hook
        |
        v
baseQuery with credentials + envelope unwrap
        |
        v
Go backend /api/*
```

State ownership should be split deliberately.

Keep in Redux slices:

- active screen and tab selection
- incomplete multi-step form values
- local modal visibility
- temporary deposit sheet UI state until payments are redesigned

Move to RTK Query:

- services catalog
- session-backed `/api/me`
- booking availability
- intake creation and intake photo upload results
- created appointments
- portal appointment list and detail
- notification preference persistence
- maintenance plan

### Recommended API Module Layout

Create a small API package instead of one giant file:

```text
web/src/stylist/store/api/
  base.ts
  types.ts
  mappers.ts
  servicesApi.ts
  bookingApi.ts
  portalApi.ts
  authApi.ts
```

Suggested responsibilities:

- `base.ts`
  - create the shared `createApi` instance or shared `baseQuery`
  - set `credentials: "include"`
  - unwrap the backend envelope shape `{ data: ... }`
  - normalize backend error envelopes
- `types.ts`
  - define DTOs that match backend payloads exactly
- `mappers.ts`
  - map backend DTOs into current widget-friendly shapes when useful
- `servicesApi.ts`
  - `getServices`
- `bookingApi.ts`
  - `createIntake`
  - `uploadIntakePhoto`
  - `getAvailability`
  - `createAppointment`
- `portalApi.ts`
  - `getMe`
  - `updateMe`
  - `updateNotificationPrefs`
  - `getMyAppointments`
  - `getMyAppointment`
  - `rescheduleMyAppointment`
  - `cancelMyAppointment`
  - `getMaintenancePlan`
- `authApi.ts`
  - optional small helper hook around session bootstrap if that keeps the UI cleaner

### Backend Route Mapping

The current backend routes that should be integrated first are:

```text
GET    /api/services
POST   /api/intake
POST   /api/intake/:id/photos
GET    /api/availability
POST   /api/appointments
GET    /api/me
PATCH  /api/me
PATCH  /api/me/notification-prefs
GET    /api/me/appointments
GET    /api/me/appointments/:id
PATCH  /api/me/appointments/:id
POST   /api/me/appointments/:id/cancel
GET    /api/me/maintenance-plan
```

The frontend should integrate them in the same order users feel them:

1. Booking reads and writes that unblock consult scheduling.
2. Portal reads that replace mock dashboard data.
3. Portal writes for profile, prefs, and appointment actions.
4. Photo timeline once the remaining backend photo routes are complete.

### Component And Slice Migration Strategy

The current component tree should not be rewritten wholesale. Replace the data source under existing screens.

#### Booking App

Files to focus on:

- `web/src/stylist/ClientBookingApp.tsx`
- `web/src/stylist/pages/ConsultCalendarPage.tsx`
- `web/src/stylist/pages/PhotosPage.tsx`
- `web/src/stylist/pages/ConsultConfirmPage.tsx`
- `web/src/stylist/store/consultationSlice.ts`
- `web/src/stylist/store/authSlice.ts`

What should change:

- `consultationSlice` remains responsible for draft form state, selected date and time, and step progression.
- `ConsultCalendarPage` should stop importing `CALENDAR_DATA` and instead query availability for the selected month and service.
- `PhotosPage` should stop simulating photo uploads and call the intake-photo mutation.
- `ConsultConfirmPage` should render from the created appointment and intake results, not only local draft state.
- `SignInPage` and `VerifyCodePage` should be replaced or repurposed to start the Keycloak browser login flow.

#### Portal App

Files to focus on:

- `web/src/stylist/ClientPortalApp.tsx`
- `web/src/stylist/pages/PortalHomePage.tsx`
- `web/src/stylist/pages/PortalAppointmentsPage.tsx`
- `web/src/stylist/pages/PortalProfilePage.tsx`
- `web/src/stylist/store/portalSlice.ts`
- `web/src/stylist/data/portal-data.ts`

What should change:

- `portalSlice` should stop being the source of truth for user, appointments, maintenance, and notification prefs.
- `portalSlice` can keep:
  - `screen`
  - `activeTab`
  - `appointmentFilter`
- `PortalHomePage`, `PortalAppointmentsPage`, and `PortalProfilePage` should read data from RTK Query hooks.
- `portal-data.ts` should become Storybook-only or fixture-only, not production-hydration data.

### Suggested Data Boundary

Use exact backend DTOs at the API boundary, then map to widget props when helpful. Do not force every component to understand backend response quirks directly.

Example:

```ts
type MeResponseDto = {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    scalp_notes?: string;
    service_summary?: string;
  };
  notification_prefs: {
    remind_48hr: boolean;
    remind_2hr: boolean;
    maint_alerts: boolean;
  };
};

type PortalUserViewModel = {
  name: string;
  email: string;
  phone: string;
  serviceDescription: string;
  notificationPrefs: Array<{ key: string; label: string; on: boolean }>;
};
```

Reason:

- DTOs keep the network layer honest.
- View models keep component props stable and readable.
- Mapping helpers isolate rename churn between backend and frontend.

### Suggested RTK Query Base Layer

Pseudocode:

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if ("error" in result) {
    return result;
  }

  return {
    data: result.data?.data ?? result.data,
  };
};

export const stylistApi = createApi({
  reducerPath: "stylistApi",
  baseQuery,
  tagTypes: ["Me", "Services", "Availability", "Appointments", "Maintenance", "Photos"],
  endpoints: () => ({}),
});
```

Important details:

- Always send cookies with `credentials: "include"` because browser auth is session-backed.
- Unwrap the backend envelope once in the base layer so every endpoint does not repeat it.
- Keep tags coarse at first. Over-optimizing cache tags early usually creates more confusion than value.

## Design Decisions

### Use RTK Query, Not Hand-Rolled Fetch Hooks

Rationale:

- The app already uses Redux Toolkit.
- RTK Query gives caching, invalidation, and generated hooks without introducing another state library.
- It keeps server-backed data out of handwritten thunks and ad hoc `useEffect` calls.

### Keep Draft Form State In `consultationSlice`

Rationale:

- Multi-step draft values are not yet canonical backend state until the user submits them.
- RTK Query is best for server state, not every keystroke in a draft wizard.

### Shrink `portalSlice` To UI State Only

Rationale:

- Appointments, profile, maintenance, and prefs are server-backed and should not be duplicated as canonical Redux slice state.
- Keeping them in both places would create stale-data and invalidation bugs.

### Replace OTP UI Instead Of Emulating OTP Against Keycloak

Rationale:

- The backend direction is explicitly Keycloak/OIDC, not login codes.
- The frontend should stop pretending otherwise.
- A simple “Continue to secure sign-in” flow is better than preserving a fake OTP journey.

### Integrate Reads Before All Writes

Rationale:

- Read integration gives quick visual confirmation that the backend contracts are correct.
- It lets us test the app in the browser before every mutation is finished.
- It reduces the blast radius of later write-path bugs.

## Alternatives Considered

### Continue Backend-Only Until Every Endpoint Is Finished

Rejected because:

- The UI would remain mostly mock-driven.
- Contract mismatches would be discovered too late.
- Real end-to-end testing would stay blocked.

### Replace Redux With React Query Or Another Data Library

Rejected because:

- The app already uses Redux Toolkit.
- RTK Query fits the current architecture with less churn.
- A second state or data library would raise complexity for an intern.

### Keep Portal Data In Slices And Fetch Imperatively

Rejected because:

- That duplicates server state.
- Cache invalidation becomes manual and fragile.
- The code drifts toward bespoke thunks and repeated loading and error logic.

### Fully Rewrite The App Architecture Before Integrating

Rejected because:

- It is unnecessary for MVP.
- It would slow down testing.
- The better approach is to preserve the UI tree and replace the data sources underneath it.

## Implementation Plan

### Phase 1: Add RTK Query Foundation

- Create the shared API module.
- Register reducer and middleware in the store.
- Add DTOs, envelope unwrapping, and mapping helpers.
- Keep this slice infrastructure-only and test it first.

### Phase 2: Replace Auth Mismatch

- Remove OTP assumptions from `authSlice`, `SignInPage`, and `VerifyCodePage`.
- Add a Keycloak login-launch UX.
- Add session bootstrap around `/api/me`.

### Phase 3: Integrate Public Booking

- Query services.
- Submit intake.
- Upload intake photos.
- Query availability.
- Create appointments.
- Keep local step progression in the slice.

### Phase 4: Integrate Portal Reads

- Hydrate profile from `/api/me`.
- Hydrate appointments from `/api/me/appointments`.
- Hydrate maintenance from `/api/me/maintenance-plan`.
- Replace `portal-data.ts` production use.

### Phase 5: Integrate Portal Writes

- Profile update mutation.
- Notification prefs mutation.
- Appointment cancel and reschedule mutations.
- Invalidate or refetch the right caches.

### Phase 6: Integrate Portal Photos

- Hook the portal photo timeline and upload UX once the remaining backend photo routes are ready.

### Phase 7: Cleanup And Validation

- Remove dead OTP state.
- Reduce stale mock data usage.
- Run typecheck and browser smoke tests.
- Verify Go server, Keycloak, and Postgres locally.

### Suggested Migration Order Table

| Order | Surface | Why First |
| --- | --- | --- |
| 1 | Services and `/api/me` foundation | Establishes API layer and auth/session assumptions |
| 2 | Availability and appointment creation | Enables real consult booking tests |
| 3 | Portal reads | Replaces the biggest user-visible mocks |
| 4 | Portal writes | Makes the portal interactive |
| 5 | Photo timeline | Depends on remaining backend photo endpoints |
| 6 | Mock cleanup | Safe once real data paths are stable |

## Open Questions

The following questions should stay visible while implementing:

- How should the Keycloak login initiation look in the booking flow:
  - a dedicated sign-in page
  - or a redirect-first button with minimal local state?
- Should the portal continue exposing loyalty and rewards UI while those features remain out of backend scope?
- Should the deposit payment sheet stay as a clearly mocked UI, or should it be hidden until payments return to scope?
- When portal photos are integrated, should image URLs be used directly or proxied through a safer fetch layer?

## References

- Current store setup: `web/src/stylist/store/index.ts`
- Current booking draft state: `web/src/stylist/store/consultationSlice.ts`
- Current portal mock state: `web/src/stylist/store/portalSlice.ts`
- Current OTP-only auth mock: `web/src/stylist/store/authSlice.ts`
- Current backend ticket: `ttmp/2026/03/19/HAIR-002--design-luxe-hair-studio-mvp-backend/`
