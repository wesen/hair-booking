package admindsl

// GojaModule returns a controlled host object intended to be installed into a
// Goja runtime. The fluent objects returned from these functions are Go host
// builders, so schema validity and JSON serialization remain owned by this
// package rather than by JavaScript helper code.
func GojaModule() map[string]any {
	surface := map[string]any{
		"drawer":      Drawer,
		"modal":       Modal,
		"sheet":       Sheet,
		"detailPanel": DetailPanel,
		"inlinePanel": InlinePanel,
		"confirm":     ConfirmDialog,
	}
	return map[string]any{
		"pageResource":    PageResource,
		"pageAdmin":       PageAdmin,
		"pageDashboard":   PageDashboard,
		"pageHeader":      PageHeader,
		"dashboardGrid":   DashboardGrid,
		"toolbar":         Toolbar,
		"panel":           Panel,
		"tabs":            Tabs,
		"previewFrame":    PreviewFrame,
		"comparisonTable": ComparisonTable,
		"monthCalendar":   MonthCalendar,
		"metricCard":      Metric,
		"emptyState":      EmptyState,
		"imageGallery":    ImageGallery,
		"markdown":        Markdown,
		"resourceTable":   ResourceTable,
		"filterBar":       FilterBar,
		"searchBox":       SearchBox,
		"form":            Form,
		"fieldGroup":      FieldGroup,
		"textField":       TextField,
		"surface":         surface,
		"open":            Open,
		"primary":         Primary,
		"secondary":       Secondary,
		"danger":          Danger,
	}
}
