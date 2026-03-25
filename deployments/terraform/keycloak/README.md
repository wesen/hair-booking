# hair-booking Keycloak Terraform

This directory is no longer the canonical hosted Terraform location.

Use the shared infra repo instead:

- [keycloak/README.md](/home/manuel/code/wesen/terraform/keycloak/README.md)
- [apps/hair-booking/envs/local](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/local/main.tf)
- [apps/hair-booking/envs/hosted](/home/manuel/code/wesen/terraform/keycloak/apps/hair-booking/envs/hosted/main.tf)

The original repo-local scaffold remains as historical context for how the app
was first bootstrapped.

This directory is historical context only. The canonical hosted and local
Keycloak Terraform now lives in `/home/manuel/code/wesen/terraform`.

Important distinction:

- `hair-booking-dev`
  - the JSON-imported local realm used by the app repo day to day
- `hair-booking-dev-tf`
  - the Terraform sandbox realm used to test Keycloak Terraform without colliding with the imported local realm
- hosted `hair-booking`
  - now owns its own dedicated realm `hair-booking` in the shared Terraform repo

## Layout

- `modules/realm-base`
- `modules/browser-client`
- `envs/local`
- `envs/hosted`

## Local sandbox verification

The local Terraform environment creates a sandbox realm so it does not collide
with the JSON-imported `hair-booking-dev` realm from `docker-compose.local.yml`.

From:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/deployments/terraform/keycloak/envs/local
```

Run:

```bash
terraform init -backend=false
terraform validate
terraform plan \
  -var='keycloak_url=http://127.0.0.1:18090' \
  -var='realm_name=hair-booking-dev-tf' \
  -var='realm_display_name=hair-booking-dev-tf' \
  -var='web_client_secret=hair-booking-web-secret'
terraform apply -auto-approve \
  -var='keycloak_url=http://127.0.0.1:18090' \
  -var='realm_name=hair-booking-dev-tf' \
  -var='realm_display_name=hair-booking-dev-tf' \
  -var='web_client_secret=hair-booking-web-secret'
```

Verify:

```bash
curl -fsS \
  http://127.0.0.1:18090/realms/hair-booking-dev-tf/.well-known/openid-configuration \
  | jq -r '.issuer'
```

Expected output:

```text
http://127.0.0.1:18090/realms/hair-booking-dev-tf
```

## Hosted verification

The canonical hosted Terraform environment in `/home/manuel/code/wesen/terraform`
now assumes:

- the shared Keycloak server already exists
- hosted `hair-booking` owns a dedicated realm named `hair-booking`
- the `hair-booking-web` client lives inside that dedicated realm

From:

```bash
cd /home/manuel/workspaces/2026-03-19/hair-signup/hair-booking/deployments/terraform/keycloak/envs/hosted
```

Run:

```bash
terraform init -backend=false
terraform validate
terraform plan \
  -var='keycloak_url=https://auth.example.com' \
  -var='realm_name=hair-booking' \
  -var='realm_display_name=hair-booking' \
  -var='public_app_url=https://hair-booking.example.com' \
  -var='web_client_secret=replace-with-generated-secret' \
  -var='keycloak_username=replace-with-admin-username' \
  -var='keycloak_password=replace-with-admin-password'
```

This will manage:

- realm: `hair-booking`
- client ID: `hair-booking-web`
- redirect URI: `https://hair-booking.example.com/auth/callback`
- web origin: `https://hair-booking.example.com`
