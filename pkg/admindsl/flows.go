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

// IntakeAdminConfigHelpersFlowModule contains config editor mapping/parsing helpers.
//
//go:embed flows/intake_config_helpers.flow.js
var IntakeAdminConfigHelpersFlowModule string

// IntakeAdminConfigFormsFlowModule contains config editor drawer/form helpers.
//
//go:embed flows/intake_config_forms.flow.js
var IntakeAdminConfigFormsFlowModule string

// IntakeAdminRequestsFlowModule contains request queue/detail helpers required by IntakeAdminFlowSource.
//
//go:embed flows/intake_requests.flow.js
var IntakeAdminRequestsFlowModule string

// IntakeAdminOpsFlowModule contains audit, health, and preview helpers required by IntakeAdminFlowSource.
//
//go:embed flows/intake_ops.flow.js
var IntakeAdminOpsFlowModule string

type EmbeddedScriptModule struct {
	Name   string
	Source string
}

func IntakeAdminScriptModules() []EmbeddedScriptModule {
	return []EmbeddedScriptModule{
		{Name: "/flows/intake_config.flow.js", Source: IntakeAdminConfigFlowModule},
		{Name: "/flows/intake_config_helpers.flow.js", Source: IntakeAdminConfigHelpersFlowModule},
		{Name: "/flows/intake_config_forms.flow.js", Source: IntakeAdminConfigFormsFlowModule},
		{Name: "/flows/intake_requests.flow.js", Source: IntakeAdminRequestsFlowModule},
		{Name: "/flows/intake_ops.flow.js", Source: IntakeAdminOpsFlowModule},
	}
}

func IntakeAdminScriptModuleOptions() []ScriptRuntimeOption {
	modules := IntakeAdminScriptModules()
	options := make([]ScriptRuntimeOption, 0, len(modules))
	for _, module := range modules {
		options = append(options, WithScriptModule(module.Name, module.Source))
	}
	return options
}
