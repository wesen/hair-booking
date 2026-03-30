# Keycloak SES Verification Playbook

This playbook is the permanent operator runbook for verifying that the hosted
`hair-booking` Keycloak realm can send and complete real account emails through
Amazon SES.

Use this when you need to verify:

- SMTP connectivity from Keycloak to SES
- real mailbox delivery
- verify-email flow
- forgot-password flow
- the hosted app login behavior after verification

This playbook assumes the current hosted setup:

- app: `https://hair-booking.app.scapegoat.dev`
- Keycloak: `https://auth.scapegoat.dev`
- realm: `hair-booking`
- sender domain: `mail.scapegoat.dev`
- default sender: `no-reply@mail.scapegoat.dev`

Before using this playbook after the Vault migration, first make sure the realm
SMTP settings were applied through
[keycloak-vault-smtp-sync-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-vault-smtp-sync-playbook.md).

## What "done" means

SES is not considered fully verified until all of these are true:

1. Keycloak test email succeeds.
2. A real verification email arrives in a real inbox.
3. Clicking the verification link marks the user as email-verified.
4. A real password-reset email arrives in a real inbox.
5. Resetting the password through the link works.
6. The user can log into `hair-booking` after both flows.

## System Map

The email flow is:

```text
Keycloak realm hair-booking
  -> SMTP over SES
    -> real mailbox
      -> user clicks action link
        -> Keycloak action endpoint
          -> app login flow
```

Relevant files and repos:

- [hair-booking-coolify.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify.md)
- [hair-booking-coolify-playbook.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/deployments/hair-booking-coolify-playbook.md)
- [tasks.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/tasks.md)
- [01-investigation-diary.md](/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/reference/01-investigation-diary.md)
- `/home/manuel/code/wesen/terraform/ses/README.md`

## Prerequisites

Before running this playbook, verify:

- the hosted app is up
- the hosted Keycloak realm is `hair-booking`
- SES identity `mail.scapegoat.dev` is verified
- SMTP credentials exist and are configured in the realm
- you have a real mailbox you control

If SES is still in sandbox mode, your test mailbox must also be a verified SES
recipient.

## 1. Verify Realm Email Settings

In Keycloak admin:

1. Open realm `hair-booking`
2. Go to `Realm settings`
3. Open the `Email` tab

Confirm:

- host is the SES SMTP endpoint
- port is correct
- authentication is enabled
- encryption mode matches the chosen SES config
- `From` is the expected sender
- the SMTP username is present
- the SMTP password is present

The minimum intended shape is:

```text
host: email-smtp.us-east-1.amazonaws.com
port: 587
from: no-reply@mail.scapegoat.dev
reply-to: no-reply@mail.scapegoat.dev
auth: true
starttls: true
```

## 2. Send Keycloak Test Email

Still in the Keycloak Email settings page:

1. enter a mailbox you control as the test recipient
2. click the test email action

Success means:

- Keycloak reports the email send succeeded
- there is no auth error
- there is no TLS error
- there is no timeout

If this fails, stop here and debug SMTP before continuing.

## 3. Verify SES Delivery Signals

Check the AWS side:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
AWS_PROFILE=manuel aws sesv2 get-account --region us-east-1
AWS_PROFILE=manuel aws sesv2 get-email-identity --region us-east-1 --email-identity mail.scapegoat.dev
```

You want to confirm:

- sending is enabled
- the domain identity is verified
- DKIM is healthy
- MAIL FROM is healthy

If delivery events are wired, also check:

- delivery
- bounce
- complaint
- reject

## 4. Test Real User Registration

Use a fresh email address you control.

Flow:

1. Open `https://hair-booking.app.scapegoat.dev/portal`
2. Go to sign in / registration
3. Create a new account in Keycloak with email and password
4. Submit registration

Expected immediate outcome:

- Keycloak accepts registration
- verification email is sent
- login is gated until verification is complete

## 5. Verify The Email Link

In the real inbox:

1. open the verification email
2. click the verification link

Expected results:

- the link lands on the hosted Keycloak/account flow
- Keycloak marks the account verified
- the user can proceed to login

Admin verification:

1. find the user in Keycloak admin
2. confirm `Email verified = true`

## 6. Verify Hosted App Login

After email verification:

1. log into `https://hair-booking.app.scapegoat.dev`
2. complete the hosted auth flow
3. verify the app session comes up correctly

Useful API check:

```bash
curl -ksS https://hair-booking.app.scapegoat.dev/api/info
```

Browser-level success is:

- login succeeds
- the app session is usable
- no duplicate local client row is created on repeat login

## 7. Test Forgot Password

From the hosted login page:

1. choose `Forgot Password`
2. submit the same real email address

Expected immediate outcome:

- reset email is sent
- the login UI confirms the email action

In the inbox:

1. open the reset email
2. click the reset link
3. choose a new password
4. complete the flow

Success means:

- the link is valid
- the password change succeeds
- the new password works immediately

## 8. Verify The User State In Keycloak

In Keycloak admin, confirm:

- the user exists in realm `hair-booking`
- `Email verified = true`
- credentials were updated successfully after password reset

## 9. Verify Repeat Login Against The App

After password reset:

1. log in again through the hosted app
2. confirm the same account still works
3. confirm the app treats this as the same person, not a duplicate identity

The intended identity rule is:

- Keycloak subject is canonical
- email is secondary

## 10. Failure Modes To Check First

If the flow breaks, check these in order:

1. SES sandbox restrictions
2. wrong SMTP endpoint or region
3. STARTTLS / TLS mismatch
4. wrong SMTP credentials
5. sender identity not verified
6. Keycloak realm email settings drift
7. bad redirect hostname in Keycloak action links
8. app-side session issues after a successful Keycloak action

## 11. Minimal Operator Checklist

If you only need the shortest production check:

1. send a Keycloak test email
2. create a fresh real account
3. verify the email from the inbox
4. log into the hosted app
5. run forgot-password
6. reset the password from the inbox
7. log in again with the new password

If all seven pass, the SES + Keycloak email path is healthy enough for MVP.
