---
Title: Intake And Appointment Photo Smoke
Ticket: HAIR-008
Status: active
Topics:
    - photos
    - backend
    - frontend
    - smoke-test
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - Path: pkg/server/photo_upload.go
      Note: Shared upload validation rules
    - Path: pkg/server/handlers_public.go
      Note: Public intake photo upload handler
    - Path: pkg/server/handlers_stylist_appointments.go
      Note: Stylist appointment photo upload handler
    - Path: pkg/appointments/service.go
      Note: Appointment photo write path and storage key generation
ExternalSources: []
Summary: Manual smoke steps for verifying intake photo uploads, retry behavior, and stylist appointment photo uploads.
LastUpdated: 2026-03-20T14:14:01-04:00
WhatFor: Use this to replay the HAIR-008 backend photo upload slice.
WhenToUse: Use after changing photo validation, upload handlers, or photo-related runtime wiring.
---

# Intake And Appointment Photo Smoke

Use this playbook when you want to verify the current MVP photo workflow end to end against the local stack.

This playbook covers two distinct flows:

- public intake photo upload during booking
- stylist appointment photo upload after booking

## Preconditions

- Local Postgres is running
- Local Keycloak is running on `127.0.0.1:18090`
- The frontend dev server is running on `127.0.0.1:5175`
- The Go backend is running on `127.0.0.1:8080`
- Use `127.0.0.1` consistently; do not mix it with `localhost`

## Public Intake Photo Smoke

1. Open `http://127.0.0.1:8080/booking`
2. Start a booking flow and move to the photo upload step
3. Upload a valid image file for one of the intake slots
4. Continue through estimate and booking
5. Confirm that the intake is created successfully instead of failing on upload

What to verify:

- valid JPEG, PNG, or WebP files are accepted
- empty or non-image files are rejected
- the flow does not lose the uploaded file state before submission

## Public Retry Behavior

This is the failure mode that matters most operationally.

The estimate step should not create a second intake just because one photo upload failed after the first intake save already succeeded.

What to verify:

- after the first successful intake create, retry mode appears with language explaining the intake is already saved
- retrying from the estimate step reuses the existing `intakeId`
- already uploaded photos are not re-uploaded
- only unfinished uploads remain pending

If you are testing manually and cannot force a network failure easily, this can still be checked by watching the confirmation screen and Redux-backed flow behavior after a partial failure is introduced during development.

Initial HAIR-008 browser result:

- one intake create request
- one intake ID reused across the failed upload and retry
- successful recovery back into the booking flow after retry

## Stylist Appointment Photo Smoke

This flow currently has a backend endpoint even if the last bit of stylist runtime UX is still evolving.

1. Sign in as `alice` at `http://127.0.0.1:8080/stylist`
2. Open DevTools Console after login
3. Fetch a live stylist appointment:

```js
const appointments = await fetch("/api/stylist/appointments", { credentials: "include" }).then((r) => r.json());
const appointmentId = appointments.data.appointments[0].id;
appointmentId;
```

4. Upload a valid photo with a `before` or `after` slot:

```js
const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const file = new File([pngBytes], "smoke-before.png", { type: "image/png" });
const form = new FormData();
form.set("slot", "before");
form.set("caption", "smoke test");
form.set("file", file);

await fetch(`/api/stylist/appointments/${appointmentId}/photos`, {
  method: "POST",
  credentials: "include",
  body: form,
}).then((r) => r.json());
```

5. Inspect the response payload

What to verify:

- response status is `201`
- response includes `data.photo`
- `slot` matches the submitted value
- returned `url` points at `/uploads/...`

## Negative Checks

Run one bad upload and confirm it is rejected.

Example invalid upload:

```js
const badFile = new File(["not an image"], "notes.txt", { type: "text/plain" });
const badForm = new FormData();
badForm.set("slot", "before");
badForm.set("file", badFile);

await fetch(`/api/stylist/appointments/${appointmentId}/photos`, {
  method: "POST",
  credentials: "include",
  body: badForm,
}).then(async (r) => ({ status: r.status, body: await r.json() }));
```

Expected result:

- status `400`
- error code `invalid-photo-file`

## Commands Used During Validation

```bash
go test ./...
npm --prefix web run typecheck
```

## Follow-Up Notes

This playbook now covers the booking retry semantics and the backend/stylist photo contracts. A dedicated real browser retry smoke is still worth running after any future changes to `ConsultEstimatePage.tsx`.
