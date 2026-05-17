package admindsl

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestGoHostBuilderEmitsStableAdminPageJSON(t *testing.T) {
	page, err := PageAdmin("services", "Services & pricing").
		Shell(ShellAdmin, JSONObject{"active": "services"}).
		Content(
			PageHeader(JSONObject{"title": "Services & pricing", "description": "Visible services become choices in the client intake flow."}).
				Actions(Open("service.new", "Add service").Intent(IntentPrimary).Priority(PriorityPrimary).Placement(PlacementPageHeader)),
			DashboardGrid(JSONObject{"columns": JSONObject{"desktop": 12}},
				Panel("Service menu", JSONObject{"padding": "none", "layout": JSONObject{"span": JSONObject{"desktop": 12}}},
					ResourceTable("services", JSONObject{
						"columns": []JSONValue{JSONObject{"id": "title", "label": "Service"}, JSONObject{"id": "subtitle", "label": "Details"}},
						"rows":    []JSONValue{JSONObject{"id": "cut", "title": "Cut", "subtitle": "60 min · $80+"}},
					}).Actions(Open("service.edit", "Edit").Payload(JSONObject{"id": "cut"}).Placement(PlacementRow)),
				),
			),
		).
		Drawers(
			Drawer("serviceEditor", JSONObject{"title": "Edit service", "open": true},
				Form("serviceForm", JSONObject{"dirty": true},
					FieldGroup("Basics", TextField("name", JSONObject{"label": "Name", "value": "Cut"})),
				).Actions(
					Primary("service.save", "Save").Placement(PlacementFormFooter),
					Secondary("service.cancel", "Cancel").Placement(PlacementFormFooter),
				),
			),
		).
		Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}

	data, err := json.MarshalIndent(page, "", "  ")
	if err != nil {
		t.Fatalf("marshal page: %v", err)
	}
	got := string(data)
	for _, want := range []string{
		`"schemaVersion": 2`,
		`"kind": "admin"`,
		`"kind": "pageHeader"`,
		`"kind": "dashboardGrid"`,
		`"kind": "resourceTable"`,
		`"target": "service.edit"`,
		`"placement": "row"`,
		`"kind": "drawer"`,
		`"dirty": true`,
		`"target": "service.save"`,
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("expected JSON to contain %s\n%s", want, got)
		}
	}

	var roundTrip Page
	if err := json.Unmarshal(data, &roundTrip); err != nil {
		t.Fatalf("round trip JSON: %v", err)
	}
	if err := ValidatePage(roundTrip); err != nil {
		t.Fatalf("validate round trip: %v", err)
	}
}

func TestGoHostBuilderRejectsInvalidV2Shapes(t *testing.T) {
	cases := []struct {
		name string
		page *PageBuilder
		want string
	}{
		{
			name: "page header title",
			page: PageAdmin("bad-header", "Bad").SchemaVersion(2).Content(PageHeader(JSONObject{})),
			want: "pageHeader requires props.title",
		},
		{
			name: "panel title",
			page: PageAdmin("bad-panel", "Bad").SchemaVersion(2).Content(NodeOf(NodePanel, JSONObject{})),
			want: "panel requires props.title",
		},
		{
			name: "resource table columns",
			page: PageAdmin("bad-table", "Bad").SchemaVersion(2).Content(ResourceTable("rows", JSONObject{"rows": []JSONValue{}})),
			want: "resourceTable requires non-empty props.columns",
		},
		{
			name: "comparison rows",
			page: PageAdmin("bad-comparison", "Bad").SchemaVersion(2).Content(ComparisonTable("changes", JSONObject{"rows": []JSONValue{JSONObject{"id": "change-1", "field": "Price"}}})),
			want: "comparisonTable rows[0] requires \"current\"",
		},
		{
			name: "typed field",
			page: PageAdmin("bad-field", "Bad").SchemaVersion(2).Content(Form("form", nil, FieldGroup("Basics", NodeOf(NodeSwitchField, JSONObject{"name": "enabled", "label": "Enabled", "value": "yes"})))),
			want: "switchField value must be boolean",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := tc.page.Build()
			if err == nil || !strings.Contains(err.Error(), tc.want) {
				t.Fatalf("expected %q error, got %v", tc.want, err)
			}
		})
	}
}

func TestGoHostBuilderRejectsInvalidSchema(t *testing.T) {
	_, err := NewPage("broken", "Broken", ShellKind("unknown")).Build()
	if err == nil || !strings.Contains(err.Error(), "invalid shell kind") {
		t.Fatalf("expected invalid shell kind error, got %v", err)
	}

	_, err = PageAdmin("bad-action", "Bad action").Content(
		PageHeader(JSONObject{"title": "Bad action"}),
		ResourceTable("rows", JSONObject{"columns": []JSONValue{JSONObject{"id": "name", "label": "Name"}}, "rows": []JSONValue{JSONObject{"id": "row-1", "name": "Row"}}}).Actions(Action(ActionType("explode"), "thing", "Explode")),
	).Build()
	if err == nil || !strings.Contains(err.Error(), "invalid action type") {
		t.Fatalf("expected invalid action type error, got %v", err)
	}

	_, err = PageAdmin("bad-json", "Bad JSON").Content(
		Panel("Bad", JSONObject{"callback": func() {}}),
	).Build()
	if err == nil || !strings.Contains(err.Error(), "non-json value") {
		t.Fatalf("expected non-json value error, got %v", err)
	}
}

func TestGoHostBuilderSupportsV2WorkbenchNodes(t *testing.T) {
	page, err := PageAdmin("workbench", "Workbench").
		SchemaVersion(2).
		Shell(ShellAdmin, JSONObject{"variant": "workbench", "sidebar": JSONObject{"active": "overview"}}).
		Content(
			PageHeader(JSONObject{"title": "Workbench", "breadcrumbs": []JSONValue{"Admin", "Overview"}}).
				Actions(Primary("service.new", "New service").Placement(PlacementPageHeader)),
			DashboardGrid(JSONObject{"columns": JSONObject{"desktop": 12}, "gap": "compact"},
				Metric("Total services", 24, JSONObject{"caption": "3 draft changes"}).Layout(JSONObject{"span": JSONObject{"desktop": 4}, "order": 10}),
				Panel("Services", JSONObject{"padding": "none"},
					ResourceTable("services", JSONObject{
						"columns": []JSONValue{JSONObject{"id": "name", "kind": "text", "label": "Name"}},
						"rows":    []JSONValue{JSONObject{"id": "svc_1", "name": "Highlights"}},
					}),
				).Density("compact").Layout(JSONObject{"span": JSONObject{"desktop": 8}}).
					FooterActions(Open("service.new", "Add service").Placement(PlacementPanelFooter)),
				Panel("Calendar", nil,
					MonthCalendar("calendar", JSONObject{
						"month":   "2024-06",
						"actions": JSONObject{"selectDate": Mutation("calendar.select", "Select").Placement(PlacementCalendarCell).Build()},
					}),
				).Layout(JSONObject{"span": JSONObject{"desktop": 4}}),
				Panel("Draft changes", nil,
					ComparisonTable("changes", JSONObject{"rows": []JSONValue{JSONObject{"id": "price", "field": "Price", "current": "$200", "draft": "$220"}}}),
				).Layout(JSONObject{"span": JSONObject{"desktop": 12}}),
			),
		).
		Build()
	if err != nil {
		t.Fatalf("build v2 workbench page: %v", err)
	}
	if page.SchemaVersion != 2 {
		t.Fatalf("expected schemaVersion 2, got %d", page.SchemaVersion)
	}
	if page.Nodes[0].Kind != NodePageHeader || page.Nodes[1].Kind != NodeDashboardGrid {
		t.Fatalf("unexpected v2 nodes: %#v", page.Nodes)
	}
	grid := page.Nodes[1]
	if grid.Children[1].Kind != NodePanel || grid.Children[1].Children[0].Kind != NodeResourceTable {
		t.Fatalf("expected panel/resource table, got %#v", grid.Children[1])
	}
}

func TestGoHostBuilderSupportsLayoutPolicies(t *testing.T) {
	page, err := PageAdmin("policy", "Policy").Content(
		NodeOf(NodeSplitPane, nil).
			LayoutPolicy(JSONObject{"desktop": JSONObject{"columns": []JSONValue{"320px", "1fr"}}, "mobile": JSONObject{"mode": "stack"}}).
			Adaptive(JSONObject{"desktop": "split", "mobile": "stack"}),
	).Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	if page.Nodes[0].Props["layoutPolicy"] == nil || page.Nodes[0].Props["adaptive"] == nil {
		t.Fatalf("expected policy props, got %#v", page.Nodes[0].Props)
	}
}

func TestGoHostBuilderSupportsResourceAndFormLifecycle(t *testing.T) {
	page, err := PageResource("lifecycle", "Lifecycle").Content(
		PageHeader(JSONObject{"title": "Lifecycle"}),
		ResourceTable("services", JSONObject{"columns": []JSONValue{JSONObject{"id": "name", "label": "Name"}}, "rows": []JSONValue{}, "emptyTitle": "No services"}),
		Form("serviceForm", JSONObject{"title": "Service"}, TextField("name", JSONObject{"label": "Name", "value": "Cut"})).
			State("dirty").Dirty(true).Values(JSONObject{"name": "Cut"}).Errors(JSONObject{"price": "Required"}).
			Submit(Primary("service.save", "Save")).Cancel(Secondary("service.cancel", "Cancel")),
	).Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	if page.Nodes[1].Props["emptyTitle"] != "No services" {
		t.Fatalf("expected empty resource title, got %#v", page.Nodes[1].Props)
	}
	actions, ok := page.Nodes[2].Props["actions"].(map[string]any)
	if !ok {
		t.Fatalf("expected keyed form actions, got %T", page.Nodes[2].Props["actions"])
	}
	if actions["submit"].(map[string]any)["target"] != "service.save" {
		t.Fatalf("unexpected submit action: %#v", actions["submit"])
	}
}

func TestGoHostBuilderSupportsSurfaceNodes(t *testing.T) {
	page, err := PageAdmin("surfaces", "Surfaces").
		Content(InlinePanel("inline-help", JSONObject{"title": "Inline help"}, TextField("name", JSONObject{"label": "Name"}))).
		Drawers(Sheet("mobile-editor", JSONObject{"title": "Mobile editor", "open": true})).
		Modals(ConfirmDialog("delete-service", JSONObject{"title": "Delete service?", "tone": "danger"})).
		Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	if page.Nodes[0].Kind != NodeInlinePanel {
		t.Fatalf("expected inline panel, got %s", page.Nodes[0].Kind)
	}
	if page.Drawers[0].Kind != NodeSheet || page.Drawers[0].Props["presentation"] != "sheet" {
		t.Fatalf("expected sheet drawer, got %#v", page.Drawers[0])
	}
	if page.Modals[0].Kind != NodeConfirmDialog || page.Modals[0].Props["presentation"] != "confirm" {
		t.Fatalf("expected confirm modal, got %#v", page.Modals[0])
	}
}

func TestGoHostBuilderRejectsDuplicateSurfaceIDs(t *testing.T) {
	_, err := PageAdmin("duplicate-surfaces", "Duplicate surfaces").
		Drawers(Drawer("editor", nil), Sheet("editor", nil)).
		Build()
	if err == nil || !strings.Contains(err.Error(), "duplicate surface id") {
		t.Fatalf("expected duplicate surface id error, got %v", err)
	}
}

func TestGoHostBuilderSupportsKeyedActionMaps(t *testing.T) {
	page, err := PageCalendar("calendar", "Calendar").Content(
		NodeOf(NodeAppointmentBlock, JSONObject{"id": "appt-1"}).Action("open", Open("appointment.open", "Open")),
	).Build()
	if err != nil {
		t.Fatalf("build page: %v", err)
	}
	actions, ok := page.Nodes[0].Props["actions"].(map[string]any)
	if !ok {
		t.Fatalf("expected cloned action map, got %T", page.Nodes[0].Props["actions"])
	}
	open, ok := actions["open"].(map[string]any)
	if !ok {
		t.Fatalf("expected open action object, got %T", actions["open"])
	}
	if open["target"] != "appointment.open" {
		t.Fatalf("unexpected target: %#v", open["target"])
	}
}
