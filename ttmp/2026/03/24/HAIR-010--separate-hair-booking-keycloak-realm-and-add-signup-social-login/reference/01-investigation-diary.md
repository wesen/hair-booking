---
Title: Investigation Diary
Ticket: HAIR-010
Status: active
Topics:
    - auth
    - keycloak
    - deploy
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - Path: docs/deployments/hair-booking-coolify.md
      Note: Current deployment still references the shared smailnail realm
    - Path: docs/deployments/hair-booking-coolify-playbook.md
      Note: Hosted rollout context that will later need issuer/client updates
ExternalSources:
    - https://www.keycloak.org/docs/latest/server_admin/
    - https://www.keycloak.org/server/features
Summary: Diary for the auth-separation work that moves hair-booking to its own Keycloak realm with local signup and social login.
LastUpdated: 2026-03-25T22:15:00-04:00
WhatFor: Use this to understand why the Keycloak plan moved into its own docmgr ticket and what conclusions were reached from the official docs.
WhenToUse: Use while implementing or reviewing HAIR-010.
---

# Investigation Diary

## 2026-03-25

The user confirmed that Amazon SES had already been set up on the side and asked
me to continue HAIR-010 task by task. That shifted the next active slice from
"prepare for SMTP someday" into "wire the already-verified SES identity into the
hosted `hair-booking` realm and validate the Keycloak side."

I started by re-reading the SES docs in the shared Terraform repo so the runtime
integration matched the Terraform-owned SES control plane instead of inventing a
parallel mail setup. The most relevant docs were:

- `/home/manuel/code/wesen/terraform/ses/README.md`
- `/home/manuel/code/wesen/terraform/ttmp/2026/03/24/TF-002-SES-TERRAFORM--set-up-ses-with-terraform/playbook/02-ses-smtp-integration-playbook.md`

Those docs lock in the production SES shape that HAIR-010 should use:

- SES identity: `mail.scapegoat.dev`
- MAIL FROM domain: `bounce.mail.scapegoat.dev`
- SMTP endpoint: `email-smtp.us-east-1.amazonaws.com`
- configuration set: `mail-scapegoat-dev`
- recommended sender address: `no-reply@mail.scapegoat.dev`

Before changing Keycloak, I revalidated the live SES setup in AWS:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
AWS_PROFILE=manuel aws sesv2 get-email-identity --region us-east-1 --email-identity mail.scapegoat.dev
AWS_PROFILE=manuel aws sesv2 get-account --region us-east-1
```

The live results were good:

- `mail.scapegoat.dev` is verified for sending
- DKIM status is `SUCCESS`
- MAIL FROM status is `SUCCESS`
- production access is enabled
- the account has a real send quota

I also re-read the hosted Keycloak runtime path so the SMTP secret would land in
the real operator-owned system, not in repo files. The hosted service is a
Coolify-managed Keycloak container on `89.167.52.236`:

```bash
ssh manuel@89.167.52.236 'sudo -n docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -Ei "keycloak|coolify|auth"'
ssh manuel@89.167.52.236 'sudo -n docker inspect keycloak-k12lm4blpo13louovn3pfsgs'
ssh manuel@89.167.52.236 'sudo -n ls -la /data/coolify/services/k12lm4blpo13louovn3pfsgs'
ssh manuel@89.167.52.236 'sudo -n sed -n "1,240p" /data/coolify/services/k12lm4blpo13louovn3pfsgs/docker-compose.yml'
```

That showed:

- hosted Keycloak is the Coolify service `keycloak-k12lm4blpo13louovn3pfsgs`
- its managed compose lives under `/data/coolify/services/k12lm4blpo13louovn3pfsgs`
- there was no SMTP-related service env yet

Then I rechecked the live hosted realm state through the Keycloak admin API:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
ACCESS_TOKEN=$(curl -fsS -X POST "$TF_VAR_keycloak_url/realms/master/protocol/openid-connect/token" \
  -d grant_type=password \
  -d client_id=$TF_VAR_keycloak_client_id \
  --data-urlencode username=$TF_VAR_keycloak_username \
  --data-urlencode password=$TF_VAR_keycloak_password | jq -r .access_token)
curl -fsS -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking" | jq '{realm, verifyEmail, smtpServer}'
```

At the start of this slice, the hosted realm had:

- `verifyEmail: false`
- `smtpServer: {}`

Because this is an operator-heavy flow and I did not want it trapped in shell
history, I added two rerunnable scripts to the HAIR-010 ticket:

- `scripts/create_hair_booking_ses_smtp_credentials.sh`
- `scripts/configure_hosted_keycloak_smtp_and_smoke.sh`

The first script is responsible for:

- validating the SES identity
- creating the dedicated IAM user `hair-booking-ses-smtp-prod`
- attaching the least-privilege `ses:SendRawEmail` policy
- creating one IAM access key
- deriving the SES SMTP password
- writing the resulting Keycloak SMTP settings to a non-git operator env file

The second script is responsible for:

- reading the operator SMTP secret file
- updating the hosted Keycloak realm `smtpServer`
- creating or reusing a probe user
- triggering Keycloak action emails for smoke validation

The first actual issue in this slice was easy to misread. My initial script run
failed with:

```text
An error occurred (NotFoundException) when calling the GetEmailIdentity operation: Email identity <mail.scapegoat.dev> does not exist.
```

That looked like the wrong AWS account at first, but the direct checks proved it
was **not** an account mismatch:

```bash
AWS_PROFILE=manuel aws sts get-caller-identity
AWS_PROFILE=manuel aws sesv2 get-email-identity --region us-east-1 --email-identity mail.scapegoat.dev
```

Both commands resolved the expected AWS account `745667007186`, and the direct
identity lookup succeeded. The practical fix was to rerun the script with the
known-good env pinned explicitly:

```bash
AWS_PROFILE=manuel AWS_REGION=us-east-1 SES_IDENTITY=mail.scapegoat.dev \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/create_hair_booking_ses_smtp_credentials.sh
```

That succeeded and created:

- IAM user: `hair-booking-ses-smtp-prod`
- one active access key for that user
- operator secret file: `/home/manuel/.config/hair-booking/hosted-keycloak-smtp.env`

I verified the IAM user and key metadata without exposing secrets:

```bash
AWS_PROFILE=manuel aws iam get-user --user-name hair-booking-ses-smtp-prod
AWS_PROFILE=manuel aws iam list-access-keys --user-name hair-booking-ses-smtp-prod
```

The second issue was more concrete and came from my own script output format. The
first generated operator env file wrote:

```text
KEYCLOAK_SMTP_FROM_DISPLAY_NAME=Hair Booking
```

without shell quoting. That broke the second script when it sourced the file:

```text
/home/manuel/.config/hair-booking/hosted-keycloak-smtp.env: line 6: Booking: command not found
```

I fixed the generator script so it now writes shell-safe values with `%q`. Since
the key had already been created, I repaired the current env file in place
instead of rotating the SMTP secret immediately:

```bash
python3 - <<'PY'
from pathlib import Path
path = Path('/home/manuel/.config/hair-booking/hosted-keycloak-smtp.env')
lines = path.read_text().splitlines()
out = []
for line in lines:
    if not line or line.lstrip().startswith('#'):
        out.append(line)
        continue
    key, value = line.split('=', 1)
    out.append(f"{key}={value!r}")
path.write_text('\n'.join(out) + '\n')
path.chmod(0o600)
PY
bash -n /home/manuel/.config/hair-booking/hosted-keycloak-smtp.env
```

After that repair, the hosted Keycloak SMTP configuration script partially
succeeded before hitting a later `400` response on the smoke-email path. The
important fact is that the realm update itself already landed. I confirmed the
current hosted state with the admin API:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
ACCESS_TOKEN=$(curl -fsS -X POST "$TF_VAR_keycloak_url/realms/master/protocol/openid-connect/token" \
  -d grant_type=password \
  -d client_id=$TF_VAR_keycloak_client_id \
  --data-urlencode username=$TF_VAR_keycloak_username \
  --data-urlencode password=$TF_VAR_keycloak_password | jq -r .access_token)
curl -fsS -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking" | jq '{realm, verifyEmail, smtpServer}'
```

The hosted realm now contains SMTP settings:

- host: `email-smtp.us-east-1.amazonaws.com`
- port: `587`
- from: `no-reply@mail.scapegoat.dev`
- reply-to: `no-reply@mail.scapegoat.dev`
- starttls: `true`
- auth: `true`
- a real SES SMTP username

and still has:

- `verifyEmail: false`

So the current HAIR-010 state at this point is:

- Phase 6 is mostly implemented
- SMTP credentials exist outside git in an operator file
- the hosted realm is configured to use SES SMTP
- the remaining bug is in the smoke-email validation path, not in the SMTP
  credential creation or the realm SMTP update itself
- `Verify Email` should stay off until the smoke path is fixed cleanly

The next debugging step isolated the smoke-email failure instead of treating the
whole SMTP path as broken. I checked the two Keycloak execute-actions-email calls
individually for the probe user `hair-booking-ses-smtp-probe`.

The first failure was:

```text
400 {"errorMessage":"Invalid redirect uri."}
```

That one was self-inflicted. I had used the application route
`https://hair-booking.app.scapegoat.dev/portal` as the execute-actions-email
redirect target, but the Keycloak browser client only allows the callback-style
redirects defined in Terraform. The fix was to stop forcing a redirect URI in
the smoke script and let Keycloak use its normal account-flow defaults.

After removing the redirect override, the error changed from a `400` to a `500`,
which meant Keycloak was now trying to send mail and failing lower in the stack.
To avoid guessing, I pulled the hosted Keycloak logs from the Coolify host:

```bash
ssh manuel@89.167.52.236 'sudo -n docker logs --tail 80 keycloak-k12lm4blpo13louovn3pfsgs 2>&1 | tail -80'
```

That surfaced the real SES authorization error:

```text
554 Access denied: User `arn:aws:iam::745667007186:user/hair-booking-ses-smtp-prod' is not authorized to perform `ses:SendRawEmail' on resource `arn:aws:ses:us-east-1:745667007186:configuration-set/mail-scapegoat-dev'
```

This was a useful correction. My first IAM policy only allowed
`ses:SendRawEmail` on the SES identity ARN. Because the SES identity is wired to
the configuration set `mail-scapegoat-dev`, the SMTP send path also needed
permission on the configuration-set ARN.

I fixed that in the HAIR-010 credential script by expanding the policy resource
list to include both:

- `arn:aws:ses:us-east-1:745667007186:identity/mail.scapegoat.dev`
- `arn:aws:ses:us-east-1:745667007186:configuration-set/mail-scapegoat-dev`

I also made the credential script safely rerunnable. It now:

- updates the IAM policy every run
- reuses the existing operator secret file if an SMTP key already exists
- avoids creating a second access key accidentally

Then I replayed the credential script to push the corrected policy without
rotating the secret:

```bash
AWS_PROFILE=manuel AWS_REGION=us-east-1 SES_IDENTITY=mail.scapegoat.dev SES_CONFIGURATION_SET=mail-scapegoat-dev \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/create_hair_booking_ses_smtp_credentials.sh
```

After that fix, the direct Keycloak action-mail calls succeeded:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
admin_token=$(curl -fsS -X POST "$TF_VAR_keycloak_url/realms/master/protocol/openid-connect/token" \
  -d grant_type=password \
  -d client_id="$TF_VAR_keycloak_client_id" \
  --data-urlencode "username=$TF_VAR_keycloak_username" \
  --data-urlencode "password=$TF_VAR_keycloak_password" | jq -r .access_token)
probe_user_id=bb3b8a1f-5351-4f72-bdc0-f3142f0c214f
curl -sS -o /tmp/hair-booking-verify-email.out -w '%{http_code}' \
  -X PUT -H "Authorization: Bearer $admin_token" -H 'Content-Type: application/json' \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking/users/$probe_user_id/execute-actions-email" \
  --data '["VERIFY_EMAIL"]'
curl -sS -o /tmp/hair-booking-password-email.out -w '%{http_code}' \
  -X PUT -H "Authorization: Bearer $admin_token" -H 'Content-Type: application/json' \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking/users/$probe_user_id/execute-actions-email" \
  --data '["UPDATE_PASSWORD"]'
```

Both returned `204`.

At that point a more subtle infrastructure issue appeared in Terraform. I tried
to plan `verify_email = true` in the hosted `hair-booking` env and saw that
Terraform wanted to remove the manually configured `smtp_server` block from the
realm. That would have recreated the exact "SMTP works until the next apply"
failure we were trying to avoid.

The underlying reason is straightforward:

- Keycloak realm policy belongs in Terraform
- SMTP secrets do not belong in Terraform state
- but `keycloak_realm` still sees the remote `smtp_server` block during refresh

The right fix was **not** to push SMTP secrets into Terraform. Instead I updated
the shared realm module to ignore `smtp_server` drift:

- `/home/manuel/code/wesen/terraform/keycloak/modules/realm-base/main.tf`

I also changed the hosted `hair-booking` env default so `verify_email` is now
treated as the normal hosted default:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`

After that, the hosted Terraform plan became clean again:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
export TF_VAR_realm_name=hair-booking
export TF_VAR_realm_display_name=hair-booking
terraform -chdir=keycloak/apps/hair-booking/envs/hosted validate
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan
```

The plan now showed exactly one change:

- `verify_email: false -> true`

and no longer tried to delete the SMTP config.

I applied that safely:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
export TF_VAR_realm_name=hair-booking
export TF_VAR_realm_display_name=hair-booking
terraform -chdir=keycloak/apps/hair-booking/envs/hosted apply -auto-approve
```

Then I re-read the live realm through the Keycloak admin API and confirmed the
final state:

- `registrationAllowed: true`
- `resetPasswordAllowed: true`
- `rememberMe: true`
- `verifyEmail: true`
- `smtpServer.host: email-smtp.us-east-1.amazonaws.com`
- `smtpServer.port: 587`
- `smtpServer.from: no-reply@mail.scapegoat.dev`

This completed the main hosted SMTP/verify-email slice cleanly. The remaining
auth work after this point is no longer SES wiring. It is signup-flow validation
and then Google/Facebook rollout.

After the SMTP/verify-email slice was stable, I switched to a browser-driven
hosted signup smoke with Playwright.

I used the live hosted portal and Keycloak registration flow. To keep the send
path automated, I reused the SES mailbox simulator recipient
`success@simulator.amazonses.com`. That required deleting the earlier
`hair-booking-ses-smtp-probe` user first so the email address was free again.

The registration created:

- username: `hb-smoke-20260325a`
- email: `success@simulator.amazonses.com`

The important browser result was the Keycloak verify-email gate:

```text
You need to verify your email address to activate your account.
An email with instructions to verify your email address has been sent to your address success@simulator.amazonses.com.
```

That proved the real hosted user path up to the verification step:

- public self-registration is enabled
- the user record is created
- verify-email mail is sent
- the browser is correctly gated until verification

I confirmed through the admin API that the created user was still
`emailVerified: false`.

Because the SES mailbox simulator does not expose a mailbox to click through, I
did one admin-assisted step solely to validate the post-verification path: I set
`emailVerified = true` for that exact test user through the admin API. That does
**not** count as mailbox-driven verification completion, so the task list still
marks true end-to-end verification as pending.

I then exercised the hosted forgot-password page and got the real browser
confirmation:

```text
You should receive an email shortly with further instructions.
```

So the hosted Keycloak-side user flow now proves:

- registration mail is sent
- verify-email gating is enforced
- forgot-password mail is sent

The next check should have been "verified user can log into the app and the app
bootstraps the local client row correctly." That is where the next blocker
appeared.

After a successful Keycloak sign-in with the verified test user, the hosted app
returned:

```text
Client service is not configured.
```

That error comes from:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/pkg/server/handlers_me.go`

where `/api/me` bails out if `clientService` is nil.

I inspected the live Coolify app env:

```bash
ssh manuel@89.167.52.236 'sudo -n sed -n "1,240p" /data/coolify/applications/uion8lttbypsijf8ww9b4c3e/.env'
```

The env contains the OIDC settings, but no database URL at all. That explains
the behavior:

- auth callback succeeds
- `/api/me` runs
- the backend cannot build `ClientService` because there is no configured DB
- portal bootstrap fails with `backend-not-configured`

This is not a Keycloak bug. It is a hosted app deployment/configuration gap.

For HAIR-010, the practical consequence is:

- Keycloak-side hosted signup and reset initiation are proven
- app login after verification is blocked by missing hosted DB config
- duplicate-client-row validation is blocked by the same hosted app issue

## 2026-03-24

The user asked for a proper Keycloak setup that separates `hair-booking` from `smailnail` and supports:

- signup with login/password
- Google SSO
- Facebook SSO
- Instagram SSO

The first pass put that plan into `docs/`, but the user explicitly wanted this to live in a `docmgr` ticket instead. So the auth guide was moved out of the repo docs and into `HAIR-010`.

The key architectural conclusion is straightforward:

- do not keep using the shared `smailnail` realm
- do not jump immediately to a second Keycloak server either
- create a dedicated `hair-booking` realm on the existing Keycloak server first

That gives separation where it matters most for product behavior:

- users
- clients
- identity providers
- branding
- registration policy

while keeping operations simple.

The official Keycloak docs also forced one important correction:

- Google and Facebook are straightforward built-in social brokers
- Instagram exists, but Keycloak documents it as deprecated for removal and recommends preferring the Facebook broker instead
- Instagram also requires the `instagram-broker` feature to be enabled

That means the product request “Google + Facebook/Instagram SSO” should not be interpreted as “Instagram is equally safe and ready.” It is supported, but it should be treated as a later, more cautious rollout.

The resulting recommendation is:

1. separate realm now
2. local signup with password reset and email verification
3. Google
4. Facebook
5. Instagram only if the business case is strong enough to justify the extra maintenance and provider risk

Later the user asked for a more implementation-heavy guide that explains how the Terraform work should actually happen. That forced a second pass over the infrastructure repo at `/home/manuel/code/wesen/terraform`, because the migration details are easy to get wrong if you only think in app-repo terms.

The most important infrastructure finding is that the hosted `hair-booking` Terraform workspace still does **not** own a realm. It only manages one browser client inside `smailnail`. In contrast, local `hair-booking` Terraform already creates its own realm, and hosted `smailnail` already demonstrates the full hosted-realm ownership pattern. That means the migration should not invent a new Terraform architecture. It should promote hosted `hair-booking` into an ownership model that already exists elsewhere in the shared repo.

After that Terraform review, the user clarified an important product fact: this auth setup is still pre-production. That changes the migration recommendation materially.

Because there are no real customer users depending on login continuity yet, the guide no longer needs a temporary overlap phase. The cleaner approach is now a hard cutover:

- update hosted `hair-booking` Terraform so it owns the `hair-booking` realm directly
- create the dedicated `hair-booking-web` client in that realm
- switch the app to the new issuer and secret
- remove stale shared-realm assumptions from docs and deployment examples

That is simpler, easier for an intern to reason about, and better aligned with the real stage of the product.

The Terraform review also confirmed that social-provider rollout should probably be split from the realm migration. The shared Terraform repo currently has reusable realm and browser-client modules, but no existing identity-provider resources. So Google and Facebook should be treated as a second, follow-on codification step after the dedicated realm is stable.

After that planning pass, the user said to go ahead and execute the tasks instead of stopping at design. I started with the hosted Terraform cutover because that was the highest-leverage slice and because the shared repo already had the right primitives. The concrete code changes were:

- add `module "realm"` to `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`
- point the hosted `browser_client` at `module.realm.id` instead of the old shared-realm name
- add `realm_display_name` to `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`
- change the hosted example tfvars from `smailnail` to `hair-booking`

I validated the new hosted env with:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
terraform -chdir=keycloak/apps/hair-booking/envs/hosted init
terraform -chdir=keycloak/apps/hair-booking/envs/hosted validate
export TF_VAR_realm_name=hair-booking
export TF_VAR_realm_display_name=hair-booking
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan
```

The important plan result was clean enough for a hard cutover:

- `module.realm.keycloak_realm.this` would be created as realm `hair-booking`
- `module.browser_client.keycloak_openid_client.this` would be replaced because `realm_id` was changing from `smailnail`
- there were no unrelated `smailnail` resources in the plan

Because the user had already clarified that the app is not yet in production, I applied the cutover immediately:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
export TF_VAR_realm_name=hair-booking
export TF_VAR_realm_display_name=hair-booking
terraform -chdir=keycloak/apps/hair-booking/envs/hosted apply -auto-approve
```

That completed successfully with:

- 2 resources added
- 1 resource destroyed
- outputs:
  - `browser_client_id = "hair-booking-web"`
  - `public_callback_url = "https://hair-booking.app.scapegoat.dev/auth/callback"`
  - `realm_name = "hair-booking"`

After the Keycloak side was live, I verified the new issuer document directly:

```bash
curl -fsS https://auth.scapegoat.dev/realms/hair-booking/.well-known/openid-configuration | jq -r '.issuer,.authorization_endpoint,.token_endpoint'
```

That returned the expected hosted `hair-booking` realm URLs.

The next operational step was the app runtime cutover on the Coolify host. Since the same client secret value was reused for the new realm client, the only runtime change needed was the issuer URL. I inspected the deployed app under:

- `/data/coolify/applications/uion8lttbypsijf8ww9b4c3e/.env`
- `/data/coolify/applications/uion8lttbypsijf8ww9b4c3e/docker-compose.yaml`

Then I updated the live env file on `89.167.52.236` and restarted the app with:

```bash
ssh manuel@89.167.52.236
sudo -n python3 - <<'PY'
from pathlib import Path
path = Path("/data/coolify/applications/uion8lttbypsijf8ww9b4c3e/.env")
text = path.read_text()
path.write_text(text.replace(
    "HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.scapegoat.dev/realms/smailnail",
    "HAIR_BOOKING_OIDC_ISSUER_URL=https://auth.scapegoat.dev/realms/hair-booking",
    1,
))
PY
sudo -n bash -lc 'cd /data/coolify/applications/uion8lttbypsijf8ww9b4c3e && docker compose up -d'
```

I hit one minor operator error there: the first restart attempt failed with `Permission denied` because I tried to `cd` into the Coolify app directory before elevating the whole shell. The fix was to wrap the `cd` and `docker compose up -d` in `sudo -n bash -lc '...'`.

After the restart, the hosted runtime validated cleanly:

```bash
curl -i -sS https://hair-booking.app.scapegoat.dev/api/info
curl -I -sS https://hair-booking.app.scapegoat.dev/auth/login
```

The important results were:

- `/api/info` now reports `"issuerUrl":"https://auth.scapegoat.dev/realms/hair-booking"`
- `/auth/login` now redirects into `https://auth.scapegoat.dev/realms/hair-booking/protocol/openid-connect/auth?...`

With the infrastructure and runtime updated, I finished the slice by cleaning the written operator story in both repos:

- app repo deployment docs now reference the dedicated `hair-booking` realm instead of `smailnail`
- shared Terraform repo docs now describe hosted `hair-booking` as an app-owned realm, not as a client-only tenant of the shared realm

After that implementation slice, the user asked for a definitive plan instead of more execution. The key product/ops decisions are now locked in the ticket so that implementation can continue without re-litigating scope every turn.

The most important planning decisions that were set are:

- keep the hosted dedicated realm and shared Keycloak server model
- keep both local realm names for now instead of forcing a cleanup rename
- keep local password signup in MVP scope
- require verified email before calling signup complete
- use Amazon SES later for SMTP, but do not block planning on the SMTP credentials existing yet
- keep Google and Facebook in scope
- drop Instagram from the initial MVP plan
- roll out Google and Facebook manually in Keycloak first, not Terraform-first
- treat the Keycloak subject as the canonical auth identity

That changed the task list from a mixed research/implementation scratchpad into a phased execution checklist:

1. hosted realm cutover
2. hosted runtime alignment
3. documentation alignment
4. local alignment
5. realm login settings
6. SES-backed SMTP preparation
7. local signup validation
8. Google rollout
9. Facebook rollout

The point of that restructuring is to make the next review easy. The user can now look at the ticket and decide whether they agree with:

- the product scope
- the operational order
- the specific follow-on tasks

before more code or admin-console changes happen.

After that review checkpoint, the user approved the plan and asked to continue task by task with commits and a detailed diary. I took the next lowest-risk slice first: local alignment.

This slice did not change runtime behavior. Its job was to make the local/operator story explicit so a new intern does not confuse the two local realm names.

The specific clarification implemented is:

- `hair-booking-dev`
  - the repo-local imported realm used for normal application development
- `hair-booking-dev-tf`
  - the Terraform sandbox realm used to test Keycloak Terraform itself

I updated these docs to say that directly:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/deployments/terraform/keycloak/README.md`
- `/home/manuel/code/wesen/terraform/keycloak/README.md`
- `/home/manuel/code/wesen/terraform/docs/shared-keycloak-platform-playbook.md`

The app README also got one more important correction while I was there: the production note now says hosted `hair-booking` uses the dedicated `hair-booking` realm, not the old shared `smailnail` realm.

To review for residual ambiguity, I used targeted grep passes instead of editing blindly:

```bash
rg -n "hair-booking-dev-tf|hair-booking-dev" \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/README.md \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs \
  /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/deployments/terraform/keycloak/README.md -S

rg -n "hair-booking-dev-tf|hair-booking-dev" \
  /home/manuel/code/wesen/terraform/keycloak/README.md \
  /home/manuel/code/wesen/terraform/docs/shared-keycloak-platform-playbook.md \
  /home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local -S
```

That review showed the remaining mentions are now intentional references rather than mismatched instructions. This let me check off three Phase 4 tasks:

- explain why both realms exist
- review examples for ambiguity
- update the docs where the ambiguity could mislead a new operator

The next task after local alignment was the first real realm-settings slice. Before changing anything, I queried the live hosted `hair-booking` realm through the Keycloak admin API using the same admin credentials already loaded in `/home/manuel/code/wesen/terraform/.envrc`.

The read-only check was:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
ACCESS_TOKEN=$(curl -fsS -X POST "$TF_VAR_keycloak_url/realms/master/protocol/openid-connect/token" \
  -d grant_type=password \
  -d client_id=$TF_VAR_keycloak_client_id \
  --data-urlencode username=$TF_VAR_keycloak_username \
  --data-urlencode password=$TF_VAR_keycloak_password | jq -r .access_token)

curl -fsS -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking" | jq '{
    realm,
    displayName,
    registrationAllowed,
    loginWithEmailAllowed,
    duplicateEmailsAllowed,
    resetPasswordAllowed,
    rememberMe,
    verifyEmail,
    registrationEmailAsUsername,
    editUsernameAllowed,
    bruteForceProtected,
    sslRequired
  }'
```

That returned:

- `registrationAllowed: true`
- `resetPasswordAllowed: true`
- `rememberMe: false`
- `verifyEmail: false`
- `bruteForceProtected: false`

The next question was whether those settings could be codified in Terraform or whether I would have to make them manually in the admin UI. I did not want to guess provider field names, so I queried the Keycloak provider schema in a temporary standalone Terraform directory. That confirmed:

- `remember_me` is supported
- `verify_email` is supported
- no obvious brute-force protection attributes are exposed through `keycloak_realm` in this provider

Because SES is not configured yet, the safest incremental change was:

- enable `remember_me` now
- leave `verify_email` false until SMTP exists

I extended the shared Terraform module in:

- `/home/manuel/code/wesen/terraform/keycloak/modules/realm-base/main.tf`
- `/home/manuel/code/wesen/terraform/keycloak/modules/realm-base/variables.tf`

and then set hosted `hair-booking` to:

- `remember_me = true`
- `verify_email = var.verify_email`

with hosted default:

- `verify_email = false`

Then I validated and planned the hosted env:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
export TF_VAR_realm_name=hair-booking
export TF_VAR_realm_display_name=hair-booking
terraform -chdir=keycloak/apps/hair-booking/envs/hosted validate
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan
```

The plan was exactly one in-place change:

- `remember_me: false -> true`

That was the right scope for this slice, so I committed the Terraform code and applied it:

```bash
terraform -chdir=keycloak/apps/hair-booking/envs/hosted apply -auto-approve
```

After apply, I re-ran the admin API check and confirmed the hosted realm now reads:

- `registrationAllowed: true`
- `resetPasswordAllowed: true`
- `rememberMe: true`
- `verifyEmail: false`

This means the realm is in the best state currently possible without SMTP:

- users can register
- users can reset passwords
- users can use remember-me
- email verification is intentionally still blocked on the future SES slice

From there I moved into the real SES SMTP rollout and hosted signup validation.
The important architectural choice in this slice was to keep SMTP secrets out of
git and out of Terraform state. The shared Terraform repo already owns the SES
control plane, but not the SMTP password material. I followed that split rather
than fighting it:

- Terraform keeps owning SES identity, DKIM, MAIL FROM, and monitoring
- a local operator-only env file keeps the SMTP username/password for now
- Keycloak realm policy stays in Terraform
- Keycloak `smtpServer` stays operator-managed, with Terraform configured to
  ignore that remote drift

I added two rerunnable HAIR-010 scripts in the ticket so the operator workflow
is reproducible:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/create_hair_booking_ses_smtp_credentials.sh`
- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh`

The credential generator script created the dedicated SMTP IAM user
`hair-booking-ses-smtp-prod`, derived an SES SMTP password from the IAM secret,
and wrote the result to:

- `/home/manuel/.config/hair-booking/hosted-keycloak-smtp.env`

That file is local-only, outside git, and intentionally temporary until the
user moves it into the shared vault. The first version of the generator had a
real bug: it wrote `KEYCLOAK_SMTP_FROM_DISPLAY_NAME=Hair Booking` without shell
escaping, which broke `source` with `Booking: command not found`. I fixed the
script to write shell-safe values and repaired the local env file in place.

The next failure was more subtle. The initial Keycloak admin update succeeded,
but the execute-actions-email smoke path returned a `500`. I pulled the live
Keycloak logs from the Coolify host:

```bash
ssh manuel@89.167.52.236 'sudo -n docker logs --tail 80 keycloak-k12lm4blpo13louovn3pfsgs 2>&1 | tail -80'
```

The actual root cause was in the log output:

```text
554 Message rejected: Email address is not verified. The following identities failed the check in region US-EAST-1: ...
```

That turned out to be a partial diagnosis only. After correcting the sender
shape and the execute-actions-email redirect handling, the more important error
was:

```text
554 Access denied ... not authorized to perform ses:SendRawEmail on resource arn:aws:ses:us-east-1:745667007186:configuration-set/mail-scapegoat-dev
```

The IAM policy I had generated for the SMTP user only allowed the SES identity
ARN. Hosted Keycloak was also sending with the configuration set
`mail-scapegoat-dev`, so the policy needed both resources. I updated the script
to allow:

- `arn:aws:ses:us-east-1:745667007186:identity/mail.scapegoat.dev`
- `arn:aws:ses:us-east-1:745667007186:configuration-set/mail-scapegoat-dev`

I also made the script rerunnable: if the IAM access key already exists and the
local operator env file already exists, the script now refreshes the inline
policy and exits cleanly instead of failing.

After that policy fix, the live Keycloak smoke succeeded. I verified both action
email flows through the admin API against the SES simulator address
`success@simulator.amazonses.com`:

```bash
curl -i -X PUT \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking/users/$USER_ID/execute-actions-email?lifespan=1800" \
  --data '["VERIFY_EMAIL"]'

curl -i -X PUT \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking/users/$USER_ID/execute-actions-email?lifespan=1800" \
  --data '["UPDATE_PASSWORD"]'
```

Both returned `204 No Content`, which is the Keycloak success path for action
emails.

The next risk was Terraform drift. Once SMTP existed in the remote realm, a
plain `terraform plan` for hosted `hair-booking` wanted to wipe the entire
`smtp_server` block because the Keycloak provider configuration does not own it
in the current shared module design. That would have made `verify_email = true`
dangerous. The fix was to update the shared realm module in:

- `/home/manuel/code/wesen/terraform/keycloak/modules/realm-base/main.tf`

with:

```hcl
lifecycle {
  ignore_changes = [
    smtp_server,
  ]
}
```

Then I promoted hosted `verify_email` from `false` to `true` in:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`

I validated and applied that change, then rechecked the live realm state. The
final hosted realm result after apply was:

- `registrationAllowed: true`
- `resetPasswordAllowed: true`
- `rememberMe: true`
- `verifyEmail: true`
- `smtpServer` still present with the SES settings

With hosted Keycloak fixed, I moved into end-to-end hosted browser validation.
Using Playwright against `https://hair-booking.app.scapegoat.dev/portal`, I
registered a fresh account:

- username: `hb-smoke-20260325a`
- email: `success@simulator.amazonses.com`
- password: `SmokePass!2026`

The browser reached the expected verify-email gate and displayed the normal
Keycloak message telling the user that an email had been sent. I separately
confirmed through the admin API that the new user existed and had
`emailVerified: false`.

I then verified hosted password-reset initiation through the browser by using
Keycloak's `Forgot Password?` flow for that same user. The browser showed the
normal reset-mail confirmation message. At that point the Keycloak side was
working, but the app itself still failed after successful auth with:

```text
Client service is not configured.
```

That failure was not an auth issue. I traced it to the hosted app runtime:

```bash
curl -sS https://hair-booking.app.scapegoat.dev/api/info | jq
```

The result showed `databaseConfigured: false`. I inspected the live Coolify app
env on the host and found the missing piece: the deployed app had OIDC vars, but
no `HAIR_BOOKING_DATABASE_URL` at all. That made `/api/me` fail even after a
successful auth callback.

I located the live hosted Postgres container on the Coolify host:

- container: `go1o5tbegalwy3kesshq3hcp`
- network alias usable from the app container: `go1o5tbegalwy3kesshq3hcp`
- database: `postgres`

Then I updated the live app env file on the host:

- `/data/coolify/applications/uion8lttbypsijf8ww9b4c3e/.env`

to include `HAIR_BOOKING_DATABASE_URL`, and recreated the app container with:

```bash
ssh manuel@89.167.52.236 'sudo -n bash -lc "cd /data/coolify/applications/uion8lttbypsijf8ww9b4c3e && docker compose up -d"'
```

That cleared the deployment blocker. The validation after restart was:

```bash
curl -sS https://hair-booking.app.scapegoat.dev/api/info | jq
```

and the runtime now reports:

- `databaseConfigured: true`
- issuer still `https://auth.scapegoat.dev/realms/hair-booking`

So the important HAIR-010 state at the end of this slice is:

- hosted Keycloak realm separation is complete
- hosted signup/password-reset initiation is working
- hosted verify-email enforcement is enabled
- hosted SMTP is working through SES
- Terraform will no longer wipe manual SMTP settings
- the earlier hosted `backend-not-configured` blocker is fixed
- the remaining Phase 7 work is now true end-to-end account validation rather
  than environment repair

Once the app database blocker was gone, the next real end-to-end check was
repeat-login behavior. I wanted to prove two things:

- logout still works in the new dedicated realm
- logging in again updates the existing app-side client row instead of creating
  duplicates

The first repeat-login attempt exposed another authentic Keycloak client gap. I
triggered logout through the app:

```bash
https://hair-booking.app.scapegoat.dev/auth/logout
```

and Keycloak responded with:

```text
Invalid redirect uri
```

That narrowed the failure immediately. The app was sending
`post_logout_redirect_uri=https://hair-booking.app.scapegoat.dev/auth/logout/callback`,
which is correct for the backend, but the Terraform-managed client only allowed
the login callback in `valid_redirect_uris`. The browser-client module already
supports `valid_post_logout_redirect_uris`; the hosted `hair-booking` env had
simply never set it.

I fixed that in the shared Terraform repo:

- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf`
- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/variables.tf`
- `/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf`

The hosted client now includes:

- `https://hair-booking.app.scapegoat.dev/auth/logout/callback`

and the local dev client now includes the matching logout callbacks for `:8080`
and `:8081`.

While validating that change, I hit an operator sharp edge in the shared
Terraform repo. A plain:

```bash
source .envrc
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan
```

produced a dangerous plan that tried to move the realm back to `smailnail`. The
root cause was not the logout change itself. The shared `/home/manuel/code/wesen/terraform/.envrc`
still exports:

- `TF_VAR_realm_name=smailnail`

So hosted `hair-booking` work must override at least:

- `TF_VAR_realm_name=hair-booking`
- `TF_VAR_realm_display_name=hair-booking`

I re-ran the hosted plan and apply with those overrides pinned explicitly:

```bash
cd /home/manuel/code/wesen/terraform
source .envrc
TF_VAR_realm_name=hair-booking \
TF_VAR_realm_display_name=hair-booking \
terraform -chdir=keycloak/apps/hair-booking/envs/hosted plan

TF_VAR_realm_name=hair-booking \
TF_VAR_realm_display_name=hair-booking \
terraform -chdir=keycloak/apps/hair-booking/envs/hosted apply -auto-approve
```

That resulted in the intended one-line change only:

- add hosted `valid_post_logout_redirect_uris = ["https://hair-booking.app.scapegoat.dev/auth/logout/callback"]`

After apply, I re-ran the browser flow with Playwright:

1. log in to `/portal` with the verified smoke user
2. trigger `/auth/logout`
3. confirm Keycloak shows a real logout confirmation instead of `Invalid redirect uri`
4. confirm logout returns to `https://hair-booking.app.scapegoat.dev/booking`
5. go back to `/portal`
6. log in again with the same account

That full flow passed cleanly.

To verify the app-side persistence, I queried the hosted Postgres container on
the Coolify host before and after the repeat login:

```bash
ssh manuel@89.167.52.236 'sudo -n docker exec go1o5tbegalwy3kesshq3hcp \
  psql -U postgres -d postgres -c "select count(*) from clients;"'

ssh manuel@89.167.52.236 'sudo -n docker exec go1o5tbegalwy3kesshq3hcp \
  psql -U postgres -d postgres -c "select id, name, email, phone, created_at, updated_at from clients order by created_at desc limit 5;"'
```

The result after the first successful app login was one client row:

- `id = 8d22f1aa-7032-48bd-b1fc-7e5d3ea4c766`
- `name = SES Smoke`
- `email = success@simulator.amazonses.com`

After the second login, the table still contained exactly one row. The `id`
stayed the same and only `updated_at` advanced. That proves the repeat-login
path is reusing the existing app-side client record rather than creating a
duplicate.

I also verified the authenticated app payload directly from the browser session:

```javascript
await fetch('/api/me', { credentials: 'include' }).then(async (res) => ({
  status: res.status,
  body: await res.json(),
}))
```

The hosted response was `200` and contained:

- the stable `client.id` matching the database row
- `auth_subject` from the dedicated `hair-booking` realm
- `auth_issuer = https://auth.scapegoat.dev/realms/hair-booking`
- default `notification_prefs`

That closes the deployment-repair portion of Phase 7 and most of the real
runtime validation. The only remaining unchecked tasks in that phase now depend
on a real inbox rather than the SES simulator:

- following the verify-email link from the mailbox itself
- following the password-reset link from the mailbox itself

After closing the main validation loop, the user asked for a proper postmortem
that would work as intern onboarding material instead of just a chronological
diary. I added a dedicated document for that purpose:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/design/03-hair-booking-keycloak-auth-postmortem.md`

I intentionally separated that document from the implementation guide. The
implementation guides explain what to build and how to operate it. The
postmortem explains:

- what the final architecture actually is
- which boundaries failed during rollout
- what concrete mistakes were made
- how those mistakes were diagnosed
- what safeguards an intern should use next time

That split is important because operator history and system design are not the
same artifact. A new contributor usually needs both:

- the steady-state guide
- the story of how the system failed and was repaired

Later, the user confirmed that the real mailbox path now works end to end, not
just the simulator-triggered Keycloak actions. That closes the last meaningful
SES uncertainty in HAIR-010.

The confirmed real-mailbox outcomes are:

- verify-email mail is delivered to a real inbox
- clicking the verification link completes successfully
- forgot-password mail is delivered to a real inbox
- clicking the reset link and changing the password completes successfully

Because this is now no longer just ticket-local investigation knowledge, I
added a permanent operator runbook in the app repo:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-ses-verification-playbook.md`

That document is the standing runbook for:

- verifying Keycloak SMTP connectivity
- checking SES identity assumptions
- testing real mailbox delivery
- validating verify-email behavior
- validating forgot-password behavior

At this point, the remaining HAIR-010 work is no longer about SES or local
password signup. The remaining meaningful scope is:

- Google provider rollout
- Facebook provider rollout
- later cleanup decisions such as moving the SMTP secret to vault and deciding
  whether provider config should eventually live in Terraform

Later in the same day, the user pointed me at three Terraform-side handoff docs
for the planned SES-plus-Vault evolution:

- `/home/manuel/code/wesen/terraform/ttmp/2026/03/24/TF-002-SES-TERRAFORM--set-up-ses-with-terraform/playbook/02-ses-smtp-integration-playbook.md`
- `/home/manuel/code/wesen/terraform/ttmp/2026/03/25/TF-008-VAULT-AUTH-HARDENING--implement-vault-auth-hardening-with-keycloak-and-a-go-end-to-end-example/playbooks/02-vault-approle-go-example-developer-guide.md`
- `/home/manuel/code/wesen/terraform/ttmp/2026/03/25/TF-010-HAIR-BOOKING-VAULT-SES--integrate-hair-booking-with-vault-for-ses-smtp-credentials/playbooks/01-hair-booking-vault-ses-developer-handoff.md`

I re-read those before touching the app repo because the details matter. The
important platform contract from the Terraform side is now:

- Vault address: `https://vault.app.scapegoat.dev`
- auth path: `approle/`
- KV mount: `kv/`
- secret path: `kv/apps/hair-booking/prod/ses`
- intended AppRole name: `hair-booking-prod`

That clarified a subtle but important architecture point: the short-term goal is
not "teach Keycloak to read Vault directly." The app-repo responsibility is
smaller and more realistic:

1. accept AppRole bootstrap env vars
2. authenticate to Vault
3. read the SES secret at `kv/apps/hair-booking/prod/ses`
4. translate that secret into the Keycloak `smtpServer` payload
5. update hosted realm `hair-booking`

Based on that, I added six new HAIR-010 tasks with `docmgr --root` so the
ticket explicitly covered the Vault handoff:

- define the Vault-to-Keycloak SMTP flow and bootstrap inputs
- add a Vault AppRole-backed secret reader helper
- add a Keycloak SMTP sync helper path that consumes Vault
- document the operator workflow
- replace the local operator secret-file workflow as the canonical path
- validate the real hosted Vault-backed flow

The design/documentation portion came first. I updated the main HAIR-010 guide
so the intended steady-state model is written down in one place, including the
expected secret payload and required bootstrap env vars. I also added a
permanent app-repo runbook:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/docs/keycloak-vault-smtp-sync-playbook.md`

That runbook is deliberately separate from the SES verification playbook. The
Vault sync playbook is about getting secrets into Keycloak safely. The SES
verification playbook is about proving the email flows after that is done.

For implementation, I added a new helper:

- `scripts/read_hair_booking_vault_ses_secret.sh`

It does one narrow job:

- log into Vault with AppRole using `curl`
- read KV v2 secret `kv/apps/hair-booking/prod/ses`
- validate the expected fields
- write a shell-safe env file in the same `KEYCLOAK_SMTP_*` shape that the
  existing Keycloak sync script already understands

I intentionally made it produce the same env-file shape as the older local
operator secret file so I could evolve the source of truth without rewriting
the Keycloak side from scratch.

Then I updated the existing sync script:

- `scripts/configure_hosted_keycloak_smtp_and_smoke.sh`

It now supports three modes:

- `SMTP_SOURCE=vault`
- `SMTP_SOURCE=auto`
- `SMTP_SOURCE=file`

The important product decision in this slice is that the script now defaults to
`vault`. `file` still exists, but only as a legacy fallback. I also added a
warning when `file` mode is used so future operators do not accidentally keep
treating the old local secret file as the preferred path.

I checked the new helper and the updated sync script with:

```bash
bash -n /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/read_hair_booking_vault_ses_secret.sh
bash -n /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh
docmgr doctor --ticket HAIR-010 --stale-after 30
```

All of those checks passed.

I also checked for already-delivered `hair-booking-prod` AppRole material before
claiming the Vault cutover was done. The result was clear:

- the Terraform docs define the intended role name and secret path
- local operator storage only contains the older `go-example-prod` AppRole
  JSON, not a `hair-booking-prod` one
- there is no active `VAULT_TOKEN` in the shell right now

That means the current state is:

- the app-repo side is ready for Vault-backed SMTP sync
- the canonical workflow has been switched to Vault
- the older local secret file path is now explicitly legacy
- the final hosted validation still depends on delivered or minted
  `hair-booking-prod` AppRole material

So task 83 is complete, but task 84 remains intentionally open. That is the
right boundary: the design and tooling are in place, but I am not claiming a
successful hosted Vault replay without the real AppRole bootstrap values.

After that checkpoint, the user explicitly asked me to do the Vault side too as
part of `HAIR-010` and `TF-010` instead of stopping at "prepared but blocked."
That changed the scope from app-only helper work into a paired app-plus-infra
execution slice.

I first checked whether the local machine still had the encrypted Vault
bootstrap material from the earlier infra ticket. The operator records were
present:

- `/home/manuel/.local/share/wesen/secrets/vault/vault.app.scapegoat.dev-init-20260325T180551.json.gpg`
- `/home/manuel/.local/share/wesen/secrets/vault/vault.app.scapegoat.dev-oidc-client-20260325T194200.json.gpg`

My first decryption attempt failed because the user had temporarily lost the
required GPG password. The exact failure was:

```text
gpg: public key decryption failed: Operation cancelled
gpg: decryption failed: Operation cancelled
```

Once the user recovered the password and told me to retry, the same decryption
path worked and I was able to continue with the live Vault side.

The Terraform repo work created three important pieces:

- `coolify/services/vault/policies/app-hair-booking-prod.hcl`
- `coolify/services/vault/scripts/seed_hair_booking_ses_secret.sh`
- `coolify/services/vault/scripts/generate_hair_booking_approle_material.sh`

The corresponding live infra work happened in this order:

1. decrypt the local Vault bootstrap root token
2. seed `kv/apps/hair-booking/prod/ses` from the current local SMTP env file
3. write the dedicated policy `app-hair-booking-prod`
4. create AppRole `hair-booking-prod`
5. mint one local-only JSON file containing the AppRole material
6. verify that the new AppRole can read its own secret and is denied from a
   sibling app subtree

The first live seed attempt failed with a real schema mismatch:

```text
missing required SMTP value in /home/manuel/.config/hair-booking/hosted-keycloak-smtp.env: KEYCLOAK_SMTP_CONFIGURATION_SET
```

That older local operator file had been created before the Vault-side contract
was finalized, so it did not carry the configuration-set field yet. The fix was
not to hand-edit the secret file. I patched the Terraform-side seed script to
default:

- `KEYCLOAK_SMTP_CONFIGURATION_SET=mail-scapegoat-dev`

That made the live seed succeed without changing the older local file by hand.

After the secret seed and AppRole generation succeeded, the local-only AppRole
record landed here:

- `/home/manuel/.local/share/wesen/secrets/vault/hair-booking-prod-approle-20260325T204940.json`

The most important validation before touching hosted Keycloak was the policy
boundary proof. Using the new `role_id` and `secret_id`, I authenticated
directly to Vault and verified:

- `200` for `kv/apps/hair-booking/prod/ses`
- `403 permission denied` for `kv/apps/go-example/prod`

That confirmed the Vault side was actually least privilege, not just nominally
configured.

Then I moved back into the app repo and tried the first real app-side replay.
The first goal was to prove that the app helper could read the newly written
Vault secret and materialize the expected `KEYCLOAK_SMTP_*` env file. My first
validation command used `mktemp` for the output path and immediately exposed a
bug in the app-side helper:

```bash
OUTPUT_FILE=$(mktemp)
VAULT_ADDR=...
VAULT_ROLE_ID=...
VAULT_SECRET_ID=...
...
read_hair_booking_vault_ses_secret.sh
```

The failure was:

```text
chmod: changing permissions of '/tmp': Operation not permitted
```

The cause was in the helper itself. It tried to `chmod 700 "$(dirname
"$OUTPUT_FILE")"` unconditionally. That is wrong when the output file lives in
`/tmp`, because the helper should not attempt to change the shared temp
directory. I fixed that by changing the helper to only create and chmod the
directory if it does not already exist.

After that fix, the app-side Vault read worked correctly and produced the full
sanitized shape:

- `KEYCLOAK_SMTP_HOST`
- `KEYCLOAK_SMTP_PORT`
- `KEYCLOAK_SMTP_USERNAME`
- `KEYCLOAK_SMTP_PASSWORD`
- `KEYCLOAK_SMTP_FROM`
- `KEYCLOAK_SMTP_FROM_DISPLAY_NAME`
- `KEYCLOAK_SMTP_REPLY_TO`
- `KEYCLOAK_SMTP_REPLY_TO_DISPLAY_NAME`
- `KEYCLOAK_SMTP_STARTTLS`
- `KEYCLOAK_SMTP_SSL`
- `KEYCLOAK_SMTP_CONFIGURATION_SET`
- `VAULT_SECRET_SOURCE`

The next step was the real hosted replay:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking
json_path=$(ls -t /home/manuel/.local/share/wesen/secrets/vault/hair-booking-prod-approle-*.json | head -n1)
source /home/manuel/code/wesen/terraform/.envrc

VAULT_ADDR=$(jq -r '.vault_addr' "$json_path") \
VAULT_ROLE_ID=$(jq -r '.role_id' "$json_path") \
VAULT_SECRET_ID=$(jq -r '.secret_id' "$json_path") \
VAULT_APPROLE_AUTH_PATH=$(jq -r '.auth_path' "$json_path") \
VAULT_KV_MOUNT=$(jq -r '.kv_mount' "$json_path") \
VAULT_SECRET_PATH=$(jq -r '.secret_path' "$json_path") \
SMTP_SOURCE=vault \
TEST_EMAIL=success@simulator.amazonses.com \
TEST_USERNAME=hair-booking-ses-smtp-probe \
./ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/scripts/configure_hosted_keycloak_smtp_and_smoke.sh
```

The first run failed with:

```text
curl: (22) The requested URL returned error: 409
```

That error was not a Vault problem. I traced it to the smoke helper's probe
user logic. The script searched for an existing user by username only. But the
simulator email `success@simulator.amazonses.com` already belonged to an older
probe user with a different username.

I confirmed that by querying Keycloak directly:

```bash
curl -fsS -H "Authorization: Bearer $admin_token" \
  "$TF_VAR_keycloak_url/admin/realms/hair-booking/users?email=success@simulator.amazonses.com" |
  jq '[.[] | {id,username,email}]'
```

The result showed:

- username `hb-smoke-20260325a`
- email `success@simulator.amazonses.com`

and the requested username `hair-booking-ses-smtp-probe` did not exist.

That meant the script was trying to create a new user with an email that was
already in use, which explains the `409`. I fixed the smoke helper so it now:

1. looks up by username first
2. if not found, looks up by email
3. only then attempts user creation

After that fix, the hosted Vault-backed replay succeeded cleanly. The script
returned:

- hosted realm `hair-booking`
- `verifyEmail: true`
- SMTP host `email-smtp.us-east-1.amazonaws.com`
- port `587`
- sender `no-reply@mail.scapegoat.dev`
- user field populated from the Vault-backed secret
- confirmation that `VERIFY_EMAIL` and `UPDATE_PASSWORD` mails were triggered
  to `success@simulator.amazonses.com`

That closes the real technical uncertainty around task 84. The hosted Keycloak
realm can now be configured from Vault-backed SMTP secrets through the new
AppRole, and the smoke flow works through the exact helper path that will be
used by operators in the future.

After finishing the live cutover, the user asked for a more explicit,
intern-facing postmortem that focused on the SES plus Vault phase rather than
the earlier realm cutover alone. I added a second postmortem for that purpose:

- `/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/ttmp/2026/03/24/HAIR-010--separate-hair-booking-keycloak-realm-and-add-signup-social-login/design/04-hair-booking-ses-vault-cutover-postmortem.md`

That document intentionally complements the earlier postmortem instead of
replacing it:

- `03-...` explains the broader auth-cutover story
- `04-...` explains the final SES and Vault AppRole cutover, the exact live
  command flow, the bugs we hit in the helpers, the operator boundary, and the
  resulting steady-state model

This split is useful for new contributors because the Vault-specific failures
were not just "more auth work." They were a separate operational layer with
their own secret-management assumptions and their own debugging sequence.
