package admindsl

// GojaModule returns a controlled host object intended to be installed into a
// Goja runtime. The fluent objects returned from these functions are Go host
// builders, so schema validity and JSON serialization remain owned by this
// package rather than by JavaScript helper code.
func GojaModule() map[string]any {
	return map[string]any{
		"pageResource":  PageResource,
		"pageAdmin":     PageAdmin,
		"section":       Section,
		"resourceList":  ResourceList,
		"resourceRow":   ResourceRow,
		"form":          Form,
		"fieldGroup":    FieldGroup,
		"textField":     TextField,
		"drawer":        Drawer,
		"modal":         Modal,
		"sheet":         Sheet,
		"detailPanel":   DetailPanel,
		"inlinePanel":   InlinePanel,
		"confirmDialog": ConfirmDialog,
		"open":          Open,
		"primary":       Primary,
		"secondary":     Secondary,
		"danger":        Danger,
	}
}
