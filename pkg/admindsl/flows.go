package admindsl

import _ "embed"

// ServicesFlowSource is the real Goja-authored services/pricing Admin DSL flow.
//
//go:embed flows/services.flow.js
var ServicesFlowSource string

// IntakeAdminFlowSource is the real Goja-authored intake admin backend flow.
//
//go:embed flows/intake_admin.flow.js
var IntakeAdminFlowSource string

// IntakeAdminConfigFlowModule contains the config-editor helper module required by IntakeAdminFlowSource.
//
//go:embed flows/intake_config.flow.js
var IntakeAdminConfigFlowModule string

// IntakeAdminRequestsFlowModule contains request queue/detail helpers required by IntakeAdminFlowSource.
//
//go:embed flows/intake_requests.flow.js
var IntakeAdminRequestsFlowModule string

// IntakeAdminOpsFlowModule contains audit, health, and preview helpers required by IntakeAdminFlowSource.
//
//go:embed flows/intake_ops.flow.js
var IntakeAdminOpsFlowModule string
