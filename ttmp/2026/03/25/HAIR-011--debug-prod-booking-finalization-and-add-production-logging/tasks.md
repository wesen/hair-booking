# Tasks

## Phase 1: Capture The Bug Precisely

- [x] Reproduce the hosted `POST /api/appointments` failure with a known intake and service
- [x] Capture the exact failing request body and response envelope
- [x] Confirm whether the failure is deterministic or only happens after photo-retry flows
- [ ] Check whether the same failure reproduces locally against the same code path
- [x] Check whether the reported request date is in the past relative to current availability logic

## Phase 2: Narrow The Root Cause

- [x] Trace the hosted appointment-create path from HTTP handler to service to repository
- [x] Identify all code paths that can currently surface `appointment-create-failed`
- [x] Determine which of those paths currently collapse to `500` without logging
- [x] Check for schema, constraint, input-normalization, and availability-edge hypotheses
- [x] Confirm whether stale frontend state, invalid dates, or missing service records can trigger the observed request shape
- [x] Confirm whether the frontend can submit a stale time slot that the backend should classify as `409 slot-unavailable` instead of `500`

## Phase 3: Add Production Logging Baseline

- [x] Add request-level structured logging middleware for all HTTP requests
- [x] Log request method, path, status, duration, request ID, and authenticated user context when available
- [x] Add explicit structured error logs in public booking handlers
- [x] Add explicit structured error logs in appointment service and repository boundaries
- [x] Ensure sensitive fields are redacted or omitted
- [x] Keep logs compact enough for production use

## Phase 4: Improve Error Surfaces

- [ ] Stop collapsing all booking-finalization failures into a bare `appointment-create-failed` without internal traceability
- [ ] Map known validation and conflict cases to stable 4xx responses
- [ ] Preserve user-safe error messages while logging full internal causes
- [ ] Add request IDs to error responses if that helps operator support

## Phase 5: Validate The Fix

- [ ] Reproduce the previous hosted booking flow after the logging patch
- [ ] Confirm logs now explain the failure path or confirm the bug is fixed
- [ ] Add automated tests for the failing appointment-create case
- [x] Add automated tests for logging middleware behavior where practical

## Phase 6: Document The Operational Model

- [ ] Write a production debug playbook for booking failures
- [ ] Document where hosted logs live and how to read them on Coolify
- [ ] Document the expected fields in request/error logs
- [ ] Update deployment docs if runtime log configuration needs new env vars
