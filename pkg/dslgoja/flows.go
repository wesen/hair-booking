package dslgoja

import _ "embed"

// DemoIntakeFlowSource is a two-step Goja-hosted intake flow used by tests and
// the first backend DSL prototype.
//
//go:embed flows/intake.flow.js
var DemoIntakeFlowSource string
