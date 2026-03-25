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
LastUpdated: 2026-03-25T00:40:00-04:00
WhatFor: Use this to understand why the Keycloak plan moved into its own docmgr ticket and what conclusions were reached from the official docs.
WhenToUse: Use while implementing or reviewing HAIR-010.
---

# Investigation Diary

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
