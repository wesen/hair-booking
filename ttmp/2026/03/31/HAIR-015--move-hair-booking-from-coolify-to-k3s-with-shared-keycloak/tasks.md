# Tasks

## Completed

- [x] Create `HAIR-015` ticket workspace
- [x] Gather evidence from the current Coolify deployment docs, app runtime code, and the Hetzner K3s platform repo
- [x] Write the detailed migration analysis / design / implementation guide
- [x] Write an investigation diary entry for the research and documentation pass
- [x] Validate the ticket with `docmgr doctor --ticket HAIR-015 --stale-after 30`
- [x] Upload the ticket bundle to reMarkable at `/ai/2026/03/31/HAIR-015`

## Implementation Queue

### Phase 0: Lock the rollout contract

- [x] Decide the parallel K3s hostname for the first rollout
- [x] Decide whether `hair-booking` images will be public in GHCR or require a Vault-backed image pull secret
- [x] Confirm that the K3s rollout should switch to the in-cluster Keycloak at `https://auth.yolo.scapegoat.dev/realms/hair-booking`
- [x] Assume the shared Keycloak Terraform browser-client path still needs explicit post-logout redirect support verification

### Phase 1: Source repo deployment automation

- [x] Add a production image publish workflow in `.github/workflows/publish-image.yaml`
  Reference: `/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/templates/github/publish-image-ghcr.template.yml`
- [x] Add `deploy/gitops-targets.json` so the source repo knows which K3s manifest to update
  Reference: `/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/examples/platform/image-gitops-targets.example.json`
- [x] Add or reuse the GitOps PR opener script pattern used by the K3s source-app deployment workflow
  Reference: `/home/manuel/workspaces/2026-03-02/os-openai-app-server/infra-tooling/scripts/gitops/open_gitops_pr.py`
- [x] Verify CI publishes immutable `sha-XXXXXXX` image tags to GHCR

### Phase 2: Shared Keycloak Terraform

- [x] Add a K3s-targeted Terraform environment for `hair-booking` in the shared Keycloak repo
- [x] Create or update realm `hair-booking` against the K3s Keycloak instance
- [x] Create or update client `hair-booking-web`
- [x] Ensure redirect URI and post-logout redirect URI match the K3s hostname exactly

### Phase 3: K3s GitOps package

- [x] Add `gitops/kustomize/hair-booking/namespace.yaml`
- [x] Add service account, Vault connection, Vault auth, runtime secret, and optional image-pull secret resources
- [x] Add the PostgreSQL bootstrap `Job` and its ConfigMap and service account
- [x] Add the `Deployment`, `Service`, `Ingress`, and PVC for upload persistence
- [x] Add `gitops/applications/hair-booking.yaml`

### Phase 4: Vault data and runtime contract

- [x] Write the `kv/apps/hair-booking/prod/runtime` secret payload in Vault
- [x] Add `kv/apps/hair-booking/prod/image-pull` if GHCR remains private
- [x] Verify the runtime secret contains both app env values and the split database fields needed by the bootstrap `Job`

### Phase 5: Cluster bootstrap and smoke

- [x] Apply the new Argo CD `Application` once with `kubectl apply`
- [x] Wait for the namespace, secrets, bootstrap `Job`, PVC, deployment, service, and ingress to reconcile
- [x] Verify `/healthz`, `/api/info`, and `/auth/login` on the K3s hostname
- [ ] Verify a full browser `/api/me` login flow on the K3s hostname with a real stylist account
- [x] Verify upload persistence survives a pod restart
- [x] Restore the Coolify PostgreSQL data into the K3s `hair_booking` database
- [x] Repair table ownership and grants after restore so the `hair_booking` app role can run migrations

### Phase 6: Cutover and cleanup

- [x] Decide whether to keep the K3s hostname as the permanent public URL or cut the existing public hostname over to K3s
- [x] Switch DNS only after browser login redirect and upload persistence are proven on K3s
- [ ] Update runbooks to point at the K3s deployment as canonical
- [x] Leave Coolify intact until rollback is no longer needed
