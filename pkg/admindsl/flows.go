package admindsl

import _ "embed"

// ServicesFlowSource is the real Goja-authored services/pricing Admin DSL flow.
//
//go:embed flows/services.flow.js
var ServicesFlowSource string
